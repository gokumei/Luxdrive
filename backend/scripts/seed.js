const fs = require("fs/promises");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const MIGRATIONS_DIRECTORY = path.resolve(__dirname, "../db/migrations");
const SEEDS_DIRECTORY = path.resolve(__dirname, "../db/seeds");
const DATABASE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const RESERVED_DATABASES = new Set([
  "information_schema",
  "mysql",
  "performance_schema",
  "sys",
]);

function fail(message) {
  console.error(`Seed runner error: ${message}`);
  process.exitCode = 1;
}

function parseDatabaseArgument(argv) {
  let database;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--database") {
      if (database || !argv[index + 1] || argv[index + 1].startsWith("--")) {
        throw new Error("exactly one --database value is required");
      }
      database = argv[index + 1];
      index += 1;
      continue;
    }

    if (argument.startsWith("--database=")) {
      if (database || !argument.slice("--database=".length)) {
        throw new Error("exactly one --database value is required");
      }
      database = argument.slice("--database=".length);
      continue;
    }

    throw new Error(`unsupported argument ${argument}`);
  }

  if (!database) {
    throw new Error("--database is required; no database is selected automatically");
  }

  if (!DATABASE_NAME_PATTERN.test(database)) {
    throw new Error("database name is malformed");
  }

  if (RESERVED_DATABASES.has(database.toLowerCase())) {
    throw new Error("system databases are not valid seed targets");
  }

  return database;
}

function connectionOptions(database) {
  const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_MIGRATION_USER,
    password: process.env.DB_MIGRATION_PASSWORD,
    charset: "utf8mb4",
    multipleStatements: true,
  };

  if (database) options.database = database;
  return options;
}

function assertMigrationCredentialsConfigured() {
  if (!process.env.DB_MIGRATION_USER || !process.env.DB_MIGRATION_PASSWORD) {
    throw new Error("migration database credentials are not configured");
  }
}

async function discoverSeeds() {
  const entries = await fs.readdir(SEEDS_DIRECTORY, { withFileTypes: true });
  const seeds = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "en", { numeric: true }));

  if (seeds.length === 0) {
    throw new Error("no SQL seeds were found");
  }

  const numbers = new Set();
  for (const filename of seeds) {
    const match = /^(\d+)_.*\.sql$/i.exec(filename);
    if (!match) {
      throw new Error(`seed filename is not safely numbered: ${filename}`);
    }

    const number = Number(match[1]);
    if (numbers.has(number)) {
      throw new Error(`duplicate seed number: ${match[1]}`);
    }
    numbers.add(number);
  }

  return seeds;
}

async function discoverMigrations() {
  const entries = await fs.readdir(MIGRATIONS_DIRECTORY, { withFileTypes: true });
  const migrations = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, "en", { numeric: true }));

  if (migrations.length === 0) {
    throw new Error("no SQL migrations were found");
  }

  const numbers = new Set();
  for (const filename of migrations) {
    const match = /^(\d+)_.*\.sql$/i.exec(filename);
    if (!match) {
      throw new Error(`migration filename is not safely numbered: ${filename}`);
    }

    const number = Number(match[1]);
    if (numbers.has(number)) {
      throw new Error(`duplicate migration number: ${match[1]}`);
    }
    numbers.add(number);
  }

  return migrations;
}

async function assertDatabaseExists(connection, database) {
  const [rows] = await connection.query(
    "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ? LIMIT 1",
    [database]
  );

  if (rows.length === 0) {
    throw new Error("selected database does not exist; the seed runner will not create it");
  }
}

async function assertMigrationSystemInitialized(connection, database) {
  const [rows] = await connection.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'schema_migrations' LIMIT 1",
    [database]
  );

  if (rows.length === 0) {
    throw new Error("selected database is not initialized by the migration system");
  }
}

async function assertDatabaseFullyMigrated(connection, migrations) {
  const [rows] = await connection.query(
    "SELECT filename FROM schema_migrations ORDER BY id"
  );
  const appliedMigrations = rows.map((row) => row.filename);

  if (
    appliedMigrations.length !== migrations.length ||
    appliedMigrations.some((filename, index) => filename !== migrations[index])
  ) {
    throw new Error("selected database is not fully migrated");
  }
}

function assertSeedIsSafe(sql, filename) {
  if (/\bDROP\s+(?:DATABASE|TABLE)\b|\bTRUNCATE\b/i.test(sql)) {
    throw new Error(`seed ${filename} contains a forbidden destructive statement`);
  }
}

async function run() {
  const database = parseDatabaseArgument(process.argv.slice(2));
  assertMigrationCredentialsConfigured();
  const migrations = await discoverMigrations();
  const seeds = await discoverSeeds();
  let serverConnection;
  let databaseConnection;

  try {
    serverConnection = await mysql.createConnection(connectionOptions());
    await assertDatabaseExists(serverConnection, database);
    await assertMigrationSystemInitialized(serverConnection, database);
    await serverConnection.end();
    serverConnection = null;

    databaseConnection = await mysql.createConnection(connectionOptions(database));
    await assertDatabaseFullyMigrated(databaseConnection, migrations);

    for (const filename of seeds) {
      const seedPath = path.join(SEEDS_DIRECTORY, filename);
      const sql = await fs.readFile(seedPath, "utf8");
      assertSeedIsSafe(sql, filename);

      try {
        await databaseConnection.query(sql);
      } catch (error) {
        const code = error && error.code ? ` (${error.code})` : "";
        throw new Error(`seed ${filename} failed${code}; no later seeds were run`);
      }
    }

    console.log(`Applied ${seeds.length} seed(s) to the selected database.`);
  } finally {
    if (serverConnection) await serverConnection.end();
    if (databaseConnection) await databaseConnection.end();
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : "seeding failed";
  const safeMessage = /^(--database|exactly one --database|unsupported argument|database name|system databases|migration database|no SQL migrations|migration filename|duplicate migration number|no SQL seeds|seed filename|duplicate seed number|selected database|seed )/.test(message)
    ? message
    : `database operation failed${error && error.code ? ` (${error.code})` : ""}`;
  fail(safeMessage);
});

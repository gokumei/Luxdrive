const fs = require("fs/promises");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const MIGRATIONS_DIRECTORY = path.resolve(__dirname, "../db/migrations");
const DATABASE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const RESERVED_DATABASES = new Set([
  "information_schema",
  "mysql",
  "performance_schema",
  "sys",
]);

function fail(message) {
  console.error(`Migration runner error: ${message}`);
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
    throw new Error("system databases are not valid migration targets");
  }

  return database;
}

function connectionOptions(database) {
  const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset: "utf8mb4",
    multipleStatements: true,
  };

  if (database) options.database = database;
  return options;
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
    throw new Error("selected database does not exist; the runner will not create it");
  }
}

async function getDatabaseTables(connection, database) {
  const [rows] = await connection.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
    [database]
  );

  return rows.map((row) => row.TABLE_NAME);
}

async function readAppliedMigrations(connection) {
  const [rows] = await connection.query(
    "SELECT filename FROM schema_migrations ORDER BY id"
  );

  return rows.map((row) => row.filename);
}

function assertMigrationHistoryIsKnown(appliedMigrations, migrations) {
  const knownMigrations = new Set(migrations);

  for (const filename of appliedMigrations) {
    if (!knownMigrations.has(filename)) {
      throw new Error(`migration history references missing migration file: ${filename}`);
    }
  }

  for (let index = 0; index < appliedMigrations.length; index += 1) {
    if (appliedMigrations[index] !== migrations[index]) {
      const expected = migrations[index] || "no further migration";
      throw new Error(
        `migration history is not an exact ordered prefix (expected ${expected}, found ${appliedMigrations[index]})`
      );
    }
  }
}

async function createMigrationTable(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT NOT NULL AUTO_INCREMENT,
      filename VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_schema_migrations_filename (filename)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);
}

async function run() {
  const database = parseDatabaseArgument(process.argv.slice(2));
  const migrations = await discoverMigrations();
  let serverConnection;
  let databaseConnection;

  try {
    serverConnection = await mysql.createConnection(connectionOptions());
    await assertDatabaseExists(serverConnection, database);
    const tables = await getDatabaseTables(serverConnection, database);
    const hasMigrationTable = tables.includes("schema_migrations");
    await serverConnection.end();
    serverConnection = null;

    databaseConnection = await mysql.createConnection(connectionOptions(database));
    let appliedMigrations = [];

    if (!hasMigrationTable) {
      if (tables.length > 0) {
        throw new Error(
          "selected database is not empty and has no schema_migrations; initial migration was refused"
        );
      }
      await createMigrationTable(databaseConnection);
    } else {
      appliedMigrations = await readAppliedMigrations(databaseConnection);
      assertMigrationHistoryIsKnown(appliedMigrations, migrations);
    }

    const appliedMigrationSet = new Set(appliedMigrations);
    const pendingMigrations = migrations.filter(
      (filename) => !appliedMigrationSet.has(filename)
    );

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations; selected database is up to date.");
      return;
    }

    for (const filename of pendingMigrations) {
      const migrationPath = path.join(MIGRATIONS_DIRECTORY, filename);
      const sql = await fs.readFile(migrationPath, "utf8");

      try {
        await databaseConnection.query(sql);
        await databaseConnection.query(
          "INSERT INTO schema_migrations (filename) VALUES (?)",
          [filename]
        );
      } catch (error) {
        const code = error && error.code ? ` (${error.code})` : "";
        throw new Error(`migration ${filename} failed${code}; no later migrations were run`);
      }
    }

    console.log(`Applied ${pendingMigrations.length} migration(s) to the selected database.`);
  } finally {
    if (serverConnection) await serverConnection.end();
    if (databaseConnection) await databaseConnection.end();
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : "migration failed";
  const safeMessage = /^(--database|exactly one --database|unsupported argument|database name|system databases|no SQL migrations|migration filename|duplicate migration number|migration history|selected database|migration )/.test(message)
    ? message
    : `database operation failed${error && error.code ? ` (${error.code})` : ""}`;
  fail(safeMessage);
});

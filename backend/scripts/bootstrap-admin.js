const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../.env"), quiet: true });

const MIGRATIONS_DIRECTORY = path.resolve(__dirname, "../db/migrations");
const DATABASE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESERVED_DATABASES = new Set([
  "information_schema",
  "mysql",
  "performance_schema",
  "sys",
]);

function fail(message) {
  console.error(`Admin bootstrap error: ${message}`);
  process.exitCode = 1;
}

function parseArguments(argv) {
  const values = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const match = /^--(database|email|name)$/.exec(argument);

    if (!match || values[match[1]] !== undefined || !argv[index + 1] || argv[index + 1].startsWith("--")) {
      throw new Error("--database, --email, and --name are required; password and role are not accepted");
    }

    values[match[1]] = argv[index + 1];
    index += 1;
  }

  for (const field of ["database", "email", "name"]) {
    if (values[field] === undefined) {
      throw new Error(`--${field} is required`);
    }
  }

  const database = values.database;
  if (!DATABASE_NAME_PATTERN.test(database)) {
    throw new Error("database name is malformed");
  }
  if (RESERVED_DATABASES.has(database.toLowerCase())) {
    throw new Error("system databases are not valid bootstrap targets");
  }

  const email = values.email.trim().toLowerCase();
  if (!email || email.length > 150 || !EMAIL_PATTERN.test(email)) {
    throw new Error("email is invalid");
  }

  const name = values.name.trim();
  if (!name || name.length > 100) {
    throw new Error("name is invalid");
  }

  return { database, email, name };
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
    throw new Error("selected database does not exist; the bootstrap tool will not create it");
  }
}

async function getDatabaseTables(connection, database) {
  const [rows] = await connection.query(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
    [database]
  );
  return rows.map((row) => row.TABLE_NAME);
}

async function assertFullyMigrated(connection, migrations) {
  const [rows] = await connection.query("SELECT filename FROM schema_migrations ORDER BY id");
  const applied = rows.map((row) => row.filename);

  if (
    applied.length !== migrations.length ||
    applied.some((filename, index) => filename !== migrations[index])
  ) {
    throw new Error("selected database is not fully migrated");
  }
}

async function assertFreshCustomerState(connection) {
  const [settingsRows] = await connection.query("SELECT COUNT(*) AS count FROM site_settings");
  if (Number(settingsRows[0].count) !== 1) {
    throw new Error("site_settings must contain exactly one row before Admin bootstrap");
  }

  const [userRows] = await connection.query("SELECT COUNT(*) AS count FROM users");
  if (Number(userRows[0].count) !== 0) {
    throw new Error("users table is not empty; first Admin bootstrap was refused");
  }
}

async function run() {
  const { database, email, name } = parseArguments(process.argv.slice(2));
  assertMigrationCredentialsConfigured();
  const migrations = await discoverMigrations();
  let serverConnection;
  let databaseConnection;
  let transactionStarted = false;

  try {
    serverConnection = await mysql.createConnection(connectionOptions());
    await assertDatabaseExists(serverConnection, database);
    const tables = await getDatabaseTables(serverConnection, database);
    if (!tables.includes("schema_migrations")) {
      throw new Error("selected database is not initialized by the migration system");
    }
    if (!tables.includes("users")) {
      throw new Error("selected database does not contain the users table");
    }
    if (!tables.includes("site_settings")) {
      throw new Error("selected database does not contain the site_settings table");
    }
    await serverConnection.end();
    serverConnection = null;

    databaseConnection = await mysql.createConnection(connectionOptions(database));
    await assertFullyMigrated(databaseConnection, migrations);
    await databaseConnection.beginTransaction();
    transactionStarted = true;
    await assertFreshCustomerState(databaseConnection);

    const generatedPassword = crypto.randomBytes(32).toString("base64url");
    const passwordHash = await bcrypt.hash(generatedPassword, 10);
    await databaseConnection.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, passwordHash, "admin"]
    );

    await databaseConnection.commit();
    transactionStarted = false;
    console.log("First Admin created successfully.");
    console.log(`Admin email: ${email}`);
    console.log("Next step: use the password-reset flow to set the Admin password.");
  } catch (error) {
    if (databaseConnection && transactionStarted) {
      try {
        await databaseConnection.rollback();
      } catch {
        // Preserve the original safe error.
      }
    }

    if (error && error.code === "ER_DUP_ENTRY") {
      throw new Error("Admin bootstrap could not create the account because of an integrity conflict");
    }
    throw error;
  } finally {
    if (serverConnection) await serverConnection.end();
    if (databaseConnection) await databaseConnection.end();
  }
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : "Admin bootstrap failed";
  const safeMessage = /^(--database|--email|--name|database name|email is|name is|system databases|migration database|no SQL migrations|migration filename|duplicate migration number|selected database|site_settings|users table|Admin bootstrap could not)/.test(message)
    ? message
    : `database operation failed${error && error.code ? ` (${error.code})` : ""}`;
  fail(safeMessage);
});

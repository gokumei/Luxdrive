require("dotenv").config();
const mysql = require("mysql2/promise");

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Connected!");

    const [rows] = await connection.query("SELECT DATABASE()");
    console.log(rows);

    await connection.end();
  } catch (err) {
    console.error(err);
  }
}

test();

const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const db = require("../db");
const {
  sendPasswordResetEmail,
} = require("../lib/mailer");

const router = express.Router();
const FORGOT_PASSWORD_MESSAGE =
  "If an account exists with that email, a password reset link has been sent.";
const INVALID_RESET_TOKEN_MESSAGE =
  "The password reset link is invalid or has expired";

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (
      typeof full_name !== "string" ||
      !full_name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Full name, email, and password are required"
      });
    }

    const normalizedFullName = full_name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [
        normalizedFullName,
        normalizedEmail,
        passwordHash,
        "customer"
      ]
    );

    const user = {
      id: result.insertId,
      full_name: normalizedFullName,
      email: normalizedEmail,
      role: "customer"
    };

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [users] = await db.query(
      "SELECT id, email FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.json({
        message: FORGOT_PASSWORD_MESSAGE,
      });
    }

    const user = users[0];
    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest();

    let connection;
    let transactionStarted = false;
    let resetTokenId;

    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
      transactionStarted = true;

      await connection.query(
        "SELECT id FROM users WHERE id = ? FOR UPDATE",
        [user.id]
      );

      await connection.query(
        `UPDATE password_reset_tokens
         SET used_at = NOW()
         WHERE user_id = ? AND used_at IS NULL`,
        [user.id]
      );

      const [result] = await connection.query(
        `INSERT INTO password_reset_tokens
         (user_id, token_hash, expires_at, used_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 60 MINUTE), NULL)`,
        [user.id, tokenHash]
      );

      resetTokenId = result.insertId;

      await connection.commit();
      transactionStarted = false;
    } catch (err) {
      if (connection && transactionStarted) {
        try {
          await connection.rollback();
        } catch {
          console.error("PASSWORD RESET TOKEN ROLLBACK ERROR");
        }
      }

      throw err;
    } finally {
      if (connection) {
        connection.release();
      }
    }

    try {
      if (
        typeof process.env.APP_URL !== "string" ||
        !process.env.APP_URL.trim()
      ) {
        throw new Error("APP_URL is not configured");
      }

      const appUrl = process.env.APP_URL.trim().replace(/\/+$/, "");
      const resetUrl =
        `${appUrl}/reset-password?token=` +
        encodeURIComponent(rawToken);

      await sendPasswordResetEmail(user.email, resetUrl);
    } catch {
      console.error("PASSWORD RESET EMAIL DELIVERY ERROR");

      try {
        await db.query(
          `UPDATE password_reset_tokens
           SET used_at = NOW()
           WHERE id = ? AND used_at IS NULL`,
          [resetTokenId]
        );
      } catch {
        console.error(
          "PASSWORD RESET TOKEN INVALIDATION ERROR"
        );
      }
    }

    res.json({
      message: FORGOT_PASSWORD_MESSAGE,
    });
  } catch (err) {
    console.error(
      "FORGOT PASSWORD ERROR:",
      err.code || "UNKNOWN_ERROR"
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, new_password } = req.body;

  if (
    typeof token !== "string" ||
    !token ||
    typeof new_password !== "string" ||
    !new_password
  ) {
    return res.status(400).json({
      message: "Token and new password are required",
    });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest();

  let connection;
  let transactionStarted = false;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [tokens] = await connection.query(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > NOW()
       LIMIT 1
       FOR UPDATE`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      await connection.rollback();
      transactionStarted = false;

      return res.status(400).json({
        message: INVALID_RESET_TOKEN_MESSAGE,
      });
    }

    const resetToken = tokens[0];
    const passwordHash = await bcrypt.hash(new_password, 10);

    await connection.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [passwordHash, resetToken.user_id]
    );

    await connection.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE id = ? AND used_at IS NULL`,
      [resetToken.id]
    );

    await connection.query(
      `UPDATE password_reset_tokens
       SET used_at = NOW()
       WHERE user_id = ? AND used_at IS NULL`,
      [resetToken.user_id]
    );

    await connection.commit();
    transactionStarted = false;

    res.json({
      message: "Password reset successful",
    });
  } catch (err) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch {
        console.error("PASSWORD RESET ROLLBACK ERROR");
      }
    }

    console.error(
      "PASSWORD RESET ERROR:",
      err.code || "UNKNOWN_ERROR"
    );

    res.status(500).json({
      message: "Server error",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const [users] = await db.query(
      "SELECT id, full_name, email, password, role FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;

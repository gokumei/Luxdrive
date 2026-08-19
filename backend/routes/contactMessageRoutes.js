const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

router.post("/", async (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  try {
    await db.query(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim(),
        typeof phone === "string" && phone.trim() ? phone.trim() : null,
        typeof subject === "string" && subject.trim() ? subject.trim() : null,
        message.trim(),
      ]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Contact message creation failed:", error);
    res.status(500).json({ message: "Could not save contact message" });
  }
});

router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, subject, message, is_read, created_at
       FROM contact_messages
       ORDER BY created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Contact message listing failed:", error);
    res.status(500).json({ message: "Could not load contact messages" });
  }
});

router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid contact message id" });
  }

  try {
    const [result] = await db.query("DELETE FROM contact_messages WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Contact message not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Contact message deletion failed:", error);
    res.status(500).json({ message: "Could not delete contact message" });
  }
});

module.exports = router;

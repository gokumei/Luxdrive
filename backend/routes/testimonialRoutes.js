const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const db = require("../db");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

const publicReviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Zu viele Bewertungsversuche. Bitte versuchen Sie es später erneut.",
  },
});

const isPositiveInteger = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
};

// Public: only published testimonials.
router.get("/", async (req, res) => {
  try {
    const [testimonials] = await db.query(
      `SELECT
         id,
         customer_name AS name,
         customer_title AS role,
         review AS quote,
         rating,
         image_url,
         created_at
       FROM testimonials
       WHERE approved = 1
       ORDER BY created_at DESC`
    );

    res.json(testimonials);
  } catch (err) {
    console.error("PUBLIC TESTIMONIAL GET ERROR:", err);
    res.status(500).json({ message: "Bewertungen konnten nicht geladen werden." });
  }
});

// Public: submit a review for moderation.
router.post("/submit", publicReviewLimiter, async (req, res) => {
  const body = req.body;
  const allowedFields = new Set(["customer_name", "review", "rating"]);

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !allowedFields.has(key))
  ) {
    return res.status(400).json({ message: "Ungültige Bewertungsdaten." });
  }

  const customerName =
    typeof body.customer_name === "string"
      ? body.customer_name.trim()
      : "";
  const review =
    typeof body.review === "string" ? body.review.trim() : "";
  const rating = body.rating;

  if (customerName.length < 2 || customerName.length > 100) {
    return res.status(400).json({ message: "Bitte geben Sie einen gültigen Namen ein." });
  }

  if (review.length < 10 || review.length > 1000) {
    return res.status(400).json({ message: "Bitte schreiben Sie eine Bewertung mit 10 bis 1000 Zeichen." });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Bitte wählen Sie eine Sternebewertung aus." });
  }

  try {
    await db.execute(
      `INSERT INTO testimonials
         (customer_name, customer_title, review, rating, image_url, approved)
       VALUES (?, NULL, ?, ?, NULL, 0)`,
      [customerName, review, rating]
    );

    return res.status(201).json({
      message: "Vielen Dank für Ihre Bewertung.",
    });
  } catch (err) {
    console.error("PUBLIC TESTIMONIAL SUBMIT ERROR:", err);
    return res.status(500).json({
      message: "Die Bewertung konnte nicht gesendet werden.",
    });
  }
});

// Admin: all testimonials, including pending submissions.
router.get("/admin", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [testimonials] = await db.query(
      `SELECT
         id,
         customer_name,
         customer_title,
         review,
         rating,
         image_url,
         approved,
         created_at
       FROM testimonials
       ORDER BY created_at DESC`
    );

    res.json(testimonials);
  } catch (err) {
    console.error("ADMIN TESTIMONIAL GET ERROR:", err);
    res.status(500).json({ message: "Bewertungen konnten nicht geladen werden." });
  }
});

// Admin: create an immediately published testimonial.
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, role, quote, rating } = req.body;

    const [result] = await db.execute(
      `INSERT INTO testimonials
         (customer_name, customer_title, review, rating, approved)
       VALUES (?, ?, ?, ?, 1)`,
      [name, role || null, quote, Number(rating) || 5]
    );

    res.status(201).json({
      message: "Bewertung erstellt.",
      id: result.insertId,
    });
  } catch (err) {
    console.error("ADMIN TESTIMONIAL CREATE ERROR:", err);
    res.status(500).json({ message: "Bewertung konnte nicht erstellt werden." });
  }
});

// Admin: publish or hide one testimonial.
router.patch(
  "/:id/approval",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    if (!isPositiveInteger(req.params.id)) {
      return res.status(400).json({ message: "Ungültige Bewertungs-ID." });
    }

    if (
      !req.body ||
      Object.keys(req.body).length !== 1 ||
      typeof req.body.approved !== "boolean"
    ) {
      return res.status(400).json({ message: "Ungültiger Freigabestatus." });
    }

    try {
      const [result] = await db.execute(
        "UPDATE testimonials SET approved = ? WHERE id = ?",
        [req.body.approved ? 1 : 0, Number(req.params.id)]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Bewertung nicht gefunden." });
      }

      return res.json({
        message: req.body.approved
          ? "Bewertung veröffentlicht."
          : "Bewertung ausgeblendet.",
      });
    } catch (err) {
      console.error("TESTIMONIAL APPROVAL ERROR:", err);
      return res.status(500).json({ message: "Status konnte nicht geändert werden." });
    }
  }
);

// Admin: edit testimonial content without changing publication state.
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, role, quote, rating } = req.body;

    await db.execute(
      `UPDATE testimonials
       SET customer_name = ?, customer_title = ?, review = ?, rating = ?
       WHERE id = ?`,
      [name, role || null, quote, Number(rating) || 5, req.params.id]
    );

    res.json({ message: "Bewertung aktualisiert." });
  } catch (err) {
    console.error("ADMIN TESTIMONIAL UPDATE ERROR:", err);
    res.status(500).json({ message: "Bewertung konnte nicht aktualisiert werden." });
  }
});

router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.execute("DELETE FROM testimonials WHERE id = ?", [req.params.id]);
    res.json({ message: "Bewertung gelöscht." });
  } catch (err) {
    console.error("ADMIN TESTIMONIAL DELETE ERROR:", err);
    res.status(500).json({ message: "Bewertung konnte nicht gelöscht werden." });
  }
});

module.exports = router;

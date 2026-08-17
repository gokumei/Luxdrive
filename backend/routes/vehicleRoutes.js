const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

// GET all vehicles
router.get("/", async (req, res) => {
  try {
    const [vehicles] = await db.query("SELECT * FROM vehicles");
    res.json(vehicles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE vehicle
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      image_url,
      passenger_capacity,
      luggage_capacity,
      starting_price,
      available,
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO vehicles
      (name, brand, category, description, image_url, passenger_capacity, luggage_capacity, starting_price, available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        brand,
        category,
        description,
        image_url,
        passenger_capacity,
        luggage_capacity,
        starting_price,
        available,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: "Vehicle created",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// UPDATE vehicle
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      brand,
      category,
      description,
      image_url,
      passenger_capacity,
      luggage_capacity,
      starting_price,
      available,
    } = req.body;

    await db.query(
      `UPDATE vehicles
       SET
         name = ?,
         brand = ?,
         category = ?,
         description = ?,
         image_url = ?,
         passenger_capacity = ?,
         luggage_capacity = ?,
         starting_price = ?,
         available = ?
       WHERE id = ?`,
      [
        name,
        brand,
        category,
        description,
        image_url,
        passenger_capacity,
        luggage_capacity,
        starting_price,
        available,
        req.params.id,
      ]
    );

    res.json({ message: "Vehicle updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// DELETE vehicle
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM vehicles WHERE id = ?", [req.params.id]);

    res.json({ message: "Vehicle deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;

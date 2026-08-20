const express = require("express");
const router = express.Router();
const db = require("../db");
const {
  sendBookingEmail,
  sendOwnerBookingNotification,
} = require("../lib/mailer");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        b.id,
        b.customer_name,
        b.customer_email,
        b.customer_phone,
        b.pickup_location,
        b.dropoff_location,
        b.pickup_date,
        b.pickup_time,
        b.passengers,
        b.special_requests,
        b.status,
        b.vehicle_id,
        v.name AS vehicle
      FROM bookings b
      LEFT JOIN vehicles v
      ON b.vehicle_id = v.id
      ORDER BY b.created_at DESC
    `);
 
    const bookings = rows.map((b) => {
      const names = b.customer_name.split(" ");

      return {
        id: b.id,
        first_name: names[0] || "",
        last_name: names.slice(1).join(" "),
        email: b.customer_email,
        phone_number: b.customer_phone,
        pickup_location: b.pickup_location,
        destination: b.dropoff_location,
        date: b.pickup_date,
        time: b.pickup_time,
        passengers: b.passengers,
        special_requests: b.special_requests,
        vehicle_id: b.vehicle_id,
        vehicle: b.vehicle,
        status: b.status,
      };
    });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      pickup_location,
      dropoff_location,
      pickup_date,
      pickup_time,
      passengers,
      special_requests,
      status,
      vehicle_id,
    } = req.body; 

    const [result] = await db.query(

      `INSERT INTO bookings (
        customer_name,
        customer_email,
        customer_phone,
        pickup_location,
        dropoff_location,
        pickup_date,
        pickup_time,
        passengers,
        special_requests,
        status,
        vehicle_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_name,
        customer_email,
        customer_phone,
        pickup_location,
        dropoff_location,
        pickup_date,
        pickup_time,
        passengers,
        special_requests,
        status || "pending",
        vehicle_id,
      ]
    );

    let booking;

    try {
      const [bookings] = await db.query(
        `SELECT
           b.id,
           b.customer_name,
           b.customer_email,
           b.customer_phone,
           b.pickup_location,
           b.dropoff_location,
           b.pickup_date,
           b.pickup_time,
           b.passengers,
           b.special_requests,
           v.name AS vehicle
         FROM bookings b
         LEFT JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.id = ?
         LIMIT 1`,
        [result.insertId]
      );

      booking = bookings[0];
    } catch {
      console.error("BOOKING EMAIL DATA LOAD ERROR");
    }

    if (booking) {
      try {
        await sendBookingEmail(
          booking.customer_email,
          booking,
          "received"
        );
      } catch {
        console.error("BOOKING RECEIVED EMAIL DELIVERY ERROR");
      }

      try {
        const [settings] = await db.query(
          "SELECT email FROM site_settings ORDER BY id ASC LIMIT 1"
        );
        const ownerEmail = settings[0]?.email?.trim();

        if (
          ownerEmail &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)
        ) {
          await sendOwnerBookingNotification(ownerEmail, booking);
        }
      } catch {
        console.error("BOOKING OWNER EMAIL DELIVERY ERROR");
      }
    }

    res.status(201).json({
      message: "Booking created",
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const bookingId = Number(req.params.id);
    const allowedStatuses = new Set([
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ]);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        message: "Invalid booking id",
      });
    }

    if (!allowedStatuses.has(req.body?.status)) {
      return res.status(400).json({
        message: "Invalid booking status",
      });
    }

    try {
      const [bookings] = await db.query(
        `SELECT
           b.status,
           b.customer_name,
           b.customer_email,
           b.pickup_location,
           b.dropoff_location,
           b.pickup_date,
           b.pickup_time,
           v.name AS vehicle
         FROM bookings b
         LEFT JOIN vehicles v ON b.vehicle_id = v.id
         WHERE b.id = ?
         LIMIT 1`,
        [bookingId]
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          message: "Booking not found",
        });
      }

      const booking = bookings[0];
      const statusChanged = booking.status !== req.body.status;

      if (statusChanged) {
        const [result] = await db.query(
          `UPDATE bookings
           SET status = ?
           WHERE id = ? AND status = ?`,
          [req.body.status, bookingId, booking.status]
        );

        if (result.affectedRows === 1) {
          booking.status = req.body.status;

          if (["confirmed", "cancelled"].includes(req.body.status)) {
            try {
              await sendBookingEmail(
                booking.customer_email,
                booking,
                req.body.status
              );
            } catch {
              console.error("BOOKING STATUS EMAIL DELIVERY ERROR");
            }
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Booking status updated",
        id: bookingId,
        status: req.body.status,
      });
    } catch (err) {
      console.error("BOOKING STATUS UPDATE ERROR:", err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  }
);

router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      pickup_location,
      dropoff_location,
      pickup_date,
      pickup_time,
      passengers,
      special_requests,
      status,
      vehicle_id,
    } = req.body;

    const [existingBookings] = await db.query(
      "SELECT status FROM bookings WHERE id = ? LIMIT 1",
      [req.params.id]
    );
    const previousStatus = existingBookings[0]?.status;

    const [result] = await db.query(
      `UPDATE bookings
       SET
         customer_name = ?,
         customer_email = ?,
         customer_phone = ?,
         pickup_location = ?,
         dropoff_location = ?,
         pickup_date = ?,
         pickup_time = ?,
         passengers = ?,
         special_requests = ?,
         status = ?,
         vehicle_id = ?
       WHERE id = ?`,
      [
        customer_name,
        customer_email,
        customer_phone,
        pickup_location,
        dropoff_location,
        pickup_date,
        pickup_time,
        passengers,
        special_requests,
        status,
        vehicle_id,
        req.params.id,
      ]
    );

    if (
      result.affectedRows === 1 &&
      previousStatus &&
      previousStatus !== status &&
      ["confirmed", "cancelled"].includes(status)
    ) {
      try {
        const [bookings] = await db.query(
          `SELECT
             b.customer_name,
             b.customer_email,
             b.pickup_location,
             b.dropoff_location,
             b.pickup_date,
             b.pickup_time,
             v.name AS vehicle
           FROM bookings b
           LEFT JOIN vehicles v ON b.vehicle_id = v.id
           WHERE b.id = ?
           LIMIT 1`,
          [req.params.id]
        );

        if (bookings[0]) {
          await sendBookingEmail(
            bookings[0].customer_email,
            bookings[0],
            status
          );
        }
      } catch {
        console.error("BOOKING STATUS EMAIL DELIVERY ERROR");
      }
    }

    res.json({ message: "Booking updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM bookings WHERE id = ?",
      [req.params.id]
    );

    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;

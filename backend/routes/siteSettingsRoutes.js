const express = require("express");
const db = require("../db");
const {
  authenticateToken,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();
const UPSERT_LOCK_NAME = "site_settings_singleton_upsert";

const databaseFields = [
  "company_name",
  "phone",
  "whatsapp_number",
  "email",
  "address",
  "hero_title",
  "hero_subtitle",
  "about_title",
  "about_body",
  "business_hours",
];

const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

const getRequestValue = (body, databaseField, frontendField) => {
  if (hasOwn(body, databaseField)) {
    return body[databaseField];
  }

  if (frontendField && hasOwn(body, frontendField)) {
    return body[frontendField];
  }

  return undefined;
};

const normalizeRequest = (body) => ({
  company_name: getRequestValue(body, "company_name"),
  phone: getRequestValue(body, "phone", "company_phone"),
  whatsapp_number: getRequestValue(body, "whatsapp_number"),
  email: getRequestValue(body, "email", "company_email"),
  address: getRequestValue(body, "address"),
  hero_title: getRequestValue(body, "hero_title", "hero_headline"),
  hero_subtitle: getRequestValue(
    body,
    "hero_subtitle",
    "hero_subheadline"
  ),
  about_title: getRequestValue(body, "about_title"),
  about_body: getRequestValue(body, "about_body"),
  business_hours: getRequestValue(body, "business_hours"),
});

const toFrontendSettings = (settings) => {
  if (!settings) {
    return null;
  }

  return {
    id: settings.id,
    company_name: settings.company_name,
    company_phone: settings.phone,
    whatsapp_number: settings.whatsapp_number,
    company_email: settings.email,
    address: settings.address,
    hero_headline: settings.hero_title,
    hero_subheadline: settings.hero_subtitle,
    about_title: settings.about_title,
    about_body: settings.about_body,
    business_hours: settings.business_hours,
    created_at: settings.created_at,
  };
};

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM site_settings ORDER BY id ASC LIMIT 1"
    );

    res.json(toFrontendSettings(rows[0] || null));
  } catch (err) {
    console.error("SITE SETTINGS GET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/", authenticateToken, requireAdmin, async (req, res) => {
  const connection = await db.getConnection();
  let lockAcquired = false;

  try {
    const [[lockResult]] = await connection.query(
      "SELECT GET_LOCK(?, 10) AS acquired",
      [UPSERT_LOCK_NAME]
    );

    lockAcquired = lockResult.acquired === 1;

    if (!lockAcquired) {
      return res.status(503).json({
        message: "Site settings are currently being updated",
      });
    }

    const settings = normalizeRequest(req.body || {});
    const [existingRows] = await connection.query(
      "SELECT id FROM site_settings ORDER BY id ASC LIMIT 1"
    );

    let settingsId;

    if (existingRows.length > 0) {
      settingsId = existingRows[0].id;

      const updates = databaseFields.filter(
        (field) => settings[field] !== undefined
      );

      if (updates.length > 0) {
        const assignments = updates
          .map((field) => `${field} = ?`)
          .join(", ");
        const values = updates.map((field) => settings[field]);

        await connection.query(
          `UPDATE site_settings SET ${assignments} WHERE id = ?`,
          [...values, settingsId]
        );
      }
    } else {
      const values = databaseFields.map(
        (field) => settings[field] ?? null
      );

      const [result] = await connection.query(
        `INSERT INTO site_settings (${databaseFields.join(", ")})
         VALUES (${databaseFields.map(() => "?").join(", ")})`,
        values
      );

      settingsId = result.insertId;
    }

    const [updatedRows] = await connection.query(
      "SELECT * FROM site_settings WHERE id = ? LIMIT 1",
      [settingsId]
    );

    res.json(toFrontendSettings(updatedRows[0]));
  } catch (err) {
    console.error("SITE SETTINGS PUT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    try {
      if (lockAcquired) {
        await connection.query("SELECT RELEASE_LOCK(?)", [
          UPSERT_LOCK_NAME,
        ]);
      }
    } catch (releaseErr) {
      console.error(
        "SITE SETTINGS LOCK RELEASE ERROR:",
        releaseErr
      );
    } finally {
      connection.release();
    }
  }
});

module.exports = router;

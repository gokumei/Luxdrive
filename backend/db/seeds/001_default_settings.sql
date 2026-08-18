-- Safe, neutral first-run settings only.
-- This intentionally creates no Admin, user, vehicle, booking, review, token, or credential.
-- It is idempotent for an empty or already-seeded site_settings table.

INSERT INTO `site_settings` (
  `company_name`,
  `phone`,
  `whatsapp_number`,
  `email`,
  `address`,
  `hero_title`,
  `hero_subtitle`,
  `about_title`,
  `about_body`,
  `business_hours`
)
SELECT
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM `site_settings`);

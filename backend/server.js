const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const jwtSecret = process.env.JWT_SECRET;
const normalizedJwtSecret =
  typeof jwtSecret === "string"
    ? jwtSecret.trim()
    : "";
const obviousPlaceholderPattern =
  /(change[-_ ]?me|placeholder|your[-_ ]?jwt|replace[-_ ]?this|example)/i;

if (
  normalizedJwtSecret.length < 32 ||
  obviousPlaceholderPattern.test(normalizedJwtSecret)
) {
  throw new Error(
    "JWT_SECRET is missing, too short, or still uses a placeholder value"
  );
}

const uploadRoutes = require("./routes/uploadRoutes");
const express = require("express");
const cors = require("cors");

const bookingRoutes = require("./routes/bookingRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const testimonialRoutes = require("./routes/testimonialRoutes");
const authRoutes = require("./routes/authRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
const contactMessageRoutes = require("./routes/contactMessageRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));
// Log every request
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
app.use("/api/upload", uploadRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/site-settings", siteSettingsRoutes);
app.use("/api/contact-messages", contactMessageRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LuxDrive Backend is running."
  });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

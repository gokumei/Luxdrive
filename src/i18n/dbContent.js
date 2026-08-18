// Temporary v1 localization bridge. Replace with locale-aware DB translation
// tables later. Overrides use stable fields/entity IDs and never match source text.
const SITE_EN = {
  hero_headline: "Your VIP Taxi for Every Journey",
  hero_subheadline: "Exclusive VIP Taxi services for airport transfers, business appointments, events, and individual journeys. Comfortable, discreet, and reliable.",
  about_title: "Premium Service. Personal. Reliable.",
  about_body: "LuxDrive provides professional VIP Taxi services with the highest standards of comfort, punctuality, and discretion. Whether you need an airport transfer, business journey, or event transport, we ensure a comfortable and reliable experience.",
  business_hours: "24 hours a day, 7 days a week, 365 days a year",
};

const VEHICLE_EN = {
  1: { category: "Luxury Sedan", description: "Ultimate luxury chauffeur vehicle." },
  3: { category: "Luxury Sedan" },
  4: { category: "Luxury Minivan" },
};

export function localizeSiteContent(content, language) {
  if (!content || language !== "en") return content;
  return { ...content, ...SITE_EN };
}

export function localizeVehicle(vehicle, language) {
  if (!vehicle || language !== "en") return vehicle;
  return { ...vehicle, ...(VEHICLE_EN[vehicle.id] || {}) };
}

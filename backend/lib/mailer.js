const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

async function sendPasswordResetEmail(recipientEmail, resetUrl) {
  const safeResetUrl = escapeHtml(resetUrl);

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: recipientEmail,
    subject: "Reset your password",
    text: [
      "We received a request to reset your password.",
      "",
      `Reset your password: ${resetUrl}`,
      "",
      "This link expires in 60 minutes and can only be used once.",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">
          Reset your password
        </h1>
        <p>We received a request to reset your password.</p>
        <p style="margin: 24px 0;">
          <a
            href="${safeResetUrl}"
            style="display: inline-block; padding: 12px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 4px;"
          >
            Reset password
          </a>
        </p>
        <p>
          This link expires in 60 minutes and can only be used once.
        </p>
        <p>
          If you did not request a password reset, you can safely ignore
          this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error("Password reset email delivery failed");
  }
}

const BOOKING_EMAIL_CONTENT = {
  received: {
    subject: "Buchungsanfrage erhalten | Booking request received",
    heading: "Buchungsanfrage erhalten",
    german:
      "Vielen Dank für Ihre Buchungsanfrage. Wir haben Ihre Anfrage erhalten und melden uns nach der Prüfung bei Ihnen.",
    english:
      "Thank you for your booking request. We have received it and will contact you after review.",
  },
  confirmed: {
    subject: "Buchung bestätigt | Booking confirmed",
    heading: "Buchung bestätigt",
    german: "Ihre Buchung wurde bestätigt. Wir freuen uns, Sie zu fahren.",
    english: "Your booking has been confirmed. We look forward to driving you.",
  },
  cancelled: {
    subject: "Buchung storniert | Booking cancelled",
    heading: "Buchung storniert",
    german:
      "Ihre Buchung wurde storniert. Wenn Sie Fragen haben oder eine neue Fahrt wünschen, kontaktieren Sie uns bitte.",
    english:
      "Your booking has been cancelled. Please contact us if you have questions or would like to arrange another journey.",
  },
};

function formatBookingDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Intl.DateTimeFormat("de-DE", { timeZone: "UTC" }).format(value);
  }

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : String(value);
}

function formatBookingTime(value) {
  const match = String(value).match(/^(\d{2}:\d{2})/);
  return match ? match[1] : String(value);
}

function bookingDetailsText(booking) {
  const details = [
    ["Name", booking.customer_name],
    ["Abholung / Pickup", booking.pickup_location],
    ["Ziel / Destination", booking.dropoff_location],
    ["Datum / Date", formatBookingDate(booking.pickup_date)],
    ["Uhrzeit / Time", formatBookingTime(booking.pickup_time)],
  ];

  if (booking.vehicle) {
    details.push(["Fahrzeug / Vehicle", booking.vehicle]);
  }

  return details.map(([label, value]) => `${label}: ${value}`).join("\n");
}

function bookingDetailsHtml(booking) {
  const details = [
    ["Name", booking.customer_name],
    ["Abholung / Pickup", booking.pickup_location],
    ["Ziel / Destination", booking.dropoff_location],
    ["Datum / Date", formatBookingDate(booking.pickup_date)],
    ["Uhrzeit / Time", formatBookingTime(booking.pickup_time)],
  ];

  if (booking.vehicle) {
    details.push(["Fahrzeug / Vehicle", booking.vehicle]);
  }

  return details
    .map(
      ([label, value]) => `
        <tr>
          <th style="padding: 8px 12px; text-align: left; vertical-align: top; color: #6b7280; font-weight: 600;">${escapeHtml(label)}</th>
          <td style="padding: 8px 12px;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");
}

async function sendBookingEmail(recipientEmail, booking, type) {
  const content = BOOKING_EMAIL_CONTENT[type];

  if (!content) {
    throw new Error("Unsupported booking email type");
  }

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: recipientEmail,
    subject: content.subject,
    text: [
      `Guten Tag ${booking.customer_name},`,
      "",
      content.german,
      "",
      `Hello ${booking.customer_name},`,
      "",
      content.english,
      "",
      bookingDetailsText(booking),
      "",
      "LuxDrive",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 640px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">${escapeHtml(content.heading)}</h1>
        <p>Guten Tag ${escapeHtml(booking.customer_name)},</p>
        <p>${escapeHtml(content.german)}</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p>Hello ${escapeHtml(booking.customer_name)},</p>
        <p>${escapeHtml(content.english)}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #f9fafb;">
          ${bookingDetailsHtml(booking)}
        </table>
        <p style="margin-top: 24px;">LuxDrive</p>
      </div>
    `,
  });

  if (error) {
    throw new Error("Booking email delivery failed");
  }
}

async function sendOwnerBookingNotification(recipientEmail, booking) {
  const specialRequests = booking.special_requests?.trim() || "Keine";
  const customerEmail = booking.customer_email?.trim() || "Keine Angabe";
  const customerPhone = booking.customer_phone?.trim() || "Keine Angabe";
  const vehicle = booking.vehicle || "Keine Angabe";
  const bookingId = booking.id || "Keine Angabe";
  const details = [
    ["Buchungs-ID", bookingId],
    ["Kundenname", booking.customer_name],
    ["E-Mail", customerEmail],
    ["Telefon", customerPhone],
    ["Fahrzeug", vehicle],
    ["Abholung", booking.pickup_location],
    ["Ziel / Drop-off", booking.dropoff_location],
    ["Abholdatum", formatBookingDate(booking.pickup_date)],
    ["Abholzeit", formatBookingTime(booking.pickup_time)],
    ["Personen", booking.passengers],
    ["Besondere Wünsche", specialRequests],
  ];
  const text = details.map(([label, value]) => `${label}: ${value}`).join("\n");
  const html = details
    .map(
      ([label, value]) => `
        <tr>
          <th style="padding: 8px 12px; text-align: left; vertical-align: top; color: #6b7280; font-weight: 600;">${escapeHtml(label)}</th>
          <td style="padding: 8px 12px;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join("");
  const customerReplyEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)
      ? customerEmail
      : undefined;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: recipientEmail,
    ...(customerReplyEmail ? { replyTo: customerReplyEmail } : {}),
    subject: `Neue Buchungsanfrage – ${booking.customer_name}`,
    text: ["Eine neue Buchungsanfrage ist eingegangen.", "", text, "", "LuxDrive"].join(
      "\n"
    ),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 640px; margin: 0 auto;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">Neue Buchungsanfrage</h1>
        <p>Eine neue Buchungsanfrage ist eingegangen:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; background: #f9fafb;">
          ${html}
        </table>
        <p style="margin-top: 24px;">LuxDrive</p>
      </div>
    `,
  });

  if (error) {
    throw new Error("Owner booking email delivery failed");
  }
}

module.exports = {
  sendBookingEmail,
  sendOwnerBookingNotification,
  sendPasswordResetEmail,
};

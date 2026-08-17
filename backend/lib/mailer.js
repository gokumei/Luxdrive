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

module.exports = {
  sendPasswordResetEmail,
};

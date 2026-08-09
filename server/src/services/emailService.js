const { Resend } = require("resend");
const env = require("../config/env");

// Guard against missing API key
if (!env.resendApiKey) {
  console.error("WARNING: RESEND_API_KEY is not set. Email service will fail.");
}

const resend = new Resend(env.resendApiKey);

async function sendEmail({ to, subject, html, text }) {
  if (!env.resendApiKey) {
    throw new Error(
      "Email service is not configured: RESEND_API_KEY is missing"
    );
  }

  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to: [to],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
}

module.exports = { sendEmail };

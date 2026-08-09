const nodemailer = require('nodemailer');

/**
 * Thin wrapper around nodemailer. If SMTP is not configured, emails are
 * simply logged instead of sent so local development never breaks.
 */
const isConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

const sendMail = async ({ to, subject, html }) => {
  if (!isConfigured()) {
    console.log(`[Email:dev-mode] To: ${to} | Subject: ${subject}`);
    return { simulated: true };
  }
  const transporter = getTransporter();
  return transporter.sendMail({
    from: process.env.SMTP_FROM || 'QuickShare <no-reply@quickshare.local>',
    to,
    subject,
    html,
  });
};

const sendPasswordResetEmail = (to, resetUrl) =>
  sendMail({
    to,
    subject: 'Reset your QuickShare password',
    html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Click here to reset your password</a>. This link expires in 1 hour.</p>`,
  });

module.exports = { sendMail, sendPasswordResetEmail };

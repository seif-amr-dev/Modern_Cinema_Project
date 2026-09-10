const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function SendEmail(to, subject, html, text = "") {
  const info = await transporter.sendMail({
    from: `"Vox_cinema to" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });

  return info;
}

module.exports = SendEmail;
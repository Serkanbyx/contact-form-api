const nodemailer = require("nodemailer");
const config = require("../config/env");

let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  // In development, create an Ethereal test account automatically
  if (!config.mail.user) {
    const testAccount = await nodemailer.createTestAccount();
    config.mail.host = "smtp.ethereal.email";
    config.mail.port = 587;
    config.mail.secure = false;
    config.mail.user = testAccount.user;
    config.mail.pass = testAccount.pass;
    console.log("📧 Ethereal test account created:", testAccount.user);
  }

  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });

  return transporter;
}

async function sendAdminNotification({ name, email, message }) {
  const transport = await getTransporter();

  const mailOptions = {
    from: config.mail.from,
    to: config.mail.adminEmail,
    subject: `New Contact Form Submission from ${name}`,
    text: buildPlainText({ name, email, message }),
    html: buildHtml({ name, email, message }),
  };

  const info = await transport.sendMail(mailOptions);

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📧 Preview URL:", previewUrl);
  }

  return { messageId: info.messageId, previewUrl: previewUrl || null };
}

function buildPlainText({ name, email, message }) {
  return [
    "New Contact Form Submission",
    "==========================",
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Message: ${message}`,
  ].join("\n");
}

function buildHtml({ name, email, message }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #555;">Name</td>
          <td style="padding: 8px;">${name}</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 8px; font-weight: bold; color: #555;">Email</td>
          <td style="padding: 8px;">
            <a href="mailto:${email}">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #555; vertical-align: top;">Message</td>
          <td style="padding: 8px; white-space: pre-wrap;">${message}</td>
        </tr>
      </table>
    </div>
  `;
}

module.exports = { sendAdminNotification };

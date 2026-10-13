import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true", // true sirf port 465 ke liye
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Server start pe ek baar SMTP check karne ke liye (optional)
export const verifyMailer = async () => {
  try {
    await transporter.verify();
    console.log("Mail server ready");
  } catch (err) {
    console.error("Mail server error:", err.message);
  }
};

export const sendMail = async ({ to, subject, html, text }) => {
  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
};
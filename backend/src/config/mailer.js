//const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const resend = new Resend(process.env.EMAIL_PASS2);

/*  const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
}); */

module.exports = resend;

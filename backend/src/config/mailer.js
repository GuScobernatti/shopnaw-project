const nodemailer = require("nodemailer");

// Configuração de transporte (Exemplo com Gmail)
// Para produção, use SendGrid, AWS SES, ou Mailgun.
const transporter = nodemailer.createTransport({
  service: "smtp.gmail.com", // ou host: 'smtp.seuprovedor.com'
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Senha de app do Gmail (não a senha normal)
  },
  connectionTimeout: 10000,
});

module.exports = transporter;

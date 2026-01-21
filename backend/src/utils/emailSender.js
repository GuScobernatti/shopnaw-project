const transporter = require("../config/mailer");
const pool = require("../pgPool");

async function sendStatusEmail(order, newStatus, trackingCode) {
  if (!order || !order.user_id) return;

  try {
    const client = await pool.connect();
    const userRes = await client.query(
      "SELECT email, name FROM users WHERE user_id = $1",
      [order.user_id]
    );
    client.release();

    if (userRes.rows.length === 0) return;
    const { email, name } = userRes.rows[0];

    let subject = "";
    let text = "";

    switch (newStatus) {
      case "pending":
        subject = `Pedido Recebido - Aguardando Pagamento #${order.order_id.slice(0, 8)}`;
        text = `Olá ${name}, recebemos seu pedido! Assim que o pagamento for confirmado, iniciaremos o processamento.`;
        break;
      case "approved":
        subject = `Pagamento Aprovado - Pedido #${order.order_id.slice(0, 8)}`;
        text = `Olá ${name}, seu pagamento foi confirmado! Estamos preparando seu pedido.`;
        break;
      case "sent":
        subject = `Pedido Enviado - Pedido #${order.order_id.slice(0, 8)}`;
        text = `Olá ${name}, seu pedido foi enviado! Em breve chegará até você.`;
        if (trackingCode)
          text += `\n Seu código de rastreio é: ${trackingCode}`;
        break;
      case "delivered":
        subject = `Pedido Entregue - Pedido #${order.order_id.slice(0, 8)}`;
        text = `Olá ${name}, seu pedido foi entregue.`;
        break;
      case "cancelled":
      case "rejected":
        subject = `Problema no Pedido #${order.order_id.slice(0, 8)}`;
        text = `Olá ${name}, houve um problema com seu pagamento ou o pedido foi cancelado.`;
        break;
      default:
        return;
    }

    const mailOptions = {
      from: '"Shopnaw Loja" <nao-responda@shopnaw.com>',
      to: email,
      subject: subject,
      html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>${subject}</h2>
                    <p>${text}</p>
                    <hr/>
                    <p><strong>Resumo do Pedido:</strong></p>
                    <p>Total: R$ ${Number(order.total_amount).toFixed(2)}</p>
                    <br/>
                    <a href="${process.env.CORS_ORIGIN}/account/orders" style="background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Meus Pedidos</a>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email de status '${newStatus}' enviado para ${email}`);
  } catch (err) {
    console.error("Erro ao enviar email de status:", err);
  }
}

module.exports = sendStatusEmail;

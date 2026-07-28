import nodemailer from "nodemailer";
import twilio from "twilio";

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendAdminEmailAlert(order) {
  if (!process.env.SMTP_HOST) {
    console.log("[notifications] SMTP non configuré — email admin simulé pour", order.id);
    return;
  }
  const itemsList = order.items.map((i) => `${i.quantity}x ${i.product.name} — ${i.price} DH`).join("\n");
  await mailer.sendMail({
    from: process.env.NOTIFY_FROM_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 Nouvelle commande ${order.id}`,
    text: `Nouvelle commande de ${order.customerName} (${order.customerPhone}) — ${order.customerCity}\n${itemsList}\nTotal: ${order.subtotal} DH\nPaiement: ${order.paymentMethod === "cod" ? "à la livraison" : "carte bancaire"}`,
  });
}

export async function sendOrderConfirmationSms(order) {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.log("[notifications] Twilio non configuré — SMS client simulé pour", order.id);
    return;
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER,
    to: order.customerPhone,
    body: `Urban Caps: merci ${order.customerName.split(" ")[0]} ! Ta commande ${order.id} (${order.subtotal} DH) est confirmée. On te contacte bientôt pour la livraison.`,
  });
}

export async function sendAdminSmsAlert(order) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.ADMIN_PHONE) {
    console.log("[notifications] Twilio/ADMIN_PHONE non configurés — alerte admin simulée pour", order.id);
    return;
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ");
  await client.messages.create({
    from: process.env.TWILIO_FROM_NUMBER,
    to: process.env.ADMIN_PHONE,
    body: `🔔 Nouvelle commande ${order.id} — ${order.customerName} (${order.customerPhone}), ${order.customerCity}. ${itemsSummary}. Total: ${order.subtotal} DH (${order.paymentMethod === "cod" ? "livraison" : "carte"}).`,
  });
}

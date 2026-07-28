import { sendPushNotification } from "../services/push.js";
import { Router } from "express";
import { prisma } from "../db.js";
import { sendOrderConfirmationSms, sendAdminSmsAlert, sendAdminEmailAlert } from "../services/notifications.js";

const router = Router();

router.post("/", async (req, res) => {
  const { customerName, customerPhone, customerCity, customerAddr, paymentMethod, items } = req.body;

  if (!customerName || !customerPhone || !customerCity || !customerAddr || !items?.length) {
    return res.status(400).json({ error: "Champs manquants" });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const itemsData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Produit ${item.productId} introuvable`);
        if (product.stock < item.quantity) throw new Error(`Stock insuffisant pour ${product.name}`);

        subtotal += product.price * item.quantity;
        itemsData.push({ productId: product.id, quantity: item.quantity, price: product.price });

        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          customerName,
          customerPhone,
          customerCity,
          customerAddr,
          paymentMethod: paymentMethod || "cod",
          subtotal,
          items: { create: itemsData },
        },
        include: { items: { include: { product: true } } },
      });
    });

    sendOrderConfirmationSms(order).catch((e) => console.error("SMS client non envoyé:", e.message));
    sendAdminSmsAlert(order).catch((e) => console.error("SMS admin non envoyé:", e.message));
    sendAdminEmailAlert(order).catch((e) => console.error("Email admin non envoyé:", e.message));
    sendPushNotification(order).catch((e) => console.error("Push non envoyé:", e.message));

    res.status(201).json(order);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get("/", async (req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } },
  });
  res.json(orders);
});

router.patch("/:id", async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(order);
});

export default router;

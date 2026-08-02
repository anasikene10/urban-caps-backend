import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// Route temporaire — remplace l'ancien catalogue par les 12 nouveaux produits
// ⚠️ À supprimer après utilisation !
router.get("/", async (req, res) => {
  try {
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.product.deleteMany({});

    const products = [
      { id: 1, name: "LA CAP GRIS", tag: "COTON TWILL", price: 170, stock: 20 },
      { id: 2, name: "NY CAP BLACK", tag: "COTON TWILL", price: 170, stock: 20 },
      { id: 3, name: "LA CAP FULL BLACK", tag: "COTON TWILL", price: 170, stock: 20 },
      { id: 4, name: "LA CAP BLACK STARS", tag: "COTON TWILL", price: 170, stock: 20 },
      { id: 5, name: "LORO PIANA CREAM", tag: "COTON LAVÉ", price: 199, stock: 20 },
      { id: 6, name: "LORO PIANA NAVY BLUE", tag: "COTON LAVÉ", price: 199, stock: 20 },
      { id: 7, name: "LORO PIANA BURGUNDY", tag: "COTON LAVÉ", price: 199, stock: 20 },
      { id: 8, name: "LORO PIANA CAMEL BROWN", tag: "COTON LAVÉ", price: 199, stock: 20 },
      { id: 9, name: "GUCCI BLACK 1-1", tag: "LAINE MÉLANGÉE", price: 299, stock: 20 },
      { id: 10, name: "GUCCI GREEN 1-1", tag: "LAINE MÉLANGÉE", price: 299, stock: 20 },
      { id: 11, name: "POLO LAVENDER", tag: "MAILLE TECHNIQUE", price: 160, stock: 20 },
      { id: 12, name: "POLO LIGHT BLUE", tag: "MAILLE TECHNIQUE", price: 160, stock: 0 },
    ];

    for (const p of products) {
      await prisma.product.create({ data: p });
    }

    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Product"', 'id'), 12, true);`);

    res.json({ message: "Catalogue mis à jour avec succès !", count: products.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

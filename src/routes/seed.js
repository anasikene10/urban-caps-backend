import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// Route temporaire pour ajouter les produits une seule fois
// ⚠️ À supprimer après utilisation !
router.get("/", async (req, res) => {
  const count = await prisma.product.count();
  if (count > 0) {
    return res.json({ message: "Des produits existent déjà, rien à faire.", count });
  }

  const products = [
    { name: "Snapback Signature", tag: "COTON TWILL", price: 390, stock: 25 },
    { name: "Trucker Noir Mat", tag: "MAILLE TECHNIQUE", price: 340, stock: 30 },
    { name: "Dad Hat Ivoire", tag: "COTON LAVÉ", price: 320, stock: 20 },
    { name: "Corduroy Graphite", tag: "VELOURS CÔTELÉ", price: 410, stock: 15 },
    { name: "Fitted Monogramme", tag: "LAINE MÉLANGÉE", price: 450, stock: 12 },
    { name: "Bucket Architecte", tag: "NYLON RIPSTOP", price: 300, stock: 22 },
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
  }

  res.json({ message: "Produits ajoutés avec succès !", count: products.length });
});

export default router;

import { prisma } from "../src/db.js";

const products = [
  { name: "Snapback Signature", tag: "COTON TWILL", price: 390, stock: 25 },
  { name: "Trucker Noir Mat", tag: "MAILLE TECHNIQUE", price: 340, stock: 30 },
  { name: "Dad Hat Ivoire", tag: "COTON LAVÉ", price: 320, stock: 20 },
  { name: "Corduroy Graphite", tag: "VELOURS CÔTELÉ", price: 410, stock: 15 },
  { name: "Fitted Monogramme", tag: "LAINE MÉLANGÉE", price: 450, stock: 12 },
  { name: "Bucket Architecte", tag: "NYLON RIPSTOP", price: 300, stock: 22 },
];

async function main() {
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log("Produits ajoutés ✔");
}

main().finally(() => prisma.$disconnect());

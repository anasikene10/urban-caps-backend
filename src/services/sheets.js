import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function appendOrderToSheet(order) {
  const { GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.log("[sheets] Google Sheets non configuré — ligne simulée pour", order.id);
    return;
  }

  try {
    const jwt = new JWT({
      email: GOOGLE_CLIENT_EMAIL,
      key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const itemsSummary = order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", ");

    await sheet.addRow({
      Numéro: order.id,
      Date: new Date(order.createdAt).toLocaleString("fr-FR"),
      Nom: order.customerName,
      Téléphone: order.customerPhone,
      Ville: order.customerCity,
      Adresse: order.customerAddr,
      Produits: itemsSummary,
      Total: order.subtotal,
      Paiement: order.paymentMethod === "cod" ? "Livraison" : "Carte",
      Statut: order.status,
    });

    console.log("[sheets] Ligne ajoutée pour", order.id);
  } catch (e) {
    console.error("[sheets] Erreur:", e.message);
  }
}

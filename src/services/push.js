// Envoi de notifications push via OneSignal à chaque nouvelle commande

export async function sendPushNotification(order) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;

  if (!appId || !apiKey) {
    console.log("[push] OneSignal non configuré — notification simulée pour", order.id);
    return;
  }

  try {
    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${apiKey}`,
      },
      body: JSON.stringify({
        app_id: appId,
        included_segments: ["Subscribed Users"],
        headings: { en: "Urban Caps" },
        contents: { en: `Nouvelle commande ${order.id} — ${order.subtotal} DH` },
        chrome_web_icon: "https://urban-caps-frontend.vercel.app/logo.png",
      }),
    });
    const data = await res.json();
    if (!res.ok) console.error("[push] Erreur OneSignal:", data);
    else console.log("[push] Notification envoyée:", data.id);
  } catch (e) {
    console.error("[push] Échec d'envoi:", e.message);
  }
}

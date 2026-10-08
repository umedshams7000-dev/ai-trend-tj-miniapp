export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const update = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return res.status(500).json({
        error: "TELEGRAM_BOT_TOKEN не настроен"
      });
    }

    const message = update?.message;

    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text || "";

    if (text === "/start") {
      const welcome =
        "👋 <b>Салом! Хуш омадед ба AI Trend TJ!</b> 🎬\n\n" +
        "Бо ёрии AI метавонед аз як акс видеои трендӣ созед.\n\n" +
        "🔥 Трендро интихоб кунед\n" +
        "📸 Аксро бор кунед\n" +
        "🎬 Видеои тайёр гиред\n\n" +
        "💎 Баланси ибтидоӣ: <b>100 кредит</b>\n\n" +
        "Барои оғоз тугмаи поёнро пахш кунед 👇";

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "🎬 Видео созед",
              web_app: {
                url: "https://aitrendtjminiapptajik.vercel.app/"
              }
            }
          ]
        ]
      };

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcome,
          parse_mode: "HTML",
          reply_markup: keyboard
        })
      });
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Ошибка бота",
      details: error.message
    });
  }
}

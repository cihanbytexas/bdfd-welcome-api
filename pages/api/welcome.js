import { createCanvas, loadImage, registerFont } from "canvas";
import FormData from "form-data";
import axios from "axios";
import path from "path";

// Font
const fontPath = path.resolve("./public/fonts/Poppins-Bold.ttf");
registerFont(fontPath, { family: "Poppins" });

const IMGBB_KEY = "b9db5cf8217dccada264cff99e9742bd";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const {
      username = "Guest",
      avatar,
      background,
      customText = "Glad to have you here 🎉",
      welcomeText = "WELCOME",
      textColor = "#FFFFFF",
      borderColor = "#FF0000"
    } = req.body;

    const width = 1920;
    const height = 1080;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    try {
      const bg = await loadImage(background);
      ctx.drawImage(bg, 0, 0, width, height);
    } catch {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, width, height);
    }

    // Dikdörtgen kutu
    const boxWidth = width * 0.7;
    const boxHeight = height * 0.8;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    // Avatar (sol köşeye ve daha büyük)
    const avatarSize = 360; // büyütüldü
    const avatarX = boxX + 50; // sol köşe + biraz boşluk
    const avatarY = boxY + 50;
    try {
      const avatarImg = await loadImage(avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch {}

    // Yazılar
    const drawText = (text, x, y, fontSize, color, weight = "bold") => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${fontSize}px Poppins`;
      ctx.fillText(text, x, y);
    };

    // Sol köşeye göre yazılar
    const textStartX = avatarX + avatarSize + 50;
    drawText(welcomeText, textStartX, avatarY + 80, 80, textColor);
    drawText(username.toUpperCase(), textStartX, avatarY + 180, 60, textColor);
    drawText(customText.toUpperCase(), textStartX, avatarY + 280, 50, borderColor);

    const buffer = canvas.toBuffer("image/png");
    const base64 = buffer.toString("base64");

    // imgbb upload
    const form = new FormData();
    form.append("image", base64);

    const imgbbRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    res.status(200).json({ image: imgbbRes.data.data.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate image" });
  }
}

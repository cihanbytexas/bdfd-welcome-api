import { createCanvas, loadImage, registerFont } from "canvas";
import FormData from "form-data";
import axios from "axios";
import path from "path";

// Poppins fontu public/fonts içinde olmalı
const fontPath = path.resolve("./public/fonts/Poppins-Bold.ttf");
registerFont(fontPath, { family: "Poppins" });

const IMGBB_KEY = "b9db5cf8217dccada264cff99e9742bd"; // imgbb API key

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

    // Canvas diktörgen (banner)
    const width = 1200;
    const height = 400;
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

    // Avatar
    const avatarSize = 120;
    const avatarX = 50;
    const avatarY = height / 2 - avatarSize / 2;
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

    // Yazılar (avatarın sağında ortalanmış)
    const textStartX = avatarX + avatarSize + 50;

    ctx.fillStyle = textColor;
    ctx.font = `bold 60px Poppins`;
    ctx.fillText(welcomeText, textStartX, height / 2 - 40);

    ctx.font = `bold 40px Poppins`;
    ctx.fillText(username.toUpperCase(), textStartX, height / 2 + 20);

    ctx.fillStyle = borderColor;
    ctx.font = `bold 30px Poppins`;
    ctx.fillText(customText, textStartX, height / 2 + 70);

    // Canvas → Buffer → Base64
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

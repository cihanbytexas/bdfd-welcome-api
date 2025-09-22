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

    // Canvas yatay 16:9
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

    // İçerik uç kutusu
    const boxWidth = width * 0.7;
    const boxHeight = height * 0.8;
    const boxX = (width - boxWidth) / 2;
    const boxY = (height - boxHeight) / 2;

    // Avatar
    const avatarSize = 260;
    const avatarX = width / 2 - avatarSize / 2;
    const avatarY = boxY + 50;
    try {
      const avatarImg = await loadImage(avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch {}

    // Yazılar
    const drawCenteredText = (text, y, fontSize, color, weight = "bold") => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${fontSize}px Poppins`;
      const textWidth = ctx.measureText(text).width;
      ctx.fillText(text, boxX + (boxWidth - textWidth) / 2, y);
    };

    drawCenteredText(welcomeText, avatarY + avatarSize + 100, 80, textColor);
    drawCenteredText(username.toUpperCase(), avatarY + avatarSize + 200, 60, textColor);
    drawCenteredText(customText.toUpperCase(), avatarY + avatarSize + 300, 50, borderColor);

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

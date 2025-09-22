import { createCanvas, loadImage } from "canvas";
import FormData from "form-data";
import axios from "axios";

const IMGBB_KEY = "b9db5cf8217dccada264cff99e9742bd";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

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
    const bgImg = await loadImage(background);
    ctx.drawImage(bgImg, 0, 0, width, height);
  } catch {
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);
  }

  // Avatar
  try {
    const avatarImg = await loadImage(avatar);
    const size = 260;
    const x = width / 2 - size / 2;
    const y = 400 - size / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(width / 2, 400, size / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, x, y, size, size);
    ctx.restore();
  } catch {}

  // Draw Text Function
  const drawCenteredText = (text, y, fontSize, color, weight = "bold") => {
    ctx.fillStyle = color;
    ctx.font = `${weight} ${fontSize}px sans-serif`; // Sistem fontu kullanıyoruz
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, (width - textWidth) / 2, y);
  };

  drawCenteredText(welcomeText, 780, 100, textColor);
  drawCenteredText(username.toUpperCase(), 870, 70, textColor);
  drawCenteredText(customText.toUpperCase(), 950, 60, borderColor);

  // Canvas -> Buffer -> Base64
  const buffer = canvas.toBuffer("image/png");
  const base64 = buffer.toString("base64");

  // Upload to imgbb
  try {
    const form = new FormData();
    form.append("image", base64);
    const imgbbRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    const imageUrl = imgbbRes.data.data.url;
    res.status(200).json({ image: imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

import { createCanvas, loadImage, registerFont } from "canvas";
import FormData from "form-data";
import axios from "axios";
import path from "path";

const IMGBB_KEY = "b9db5cf8217dccada264cff99e9742bd";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  const { username = "Guest", avatar, background } = req.body;

  try {
    // Font
    registerFont(path.resolve("./public/fonts/Poppins-Bold.ttf"), { family: "Poppins", weight: "bold" });
    registerFont(path.resolve("./public/fonts/Poppins-Regular.ttf"), { family: "Poppins", weight: "regular" });

    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    if (background) {
      try {
        const bgImg = await loadImage(background);
        ctx.drawImage(bgImg, 0, 0, width, height);
      } catch {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, width, height);
    }

    // Avatar
    if (avatar) {
      try {
        const avatarImg = await loadImage(avatar);
        const size = 180;
        const x = 50;
        const y = height / 2 - size / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, x, y, size, size);
        ctx.restore();
      } catch {}
    }

    // Text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px Poppins";
    ctx.fillText("Welcome To Server 🎉", 260, 170);

    ctx.font = "bold 35px Poppins";
    ctx.fillText(username, 260, 230);

    // Canvas -> Buffer -> Base64
    const buffer = canvas.toBuffer("image/png");
    const base64 = buffer.toString("base64");

    // Upload to imgbb
    const form = new FormData();
    form.append("image", base64);

    const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, form, {
      headers: form.getHeaders()
    });

    const imageUrl = imgbbRes.data.data.url;

    res.status(200).json({ image: imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

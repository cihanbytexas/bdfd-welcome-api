import { createCanvas, loadImage, registerFont } from "canvas";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { username = "Kullanıcı", avatar } = req.query;

  const canvas = createCanvas(700, 250);
  const ctx = canvas.getContext("2d");

  // Arka plan
  ctx.fillStyle = "#0d162e"; // Lacivert ton
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Avatar çerçevesi
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(125, 125, 90, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();

  // Avatar resmi
  if (avatar) {
    try {
      const response = await fetch(avatar);
      const buffer = await response.buffer();
      const avatarImage = await loadImage(buffer);
      ctx.save();
      ctx.beginPath();
      ctx.arc(125, 125, 85, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImage, 40, 40, 170, 170);
      ctx.restore();
    } catch (err) {
      console.error("Avatar yüklenemedi:", err);
    }
  }

  // Yazı rengi ve stil
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Sans"; // Font yüklemek istemediğini söyledin, sistem fontu kullandım
  ctx.fillText(`Hoşgeldin, ${username}!`, 250, 140);

  // Görseli gönder
  res.setHeader("Content-Type", "image/png");
  canvas.createPNGStream().pipe(res);
}

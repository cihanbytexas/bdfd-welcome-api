import { createCanvas, loadImage } from "canvas";

export default async function handler(req, res) {
  try {
    const { username = "Guest", avatar, bgImage } = req.query;

    // Canvas boyutu
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Arka plan resmi
    if (bgImage) {
      try {
        const background = await loadImage(bgImage);
        ctx.drawImage(background, 0, 0, width, height);
      } catch (e) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, width, height);
    }

    // Avatar (yuvarlak)
    if (avatar) {
      try {
        const avatarImg = await loadImage(avatar);
        const size = 180;
        const x = 50;
        const y = height / 2 - size / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImg, x, y, size, size);
        ctx.restore();
      } catch (e) {
        console.log("Avatar yüklenemedi:", e.message);
      }
    }

    // Hoş geldin yazısı
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px Poppins, sans-serif";
    ctx.fillText("Welcome to the Server 🎉", 260, 170);

    ctx.font = "bold 35px Poppins, sans-serif";
    ctx.fillText(username, 260, 230);

    // PNG çıktısı
    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bir hata oluştu" });
  }
}

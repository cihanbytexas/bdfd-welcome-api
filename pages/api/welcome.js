import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import path from "path";

GlobalFonts.registerFromPath(path.join(process.cwd(), "public/fonts/Poppins-Bold.ttf"), "Poppins-Bold");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username, avatar, bgImage } = req.query;

    const user = username || "Guest";
    const userAvatar = avatar || "https://i.imgur.com/bq24D9q.jpeg";
    const background = bgImage || "https://i.imgur.com/bq24D9q.jpeg";

    const WIDTH = 800;
    const HEIGHT = 400;
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Arkaplan
    try {
      const bg = await loadImage(background);
      ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);
    } catch (err) { console.error("Background error:", err); }

    // Avatar
    try {
      const av = await loadImage(userAvatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 200, 80, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av, 20, 120, 160, 160);
      ctx.restore();
    } catch (err) { console.error("Avatar error:", err); }

    // Welcome yazıları
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Poppins-Bold";
    ctx.fillText("Welcome To Server,", 220, 150);

    ctx.font = "50px Poppins-Bold";
    ctx.fillText(user, 220, 220);

    const buffer = canvas.toBuffer("image/png");

    res.setHeader("Content-Type", "image/png");
    res.status(200).send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

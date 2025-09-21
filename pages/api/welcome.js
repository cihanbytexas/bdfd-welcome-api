import path from "path";
import fs from "fs";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

// Font yolları
const regularFont = path.resolve(process.cwd(), "public/fonts/Poppins-Regular.ttf");
const boldFont = path.resolve(process.cwd(), "public/fonts/Poppins-Bold.ttf");

// Fontları yükle
try {
  GlobalFonts.registerFromPath(regularFont, "Poppins");
  GlobalFonts.registerFromPath(boldFont, "Poppins-Bold");
  console.log("✅ Fontlar yüklendi");
} catch (e) {
  console.error("❌ Font yükleme hatası:", e);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body || {};
    const username = (body.username || "Guest").toString().slice(0, 40);
    const avatar = body.avatar;
    const bgColor = body.bgColor || "#0f1724";
    const bgImage = body.bgImage || null;
    const blur = parseInt(body.blur) || 0;

    const WIDTH = 800;
    const HEIGHT = 400;
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext("2d");

    // Arkaplan renk
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Arkaplan resmi
    if (bgImage) {
      try {
        const img = await loadImage(bgImage);
        ctx.globalAlpha = 1.0;
        ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
        if (blur > 0) {
          ctx.filter = `blur(${blur}px)`;
          ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
          ctx.filter = "none";
        }
      } catch (err) {
        console.error("❌ Arkaplan resmi yükleme hatası:", err.message);
      }
    }

    // Avatar
    if (avatar) {
      try {
        const img = await loadImage(avatar);
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 200, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 20, 120, 160, 160);
        ctx.restore();
      } catch (err) {
        console.error("❌ Avatar yükleme hatası:", err.message);
      }
    }

    // Başlık
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px Poppins-Bold, sans-serif";
    ctx.fillText("Welcome to the server,", 220, 150);

    // Kullanıcı adı
    ctx.font = "50px Poppins-Bold, sans-serif";
    ctx.fillText(username, 220, 220);

    // Alt yazı
    ctx.font = "20px Poppins, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Glad to have you here 🎉", 220, 270);

    // PNG dosya yolu
    const tmpDir = path.resolve(process.cwd(), "public/tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const filePath = path.join(tmpDir, "welcome.png");

    fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

    // Public URL
    const imageUrl = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/tmp/welcome.png`;

    res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error("❌ Genel hata:", err);
    res.status(500).json({ error: err.message });
  }
}

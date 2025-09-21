import fetch from 'node-fetch';
import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

// Fontları yükle
const regularFont = path.resolve(process.cwd(), 'public/fonts/Poppins-Regular.ttf');
const boldFont = path.resolve(process.cwd(), 'public/fonts/Poppins-Bold.ttf');
registerFont(regularFont, { family: 'Poppins' });
registerFont(boldFont, { family: 'Poppins-Bold' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};
    const username = (body.username || 'Guest').slice(0, 40);
    const avatar = body.avatar || null;
    const bgColor = body.bgColor || '#0f1724';
    const bgImage = body.bgImage || null;
    const blur = parseInt(body.blur) || 0;

    const WIDTH = 800;
    const HEIGHT = 400;
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');

    // Arkaplan rengi
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
          ctx.filter = 'none';
        }
      } catch (err) { console.error(err); }
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
      } catch (err) { console.error(err); }
    }

    // Yazılar
    ctx.fillStyle = '#ffffff';
    ctx.font = '40px Poppins-Bold, sans-serif';
    ctx.fillText('Welcome to the server,', 220, 150);

    ctx.font = '50px Poppins-Bold, sans-serif';
    ctx.fillText(username, 220, 220);

    ctx.font = '20px Poppins, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('Glad to have you here 🎉', 220, 270);

    // Canvas -> Buffer -> Base64
    const buffer = canvas.toBuffer('image/png');
    const base64Image = buffer.toString('base64');

    // Upload to ImgBB
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      body: new URLSearchParams({ image: base64Image })
    });
    const imgbbJson = await imgbbRes.json();

    if (!imgbbJson.success) return res.status(500).json({ error: 'ImgBB upload failed' });

    // Direkt link döndür
    res.status(200).json({ url: imgbbJson.data.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

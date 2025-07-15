import { createCanvas, loadImage } from '@napi-rs/canvas';

export default async function handler(req, res) {
  const { name = 'Misafir', avatar, member = '??' } = req.query;

  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 800, 300);

  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 40px Sans';
  ctx.fillText('HOŞ GELDİN!', 50, 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = '30px Sans';
  ctx.fillText(name, 50, 110);

  ctx.fillStyle = '#cccccc';
  ctx.font = '24px Sans';
  ctx.fillText(`Üye: ${member}`, 50, 160);

  if (avatar) {
    try {
      const img = await loadImage(avatar);
      ctx.beginPath();
      ctx.arc(650, 120, 80, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(img, 570, 40, 160, 160);
    } catch (e) {
      console.log("Avatar yüklenemedi:", e.message);
    }
  }

  const buffer = await canvas.encode('png');
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}

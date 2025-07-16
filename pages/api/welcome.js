import { createCanvas, loadImage } from '@napi-rs/canvas';

export default async function handler(req, res) {
  const { name = 'Misafir', avatar, member = '??' } = req.query;

  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // Arka plan rengi
  ctx.fillStyle = '#f0f4ff'; // Açık mavi ton
  ctx.fillRect(0, 0, 800, 300);

  // Kullanıcı adı
  ctx.fillStyle = '#1e3a8a'; // Lacivert mavi ton
  ctx.font = 'bold 36px Sans';
  ctx.fillText(`Hoş geldin, ${name}!`, 40, 80);

  // Üye numarası
  ctx.fillStyle = '#475569'; // Gri ton
  ctx.font = '28px Sans';
  ctx.fillText(`Sunucuya katılan ${member}. üyesin.`, 40, 130);

  // Avatar çizimi
  if (avatar) {
    try {
      const img = await loadImage(avatar);
      const centerX = 600;
      const centerY = 80;
      const radius = 80;

      // Yuvarlak kesme
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX + radius / 2, centerY + radius / 2, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, centerX, centerY, radius * 2, radius * 2);
      ctx.restore();
    } catch (e) {
      console.log("Avatar yüklenemedi:", e.message);
    }
  }

  // PNG olarak gönder
  const buffer = await canvas.encode('png');
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}

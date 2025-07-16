import { createCanvas, loadImage } from '@napi-rs/canvas';

export default async function handler(req, res) {
  const { name = 'Misafir', avatar, member = '??' } = req.query;

  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // Arka plan (koyu mavi)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 800, 300);

  // Başlık
  ctx.fillStyle = '#3b82f6'; // Mavi ton
  ctx.font = 'bold 40px Sans';
  ctx.fillText('HOŞ GELDİN!', 50, 70);

  // Kullanıcı adı
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Sans';
  ctx.fillText(`Kullanıcı: ${name}`, 50, 120);

  // Üyelik sırası
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '24px Sans';
  ctx.fillText(`Sunucu üye sayısı: ${member}`, 50, 165);

  // Avatar resmi (sağ üst)
  if (avatar) {
    try {
      const img = await loadImage(avatar);

      // Yuvarlak avatar kesimi
      ctx.save();
      ctx.beginPath();
      ctx.arc(650 + 75, 60 + 75, 75, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, 650, 60, 150, 150);
      ctx.restore();
    } catch (e) {
      console.log('Avatar yüklenemedi:', e.message);
    }
  }

  // Son olarak PNG döndür
  const buffer = await canvas.encode('png');
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}

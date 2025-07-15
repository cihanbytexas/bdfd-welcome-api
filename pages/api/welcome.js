import { createCanvas, loadImage } from 'canvas';

export default async function handler(req, res) {
  const { name = 'Misafir', avatar, member = '??' } = req.query;

  const width = 800;
  const height = 300;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Arka plan rengi
  ctx.fillStyle = '#1e1e2f';
  ctx.fillRect(0, 0, width, height);

  // Başlık
  ctx.fillStyle = '#00ffff';
  ctx.font = 'bold 40px Sans';
  ctx.fillText('HOŞ GELDİN!', 50, 60);

  // Kullanıcı adı
  ctx.fillStyle = '#ffffff';
  ctx.font = '30px Sans';
  ctx.fillText(name, 50, 110);

  // Üyelik numarası
  ctx.fillStyle = '#cccccc';
  ctx.font = '24px Sans';
  ctx.fillText(`Üye: ${member}`, 50, 160);

  // Avatar resmi
  if (avatar) {
    try {
      const img = await loadImage(avatar);
      ctx.beginPath();
      ctx.arc(650, 120, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 570, 40, 160, 160);
    } catch (e) {
      console.error('Avatar yüklenemedi:', e.message);
    }
  }

  // PNG yanıt olarak gönder
  res.setHeader('Content-Type', 'image/png');
  canvas.pngStream().pipe(res);
}

import { createCanvas, loadImage } from '@napi-rs/canvas';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { username = 'User', avatar } = req.query;

  if (!avatar) {
    return res.status(400).json({ error: 'Avatar URL gerekli' });
  }

  // Tuval oluştur
  const width = 800;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Arka plan rengi
  ctx.fillStyle = '#2C2F33';
  ctx.fillRect(0, 0, width, height);

  // Hoşgeldin yazısı
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('Hoş Geldin,', 250, 100);

  // Kullanıcı adı
  ctx.font = 'bold 35px sans-serif';
  ctx.fillStyle = '#7289DA';
  ctx.fillText(username, 250, 160);

  try {
    // Avatarı indir ve çiz
    const avatarRes = await fetch(avatar);
    const avatarBuffer = await avatarRes.arrayBuffer();
    const avatarImg = await loadImage(Buffer.from(avatarBuffer));

    // Avatar dairesi
    const avatarSize = 180;
    const x = 40;
    const y = 35;

    ctx.save();
    ctx.beginPath();
    ctx.arc(x + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(avatarImg, x, y, avatarSize, avatarSize);
    ctx.restore();

    // Görseli döndür
    const buffer = await canvas.encode('png');
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Görsel oluşturulamadı' });
  }
}

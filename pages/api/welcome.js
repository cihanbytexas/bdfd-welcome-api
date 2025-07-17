import { createCanvas, loadImage } from '@napi-rs/canvas';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { username = "Kullanıcı", avatar } = req.query;

  // Kanvas ayarları
  const width = 800;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Arka plan rengi
  ctx.fillStyle = '#1e1e2f'; // koyu mavi-gri arka plan
  ctx.fillRect(0, 0, width, height);

  // Yazı ayarları
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Sans';
  ctx.fillText(`Hoşgeldin, ${username}!`, 250, 120);

  // Avatar işle
  try {
    const avatarURL = avatar?.startsWith('http') ? avatar : `https://cdn.discordapp.com/avatars/${avatar}.png?size=256`;
    const avatarImg = await loadImage(avatarURL);

    // Yuvarlak avatar çiz
    const avatarSize = 180;
    const avatarX = 40;
    const avatarY = 35;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } catch (error) {
    console.error("Avatar yüklenemedi:", error.message);
  }

  // Sonuç
  const buffer = canvas.toBuffer('image/png');
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}

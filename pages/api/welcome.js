import { createCanvas, loadImage, registerFont } from 'canvas';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { name = 'Kullanıcı', avatar } = req.query;

  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Arka plan rengi
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Başlık
  ctx.fillStyle = '#1E3A8A'; // Mavi renk
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText('HOŞ GELDİN', 50, 80);

  // Kullanıcı adı
  ctx.fillStyle = '#111827'; // Siyahımsı
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(`Kullanıcı: ${name}`, 50, 150);

  // Avatar çizimi
  if (avatar) {
    try {
      const avatarImg = await loadImage(avatar);
      const avatarSize = 128;
      const avatarX = width - avatarSize - 50;
      const avatarY = 50;

      ctx.beginPath();
      ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    } catch (err) {
      console.error('Avatar yüklenemedi:', err);
    }
  }

  const buffer = canvas.toBuffer('image/png');
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}

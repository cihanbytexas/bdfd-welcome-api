import { createCanvas, loadImage } from '@napi-rs/canvas';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { username = 'Kullanıcı', avatar } = req.query;

  const width = 1024;
  const height = 450;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Arkaplan rengi
  ctx.fillStyle = '#111827'; // koyu gri
  ctx.fillRect(0, 0, width, height);

  // Kullanıcı avatarını çiz
  if (avatar) {
    try {
      const response = await fetch(avatar);
      const buffer = await response.arrayBuffer();
      const img = await loadImage(Buffer.from(buffer));
      
      const avatarX = 60;
      const avatarY = 100;
      const avatarSize = 256;

      // Daire içine kırp
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();
    } catch (err) {
      console.error('Avatar yüklenemedi:', err);
    }
  }

  // Yazı rengi ve font
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px sans-serif';
  ctx.fillText(`Hoş geldin, ${username}!`, 350, 180);

  ctx.font = '30px sans-serif';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(`Sunucumuza katıldığın için mutluyuz.`, 350, 240);

  // Görseli döndür
  const buffer = canvas.toBuffer('image/png');
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}

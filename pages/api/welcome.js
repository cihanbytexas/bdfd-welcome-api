import { createCanvas, loadImage, registerFont } from '@napi-rs/canvas';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

export default async function handler(req, res) {
  const { name = 'Misafir', avatar, member = '??' } = req.query;

  // __dirname ayarı (ESM için)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Fontu register et (dosya projenin köküne koyulmalı /fonts klasörü içinde)
  const fontPath = path.join(__dirname, '../../../public/fonts/OpenSans-Bold.ttf');
  if (fs.existsSync(fontPath)) {
    registerFont(fontPath, { family: 'Open Sans' });
  }

  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 800, 300);

  ctx.fillStyle = '#3b82f6';
  ctx.font = 'bold 40px "Open Sans"';
  ctx.fillText('HOŞ GELDİN!', 50, 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Open Sans"';
  ctx.fillText(`Kullanıcı: ${name}`, 50, 120);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '24px "Open Sans"';
  ctx.fillText(`Sunucu üye sayısı: ${member}`, 50, 165);

  if (avatar) {
    try {
      const img = await loadImage(avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(725, 135, 75, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 650, 60, 150, 150);
      ctx.restore();
    } catch (e) {
      console.log('Avatar yüklenemedi:', e.message);
    }
  }

  const buffer = await canvas.encode('png');
  res.setHeader('Content-Type', 'image/png');
  res.send(buffer);
}

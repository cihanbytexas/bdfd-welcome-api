import { createCanvas, loadImage } from '@napi-rs/canvas';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username') || 'Kullanıcı';

  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');

  // Arka plan rengi
  ctx.fillStyle = '#1e1e2f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Kullanıcı fotoğrafı (yuvarlak)
  const avatarURL = searchParams.get('avatar');
  if (avatarURL) {
    try {
      const avatar = await loadImage(avatarURL);
      ctx.save();
      ctx.beginPath();
      ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 25, 25, 200, 200);
      ctx.restore();
    } catch (e) {
      console.error('Avatar yüklenemedi:', e);
    }
  }

  // Yazı: Hoşgeldin, Kullanıcı!
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Sans';
  ctx.fillText(`Hoşgeldin, ${username}!`, 250, 140);

  const buffer = canvas.toBuffer('image/png');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
    },
  });
}

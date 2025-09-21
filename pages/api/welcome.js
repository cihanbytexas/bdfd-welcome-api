import { createCanvas, loadImage, registerFont } from 'canvas';
import fetch from 'node-fetch';
import path from 'path';

// Fontları kaydet
registerFont(path.join(process.cwd(), 'public/fonts/Poppins-Regular.ttf'), { family: 'Poppins', weight: 'normal' });
registerFont(path.join(process.cwd(), 'public/fonts/Poppins-Bold.ttf'), { family: 'Poppins', weight: 'bold' });

export default async function handler(req, res) {
    const { username = "Guest", avatarURL } = req.query;

    if (!avatarURL) return res.status(400).send("Avatar URL gerekli!");

    // Canvas oluştur
    const width = 700;
    const height = 250;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Arka plan
    ctx.fillStyle = "#1E1E2F"; // koyu mavi
    ctx.fillRect(0, 0, width, height);

    // Avatar
    const avatar = await loadImage(avatarURL);
    const avatarSize = 180;
    ctx.save();
    ctx.beginPath();
    ctx.arc(125 + avatarSize/2, height/2, avatarSize/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 125, (height-avatarSize)/2, avatarSize, avatarSize);
    ctx.restore();

    // Yazılar
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Poppins';
    ctx.fillText(`Welcome, ${username}!`, 300, 130);

    ctx.font = '28px Poppins';
    ctx.fillStyle = '#00aaff';
    ctx.fillText('to our Discord server!', 300, 180);

    // Resmi PNG olarak gönder
    res.setHeader('Content-Type', 'image/png');
    res.send(canvas.toBuffer('image/png'));
}

// api/welcome-card.js
import { createCanvas, loadImage, registerFont } from 'canvas';

export default async function handler(req, res) {
  // Sadece POST isteklerini kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      username, 
      avatarUrl, 
      backgroundImage,
      backgroundColor = '#667eea',
      title = 'Hoşgeldin!',
      subtitle = 'Aramıza katıldığın için teşekkürler',
      textColor = '#ffffff',
      accentColor = '#f093fb'
    } = req.body;

    // Gerekli parametreleri kontrol et
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Canvas boyutları - daha modern görünüm için
    const width = 1000;
    const height = 500;
    
    // Canvas oluştur
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Arka plan çiz
    await drawBackground(ctx, width, height, backgroundImage, backgroundColor);

    // Overlay katmanı (metin okunabilirliği için)
    drawOverlay(ctx, width, height);

    // Modern dekoratif elementler
    drawModernDecorations(ctx, width, height, accentColor);

    // Avatar yükle ve çiz - yeni modern tasarım
    if (avatarUrl) {
      try {
        const avatar = await loadImage(avatarUrl);
        drawModernAvatar(ctx, avatar, width, height);
      } catch (err) {
        console.log('Avatar yüklenemedi, varsayılan avatar kullanılıyor');
        drawDefaultAvatar(ctx, width, height);
      }
    } else {
      drawDefaultAvatar(ctx, width, height);
    }

    // Modern metin düzeni
    drawModernText(ctx, { username, title, subtitle, textColor }, width, height);

    // Canvas'ı PNG'ye çevir
    const buffer = canvas.toBuffer('image/png');

    // Response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Length', buffer.length);
    
    return res.status(200).send(buffer);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function drawBackground(ctx, width, height, backgroundImage, backgroundColor) {
  if (backgroundImage) {
    try {
      const bgImage = await loadImage(backgroundImage);
      
      // Resmi canvas boyutuna uygun şekilde çiz
      const scale = Math.max(width / bgImage.width, height / bgImage.height);
      const scaledWidth = bgImage.width * scale;
      const scaledHeight = bgImage.height * scale;
      const x = (width - scaledWidth) / 2;
      const y = (height - scaledHeight) / 2;
      
      ctx.drawImage(bgImage, x, y, scaledWidth, scaledHeight);
    } catch (err) {
      console.log('Arka plan resmi yüklenemedi, renk kullanılıyor');
      drawGradientBackground(ctx, width, height, backgroundColor);
    }
  } else {
    drawGradientBackground(ctx, width, height, backgroundColor);
  }
}

function drawGradientBackground(ctx, width, height, backgroundColor) {
  // Modern gradyan arka plan
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, backgroundColor);
  gradient.addColorStop(0.5, adjustBrightness(backgroundColor, 10));
  gradient.addColorStop(1, adjustBrightness(backgroundColor, -20));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawOverlay(ctx, width, height) {
  // Yarı şeffaf overlay - metin okunabilirliği için
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
  gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawModernDecorations(ctx, width, height, accentColor) {
  // Modern geometrik şekiller
  ctx.globalAlpha = 0.1;
  
  // Büyük daire
  const circleGradient = ctx.createRadialGradient(width - 150, 150, 0, width - 150, 150, 200);
  circleGradient.addColorStop(0, accentColor);
  circleGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = circleGradient;
  ctx.beginPath();
  ctx.arc(width - 150, 150, 200, 0, Math.PI * 2);
  ctx.fill();
  
  // Alt sol dekoratif şekil
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(200, height);
  ctx.lineTo(0, height - 100);
  ctx.closePath();
  ctx.fill();
  
  // Üst sağ dekoratif çizgiler
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.2;
  
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(width - 100 + (i * 15), 50);
    ctx.lineTo(width - 50 + (i * 15), 100);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

function drawModernAvatar(ctx, avatar, width, height) {
  const size = 160;
  const x = 80;
  const y = height / 2 - size / 2;
  
  // Avatar gölgesi
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;
  
  // Avatar için yuvarlak kesim
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  
  // Avatar çiz
  ctx.drawImage(avatar, x, y, size, size);
  
  ctx.restore();
  
  // Modern avatar çerçevesi
  const borderGradient = ctx.createLinearGradient(x, y, x + size, y + size);
  borderGradient.addColorStop(0, '#ffffff');
  borderGradient.addColorStop(1, '#f0f0f0');
  
  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
  ctx.stroke();
  
  // İç çerçeve
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 - 3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDefaultAvatar(ctx, width, height) {
  const size = 160;
  const x = 80;
  const y = height / 2 - size / 2;
  
  // Gölge
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;
  
  // Varsayılan avatar arka planı
  const avatarGradient = ctx.createLinearGradient(x, y, x + size, y + size);
  avatarGradient.addColorStop(0, '#667eea');
  avatarGradient.addColorStop(1, '#764ba2');
  
  ctx.fillStyle = avatarGradient;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  
  // Kullanıcı ikonu
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('👤', x + size / 2, y + size / 2);
  
  // Çerçeve
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawModernText(ctx, textData, width, height) {
  const { username, title, subtitle, textColor } = textData;
  const textStartX = 300;
  
  // Ana başlık gölgesi
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  
  // "Hoşgeldin" metni
  ctx.fillStyle = textColor;
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, textStartX, height / 2 - 50);
  
  ctx.restore();
  
  // Kullanıcı adı - daha büyük ve öne çıkan
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 3;
  
  ctx.fillStyle = textColor;
  ctx.font = 'bold 64px Arial, sans-serif';
  ctx.fillText(username, textStartX, height / 2 + 20);
  
  ctx.restore();
  
  // Alt metin
  ctx.fillStyle = adjustOpacity(textColor, 0.8);
  ctx.font = '28px Arial, sans-serif';
  ctx.fillText(subtitle, textStartX, height / 2 + 80);
  
  // Dekoratif çizgi
  const lineGradient = ctx.createLinearGradient(textStartX, 0, textStartX + 300, 0);
  lineGradient.addColorStop(0, textColor);
  lineGradient.addColorStop(1, 'transparent');
  
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(textStartX, height / 2 - 80);
  ctx.lineTo(textStartX + 200, height / 2 - 80);
  ctx.stroke();
  
  // Tarih bilgisi
  const currentDate = new Date().toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  ctx.fillStyle = adjustOpacity(textColor, 0.6);
  ctx.font = '20px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(currentDate, width - 50, height - 30);
}

function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function adjustOpacity(color, opacity) {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
}

import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username, avatar, bgImage, bgColor } = req.body;

    // Default değerler
    const user = username || "Guest";
    const userAvatar = avatar || "https://i.imgur.com/bq24D9q.jpeg"; // avatar yoksa default
    const background = bgImage || "https://i.imgur.com/bq24D9q.jpeg";
    const color = bgColor || "#1a1a2e";

    // Base64 oluşturmak yerine Cloudinary API / ImgBB kullanacağız
    // Burada sadece avatar ve background URL kullanıyoruz, direkt link döndür
    const welcomeCardUrl = `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}&image=${encodeURIComponent(userAvatar)}`;

    // Eğer ImgBB’den upload yapmak istemiyorsan direkt avatar URL döndür
    res.status(200).json({ url: userAvatar });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

const cache = {};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const apiKey = process.env.JQUANTS_API_KEY;
    const code = req.query.code || "7203";

    if (!apiKey) {
      return res.status(500).json({ error: "APIキー未設定" });
    }

    const now = Date.now();
    const CACHE_MS = 10000; // 10秒キャッシュ

    // キャッシュがあれば使う
    if (cache[code] && now - cache[code].time < CACHE_MS) {
      return res.status(200).json(cache[code].data);
    }

    const response = await fetch(
      `https://api.jquants.com/v2/equities/bars/daily?code=${code}0&from=20240125&to=20240130`,
      {
        headers: {
          "x-api-key": apiKey
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // 新しいデータをキャッシュ保存
    cache[code] = {
      time: now,
      data: data
    };

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "サーバーエラー",
      detail: error.message
    });
  }
}
const cache = {};
const inFlight = {};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const apiKey = process.env.JQUANTS_API_KEY;
    const code = (req.query.code || "7203").trim();

    if (!apiKey) {
      return res.status(500).json({ error: "APIキー未設定" });
    }

    const now = Date.now();
    const CACHE_MS = 10000;

    // 10秒以内ならキャッシュ返す
    if (cache[code] && now - cache[code].time < CACHE_MS) {
      return res.status(200).json(cache[code].data);
    }

    // 同じ銘柄の通信中なら、その結果を待って返す
    if (inFlight[code]) {
      const data = await inFlight[code];
      return res.status(200).json(data);
    }

    inFlight[code] = fetchFromJQuants(apiKey, code);

    try {
      const data = await inFlight[code];

      cache[code] = {
        time: Date.now(),
        data: data
      };

      return res.status(200).json(data);
    } catch (error) {
      // rate limit時は古いキャッシュがあればそれを返す
      if (cache[code]) {
        return res.status(200).json(cache[code].data);
      }

      return res.status(500).json({
        error: "API取得失敗",
        detail: error.message
      });
    } finally {
      delete inFlight[code];
    }

  } catch (error) {
    return res.status(500).json({
      error: "サーバーエラー",
      detail: error.message
    });
  }
}

async function fetchFromJQuants(apiKey, code) {
  const response = await fetch(
  `https://api.jquants.com/v2/equities/bars/daily?code=${code}0&from=20240131&to=20240210`code=${code}0&from=20240125&to=20240130`,
    {
      headers: {
        "x-api-key": apiKey
      }
    }
  );

  const data = await response.json();

  // J-Quantsのrate limitやエラーを明示的に失敗扱い
  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }

  if (data?.message && data.message.includes("Rate limit exceeded")) {
    throw new Error(data.message);
  }

  return data;
}
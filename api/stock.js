const cache = {};
const inFlight = {};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const apiKey = process.env.JQUANTS_API_KEY;
    const code = String(req.query.code || "7203").trim();

    if (!apiKey) {
      return res.status(500).json({ error: "APIキー未設定" });
    }

    const now = Date.now();
    const CACHE_MS = 10000;

    if (cache[code] && now - cache[code].time < CACHE_MS) {
      return res.status(200).json(cache[code].data);
    }

    if (inFlight[code]) {
      const data = await inFlight[code];
      return res.status(200).json(data);
    }

    inFlight[code] = fetchStock(apiKey, code);

    try {
      const data = await inFlight[code];

      cache[code] = {
        time: Date.now(),
        data
      };

      return res.status(200).json(data);
    } catch (error) {
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

async function fetchStock(apiKey, code) {
  const jquantsCode = code.endsWith("0") ? code : `${code}0`;

  const url =
    `https://api.jquants.com/v2/equities/bars/daily?code=${jquantsCode}&from=20240131&to=20240210`;

  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey
    }
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`JSON変換失敗: ${text.slice(0, 100)}`);
  }

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
}
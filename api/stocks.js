const cache = {};

const WATCH_CODES = [
  "7203","6758","7974","9984","9432",
  "8306","8316","8411","6501","6503",
  "7011","7012","7013","8035","6857",
  "9983","6098","4063","7267","8058",
  "8001","8002","8031","8053","8766",
  "8750","9101","9104","9107","5401",
  "5406","5411","6301","6367","6146",
  "7733","7741","7751","6902","6954",
  "6981","6971","4661","4689","4755",
  "9613","9020","9022","9201","9202"
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function getDateRange() {
  const to = new Date("2026-01-31");
  const from = new Date("2026-01-31");

  from.setDate(from.getDate() - 80);

  return {
    from: formatDate(from),
    to: formatDate(to)
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const apiKey = process.env.JQUANTS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "APIキー未設定" });
    }

    const now = Date.now();
    const CACHE_MS = 10 * 60 * 1000;

    if (cache.all && now - cache.all.time < CACHE_MS) {
      return res.status(200).json(cache.all.data);
    }

    const result = {};

    for (const code of WATCH_CODES) {
      try {
        const data = await fetchStock(apiKey, code);

        result[code] = {
          data: data.data || []
        };

        await wait(1200);

      } catch (error) {
        result[code] = {
          error: error.message,
          data: []
        };

        if (String(error.message).includes("Rate limit")) {
          await wait(3000);
        }
      }
    }

    cache.all = {
      time: Date.now(),
      data: result
    };

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({
      error: "まとめ取得失敗",
      detail: error.message
    });
  }
}

async function fetchStock(apiKey, code) {
  const jquantsCode = code.endsWith("0") ? code : `${code}0`;
  const range = getDateRange();

  const url =
    `https://api.jquants.com/v2/equities/bars/daily?code=${jquantsCode}&from=${range.from}&to=${range.to}`;

  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`);
  }

  return data;
}

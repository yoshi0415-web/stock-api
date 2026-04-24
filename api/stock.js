const cache = {};
const inFlight = {};

let lastJquantsAccessAt = 0;

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
  const today = new Date();

  const to = new Date(today);
  const from = new Date(today);

  from.setDate(from.getDate() - 60);

  return {
    from: formatDate(from),
    to: formatDate(to)
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const apiKey = process.env.JQUANTS_API_KEY;
    const code = String(req.query.code || "7203").trim();

    if (!apiKey) {
      return res.status(500).json({ error: "APIキー未設定" });
    }

    const now = Date.now();
    const CACHE_MS = 5 * 60 * 1000;

    if (cache[code] && now - cache[code].time < CACHE_MS) {
      return res.status(200).json(cache[code].data);
    }

    if (inFlight[code]) {
      const data = await inFlight[code];
      return res.status(200).json(data);
    }

    inFlight[code] = fetchStockWithRateLimit(apiKey, code);

    try {
      const data = await inFlight[code];

      cache[code] = {
        time: Date.now(),
        data
      };

      return res.status(200).json(data);

    } finally {
      delete inFlight[code];
    }

  } catch (error) {
    return res.status(500).json({
      error: "API取得失敗",
      detail: error.message
    });
  }
}

async function fetchStockWithRateLimit(apiKey, code) {
  const MIN_INTERVAL_MS = 1200;

  const now = Date.now();
  const elapsed = now - lastJquantsAccessAt;

  if (elapsed < MIN_INTERVAL_MS) {
    await wait(MIN_INTERVAL_MS - elapsed);
  }

  lastJquantsAccessAt = Date.now();

  try {
    return await fetchStock(apiKey, code);

  } catch (error) {
    if (String(error.message).includes("Rate limit")) {
      await wait(1800);
      return await fetchStock(apiKey, code);
    }

    throw error;
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
const fs = require("fs");

const WATCH_CODES = [
  "7203","6758","7974","9984","9432"
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
  const to = new Date();
  const from = new Date();

  from.setDate(from.getDate() - 80);

  return {
    from: formatDate(from),
    to: formatDate(to)
  };
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

async function main() {
  const apiKey = process.env.JQUANTS_API_KEY;

  if (!apiKey) {
    throw new Error("JQUANTS_API_KEY が未設定");
  }

  const result = {};

  for (const code of WATCH_CODES) {
    try {
      const data = await fetchStock(apiKey, code);

      result[code] = {
        data: data.data || []
      };

    } catch (error) {
      result[code] = {
        error: error.message,
        data: []
      };
    }

    await wait(13000);
  }

  fs.writeFileSync(
    "stocks.json",
    JSON.stringify(result, null, 2),
    "utf8"
  );

  console.log("stocks.json updated");
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
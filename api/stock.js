export default async function handler(req, res) {
  try {
    const apiKey = process.env.JQUANTS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "APIキーが設定されていません" });
    }

    const response = await fetch(
      "https://api.jquants.com/v2/markets/trading_calendar",
      {
        headers: {
          "X-API-KEY": apiKey
        }
      }
    );

    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export default async function handler(req, res) {
  try {
    const apiKey = process.env.JQUANTS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "APIキーなし" });
    }

    const response = await fetch(
      "https://api.jquants.com/v2/equities/bars/daily?code=72030&from=20240125&to=20240130",
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

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

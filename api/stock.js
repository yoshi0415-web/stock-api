export default async function handler(req, res) {
  try {
    const apiKey = "wFr-p-IwByiALQ4v7yU15oZGaazO9Bn49ouXgsXqixo";

    const response = await fetch(
      "https://api.jquants.com/v2/eq/bars/daily?code=7203",
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

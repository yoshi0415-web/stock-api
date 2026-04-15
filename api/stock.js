export default async function handler(req, res) {
  try {
    const apiKey = process.env.JQUANTS_API_KEY;

    const response = await fetch(
      "https://api.jquants.com/v2/equities/bars/daily?code=72030&from=20240122&to=20240210",
      {
        headers: {
          "x-api-key": apiKey
        }
      }
    );

    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

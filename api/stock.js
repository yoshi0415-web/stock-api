export default async function handler(req, res) {
  try {
    const apiKey = process.env.JQUANTS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "APIキー未設定" });
    }

    const response = await fetch(
      "https://api.jquants.com/v2/equities/bars/daily?code=72030&date=20240122",
      {
        headers: {
          "x-api-key": apiKey
        }
      }
    );

    const data = await response.json();

    // 👇 APIエラー処理
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // 👇 データ存在チェック（超重要）
    if (!data.data || data.data.length === 0) {
      return res.status(200).json({
        message: "データなし",
        data: []
      });
    }

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({
      error: "サーバーエラー",
      detail: error.message
    });
  }
}

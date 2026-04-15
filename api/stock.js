export default async function handler(req, res) {
  try {
    const email = "yoridaiiti@gmail.com";
    const password = "Ny030410";

    // ① リフレッシュトークン取得
    const refreshRes = await fetch("https://api.jquants.com/v1/token/auth_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mailaddress: email,
        password: password
      })
    });

    const refreshData = await refreshRes.json();

    if (!refreshData.refreshToken) {
      return res.status(400).json(refreshData);
    }

    // ② IDトークン取得
    const idRes = await fetch(
      `https://api.jquants.com/v1/token/auth_refresh?refreshtoken=${refreshData.refreshToken}`
    );

    const idData = await idRes.json();

    if (!idData.idToken) {
      return res.status(400).json(idData);
    }

    const idToken = idData.idToken;

    // ③ 株価取得
    const stockRes = await fetch(
      `https://api.jquants.com/v1/prices/daily_quotes?code=7203&from=20240101&to=20240110`,
      {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      }
    );

    const stockData = await stockRes.json();

    res.status(200).json(stockData);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

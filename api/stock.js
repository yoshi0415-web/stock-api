export default async function handler(req, res) {
  const email = "あなたのメール";
  const password = "あなたのパスワード";

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

  // ② IDトークン取得
  const idRes = await fetch(`https://api.jquants.com/v1/token/auth_refresh?refreshtoken=${refreshData.refreshToken}`);
  const idData = await idRes.json();

  const idToken = idData.idToken;

  // ③ 株価取得（トヨタ）
  const stockRes = await fetch(`https://api.jquants.com/v1/prices/daily_quotes?code=7203&from=20240101&to=20240110`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });

  const stockData = await stockRes.json();

  res.status(200).json(stockData);
}

export default async function handler(req, res) {
  const apiKey = "oSWhicpumjNVdXendV-5jL4swDDuh9JECNQZdFb4jgI";

  const response = await fetch(
    "https://api.jquants.com/v1/prices/daily_quotes?code=7203&from=20240101&to=20240110",
    {
      headers: {
        "X-API-KEY": apiKey
      }
    }
  );

  const data = await response.json();

  res.status(200).json(data);
}

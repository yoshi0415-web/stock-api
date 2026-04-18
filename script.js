let chart = null;

const codeInput = document.getElementById("code");
const fromInput = document.getElementById("from");
const toInput = document.getElementById("to");
const showButton = document.getElementById("showButton");
const reloadButton = document.getElementById("reloadButton");
const risingButton = document.getElementById("risingButton");
const resultList = document.getElementById("resultList");
const chartCanvas = document.getElementById("chart");

const WATCH_CODES = ["7203", "6758", "7974", "9984", "9432"];

const STOCK_NAMES = {
  "7203": "トヨタ",
  "6758": "ソニーグループ",
  "7974": "任天堂",
  "9984": "ソフトバンクグループ",
  "9432": "NTT"
};

showButton.addEventListener("click", loadChart);

reloadButton.addEventListener("click", () => {
  location.reload();
});

risingButton.addEventListener("click", showRisingStocks);

codeInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    loadChart();
  }
});

async function loadChart() {
  const code = codeInput.value.trim();

  if (!code) {
    alert("銘柄コードを入力して");
    return;
  }

  try {
    const response = await fetch(`/api/stock?code=${code}`);
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      alert("データがありません");
      return;
    }

    let prices = data.data;

const from = fromInput.value.trim();
const to = toInput.value.trim();

if (from) {
  prices = prices.filter(item => item.Date.replaceAll("-", "") >= from);
}

if (to) {
  prices = prices.filter(item => item.Date.replaceAll("-", "") <= to);
}
    const labels = prices.map(item => item.Date);
    const closePrices = prices.map(item => item.C);

    if (chart) {
      chart.destroy();
    }

    chart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: `${code} ${STOCK_NAMES[code] || ""} の株価`,
            data: closePrices,
            borderWidth: 2,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  } catch (error) {
    console.error(error);
    alert("通信エラー");
  }
}

function showRisingStocks() {
  resultList.innerHTML = "";

  for (const code of WATCH_CODES) {
    const li = document.createElement("li");
    li.textContent = `${code} ${STOCK_NAMES[code] || ""}`;

    li.addEventListener("click", () => {
      codeInput.value = code;
      loadChart();
    });

    resultList.appendChild(li);、
  }
}
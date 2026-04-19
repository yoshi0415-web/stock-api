document.addEventListener("DOMContentLoaded", () => {
  let chart = null;

  const risingButton = document.getElementById("risingButton");
  const fallingButton = document.getElementById("fallingButton");
  const bullishButton = document.getElementById("bullishButton");
  const volumeButton = document.getElementById("volumeButton");
  const resultList = document.getElementById("resultList");
  const chartCanvas = document.getElementById("chart");
  const chartTitle = document.getElementById("chartTitle");

  const WATCH_CODES = ["7203", "6758", "7974", "9984", "9432"];

  const STOCK_NAMES = {
    "7203": "トヨタ",
    "6758": "ソニーグループ",
    "7974": "任天堂",
    "9984": "ソフトバンクグループ",
    "9432": "NTT"
  };

  risingButton.addEventListener("click", () => {
    showStockList(WATCH_CODES, "上昇中");
  });

  fallingButton.addEventListener("click", () => {
    showStockList(WATCH_CODES, "下落中");
  });

  bullishButton.addEventListener("click", () => {
    showStockList(WATCH_CODES, "陽線連続");
  });

  volumeButton.addEventListener("click", () => {
    showStockList(WATCH_CODES, "出来高増");
  });

  function showStockList(codes, label) {
    resultList.innerHTML = "";

    for (const code of codes) {
      const li = document.createElement("li");
      li.textContent = `${code} ${STOCK_NAMES[code] || ""}`;

      li.addEventListener("click", () => {
        loadChart(code, label);
      });

      resultList.appendChild(li);
    }
  }

  async function loadChart(code, label) {
    try {
      const response = await fetch(`https://kabutree.vercel.app/api/stock?code=${code}`);
      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        alert("データがありません");
        return;
      }

      const prices = data.data;
      const labels = prices.map(item => item.Date);
      const closePrices = prices.map(item => item.C);

      if (chart) {
        chart.destroy();
      }

      chartTitle.textContent = `${label} : ${code} ${STOCK_NAMES[code] || ""}`;

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
});
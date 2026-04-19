document.addEventListener("DOMContentLoaded", () => {
  let chart = null;
  let isLoading = false;
  let currentRequestId = 0;

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
    
    function blockInteraction(event) {
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
}

function enableInteractionBlock() {
  document.addEventListener("click", blockInteraction, true);
  document.addEventListener("touchstart", blockInteraction, { capture: true, passive: false });
  document.addEventListener("touchend", blockInteraction, { capture: true, passive: false });
  document.addEventListener("pointerdown", blockInteraction, true);
}

function disableInteractionBlock() {
  document.removeEventListener("click", blockInteraction, true);
  document.removeEventListener("touchstart", blockInteraction, true);
  document.removeEventListener("touchend", blockInteraction, true);
  document.removeEventListener("pointerdown", blockInteraction, true);
}
    
  };

  risingButton.addEventListener("click", () => {
    if (isLoading) return;
    showStockList(WATCH_CODES, "上昇中");
  });

  fallingButton.addEventListener("click", () => {
    if (isLoading) return;
    showStockList(WATCH_CODES, "下落中");
  });

  bullishButton.addEventListener("click", () => {
    if (isLoading) return;
    showStockList(WATCH_CODES, "陽線連続");
  });

  volumeButton.addEventListener("click", () => {
    if (isLoading) return;
    showStockList(WATCH_CODES, "出来高増");
  });

  function setLoadingState(loading) {
  isLoading = loading;

  if (loading) {
    document.body.classList.add("is-loading");
    resultList.classList.add("is-loading");
    enableInteractionBlock();
  } else {
    document.body.classList.remove("is-loading");
    resultList.classList.remove("is-loading");
    disableInteractionBlock();
  }
}
  }

  function showStockList(codes, label) {
    resultList.innerHTML = "";

    for (const code of codes) {
      const li = document.createElement("li");
      li.textContent = `${code} ${STOCK_NAMES[code] || ""}`;

      li.addEventListener("click", () => {
        if (isLoading) return;
        loadChart(code, label);
      });

      resultList.appendChild(li);
    }
  }

  async function loadChart(code, label) {
    if (isLoading) return;

    const requestId = ++currentRequestId;
    setLoadingState(true);

    try {
      const response = await fetch(
        `https://kabutree.vercel.app/api/stock?code=${code}`
      );

      const data = await response.json();

      // 古い通信結果は無視
      if (requestId !== currentRequestId) {
        return;
      }

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
              label: `${code} ${STOCK_NAMES[code] || ""}`,
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
      if (requestId !== currentRequestId) {
        return;
      }

      console.error(error);
      alert("通信エラー");
    } finally {
      if (requestId === currentRequestId) {
        setTimeout(() => {
          setLoadingState(false);
        }, 1000);
      }
    }
  }
});
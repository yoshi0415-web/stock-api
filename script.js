document.addEventListener("DOMContentLoaded", () => {
  let chart = null;
  let isLoading = false;
  let currentRequestId = 0;

  let lastRequestAt = 0;
  const MIN_COOLDOWN_MS = 3000;

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

  function setActiveButton(activeButton) {
    [risingButton, fallingButton, bullishButton, volumeButton].forEach(button => {
      button.classList.remove("active");
    });

    activeButton.classList.add("active");
  }

  function clearChart(titleText = "チャート") {
    if (chart) {
      chart.destroy();
      chart = null;
    }

    chartTitle.textContent = titleText;
  }

  function createStockItem(code, label) {
    const li = document.createElement("li");

    let name = STOCK_NAMES[code] || "";

    if (name.length > 12) {
      name = name.slice(0, 12) + "…";
    }

    const line1 = name.slice(0, 6);
    const line2 = name.slice(6);

    li.innerHTML = `
      <span class="stock-code">${code}</span>
      <span class="stock-name-wrap">
        <span class="stock-name">${line1}</span>
        <span class="stock-name">${line2}</span>
      </span>
    `;

    li.addEventListener("click", () => {
      if (isLoading) return;
      loadChart(code, label);
    });

    return li;
  }

  function showStockList(codes, label) {
    resultList.innerHTML = "";

    for (const code of codes) {
      resultList.appendChild(createStockItem(code, label));
    }
  }

  async function showFilteredStocks(label, judgeFunction) {
    resultList.innerHTML = "";

    for (const code of WATCH_CODES) {
      try {
        const response = await fetch(
          `https://kabutree.vercel.app/api/stock?code=${code}`
        );

        const data = await response.json();

        if (!data.data || data.data.length < 3) {
          continue;
        }

        if (judgeFunction(data.data)) {
          resultList.appendChild(createStockItem(code, label));
        }

      } catch (error) {
        console.log(error);
      }
    }

    if (resultList.children.length === 0) {
      resultList.innerHTML = "<li>該当なし</li>";
      clearChart(`${label} : 該当なし`);
    }
  }

  function setLoadingState(loading) {
    isLoading = loading;

    if (loading) {
      document.body.classList.add("is-loading");
      resultList.classList.add("is-loading");
    } else {
      document.body.classList.remove("is-loading");
      resultList.classList.remove("is-loading");
      lastRequestAt = Date.now();
    }
  }

  risingButton.addEventListener("click", async () => {
    if (isLoading) return;

    setActiveButton(risingButton);
    clearChart("赤三兵");
    await showFilteredStocks("赤三兵", isRedThreeSoldiers);
  });

  fallingButton.addEventListener("click", async () => {
    if (isLoading) return;

    setActiveButton(fallingButton);
    clearChart("三羽烏");
    await showFilteredStocks("三羽烏", isThreeBlackCrows);
  });

  bullishButton.addEventListener("click", () => {
    if (isLoading) return;

    setActiveButton(bullishButton);
    clearChart("出来高急増");
    showStockList(WATCH_CODES, "出来高急増");
  });

  volumeButton.addEventListener("click", () => {
    if (isLoading) return;

    setActiveButton(volumeButton);
    clearChart("高値更新");
    showStockList(WATCH_CODES, "高値更新");
  });

  function drawChart(code, label, labels, closePrices) {
    if (chart) {
      chart.destroy();
    }

    chartTitle.textContent =
      `${label} : ${code} ${STOCK_NAMES[code] || ""}`;

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
        maintainAspectRatio: true,
        animation: {
          duration: 400
        }
      }
    });
  }

  async function loadChart(code, label) {
    const now = Date.now();

    if (isLoading) return;
    if (now - lastRequestAt < MIN_COOLDOWN_MS) return;

    lastRequestAt = now;

    const requestId = ++currentRequestId;

    setLoadingState(true);

    try {
      const response = await fetch(
        `https://kabutree.vercel.app/api/stock?code=${code}`
      );

      const data = await response.json();

      if (requestId !== currentRequestId) return;

      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        alert(JSON.stringify(data));
        return;
      }

      const prices = data.data;
      const labels = prices.map(item => item.Date);
      const closePrices = prices.map(item => item.C);

      drawChart(code, label, labels, closePrices);

    } catch (error) {
      if (requestId !== currentRequestId) return;

      alert("通信エラー");

    } finally {
      if (requestId === currentRequestId) {
        setLoadingState(false);
      }
    }
  }
});
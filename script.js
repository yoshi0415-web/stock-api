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

  risingButton.addEventListener("click", () => {
    if (isLoading) return;
    logCondition("上昇中");
    showStockList(WATCH_CODES, "上昇中");
  });

  fallingButton.addEventListener("click", () => {
    if (isLoading) return;
    logCondition("下落中");
    showStockList(WATCH_CODES, "下落中");
  });

  bullishButton.addEventListener("click", () => {
    if (isLoading) return;
    logCondition("陽線連続");
    showStockList(WATCH_CODES, "陽線連続");
  });

  volumeButton.addEventListener("click", () => {
    if (isLoading) return;
    logCondition("出来高増");
    showStockList(WATCH_CODES, "出来高増");
  });

  function setLoadingState(loading) {
    isLoading = loading;

    if (loading) {
      document.body.classList.add("is-loading");
      resultList.classList.add("is-loading");
      logLoadingStart();
    } else {
      document.body.classList.remove("is-loading");
      resultList.classList.remove("is-loading");
      lastRequestAt = Date.now();
      logLoadingEnd();
    }
  }

  function showStockList(codes, label) {
    resultList.innerHTML = "";
    logList(label);

    for (const code of codes) {
      const li = document.createElement("li");
      li.textContent = `${code} ${STOCK_NAMES[code] || ""}`;

      li.addEventListener("click", () => {
        if (isLoading) return;

        logCandidate(code);
        loadChart(code, label);
      });

      resultList.appendChild(li);
    }
  }

  function drawChart(code, label, labels, closePrices) {
    if (chart) {
      chart.destroy();
      logDestroy();
    }

    chartTitle.textContent =
      `${label} : ${code} ${STOCK_NAMES[code] || ""}`;

    chart = new Chart(chartCanvas, {
      type: "line",
      data: {
        labels,
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

    logChart(code);
  }

  async function loadChart(code, label) {
    const now = Date.now();

    if (isLoading) return;

    if (now - lastRequestAt < MIN_COOLDOWN_MS) {
      logCooldown(code);
      return;
    }

    lastRequestAt = now;

    const requestId = ++currentRequestId;

    logStart(code);
    setLoadingState(true);

    try {
      const response = await fetch(
        `https://kabutree.vercel.app/api/stock?code=${code}`
      );

      logHttp(response.status);

      const data = await response.json();

      if (requestId !== currentRequestId) {
        logIgnore(code);
        return;
      }

      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        logNoData(data);
        showDebugLogs();
        return;
      }

      logSuccess(data.data.length);

      const prices = data.data;
      const labels = prices.map(item => item.Date);
      const closePrices = prices.map(item => item.C);

      drawChart(code, label, labels, closePrices);

    } catch (error) {
      if (requestId !== currentRequestId) {
        return;
      }

      logError(error);
      showDebugLogs();

    } finally {
      if (requestId === currentRequestId) {
        setLoadingState(false);
      }
    }
  }

  logCondition("script.js 読み込み完了");
});
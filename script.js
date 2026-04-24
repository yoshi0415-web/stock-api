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
  const logArea = document.getElementById("logArea");

  const WATCH_CODES = ["7203", "6758", "7974", "9984", "9432"];

  const STOCK_NAMES = {
    "7203": "トヨタ",
    "6758": "ソニーグループ",
    "7974": "任天堂",
    "9984": "ソフトバンクグループ",
    "9432": "NTT"
  };

  function addLog(message) {
    const time = new Date().toLocaleTimeString("ja-JP");

    logArea.textContent += `${time} ${message}\n`;
    logArea.scrollTop = logArea.scrollHeight;
  }

  risingButton.addEventListener("click", () => {
    if (isLoading) {
      addLog("上昇中クリック無効（読込中）");
      return;
    }

    addLog("条件クリック: 上昇中");
    showStockList(WATCH_CODES, "上昇中");
  });

  fallingButton.addEventListener("click", () => {
    if (isLoading) {
      addLog("下落中クリック無効（読込中）");
      return;
    }

    addLog("条件クリック: 下落中");
    showStockList(WATCH_CODES, "下落中");
  });

  bullishButton.addEventListener("click", () => {
    if (isLoading) {
      addLog("陽線連続クリック無効（読込中）");
      return;
    }

    addLog("条件クリック: 陽線連続");
    showStockList(WATCH_CODES, "陽線連続");
  });

  volumeButton.addEventListener("click", () => {
    if (isLoading) {
      addLog("出来高増クリック無効（読込中）");
      return;
    }

    addLog("条件クリック: 出来高増");
    showStockList(WATCH_CODES, "出来高増");
  });

  function setLoadingState(loading) {
    isLoading = loading;

    if (loading) {
      document.body.classList.add("is-loading");
      resultList.classList.add("is-loading");
      addLog("読込開始");
    } else {
      document.body.classList.remove("is-loading");
      resultList.classList.remove("is-loading");
      lastRequestAt = Date.now();
      addLog("読込終了");
    }
  }

  function showStockList(codes, label) {
    resultList.innerHTML = "";
    addLog(`候補一覧表示: ${label}`);

    for (const code of codes) {
      const li = document.createElement("li");
      li.textContent = `${code} ${STOCK_NAMES[code] || ""}`;

      li.addEventListener("click", () => {
        if (isLoading) {
          addLog(`候補クリック無効: ${code}`);
          return;
        }

        addLog(`候補クリック: ${code}`);
        loadChart(code, label);
      });

      resultList.appendChild(li);
    }
  }

  function drawChart(code, label, labels, closePrices) {
    if (chart) {
      chart.destroy();
      addLog("旧チャート破棄");
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

    addLog(`チャート描画完了: ${code}`);
  }

  async function loadChart(code, label) {
    const now = Date.now();

    if (isLoading) {
      addLog(`通信拒否（読込中）: ${code}`);
      return;
    }

    if (now - lastRequestAt < MIN_COOLDOWN_MS) {
      addLog(`通信拒否（クールダウン中）: ${code}`);
      return;
    }

    lastRequestAt = now;

    const requestId = ++currentRequestId;
    addLog(`通信開始: ${code}`);

    setLoadingState(true);

    try {
      const response = await fetch(
        `https://kabutree.vercel.app/api/stock?code=${code}`
      );

      addLog(`HTTP応答: ${response.status}`);

      const data = await response.json();

      if (requestId !== currentRequestId) {
        addLog(`旧通信無視: ${code}`);
        return;
      }

      if (!data || !Array.isArray(data.data) || data.data.length === 0) {
        addLog(`データなし: ${JSON.stringify(data)}`);
        alert("データがありません");
        return;
      }

      addLog(`データ取得成功: ${data.data.length}件`);

      const prices = data.data;
      const labels = prices.map(item => item.Date);
      const closePrices = prices.map(item => item.C);

      drawChart(code, label, labels, closePrices);

    } catch (error) {
      if (requestId !== currentRequestId) {
        addLog(`旧通信エラー無視: ${code}`);
        return;
      }

      console.error(error);
      addLog(`通信エラー: ${error.message}`);
      alert("通信エラー");
    } finally {
      if (requestId === currentRequestId) {
        setLoadingState(false);
      }
    }
  }

  addLog("script.js 読み込み完了");
});
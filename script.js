let chart = null;

const codeInput = document.getElementById("code");
const showButton = document.getElementById("showButton");
const chartCanvas = document.getElementById("chart");

showButton.addEventListener("click", loadChart);
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

    const prices = data.data;
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
            label: `${code} の株価`,
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
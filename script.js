let chart;

function loadChart() {

  const code = document.getElementById("code").value;

  fetch(`https://stock-api-weld-three.vercel.app/api/stock?code=${code}`)
    .then(res => res.json())
    .then(data => {

      const prices = data.data;

      const labels = prices.map(d => d.Date);
      const close = prices.map(d => d.C);

      if (chart) chart.destroy();

      chart = new Chart(document.getElementById('chart'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: close
          }]
        }
      });

    });
}

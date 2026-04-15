<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>

<canvas id="chart"></canvas>

<script>
fetch("https://stock-api-weld-three.vercel.app/api/stock")
  .then(res => res.json())
  .then(data => {
    const prices = data.data;

    const labels = prices.map(d => d.Date);
    const close = prices.map(d => d.C);

    new Chart(document.getElementById("chart"), {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "トヨタ株価",
          data: close
        }]
      }
    });
  });
</script>

</body>
</html>

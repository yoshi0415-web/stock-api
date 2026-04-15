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
    const d = data.data[0];

    const chart = new Chart(document.getElementById("chart"), {
      type: "bar",
      data: {
        labels: [d.Date],
        datasets: [
          {
            label: "株価（終値）",
            data: [d.C]
          }
        ]
      }
    });
  });
</script>

</body>
</html>

alert("JS読み込まれてる");
let chart;

function loadChart() {

  const code = document.getElementById("code").value;

  if (!code) {
    alert("銘柄コードを入力して");
    return;
  }

  fetch(`https://kabutree.vercel.app/api/stock?code=${code}`)
    .then(res => res.json())
    .then(data => {

      console.log(data); // デバッグ用

      if (!data.data || data.data.length === 0) {
        alert("データがありません");
        return;
      }

      const prices = data.data;

      const labels = prices.map(d => d.Date);
      const close = prices.map(d => d.C);

      if (chart) chart.destroy();

      chart = new Chart(document.getElementById('chart'), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: code + " の株価",
            data: close,
            borderWidth: 2
          }]
        }
      });

    })
    .catch(err => {
      console.error(err);
      alert("通信エラー");
    });
}
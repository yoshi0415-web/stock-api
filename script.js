/* 001 */ document.addEventListener("DOMContentLoaded", () => {
/* 002 */   let chart = null;
/* 003 */   let isLoading = false;
/* 004 */   let currentRequestId = 0;
/* 005 */   let lastRequestAt = 0;
/* 006 */   const MIN_COOLDOWN_MS = 3000;
/* 007 */   let currentStockData = null;
/* 008 */   let currentCode = "";
/* 009 */   let currentLabel = "";
/* 010 */   let currentTimeframe = "daily";
/* 011 */ 
/* 012 */   const risingButton = document.getElementById("risingButton");
/* 013 */   const fallingButton = document.getElementById("fallingButton");
/* 014 */   const bullishButton = document.getElementById("bullishButton");
/* 015 */   const volumeButton = document.getElementById("volumeButton");
/* 016 */   const high25Button = document.getElementById("high25Button");
/* 017 */ 
/* 018 */   const resultList = document.getElementById("resultList");
/* 019 */   const chartCanvas = document.getElementById("chart");
/* 020 */   const chartTitle = document.getElementById("chartTitle");
/* 021 */   const chartSection = document.querySelector(".chart-section");
/* 022 */   const mainLayout = document.querySelector(".main-layout");
/* 023 */   const dailyButton = document.getElementById("dailyButton");
/* 024 */   const weeklyButton = document.getElementById("weeklyButton");
/* 025 */   const monthlyButton = document.getElementById("monthlyButton");
/* 026 */ 
/* 027 */   const WATCH_CODES = [
/* 028 */     "7203","6758","7974","9984","9432",
/* 029 */     "8306","8316","8411","6501","6503",
/* 030 */     "7011","7012","7013","8035","6857",
/* 031 */     "9983","6098","4063","7267","8058",
/* 032 */     "8001","8002","8031","8053","8766",
/* 033 */     "8750","9101","9104","9107","5401",
/* 034 */     "5406","5411","6301","6367","6146",
/* 035 */     "7733","7741","7751","6902","6954",
/* 036 */     "6981","6971","4661","4689","4755",
/* 037 */     "9613","9020","9022","9201","9202"
/* 038 */   ];
/* 039 */ 
/* 040 */   const STOCK_NAMES = {
/* 041 */     "7203": "トヨタ",
/* 042 */     "6758": "ソニーG",
/* 043 */     "7974": "任天堂",
/* 044 */     "9984": "SBG",
/* 045 */     "9432": "NTT"
/* 046 */   };
/* 047 */ 
/* 048 */   let allStocksCache = null;
/* 049 */ 
/* 050 */   async function getAllStocks() {
/* 051 */     if (allStocksCache) return allStocksCache;
/* 052 */     const res = await fetch("/stocks.json");
/* 053 */     const data = await res.json();
/* 054 */     allStocksCache = data;
/* 055 */     return data;
/* 056 */   }
/* 057 */ 
/* 058 */   function setActiveButton(activeButton) {
/* 059 */     [risingButton, fallingButton, bullishButton, volumeButton]
/* 060 */       .forEach(b => b.classList.remove("active"));
/* 061 */     activeButton.classList.add("active");
/* 062 */   }
/* 063 */ 
/* 064 */   function hideHighSubFilters() {
/* 065 */     document.getElementById("highSubFilters").classList.remove("show");
/* 066 */   }
/* 067 */ 
/* 068 */   function clearChart(titleText = "チャート") {
/* 069 */     if (chart) chart.destroy();
/* 070 */     chartTitle.textContent = titleText;
/* 071 */   }
/* 072 */ 
/* 073 */   function groupWeekly(data) {
/* 074 */     return data.filter((_, i) => i % 5 === 0);
/* 075 */   }
/* 076 */ 
/* 077 */   function groupMonthly(data) {
/* 078 */     return data.filter((_, i) => i % 20 === 0);
/* 079 */   }
/* 080 */ 
/* 081 */   function updateTimeframeButtons(active) {
/* 082 */     [dailyButton, weeklyButton, monthlyButton]
/* 083 */       .forEach(b => b.classList.remove("active"));
/* 084 */     active.classList.add("active");
/* 085 */   }
/* 086 */ 
/* 087 */   function redrawChartByTimeframe() {
/* 088 */     if (!currentStockData) return;
/* 089 */ 
/* 090 */     let data = currentStockData;
/* 091 */ 
/* 092 */     if (currentTimeframe === "weekly") {
/* 093 */       data = groupWeekly(data);
/* 094 */     }
/* 095 */ 
/* 096 */     if (currentTimeframe === "monthly") {
/* 097 */       data = groupMonthly(data);
/* 098 */     }
/* 099 */ 
/* 100 */     drawChart(currentCode, currentLabel, data);
/* 101 */   }
/* 102 */ 
/* 103 */   function drawChart(code, label, data) {
/* 104 */     if (chart) chart.destroy();
/* 105 */ 
/* 106 */     const labels = data.map(d => d.Date);
/* 107 */     const prices = data.map(d => d.C);
/* 108 */ 
/* 109 */     chartTitle.textContent =
/* 110 */       `${label} : ${code} ${STOCK_NAMES[code] || ""}`;
    
/* 111 */     chart = new Chart(chartCanvas, {
/* 112 */       type: "line",
/* 113 */       data: {
/* 114 */         labels,
/* 115 */         datasets: [{
/* 116 */           label: code,
/* 117 */           data: prices,
/* 118 */           borderWidth: 2,
/* 119 */           tension: 0.2
/* 120 */         }]
/* 121 */       },
/* 122 */       options: {
/* 123 */         responsive: true,
/* 124 */         maintainAspectRatio: true
/* 125 */       }
/* 126 */     });
/* 127 */   }
/* 128 */ 
/* 129 */   function moveChartUnderItem(li) {
/* 130 */     const old = document.querySelector(".inline-chart-wrapper");
/* 131 */     if (old) old.remove();
/* 132 */ 
/* 133 */     document.querySelectorAll("#resultList li")
/* 134 */       .forEach(i => i.classList.remove("selected-stock"));
/* 135 */ 
/* 136 */     li.classList.add("selected-stock");
/* 137 */ 
/* 138 */     const isWide =
/* 139 */       window.innerWidth > window.innerHeight ||
/* 140 */       window.innerWidth >= 900;
/* 141 */ 
/* 142 */     if (isWide) {
/* 143 */       mainLayout.appendChild(chartSection);
/* 144 */       return;
/* 145 */     }
/* 146 */ 
/* 147 */     const items = Array.from(document.querySelectorAll("#resultList li"));
/* 148 */     const index = items.indexOf(li);
/* 149 */     const rowEnd = Math.min(Math.floor(index / 4) * 4 + 3, items.length - 1);
/* 150 */ 
/* 151 */     const wrap = document.createElement("li");
/* 152 */     wrap.className = "inline-chart-wrapper";
/* 153 */     items[rowEnd].insertAdjacentElement("afterend", wrap);
/* 154 */     wrap.appendChild(chartSection);
/* 155 */   }
/* 156 */ 
/* 157 */   function createStockItem(code, label) {
/* 158 */     const li = document.createElement("li");
/* 159 */     const name = STOCK_NAMES[code] || "";
/* 160 */ 
/* 161 */     li.innerHTML =
/* 162 */       `<span class="stock-code">${code}</span>
/* 163 */        <span class="stock-name">${name}</span>`;
/* 164 */ 
/* 165 */     li.addEventListener("click", async () => {
/* 166 */       moveChartUnderItem(li);
/* 167 */ 
/* 168 */       const all = await getAllStocks();
/* 169 */       const stock = all[code];
/* 170 */       if (!stock?.data?.length) return;
/* 171 */ 
/* 172 */       currentStockData = stock.data;
/* 173 */       currentCode = code;
/* 174 */       currentLabel = label;
/* 175 */       currentTimeframe = "daily";
/* 176 */ 
/* 177 */       updateTimeframeButtons(dailyButton);
/* 178 */       drawChart(code, label, stock.data);
/* 179 */     });
/* 180 */ 
/* 181 */     return li;
/* 182 */   }
/* 183 */ 
/* 184 */   function showStockList(codes, label) {
/* 185 */     resultList.innerHTML = "";
/* 186 */     codes.forEach(c => resultList.appendChild(createStockItem(c, label)));
/* 187 */   }
/* 188 */ 
/* 189 */ });
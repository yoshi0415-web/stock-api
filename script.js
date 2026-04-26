/* 001 */ document.addEventListener("DOMContentLoaded", () => {
/* 002 */   let chart = null;
/* 003 */   let isLoading = false;
/* 004 */   let currentRequestId = 0;
/* 005 */   let lastRequestAt = 0;
/* 006 */   const MIN_COOLDOWN_MS = 3000;
/* 007 */ 
/* 008 */   const risingButton = document.getElementById("risingButton");
/* 009 */   const fallingButton = document.getElementById("fallingButton");
/* 010 */   const bullishButton = document.getElementById("bullishButton");
/* 011 */   const volumeButton = document.getElementById("volumeButton");
/* 012 */   const high25Button = document.getElementById("high25Button");
/* 013 */ 
/* 014 */   const resultList = document.getElementById("resultList");
/* 015 */   const chartCanvas = document.getElementById("chart");
/* 016 */   const chartTitle = document.getElementById("chartTitle");
/* 017 */   const chartSection = document.querySelector(".chart-section");
/* 018 */ 
/* 019 */   const WATCH_CODES = [
/* 020 */     "7203","6758","7974","9984","9432",
/* 021 */     "8306","8316","8411","6501","6503",
/* 022 */     "7011","7012","7013","8035","6857",
/* 023 */     "9983","6098","4063","7267","8058",
/* 024 */     "8001","8002","8031","8053","8766",
/* 025 */     "8750","9101","9104","9107","5401",
/* 026 */     "5406","5411","6301","6367","6146",
/* 027 */     "7733","7741","7751","6902","6954",
/* 028 */     "6981","6971","4661","4689","4755",
/* 029 */     "9613","9020","9022","9201","9202"
/* 030 */   ];
/* 031 */ 
/* 032 */   const STOCK_NAMES = {
/* 033 */     "7203": "トヨタ",
/* 034 */     "6758": "ソニーG",
/* 035 */     "7974": "任天堂",
/* 036 */     "9984": "SBG",
/* 037 */     "9432": "NTT"
/* 038 */   };
/* 039 */ 
/* 040 */   let allStocksCache = null;
/* 041 */ 
/* 042 */   async function getAllStocks() {
/* 043 */     if (allStocksCache) return allStocksCache;
/* 044 */ 
/* 045 */     const response = await fetch("/stocks.json");
/* 046 */     const data = await response.json();
/* 047 */ 
/* 048 */     allStocksCache = data;
/* 049 */     return data;
/* 050 */   }
/* 051 */ 
/* 052 */   function setActiveButton(activeButton) {
/* 053 */     [risingButton, fallingButton, bullishButton, volumeButton].forEach(button => {
/* 054 */       button.classList.remove("active");
/* 055 */     });
/* 056 */ 
/* 057 */     activeButton.classList.add("active");
/* 058 */   }
/* 059 */ 
/* 060 */   function hideHighSubFilters() {
/* 061 */     document.getElementById("highSubFilters").classList.remove("show");
/* 062 */   }
/* 063 */ 
/* 064 */   function clearChart(titleText = "チャート") {
/* 065 */     if (chart) {
/* 066 */       chart.destroy();
/* 067 */       chart = null;
/* 068 */     }
/* 069 */ 
/* 070 */     chartTitle.textContent = titleText;
/* 071 */   }
/* 072 */ 
/* 073 */   function moveChartUnderItem(li) {
/* 074 */     const old = document.querySelector(".inline-chart-wrapper");
/* 075 */     if (old) old.remove();
/* 076 */ 
/* 077 */     document.querySelectorAll("#resultList li").forEach(item => {
/* 078 */       item.classList.remove("selected-stock");
/* 079 */     });
/* 080 */ 
/* 081 */     li.classList.add("selected-stock");
/* 081-1 */ 
/* 081-2 */     const stockItems = Array.from(
/* 081-3 */       document.querySelectorAll("#resultList li:not(.inline-chart-wrapper)")
/* 081-4 */     );
/* 081-5 */ 
/* 081-6 */     const index = stockItems.indexOf(li);
/* 081-7 */     const rowEndIndex =
/* 081-8 */       Math.min(Math.floor(index / 4) * 4 + 3, stockItems.length - 1);
/* 081-9 */     const rowEndItem = stockItems[rowEndIndex];
/* 081-10 */ 
/* 081-11 */     const wrap = document.createElement("li");
/* 081-12 */     wrap.className = "inline-chart-wrapper";
/* 081-13 */     rowEndItem.insertAdjacentElement("afterend", wrap);
/* 081-14 */     wrap.appendChild(chartSection);
/* 082 */   }
/* 083 */   function createStockItem(code, label) {
/* 084 */     const li = document.createElement("li");
/* 085 */     const name = STOCK_NAMES[code] || "";
/* 086 */ 
li.innerHTML = `
<span class="stock-code">${code}</span>
<span class="stock-name">${name}</span>
`;
/* 091 */ 
/* 092 */     li.addEventListener("click", async () => {
/* 093 */       moveChartUnderItem(li);
/* 094 */ 
/* 095 */       const allStocks = await getAllStocks();
/* 096 */       const stock = allStocks[code];
/* 097 */ 
/* 098 */       if (!stock || !stock.data || stock.data.length === 0) return;
/* 099 */ 
/* 100 */       const labels = stock.data.map(item => item.Date);
/* 101 */       const closePrices = stock.data.map(item => item.C);
/* 102 */ 
/* 103 */       drawChart(code, label, labels, closePrices);
/* 104 */     });
/* 105 */ 
/* 106 */     return li;
/* 107 */   }
/* 108 */ 
/* 109 */   function showStockList(codes, label) {
/* 110 */     resultList.innerHTML = "";
/* 111 */ 
/* 112 */     for (const code of codes) {
/* 113 */       resultList.appendChild(createStockItem(code, label));
/* 114 */     }
/* 115 */   }
/* 116 */ 
/* 117 */   async function showFilteredStocks(label, judgeFunction) {
/* 118 */     resultList.innerHTML = "";
/* 119 */ 
/* 120 */     const allStocks = await getAllStocks();
/* 121 */ 
/* 122 */     for (const code of WATCH_CODES) {
/* 123 */       const stock = allStocks[code];
/* 124 */       if (!stock || !stock.data || stock.data.length < 3) continue;
/* 125 */ 
/* 126 */       if (judgeFunction(stock.data)) {
/* 127 */         resultList.appendChild(createStockItem(code, label));
/* 128 */       }
/* 129 */     }
/* 130 */ 
/* 131 */     if (resultList.children.length === 0) {
/* 132 */       resultList.innerHTML = "<li>該当なし</li>";
/* 133 */       clearChart(`${label} : 該当なし`);
/* 134 */     } else {
/* 135 */       chartTitle.textContent = label;
/* 136 */     }
/* 137 */   }
/* 138 */ 
/* 139 */   risingButton.addEventListener("click", async () => {
/* 140 */     hideHighSubFilters();
/* 141 */     setActiveButton(risingButton);
/* 142 */     clearChart("赤三兵");
/* 143 */     await showFilteredStocks("赤三兵", isRedThreeSoldiers);
/* 144 */   });
/* 145 */ 
/* 146 */   fallingButton.addEventListener("click", async () => {
/* 147 */     hideHighSubFilters();
/* 148 */     setActiveButton(fallingButton);
/* 149 */     clearChart("三羽烏");
/* 150 */     await showFilteredStocks("三羽烏", isThreeBlackCrows);
/* 151 */   });
/* 152 */ 
/* 153 */   bullishButton.addEventListener("click", () => {
/* 154 */     hideHighSubFilters();
/* 155 */     setActiveButton(bullishButton);
/* 156 */     clearChart("出来高急増");
/* 157 */     showStockList(WATCH_CODES, "出来高急増");
/* 158 */   });
/* 159 */ 
/* 160 */   volumeButton.addEventListener("click", () => {
/* 161 */     setActiveButton(volumeButton);
/* 162 */     clearChart("高値更新");
/* 163 */     resultList.innerHTML = "";
/* 164 */     document.getElementById("highSubFilters").classList.add("show");
/* 165 */   });
/* 166 */   high25Button.addEventListener("click", async () => {
/* 167 */     clearChart("高値更新 25日");
/* 168 */     await showFilteredStocks("高値更新 25日", isBreakHigh25);
/* 169 */   });
/* 170 */ 
/* 171 */   function drawChart(code, label, labels, closePrices) {
/* 172 */     if (chart) chart.destroy();
/* 173 */ 
/* 174 */     chartTitle.textContent = `${label} : ${code} ${STOCK_NAMES[code] || ""}`;
/* 175 */ 
/* 176 */     chart = new Chart(chartCanvas, {
/* 177 */       type: "line",
/* 178 */       data: {
/* 179 */         labels: labels,
/* 180 */         datasets: [{
/* 181 */           label: code,
/* 182 */           data: closePrices,
/* 183 */           borderWidth: 2,
/* 184 */           tension: 0.2
/* 185 */         }]
/* 186 */       },
/* 187 */       options: {
/* 188 */         responsive: true,
/* 189 */         maintainAspectRatio: true
/* 190 */       }
/* 191 */     });
/* 192 */   }
/* 193 */ 
/* 194 */   logCondition("script.js 読み込み完了");
/* 195 */ });
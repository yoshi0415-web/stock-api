/* 001 */ document.addEventListener("DOMContentLoaded", () => {
/* 002 */   let chart = null;
/* 003 */   let isLoading = false;
/* 004 */   let currentRequestId = 0;
/* 005 */ 
/* 006 */   let lastRequestAt = 0;
/* 007 */   const MIN_COOLDOWN_MS = 3000;
/* 008 */ 
/* 009 */   const risingButton = document.getElementById("risingButton");
/* 010 */   const fallingButton = document.getElementById("fallingButton");
/* 011 */   const bullishButton = document.getElementById("bullishButton");
/* 012 */   const volumeButton = document.getElementById("volumeButton");
/* 013 */ 
/* 014 */   const resultList = document.getElementById("resultList");
/* 015 */   const chartCanvas = document.getElementById("chart");
/* 016 */   const chartTitle = document.getElementById("chartTitle");
/* 017 */ 
/* 018 */   const WATCH_CODES = ["7203", "6758", "7974", "9984", "9432"];
/* 019 */ 
/* 020 */   const STOCK_NAMES = {
/* 021 */     "7203": "トヨタ",
/* 022 */     "6758": "ソニーグループ",
/* 023 */     "7974": "任天堂",
/* 024 */     "9984": "ソフトバンクグループ",
/* 025 */     "9432": "NTT"
/* 026 */   };
/* 027 */ 
/* 028 */   function setActiveButton(activeButton) {
/* 029 */     [risingButton, fallingButton, bullishButton, volumeButton].forEach(button => {
/* 030 */       button.classList.remove("active");
/* 031 */     });
/* 032 */ 
/* 033 */     activeButton.classList.add("active");
/* 034 */   }
/* 035 */ 
/* 036 */   function clearChart(titleText = "チャート") {
/* 037 */     if (chart) {
/* 038 */       chart.destroy();
/* 039 */       chart = null;
/* 040 */       logDestroy();
/* 041 */     }
/* 042 */ 
/* 043 */     chartTitle.textContent = titleText;
/* 044 */   }
/* 045 */ 
/* 046 */   function createStockItem(code, label) {
/* 047 */     const li = document.createElement("li");
/* 048 */ 
/* 049 */     let name = STOCK_NAMES[code] || "";
/* 050 */ 
/* 051 */     if (name.length > 12) {
/* 052 */       name = name.slice(0, 12) + "…";
/* 053 */     }
/* 054 */ 
/* 055 */     const line1 = name.slice(0, 6);
/* 056 */     const line2 = name.slice(6);
/* 057 */ 
li.innerHTML = `
  <span class="stock-code">${code}</span>
  <span class="stock-name-wrap">
    <span class="stock-name">${line1}</span>
    <span class="stock-name">${line2}</span>
  </span>
`;
/* 065 */ 
/* 066 */     li.addEventListener("click", () => {
/* 067 */       logCandidate(code);
/* 068 */ 
/* 069 */       if (isLoading) {
/* 070 */         logCondition("候補クリック無効: 読込中");
/* 071 */         return;
/* 072 */       }
/* 073 */ 
/* 074 */       loadChart(code, label);
/* 075 */     });
/* 076 */ 
/* 077 */     return li;
/* 078 */   }
/* 079 */ 
/* 080 */   function showStockList(codes, label) {
/* 081 */     resultList.innerHTML = "";
/* 082 */     logList(label);
/* 083 */ 
/* 084 */     for (const code of codes) {
/* 085 */       resultList.appendChild(createStockItem(code, label));
/* 086 */     }
/* 087 */   }
/* 088 */ 
/* 089 */   async function showFilteredStocks(label, judgeFunction) {
/* 090 */     resultList.innerHTML = "";
/* 091 */     chartTitle.textContent = "読み込み中...";
/* 092 */     logList(label);
/* 093 */ 
/* 094 */     for (const code of WATCH_CODES) {
/* 095 */       try {
/* 096 */         const response = await fetch(
/* 097 */           `https://kabutree.vercel.app/api/stock?code=${code}`
/* 098 */         );
/* 099 */ 
/* 100 */         const data = await response.json();
/* 101 */ 
/* 102 */         if (!data.data || data.data.length < 3) {
/* 103 */           continue;
/* 104 */         }
/* 105 */ 
/* 106 */         if (judgeFunction(data.data)) {
/* 107 */           resultList.appendChild(createStockItem(code, label));
/* 108 */         }
/* 109 */ 
/* 110 */       } catch (error) {
/* 111 */         logError(error);
/* 112 */       }
/* 113 */     }
/* 114 */ 
/* 115 */     if (resultList.children.length === 0) {
/* 116 */       resultList.innerHTML = "<li>該当なし</li>";
/* 117 */       clearChart(`${label} : 該当なし`);
/* 118 */     } else {
/* 119 */       chartTitle.textContent = label;
/* 120 */     }
/* 121 */   }
/* 122 */ 
/* 123 */   function setLoadingState(loading) {
/* 124 */     isLoading = loading;
/* 125 */ 
/* 126 */     if (loading) {
/* 127 */       document.body.classList.add("is-loading");
/* 128 */       resultList.classList.add("is-loading");
/* 129 */       chartTitle.textContent = "読み込み中...";
/* 130 */       logLoadingStart();
/* 131 */ 
/* 132 */     } else {
/* 133 */       document.body.classList.remove("is-loading");
/* 134 */       resultList.classList.remove("is-loading");
/* 135 */       logLoadingEnd();
/* 136 */     }
/* 137 */   }
/* 138 */ 
/* 139 */   risingButton.addEventListener("click", async () => {
/* 140 */     if (isLoading) return;
/* 141 */ 
/* 142 */     logCondition("赤三兵");
/* 143 */     setActiveButton(risingButton);
/* 144 */     clearChart("赤三兵");
/* 145 */ 
/* 146 */     await showFilteredStocks("赤三兵", isRedThreeSoldiers);
/* 147 */   });
/* 148 */ 
/* 149 */   fallingButton.addEventListener("click", async () => {
/* 150 */     if (isLoading) return;
/* 151 */ 
/* 152 */     logCondition("三羽烏");
/* 153 */     setActiveButton(fallingButton);
/* 154 */     clearChart("三羽烏");
/* 155 */ 
/* 156 */     await showFilteredStocks("三羽烏", isThreeBlackCrows);
/* 157 */   });
/* 158 */ 
/* 159 */   bullishButton.addEventListener("click", () => {
/* 160 */     if (isLoading) return;
/* 161 */ 
/* 162 */     logCondition("出来高急増");
/* 163 */     setActiveButton(bullishButton);
/* 164 */     clearChart("出来高急増");
/* 165 */ 
/* 169 */   volumeButton.addEventListener("click", () => {
/* 170 */     if (isLoading) return;
/* 171 */ 
/* 172 */     logCondition("高値更新");
/* 173 */     setActiveButton(volumeButton);
/* 174 */     clearChart("高値更新");
/* 175 */ 
/* 176 */     document.getElementById("highSubFilters").classList.add("show");
/* 177 */   });
/* 178 */ 
/* 179 */   function drawChart(code, label, labels, closePrices) {
/* 180 */     if (chart) {
/* 181 */       chart.destroy();
/* 182 */       logDestroy();
/* 183 */     }
/* 184 */ 
/* 185 */     chartTitle.textContent =
/* 186 */       `${label} : ${code} ${STOCK_NAMES[code] || ""}`;
/* 187 */ 
/* 188 */     chart = new Chart(chartCanvas, {
/* 189 */       type: "line",
/* 190 */       data: {
/* 191 */         labels: labels,
/* 192 */         datasets: [
/* 193 */           {
/* 194 */             label: `${code} ${STOCK_NAMES[code] || ""}`,
/* 195 */             data: closePrices,
/* 196 */             borderWidth: 2,
/* 197 */             tension: 0.2
/* 198 */           }
/* 199 */         ]
/* 200 */       },
/* 201 */       options: {
/* 202 */         responsive: true,
/* 203 */         maintainAspectRatio: true,
/* 204 */         animation: {
/* 205 */           duration: 400
/* 206 */         }
/* 207 */       }
/* 208 */     });
/* 209 */ 
/* 210 */     logChart(code);
/* 211 */   }
/* 212 */ 
/* 213 */   async function loadChart(code, label) {
/* 214 */     const now = Date.now();
/* 215 */ 
/* 216 */     if (isLoading) {
/* 217 */       logCondition("通信拒否: 読込中");
/* 218 */       return;
/* 219 */     }
/* 220 */ 
/* 221 */     if (now - lastRequestAt < MIN_COOLDOWN_MS) {
/* 222 */       logCooldown(code);
/* 223 */       return;
/* 224 */     }
/* 225 */ 
/* 226 */     lastRequestAt = now;
/* 227 */ 
/* 228 */     const requestId = ++currentRequestId;
/* 229 */ 
/* 230 */     logStart(code);
/* 231 */     setLoadingState(true);
/* 232 */ 
/* 233 */     try {
/* 234 */       const response = await fetch(
/* 235 */         `https://kabutree.vercel.app/api/stock?code=${code}`
/* 236 */       );
/* 237 */ 
/* 238 */       logHttp(response.status);
/* 239 */ 
/* 240 */       const data = await response.json();
/* 241 */ 
/* 242 */       if (requestId !== currentRequestId) {
/* 243 */         logIgnore(code);
/* 244 */         return;
/* 245 */       }
/* 246 */ 
/* 247 */       if (!data || !Array.isArray(data.data) || data.data.length === 0) {
/* 248 */         logNoData(data);
/* 249 */         showDebugLogs();
/* 250 */         return;
/* 251 */       }
/* 252 */ 
/* 253 */       logSuccess(data.data.length);
/* 254 */ 
/* 255 */       const prices = data.data;
/* 256 */       const labels = prices.map(item => item.Date);
/* 257 */       const closePrices = prices.map(item => item.C);
/* 258 */ 
/* 259 */       drawChart(code, label, labels, closePrices);
/* 260 */ 
/* 261 */     } catch (error) {
/* 262 */       if (requestId !== currentRequestId) return;
/* 263 */ 
/* 264 */       logError(error);
/* 265 */       showDebugLogs();
/* 266 */ 
/* 267 */     } finally {
/* 268 */       if (requestId === currentRequestId) {
/* 269 */         setLoadingState(false);
/* 270 */       }
/* 271 */     }
/* 272 */   }
/* 273 */ 
/* 274 */   logCondition("script.js 読み込み完了");
/* 275 */ });
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
/* 043 */     if (allStocksCache) {
/* 044 */       return allStocksCache;
/* 045 */     }
/* 046 */ 
/* 047 */     const response = await fetch("/stocks.json");
/* 048 */     const data = await response.json();
/* 049 */ 
/* 050 */     allStocksCache = data;
/* 051 */     return data;
/* 052 */   }
/* 053 */ 
/* 054 */   function setActiveButton(activeButton) {
/* 055 */     [risingButton, fallingButton, bullishButton, volumeButton].forEach(button => {
/* 056 */       button.classList.remove("active");
/* 057 */     });
/* 058 */ 
/* 059 */     activeButton.classList.add("active");
/* 060 */   });
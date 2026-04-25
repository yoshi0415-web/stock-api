/* 001 */ const cache = {};
/* 002 */ 
/* 003 */ const WATCH_CODES = [
/* 004 */   "7203","6758","7974","9984","9432",
/* 005 */   "8306","8316","8411","6501","6503",
/* 006 */   "7011","7012","7013","8035","6857",
/* 007 */   "9983","6098","4063","7267","8058",
/* 008 */   "8001","8002","8031","8053","8766",
/* 009 */   "8750","9101","9104","9107","5401",
/* 010 */   "5406","5411","6301","6367","6146",
/* 011 */   "7733","7741","7751","6902","6954",
/* 012 */   "6981","6971","4661","4689","4755",
/* 013 */   "9613","9020","9022","9201","9202"
/* 014 */ ];
/* 015 */ 
/* 016 */ function wait(ms) {
/* 017 */   return new Promise(resolve => setTimeout(resolve, ms));
/* 018 */ }
/* 019 */ 
/* 020 */ function formatDate(date) {
/* 021 */   const y = date.getFullYear();
/* 022 */   const m = String(date.getMonth() + 1).padStart(2, "0");
/* 023 */   const d = String(date.getDate()).padStart(2, "0");
/* 024 */ 
/* 025 */   return `${y}${m}${d}`;
/* 026 */ }
/* 027 */ 
/* 028 */ function getDateRange() {
/* 029 */   const to = new Date("2026-01-31");
/* 030 */   const from = new Date("2026-01-31");
/* 031 */ 
/* 032 */   from.setDate(from.getDate() - 80);
/* 033 */ 
/* 034 */   return {
/* 035 */     from: formatDate(from),
/* 036 */     to: formatDate(to)
/* 037 */   };
/* 038 */ }
/* 039 */ 
/* 040 */ export default async function handler(req, res) {
/* 041 */   res.setHeader("Access-Control-Allow-Origin", "*");
/* 042 */ 
/* 043 */   try {
/* 044 */     const apiKey = process.env.JQUANTS_API_KEY;
/* 045 */ 
/* 046 */     if (!apiKey) {
/* 047 */       return res.status(500).json({
/* 048 */         error: "APIキー未設定"
/* 049 */       });
/* 050 */     }
/* 051 */ 
/* 052 */     const now = Date.now();
/* 053 */     const CACHE_MS = 10 * 60 * 1000;
/* 054 */ 
/* 055 */     if (cache.all && now - cache.all.time < CACHE_MS) {
/* 056 */       return res.status(200).json(cache.all.data);
/* 057 */     }
/* 058 */ 
/* 059 */     const result = {};
/* 060 */ 
/* 061 */     for (const code of WATCH_CODES) {
/* 062 */       try {
/* 063 */         const data = await fetchStock(apiKey, code);
/* 064 */ 
/* 065 */         result[code] = {
/* 066 */           data: data.data || []
/* 067 */         };
/* 068 */ 
/* 069 */         await wait(1200);
/* 070 */ 
/* 071 */       } catch (error) {
/* 072 */         result[code] = {
/* 073 */           error: error.message,
/* 074 */           data: []
/* 075 */         };
/* 076 */ 
/* 077 */         await wait(2500);
/* 078 */       }
/* 079 */     }
/* 080 */ 
/* 081 */     cache.all = {
/* 082 */       time: Date.now(),
/* 083 */       data: result
/* 084 */     };
/* 085 */ 
/* 086 */     return res.status(200).json(result);
/* 087 */ 
/* 088 */   } catch (error) {
/* 089 */     return res.status(500).json({
/* 090 */       error: "stocks取得失敗",
/* 091 */       detail: error.message
/* 092 */     });
/* 093 */   }
/* 094 */ }
/* 095 */ 
/* 096 */ async function fetchStock(apiKey, code) {
/* 097 */   const jquantsCode = code.endsWith("0") ? code : `${code}0`;
/* 098 */   const range = getDateRange();
/* 099 */ 
/* 100 */   const url =
/* 101 */     `https://api.jquants.com/v2/equities/bars/daily?code=${jquantsCode}&from=${range.from}&to=${range.to}`;
/* 102 */ 
/* 103 */   const response = await fetch(url, {
/* 104 */     headers: {
/* 105 */       "x-api-key": apiKey
/* 106 */     }
/* 107 */   });
/* 108 */ 
/* 109 */   const data = await response.json();
/* 110 */ 
/* 111 */   if (!response.ok) {
/* 112 */     throw new Error(data.message || `HTTP ${response.status}`);
/* 113 */   }
/* 114 */ 
/* 115 */   return data;
/* 116 */ }
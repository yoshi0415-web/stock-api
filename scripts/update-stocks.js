/* 001 */ const fs = require("fs");
/* 002 */ 
/* 003 */ function formatDate(date) {
/* 004 */   const y = date.getFullYear();
/* 005 */   const m = String(date.getMonth() + 1).padStart(2, "0");
/* 006 */   const d = String(date.getDate()).padStart(2, "0");
/* 007 */ 
/* 008 */   return `${y}${m}${d}`;
/* 009 */ }
/* 010 */ 
/* 011 */ function getDateRange() {
/* 012 */   const to = new Date();
/* 013 */   const from = new Date();
/* 014 */ 
/* 015 */   from.setDate(from.getDate() - 84);
/* 016 */ 
/* 017 */   return {
/* 018 */     from: formatDate(from),
/* 019 */     to: formatDate(to)
/* 020 */   };
/* 021 */ }
/* 022 */ 
/* 023 */ const WATCH_CODES = [
/* 024 */   "7203","6758","7974","9984","9432",
/* 025 */   "8306","8316","8411","6501","6503",
/* 026 */   "7011","7012","7013","8035","6857",
/* 027 */   "9983","6098","4063","7267","8058"
/* 028 */ ];
/* 029 */ 
/* 030 */ function wait(ms) {
/* 031 */   return new Promise(resolve => setTimeout(resolve, ms));
/* 032 */ }
/* 033 */ 
/* 034 */ async function fetchStock(apiKey, code) {
/* 035 */   const jquantsCode = code.endsWith("0") ? code : `${code}0`;
/* 036 */   const range = getDateRange();
/* 037 */ 
/* 038 */   const url =
/* 039 */     `https://api.jquants.com/v2/equities/bars/daily?code=${jquantsCode}&from=${range.from}&to=${range.to}`;
/* 040 */ 
/* 041 */   const response = await fetch(url, {
/* 042 */     headers: {
/* 043 */       "x-api-key": apiKey
/* 044 */     }
/* 045 */   });
/* 046 */ 
/* 047 */   const data = await response.json();
/* 048 */ 
/* 049 */   if (!response.ok) {
/* 050 */     throw new Error(data.message || `HTTP ${response.status}`);
/* 051 */   }
/* 052 */ 
/* 053 */   return data;
/* 054 */ }
/* 055 */ 
/* 056 */ async function main() {
/* 057 */   const apiKey = process.env.JQUANTS_API_KEY;
/* 058 */ 
/* 059 */   if (!apiKey) {
/* 060 */     throw new Error("JQUANTS_API_KEY が未設定");
/* 061 */   }
/* 062 */ 
/* 063 */   const result = {};
/* 064 */ 
/* 065 */   for (const code of WATCH_CODES) {
/* 066 */     try {
/* 067 */       const data = await fetchStock(apiKey, code);
/* 068 */ 
/* 069 */       result[code] = {
/* 070 */         data: data.data || []
/* 071 */       };
/* 072 */ 
/* 073 */       console.log(`${code} success`);
/* 074 */ 
/* 075 */     } catch (error) {
/* 076 */       result[code] = {
/* 077 */         error: error.message,
/* 078 */         data: []
/* 079 */       };
/* 080 */ 
/* 081 */       console.error(`${code} error: ${error.message}`);
/* 082 */     }
/* 083 */ 
/* 084 */     await wait(13000);
/* 085 */   }
/* 086 */ 
/* 087 */   fs.writeFileSync(
/* 088 */     "stocks.json",
/* 089 */     JSON.stringify(result, null, 2),
/* 090 */     "utf8"
/* 091 */   );
/* 092 */ 
/* 093 */   console.log("stocks.json updated");
/* 094 */ }
/* 095 */ 
/* 096 */ main().catch(error => {
/* 097 */   console.error(error);
/* 098 */   process.exit(1);
/* 099 */ });
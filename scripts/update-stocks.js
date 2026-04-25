/* 001 */ const fs = require("fs");
/* 002 */ 
/* 003 */ const WATCH_CODES = [
/* 004 */   "7203","6758","7974","9984","9432"
/* 005 */ ];
/* 006 */ 
/* 007 */ function wait(ms) {
/* 008 */   return new Promise(resolve => setTimeout(resolve, ms));
/* 009 */ }
/* 010 */ 
/* 011 */ function formatDate(date) {
/* 012 */   const y = date.getFullYear();
/* 013 */   const m = String(date.getMonth() + 1).padStart(2, "0");
/* 014 */   const d = String(date.getDate()).padStart(2, "0");
/* 015 */ 
/* 016 */   return `${y}${m}${d}`;
/* 017 */ }
/* 018 */ 
/* 019 */ function getDateRange() {
/* 020 */   const to = new Date("2026-01-31");
/* 021 */   const from = new Date("2026-01-31");
/* 022 */ 
/* 023 */   from.setDate(from.getDate() - 80);
/* 024 */ 
/* 025 */   return {
/* 026 */     from: formatDate(from),
/* 027 */     to: formatDate(to)
/* 028 */   };
/* 029 */ }
/* 030 */ 
/* 031 */ async function fetchStock(apiKey, code) {
/* 032 */   const jquantsCode = code.endsWith("0") ? code : `${code}0`;
/* 033 */   const range = getDateRange();
/* 034 */ 
/* 035 */   const url =
/* 036 */     `https://api.jquants.com/v2/equities/bars/daily?code=${jquantsCode}&from=${range.from}&to=${range.to}`;
/* 037 */ 
/* 038 */   const response = await fetch(url, {
/* 039 */     headers: {
/* 040 */       "x-api-key": apiKey
/* 041 */     }
/* 042 */   });
/* 043 */ 
/* 044 */   const data = await response.json();
/* 045 */ 
/* 046 */   if (!response.ok) {
/* 047 */     throw new Error(data.message || `HTTP ${response.status}`);
/* 048 */   }
/* 049 */ 
/* 050 */   return data;
/* 051 */ }
/* 052 */ 
/* 053 */ async function main() {
/* 054 */   const apiKey = process.env.JQUANTS_API_KEY;
/* 055 */ 
/* 056 */   if (!apiKey) {
/* 057 */     throw new Error("JQUANTS_API_KEY が未設定");
/* 058 */   }
/* 059 */ 
/* 060 */   const result = {};
/* 061 */ 
/* 062 */   for (const code of WATCH_CODES) {
/* 063 */     try {
/* 064 */       const data = await fetchStock(apiKey, code);
/* 065 */ 
/* 066 */       result[code] = {
/* 067 */         data: data.data || []
/* 068 */       };
/* 069 */ 
/* 070 */     } catch (error) {
/* 071 */       result[code] = {
/* 072 */         error: error.message,
/* 073 */         data: []
/* 074 */       };
/* 075 */     }
/* 076 */ 
/* 077 */     await wait(13000);
/* 078 */   }
/* 079 */ 
/* 080 */   fs.writeFileSync(
/* 081 */     "stocks.json",
/* 082 */     JSON.stringify(result, null, 2),
/* 083 */     "utf8"
/* 084 */   );
/* 085 */ 
/* 086 */   console.log("stocks.json updated");
/* 087 */ }
/* 088 */ 
/* 089 */ main().catch(error => {
/* 090 */   console.error(error);
/* 091 */   process.exit(1);
/* 092 */ });
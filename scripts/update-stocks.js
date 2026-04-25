/* 001 */ const fs = require("fs");
/* 002 */ 
/* 003 */ const MAX_DATE = "2026-01-31";
/* 004 */ 
/* 005 */ const WATCH_CODES = [
/* 006 */   "7203","6758","7974","9984","9432"
/* 007 */ ];
/* 008 */ 
/* 009 */ function wait(ms) {
/* 010 */   return new Promise(resolve => setTimeout(resolve, ms));
/* 011 */ }
/* 012 */ 
/* 013 */ function formatDate(date) {
/* 014 */   const y = date.getFullYear();
/* 015 */   const m = String(date.getMonth() + 1).padStart(2, "0");
/* 016 */   const d = String(date.getDate()).padStart(2, "0");
/* 017 */ 
/* 018 */   return `${y}${m}${d}`;
/* 019 */ }
/* 020 */ 
/* 021 */ function getDateRange() {
/* 022 */   const to = new Date(MAX_DATE);
/* 023 */   const from = new Date(MAX_DATE);
/* 024 */ 
/* 025 */   from.setDate(from.getDate() - 84);
/* 026 */ 
/* 027 */   return {
/* 028 */     from: formatDate(from),
/* 029 */     to: formatDate(to)
/* 030 */   };
/* 031 */ }
/* 032 */ 
/* 033 */ async function fetchStock(apiKey, code) {
/* 034 */   const jquantsCode = code.endsWith("0") ? code : `${code}0`;
/* 035 */   const range = getDateRange();
/* 036 */ 
/* 037 */   const url =
/* 038 */     `https://api.jquants.com/v2/equities/bars/daily?code=${jquantsCode}&from=${range.from}&to=${range.to}`;
/* 039 */ 
/* 040 */   const response = await fetch(url, {
/* 041 */     headers: {
/* 042 */       "x-api-key": apiKey
/* 043 */     }
/* 044 */   });
/* 045 */ 
/* 046 */   const data = await response.json();
/* 047 */ 
/* 048 */   if (!response.ok) {
/* 049 */     throw new Error(data.message || `HTTP ${response.status}`);
/* 050 */   }
/* 051 */ 
/* 052 */   return data;
/* 053 */ }
/* 054 */ 
/* 055 */ async function main() {
/* 056 */   const apiKey = process.env.JQUANTS_API_KEY;
/* 057 */ 
/* 058 */   if (!apiKey) {
/* 059 */     throw new Error("JQUANTS_API_KEY が未設定");
/* 060 */   }
/* 061 */ 
/* 062 */   const result = {};
/* 063 */ 
/* 064 */   for (const code of WATCH_CODES) {
/* 065 */     try {
/* 066 */       const data = await fetchStock(apiKey, code);
/* 067 */ 
/* 068 */       result[code] = {
/* 069 */         data: data.data || []
/* 070 */       };
/* 071 */ 
/* 072 */     } catch (error) {
/* 073 */       result[code] = {
/* 074 */         error: error.message,
/* 075 */         data: []
/* 076 */       };
/* 077 */     }
/* 078 */ 
/* 079 */     await wait(13000);
/* 080 */   }
/* 081 */ 
/* 082 */   fs.writeFileSync(
/* 083 */     "stocks.json",
/* 084 */     JSON.stringify(result, null, 2),
/* 085 */     "utf8"
/* 086 */   );
/* 087 */ 
/* 088 */   console.log("stocks.json updated");
/* 089 */ }
/* 090 */ 
/* 091 */ main().catch(error => {
/* 092 */   console.error(error);
/* 093 */   process.exit(1);
/* 094 */ });
/* 001 */ function formatDate(date) {
/* 002 */   const y = date.getFullYear();
/* 003 */   const m = String(date.getMonth() + 1).padStart(2, "0");
/* 004 */   const d = String(date.getDate()).padStart(2, "0");
/* 005 */ 
/* 006 */   return `${y}${m}${d}`;
/* 007 */ }
/* 008 */ 
/* 009 */ function getDateRange() {
/* 010 */   const to = new Date("2026-01-31");
/* 011 */   const from = new Date("2026-01-31");
/* 012 */ 
/* 013 */   from.setDate(from.getDate() - 80);
/* 014 */ 
/* 015 */   return {
/* 016 */     from: formatDate(from),
/* 017 */     to: formatDate(to)
/* 018 */   };
/* 019 */ }
/* 020 */ 
/* 021 */ export default async function handler(req, res) {
/* 022 */   try {
/* 023 */     const apiKey = process.env.JQUANTS_API_KEY;
/* 024 */ 
/* 025 */     if (!apiKey) {
/* 026 */       return res.status(500).json({
/* 027 */         error: "APIキー未設定"
/* 028 */       });
/* 029 */     }
/* 030 */ 
/* 031 */     const code = "7203";
/* 032 */     const data = await fetchStock(apiKey, code);
/* 033 */ 
/* 034 */     return res.status(200).json({
/* 035 */       [code]: {
/* 036 */         data: data.data || []
/* 037 */       }
/* 038 */     });
/* 039 */ 
/* 040 */   } catch (error) {
/* 041 */     return res.status(500).json({
/* 042 */       error: "stocks取得失敗",
/* 043 */       detail: error.message
/* 044 */     });
/* 045 */   }
/* 046 */ }
/* 047 */ 
/* 048 */ async function fetchStock(apiKey, code) {
/* 049 */   const jquantsCode = `${code}0`;
/* 050 */   const range = getDateRange();
/* 051 */ 
/* 052 */   const url =
/* 053 */     `https://api.jquants.com/v2/equities/bars/daily?code=${jquantsCode}&from=${range.from}&to=${range.to}`;
/* 054 */ 
/* 055 */   const response = await fetch(url, {
/* 056 */     headers: {
/* 057 */       "x-api-key": apiKey
/* 058 */     }
/* 059 */   });
/* 060 */ 
/* 061 */   const data = await response.json();
/* 062 */ 
/* 063 */   if (!response.ok) {
/* 064 */     throw new Error(data.message || `HTTP ${response.status}`);
/* 065 */   }
/* 066 */ 
/* 067 */   return data;
/* 068 */ }
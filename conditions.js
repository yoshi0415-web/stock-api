/* 001 */ function isRedThreeSoldiers(prices) {
/* 002 */   const last3 = prices.slice(-3);
/* 003 */ 
/* 004 */   if (last3.length < 3) {
/* 005 */     return false;
/* 006 */   }
/* 007 */ 
/* 008 */   const [day1, day2, day3] = last3;
/* 009 */ 
/* 010 */   const allBullish =
/* 011 */     day1.C > day1.O &&
/* 012 */     day2.C > day2.O &&
/* 013 */     day3.C > day3.O;
/* 014 */ 
/* 015 */   const closeRising =
/* 016 */     day1.C < day2.C &&
/* 017 */     day2.C < day3.C;
/* 018 */ 
/* 019 */   return allBullish && closeRising;
/* 020 */ }
/* 021 */ 
/* 022 */ function isThreeBlackCrows(prices) {
/* 023 */   const last3 = prices.slice(-3);
/* 024 */ 
/* 025 */   if (last3.length < 3) {
/* 026 */     return false;
/* 027 */   }
/* 028 */ 
/* 029 */   const [day1, day2, day3] = last3;
/* 030 */ 
/* 031 */   const allBearish =
/* 032 */     day1.C < day1.O &&
/* 033 */     day2.C < day2.O &&
/* 034 */     day3.C < day3.O;
/* 035 */ 
/* 036 */   const closeFalling =
/* 037 */     day1.C > day2.C &&
/* 038 */     day2.C > day3.C;
/* 039 */ 
/* 040 */   return allBearish && closeFalling;
/* 041 */ }
/* 042 */ 
/* 043 */ function isBreakHigh25(prices) {
/* 044 */   if (!prices || prices.length < 25) {
/* 045 */     return false;
/* 046 */   }
/* 047 */ 
/* 048 */   const last25 = prices.slice(-25);
/* 049 */   const latest = last25[last25.length - 1];
/* 050 */ 
/* 051 */   const pastHigh = Math.max(
/* 052 */     ...last25.slice(0, -1).map(day => day.H)
/* 053 */   );
/* 054 */ 
/* 055 */   return latest.C >= pastHigh;
/* 056 */ }
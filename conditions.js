function isRedThreeSoldiers(prices) {
  const last3 = prices.slice(-3);

  if (last3.length < 3) return false;

  const [day1, day2, day3] = last3;

  const allBullish =
    day1.C > day1.O &&
    day2.C > day2.O &&
    day3.C > day3.O;

  const closeRising =
    day1.C < day2.C &&
    day2.C < day3.C;

  return allBullish && closeRising;
}

function isThreeBlackCrows(prices) {
  const last3 = prices.slice(-3);

  if (last3.length < 3) return false;

  const [day1, day2, day3] = last3;

  const allBearish =
    day1.C < day1.O &&
    day2.C < day2.O &&
    day3.C < day3.O;

  const closeFalling =
    day1.C > day2.C &&
    day2.C > day3.C;

  return allBearish && closeFalling;
}

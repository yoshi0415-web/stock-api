const risingButton = document.getElementById("risingButton");
const fallingButton = document.getElementById("fallingButton");
const bullishButton = document.getElementById("bullishButton");
const volumeButton = document.getElementById("volumeButton");

function setActiveButton(activeButton) {
  [risingButton, fallingButton, bullishButton, volumeButton].forEach(button => {
    button.classList.remove("active");
  });

  activeButton.classList.add("active");
}

risingButton.addEventListener("click", () => {
  if (isLoading) return;

  setActiveButton(risingButton);
  logCondition("赤三兵");
  showStockList(WATCH_CODES, "赤三兵");
});

fallingButton.addEventListener("click", () => {
  if (isLoading) return;

  setActiveButton(fallingButton);
  logCondition("三羽烏");
  showStockList(WATCH_CODES, "三羽烏");
});

bullishButton.addEventListener("click", () => {
  if (isLoading) return;

  setActiveButton(bullishButton);
  logCondition("出来高急増");
  showStockList(WATCH_CODES, "出来高急増");
});

volumeButton.addEventListener("click", () => {
  if (isLoading) return;

  setActiveButton(volumeButton);
  logCondition("高値更新");
  showStockList(WATCH_CODES, "高値更新");
});
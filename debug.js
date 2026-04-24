window.debugLogs = [];

function pushLog(message) {
  const time = new Date().toLocaleTimeString("ja-JP");

  window.debugLogs.push(`${time} ${message}`);

  if (window.debugLogs.length > 30) {
    window.debugLogs.shift();
  }
}

window.logCondition = label => pushLog(`条件クリック: ${label}`);
window.logList = label => pushLog(`候補一覧表示: ${label}`);
window.logCandidate = code => pushLog(`候補クリック: ${code}`);

window.logStart = code => pushLog(`通信開始: ${code}`);
window.logHttp = status => pushLog(`HTTP応答: ${status}`);
window.logNoData = data => pushLog(`データなし: ${JSON.stringify(data)}`);
window.logSuccess = count => pushLog(`データ取得成功: ${count}件`);
window.logChart = code => pushLog(`チャート描画完了: ${code}`);
window.logDestroy = () => pushLog("旧チャート破棄");
window.logCooldown = code => pushLog(`通信拒否（クールダウン中）: ${code}`);
window.logIgnore = code => pushLog(`旧通信無視: ${code}`);
window.logError = error => pushLog(`通信エラー: ${error.message}`);
window.logLoadingStart = () => pushLog("読込開始");
window.logLoadingEnd = () => pushLog("読込終了");

window.showDebugLogs = function () {
  alert(window.debugLogs.join("\n"));
};
window.debugLogs = [];

window.addLog = function (message) {
  const time = new Date().toLocaleTimeString("ja-JP");
  window.debugLogs.push(`${time} ${message}`);

  if (window.debugLogs.length > 30) {
    window.debugLogs.shift();
  }
};

window.showDebugLogs = function () {
  alert(window.debugLogs.join("\n"));
};

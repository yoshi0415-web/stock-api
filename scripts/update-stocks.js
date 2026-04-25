const fs = require("fs");

const WATCH_CODES = [
  "7203","6758","7974","9984","9432",
  "8306","8316","8411","6501","6503"
];

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function getDate

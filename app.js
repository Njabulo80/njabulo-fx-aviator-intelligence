
"use strict";

const STORAGE_KEY = "njabuloRounds";

let rounds = [];

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  rounds = Array.isArray(saved)
    ? saved.filter(value => Number.isFinite(value) && value >= 1)
    : [];
} catch (error) {
  rounds = [];
}

function saveRounds() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds));
  } catch (error) {
    showMessage("Could not save data on this device.");
  }
}

function showMessage(message) {
  const element = document.getElementById("message");
  if (element) element.textContent = message;
}

function calculateMedian(values) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function calculateStatistics() {
  const total = rounds.length;

  if (!total) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      median: 0,
      low: 0,
      medium: 0,
      high: 0,
      aboveTwo: 0,
      aboveFive: 0
    };
  }

  const sum = rounds.reduce((a, b) => a + b, 0);

  return {
    total,
    average: sum / total,
    highest: Math.max(...rounds),
    median: calculateMedian(rounds),
    low: rounds.filter(value => value < 2).length,
    medium: rounds.filter(value => value >= 2 && value < 5).length,
    high: rounds.filter(value => value >= 5).length,
    aboveTwo: rounds.filter(value => value >= 2).length,
    aboveFive: rounds.filter(value => value >= 5).length
  };
}

function renderDashboard() {
  const stats = calculateStatistics();

  setText("totalRounds", stats.total);
  setText("averageMultiplier", stats.average.toFixed(2) + "x");
  setText("highestMultiplier", stats.highest.toFixed(2) + "x");

  setText("lowRounds", stats.low);
  setText("mediumRounds", stats.medium);
  setText("highRounds", stats.high);

  setText("medianMultiplier", stats.median.toFixed(2) + "x");
  setText("aboveTwo", stats.aboveTwo);
  setText("aboveFive", stats.aboveFive);

  const history = document.getElementById("roundHistory");

  if (history) {
    history.replaceChildren();

    rounds.slice().reverse().slice(0, 50).forEach(value => {
      const item = document.createElement("div");
      item.className = "round";
      item.textContent = value.toFixed(2) + "x";

      if (value >= 5) item.classList.add("high");
      if (value < 2) item.classList.add("low");

      history.appendChild(item);
    });

    if (!rounds.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No rounds recorded yet.";
      history.appendChild(empty);
    }
  }
}

function addRound() {
  const input = document.getElementById("multiplierInput");
  if (!input) return;

  const value = Number(input.value);

  if (!Number.isFinite(value) || value < 1) {
    showMessage("Enter a valid multiplier of 1.00x or higher.");
    return;
  }

  rounds.push(Number(value.toFixed(2)));
  saveRounds();
  renderDashboard();

  input.value = "";
  showMessage("Round successfully recorded.");
}

function calculateProbability() {
  const input = document.getElementById("targetMultiplier");
  const target = Number(input?.value);

  if (!Number.isFinite(target) || target <= 1) {
    setText("probabilityResult", "Enter a target above 1.00x.");
    setText("probabilityExplanation", "");
    return;
  }

  if (!rounds.length) {
    setText("probabilityResult", "Not enough recorded data.");
    setText("probabilityExplanation", "Record rounds before analysing historical frequency.");
    return;
  }

  const count = rounds.filter(value => value >= target).length;
  const percentage = (count / rounds.length) * 100;

  setText("probabilityResult", percentage.toFixed(2) + "%");
  setText(
    "probabilityExplanation",
    count + " of " + rounds.length +
    " recorded rounds reached or exceeded " + target.toFixed(2) +
    "x. This is historical frequency, not the probability of the next round."
  );
}

function exportRounds() {
  if (!rounds.length) {
    showMessage("There are no rounds to export yet.");
    return;
  }

  const csv = [
    "Round,Multiplier",
    ...rounds.map((value, index) => (index + 1) + "," + value.toFixed(2))
  ].join("\n");

  const file = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = url;
  link.download = "njabulo-fx-round-history.csv";
  link.click();

  URL.revokeObjectURL(url);
  showMessage("Round history exported.");
}

renderDashboard();

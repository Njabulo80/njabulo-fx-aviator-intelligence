
/* =====================================
   NJABULO FX - AVIATOR INTELLIGENCE
   Historical Statistical Engine
===================================== */

const STORAGE_KEY = "njabuloRounds";

let rounds = [];

try {
  const saved = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
  );

  rounds = Array.isArray(saved) ? saved : [];
} catch {
  rounds = [];
}

/* SAVE DATA */

function saveRounds() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(rounds)
  );
}

/* ADD A COMPLETED ROUND */

function addRound() {
  const input = document.getElementById("multiplierInput");
  const message = document.getElementById("message");

  const value = Number(input.value);

  if (!Number.isFinite(value) || value < 1) {
    message.textContent = "Enter a valid multiplier.";
    return;
  }

  rounds.unshift({
    id: crypto.randomUUID(),
    multiplier: value,
    recordedAt: new Date().toISOString()
  });

  saveRounds();

  input.value = "";
  message.textContent = "Round recorded successfully.";

  renderDashboard();
}

/* CALCULATE STATISTICS */

function calculateStatistics() {
  if (rounds.length === 0) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0,
      median: 0,
      aboveTwo: 0,
      aboveFive: 0
    };
  }

  const values = rounds.map(
    round => round.multiplier
  );

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const total = values.length;

  const average =
    values.reduce((sum, value) => sum + value, 0) / total;

  const middle = Math.floor(total / 2);

  const median = total % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];

  return {
    total,
    average,
    highest: Math.max(...values),
    lowest: Math.min(...values),
    median,
    aboveTwo: values.filter(value => value >= 2).length,
    aboveFive: values.filter(value => value >= 5).length
  };
}

/* UPDATE DASHBOARD */

function renderDashboard() {
  const stats = calculateStatistics();

  document.getElementById("totalRounds").textContent =
    stats.total;

  document.getElementById("averageMultiplier").textContent =
    stats.average.toFixed(2) + "x";

  document.getElementById("highestMultiplier").textContent =
    stats.highest.toFixed(2) + "x";

  const history = document.getElementById("roundHistory");

  history.replaceChildren();

  if (rounds.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No rounds recorded yet.";
    history.appendChild(empty);
    return;
  }

  rounds.slice(0, 100).forEach(round => {
    const item = document.createElement("div");

    item.className = "round " +
      (round.multiplier >= 2 ? "high" : "low");

    item.textContent =
      round.multiplier.toFixed(2) + "x";

    history.appendChild(item);
  });
}

/* PROBABILITY RESEARCH */

function calculateProbability() {
  const target = Number(
    document.getElementById("targetMultiplier").value
  );

  const result =
    document.getElementById("probabilityResult");

  const explanation =
    document.getElementById("probabilityExplanation");

  if (!Number.isFinite(target) || target < 1) {
    result.textContent = "--";
    explanation.textContent =
      "Enter a valid target multiplier.";
    return;
  }

  const illustrativeRTP = 0.97;

  const probability =
    Math.min(1, illustrativeRTP / target) * 100;

  result.textContent = probability.toFixed(2) + "%";

  explanation.textContent =
    "Illustrative theoretical estimate only. " +
    "Actual game rules may differ. Not a next-round prediction.";
}

/* EXPORT RESEARCH DATA */

function exportRounds() {
  if (rounds.length === 0) {
    alert("There are no rounds to export.");
    return;
  }

  const csv = [
    "Multiplier,Recorded At",
    ...rounds.map(round =>
      `${round.multiplier},${round.recordedAt}`
    )
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "njabulo-fx-round-history.csv";
  link.click();

  URL.revokeObjectURL(url);
}

/* INITIALIZE */

renderDashboard();

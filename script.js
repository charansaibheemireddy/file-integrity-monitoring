"use strict";

const STORAGE_KEYS = {
  baseline: "fileguard_baseline_v1",
  history: "fileguard_history_v1"
};

const fileInput = document.getElementById("fileInput");
const folderInput = document.getElementById("folderInput");
const selectionInfo = document.getElementById("selectionInfo");
const fileList = document.getElementById("fileList");
const baselineBtn = document.getElementById("baselineBtn");
const verifyBtn = document.getElementById("verifyBtn");
const clearBaselineBtn = document.getElementById("clearBaselineBtn");
const baselineInfo = document.getElementById("baselineInfo");
const statusCard = document.getElementById("statusCard");
const statusIcon = document.getElementById("statusIcon");
const statusTitle = document.getElementById("statusTitle");
const statusMessage = document.getElementById("statusMessage");
const unchangedCount = document.getElementById("unchangedCount");
const modifiedCount = document.getElementById("modifiedCount");
const newCount = document.getElementById("newCount");
const missingCount = document.getElementById("missingCount");
const resultsSubtitle = document.getElementById("resultsSubtitle");
const resultCount = document.getElementById("resultCount");
const resultsBody = document.getElementById("resultsBody");
const baselineFileCount = document.getElementById("baselineFileCount");
const baselineCreated = document.getElementById("baselineCreated");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const historyList = document.getElementById("historyList");

let selectedFiles = [];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error("FileGuard storage error:", error);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("FileGuard storage error:", error);
    alert("The browser could not save this data. Your storage may be full or restricted.");
    return false;
  }
}

function getBaseline() {
  return readJSON(STORAGE_KEYS.baseline, null);
}

function getHistory() {
  return readJSON(STORAGE_KEYS.history, []);
}

function getFileKey(file) {
  return file.webkitRelativePath || file.name;
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes || 0} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(file) {
  if (!window.crypto || !window.crypto.subtle) {
    throw new Error("Web Crypto SHA-256 is not available in this browser.");
  }

  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return bytesToHex(digest);
}

function setSelectedFiles(fileListObject) {
  selectedFiles = Array.from(fileListObject || []);
  renderSelectedFiles();
}

function renderSelectedFiles() {
  if (selectedFiles.length === 0) {
    selectionInfo.classList.add("hidden");
    fileList.className = "file-list empty-state";
    fileList.textContent = "No files selected yet.";
    return;
  }

  selectionInfo.classList.remove("hidden");
  selectionInfo.textContent = `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected. For accurate New/Missing detection, select the same files or folder used for the baseline.`;

  fileList.className = "file-list";
  fileList.innerHTML = selectedFiles.map(file => `
    <div class="file-item">
      <span class="file-name" title="${escapeHTML(getFileKey(file))}">📄 ${escapeHTML(getFileKey(file))}</span>
      <span class="file-size">${formatBytes(file.size)}</span>
    </div>
  `).join("");
}

function resetSummary() {
  unchangedCount.textContent = "0";
  modifiedCount.textContent = "0";
  newCount.textContent = "0";
  missingCount.textContent = "0";
}

function setStatus(type, icon, title, message) {
  statusCard.className = `status-card ${type}`;
  statusIcon.textContent = icon;
  statusTitle.textContent = title;
  statusMessage.textContent = message;
}

function updateBaselineUI() {
  const baseline = getBaseline();

  if (!baseline || !Array.isArray(baseline.files) || baseline.files.length === 0) {
    baselineFileCount.textContent = "0";
    baselineCreated.textContent = "—";
    baselineInfo.textContent = "No baseline has been created.";
    clearBaselineBtn.disabled = true;
    return;
  }

  baselineFileCount.textContent = String(baseline.files.length);
  baselineCreated.textContent = formatDate(baseline.createdAt);
  baselineInfo.textContent = `Baseline ready: ${baseline.files.length} file${baseline.files.length === 1 ? "" : "s"} recorded on ${formatDate(baseline.createdAt)}.`;
  clearBaselineBtn.disabled = false;
}

function clearResults() {
  resetSummary();
  resultCount.textContent = "0 files";
  resultsSubtitle.textContent = "Results will appear after an integrity verification.";
  resultsBody.innerHTML = '<tr><td colspan="3" class="table-empty">No verification results yet.</td></tr>';
  setStatus("status-neutral", "🟡", "No Scan Performed", "Create a baseline first, then verify your selected files.");
}

function statusLabel(status) {
  const labels = {
    unchanged: ["🟢", "Unchanged", "pill-unchanged"],
    modified: ["🟠", "Modified", "pill-modified"],
    new: ["🔵", "New", "pill-new"],
    missing: ["🔴", "Missing", "pill-missing"]
  };
  return labels[status];
}

function renderResults(results) {
  const counts = {
    unchanged: results.filter(item => item.status === "unchanged").length,
    modified: results.filter(item => item.status === "modified").length,
    new: results.filter(item => item.status === "new").length,
    missing: results.filter(item => item.status === "missing").length
  };

  unchangedCount.textContent = String(counts.unchanged);
  modifiedCount.textContent = String(counts.modified);
  newCount.textContent = String(counts.new);
  missingCount.textContent = String(counts.missing);
  resultCount.textContent = `${results.length} file${results.length === 1 ? "" : "s"}`;

  if (results.length === 0) {
    resultsBody.innerHTML = '<tr><td colspan="3" class="table-empty">No files to display.</td></tr>';
    return counts;
  }

  resultsBody.innerHTML = results.map(item => {
    const [icon, label, className] = statusLabel(item.status);
    const hashText = item.hash || "—";
    return `
      <tr>
        <td title="${escapeHTML(item.path)}">${escapeHTML(item.path)}</td>
        <td><span class="status-pill ${className}">${icon} ${label}</span></td>
        <td class="hash">${escapeHTML(hashText)}</td>
      </tr>
    `;
  }).join("");

  return counts;
}

function saveHistory(entry) {
  const history = getHistory();
  history.unshift(entry);
  writeJSON(STORAGE_KEYS.history, history.slice(0, 12));
  renderHistory();
}

function renderHistory() {
  const history = getHistory();

  if (!Array.isArray(history) || history.length === 0) {
    historyList.innerHTML = '<div class="table-empty">No scan history yet.</div>';
    return;
  }

  historyList.innerHTML = history.map(entry => `
    <div class="history-item">
      <div>
        <div class="history-title">${escapeHTML(entry.title)}</div>
        <div class="history-detail">${escapeHTML(entry.detail)}</div>
      </div>
      <div class="history-time">${escapeHTML(formatDate(entry.timestamp))}</div>
    </div>
  `).join("");
}

async function createBaseline() {
  if (selectedFiles.length === 0) {
    alert("Please select at least one file or folder first.");
    return;
  }

  baselineBtn.disabled = true;
  verifyBtn.disabled = true;
  baselineBtn.textContent = "⏳ Hashing Files...";

  try {
    const records = [];

    for (let index = 0; index < selectedFiles.length; index += 1) {
      const file = selectedFiles[index];
      baselineBtn.textContent = `⏳ Hashing ${index + 1}/${selectedFiles.length}...`;
      const hash = await sha256(file);
      records.push({
        path: getFileKey(file),
        hash,
        size: file.size,
        lastModified: file.lastModified
      });
    }

    const baseline = {
      version: 1,
      algorithm: "SHA-256",
      createdAt: new Date().toISOString(),
      files: records
    };

    if (!writeJSON(STORAGE_KEYS.baseline, baseline)) return;

    updateBaselineUI();
    clearResults();
    saveHistory({
      title: "🔐 Baseline created",
      detail: `${records.length} file${records.length === 1 ? "" : "s"} hashed with SHA-256.`,
      timestamp: new Date().toISOString()
    });

    alert(`Baseline created successfully for ${records.length} file${records.length === 1 ? "" : "s"}.`);
  } catch (error) {
    console.error(error);
    alert(`Could not create the baseline: ${error.message}`);
  } finally {
    baselineBtn.disabled = false;
    verifyBtn.disabled = false;
    baselineBtn.textContent = "🔐 Create Baseline";
  }
}

async function verifyIntegrity() {
  const baseline = getBaseline();

  if (!baseline || !Array.isArray(baseline.files) || baseline.files.length === 0) {
    alert("Please create a baseline first.");
    return;
  }

  if (selectedFiles.length === 0) {
    alert("Please select the files or folder you want to verify.");
    return;
  }

  baselineBtn.disabled = true;
  verifyBtn.disabled = true;
  verifyBtn.textContent = "⏳ Verifying...";

  try {
    const baselineMap = new Map(baseline.files.map(record => [record.path, record]));
    const currentMap = new Map();
    const results = [];

    for (let index = 0; index < selectedFiles.length; index += 1) {
      const file = selectedFiles[index];
      verifyBtn.textContent = `⏳ Checking ${index + 1}/${selectedFiles.length}...`;
      const path = getFileKey(file);
      const hash = await sha256(file);
      currentMap.set(path, { file, hash });

      if (!baselineMap.has(path)) {
        results.push({ path, status: "new", hash });
      } else if (baselineMap.get(path).hash === hash) {
        results.push({ path, status: "unchanged", hash });
      } else {
        results.push({ path, status: "modified", hash });
      }
    }

    for (const record of baseline.files) {
      if (!currentMap.has(record.path)) {
        results.push({ path: record.path, status: "missing", hash: record.hash });
      }
    }

    const counts = renderResults(results);
    const problemCount = counts.modified + counts.new + counts.missing;

    if (problemCount === 0) {
      setStatus(
        "status-safe",
        "🟢",
        "ALL FILES VERIFIED",
        `All ${counts.unchanged} selected baseline file${counts.unchanged === 1 ? "" : "s"} match their original SHA-256 hashes.`
      );
      resultsSubtitle.textContent = "Every selected file matches the stored baseline.";
    } else if (counts.modified > 0 && counts.new === 0 && counts.missing === 0) {
      setStatus(
        "status-warning",
        "🟠",
        "FILE MODIFICATION DETECTED",
        `${counts.modified} file${counts.modified === 1 ? "" : "s"} has a different SHA-256 hash than the baseline.`
      );
      resultsSubtitle.textContent = "One or more files changed after the baseline was created.";
    } else if (counts.missing > 0 && counts.modified === 0 && counts.new === 0) {
      setStatus(
        "status-danger",
        "🔴",
        "MISSING FILE DETECTED",
        `${counts.missing} baseline file${counts.missing === 1 ? "" : "s"} was not found in the current selection.`
      );
      resultsSubtitle.textContent = "One or more baseline files were not found in the current selection.";
    } else {
      setStatus(
        "status-danger",
        "🔴",
        "INTEGRITY CHANGES DETECTED",
        `${problemCount} file${problemCount === 1 ? "" : "s"} differ from the baseline or were added/removed.`
      );
      resultsSubtitle.textContent = "The current selection contains modifications, new files, or missing baseline files.";
    }

    saveHistory({
      title: problemCount === 0 ? "🟢 Integrity verified" : "⚠️ Integrity changes detected",
      detail: `${counts.unchanged} unchanged · ${counts.modified} modified · ${counts.new} new · ${counts.missing} missing`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    alert(`Could not verify the files: ${error.message}`);
  } finally {
    baselineBtn.disabled = false;
    verifyBtn.disabled = false;
    verifyBtn.textContent = "🔍 Verify Integrity";
  }
}

function clearBaseline() {
  const baseline = getBaseline();
  if (!baseline) return;

  const confirmed = window.confirm("Clear the current baseline? You will need to create a new baseline before verifying files.");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEYS.baseline);
  updateBaselineUI();
  clearResults();
}

function clearHistory() {
  const history = getHistory();
  if (history.length === 0) return;

  const confirmed = window.confirm("Clear all FileGuard scan history?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEYS.history);
  renderHistory();
}

fileInput.addEventListener("change", event => {
  folderInput.value = "";
  setSelectedFiles(event.target.files);
});

folderInput.addEventListener("change", event => {
  fileInput.value = "";
  setSelectedFiles(event.target.files);
});

baselineBtn.addEventListener("click", createBaseline);
verifyBtn.addEventListener("click", verifyIntegrity);
clearBaselineBtn.addEventListener("click", clearBaseline);
clearHistoryBtn.addEventListener("click", clearHistory);

updateBaselineUI();
renderHistory();
resetSummary();

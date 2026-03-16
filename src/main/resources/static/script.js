/* ════════════════════════════════════════
   THEME
════════════════════════════════════════ */

(function () {
  const saved = localStorage.getItem("crac-theme");
  if (saved === "dark")
    document.documentElement.setAttribute("data-theme", "dark");
})();

function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", isDark ? "light" : "dark");
  localStorage.setItem("crac-theme", isDark ? "light" : "dark");
}

/* ════════════════════════════════════════
   STATE
════════════════════════════════════════ */
let customers = [];

/* ════════════════════════════════════════
   API
════════════════════════════════════════ */
const BASE = "http://localhost:8080";
const API = {
  LIST: (page = 0) => `/customer/customers?page=${page}&size=5`,
  ADD:    "/customer/add",
  UPDATE: (id) => `/customer/update/${id}`,
  DELETE: (id) => `/customer/delete/${id}`,
  CLEAR: "/customer/clear",
};

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}

/* ════════════════════════════════════════
   HELPERS
════════════════════════════════════════ */
function formatDate(s) {
  if (!s) return "—";
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function monthsAgo(s) {
  if (!s) return 999;
  const [y, m] = s.split("-").map(Number);
  const now = new Date();
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
}

function nextPage() {
  if (currentPage < totalPages - 1) {
    currentPage++;
    loadCustomers();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    loadCustomers();
  }
}

function isDue(s) { return monthsAgo(s) >= 6; }

function refresh() {
  renderTable();
  renderDueSection();
  updateStats();
}

/* ════════════════════════════════════════
   TABLE STATES
════════════════════════════════════════ */
function setTableLoading(on) {
  if (!on) return;
  document.getElementById("customer-tbody").innerHTML = `
    <tr class="empty-row"><td colspan="6">
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--muted)">
        <svg style="width:28px;height:28px;opacity:.4;animation:spin-slow 1.2s linear infinite"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
                   M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Loading…
      </div>
    </td></tr>`;
}

function showTableError(msg) {
  document.getElementById("customer-tbody").innerHTML = `
    <tr class="empty-row"><td colspan="6">
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--danger)">
        <svg style="width:28px;height:28px;opacity:.6"
             fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        ${msg}
      </div>
    </td></tr>`;
  document.getElementById("table-count").textContent = "—";
}

/* ════════════════════════════════════════
   LOAD  —  GET /customer/customers
════════════════════════════════════════ */
let currentPage = 0;
let totalPages = 0;
async function loadCustomers() {
  setTableLoading(true);
  try {
    //customers = await apiFetch(API.LIST);
    const res = await apiFetch(API.LIST(currentPage));
    customers = res.content;
    totalPages = res.totalPages;
    refresh();
    document.getElementById("page-indicator").textContent =
      `Page ${currentPage + 1} of ${totalPages}`;
  } catch (e) {
    showTableError("Could not load customers. Is the server running?");
    console.error(e);
  }
}

/* ════════════════════════════════════════
   RENDER TABLE
════════════════════════════════════════ */
function renderTable(list = customers) {
  const tbody = document.getElementById("customer-tbody");
  tbody.innerHTML = "";

  if (!list.length) {
    tbody.innerHTML = `
      <tr class="empty-row"><td colspan="6">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--muted)">
          <svg style="width:32px;height:32px;opacity:.35"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          No customers found
        </div>
      </td></tr>`;
    document.getElementById("table-count").textContent = "Showing 0 customers";
    return;
  }

  list.forEach((c) => {
    const due = isDue(c.lastServiceDate);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar-ring" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span class="avatar-letter" style="font-weight:700;font-size:0.75rem">${c.name.charAt(0).toUpperCase()}</span>
          </div>
          <span class="cust-name">${c.name}</span>
        </div>
      </td>
      <td style="color:var(--muted);font-family:monospace;font-size:0.75rem">${c.contactNumber}</td>
      <td style="color:var(--muted);font-size:0.75rem;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${c.address}">${c.address}</td>
      <td>
        ${due
          ? `<span class="due-badge">
               <svg style="width:12px;height:12px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                 <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
               </svg>
               ${formatDate(c.lastServiceDate)}
             </span>`
          : `<span class="text-success-var">${formatDate(c.lastServiceDate)}</span>`
        }
      </td>
      <td style="color:var(--muted);font-size:0.75rem;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
          title="${c.notes || ''}">${c.notes || "—"}</td>
      <td>
        <div style="display:flex;align-items:center;justify-content:center;gap:6px">
          <button class="btn-icon edit" title="Edit" onclick="editCustomer(${c.id})">
            <svg style="width:14px;height:14px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="btn-icon delete" title="Delete"
                  onclick="deleteCustomer(${c.id}, '${c.name.replace(/'/g, "\\'")}')">
            <svg style="width:14px;height:14px" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  document.getElementById("table-count").textContent =
    `Showing ${list.length} customer${list.length !== 1 ? "s" : ""}`;
}

/* ════════════════════════════════════════
   RENDER DUE CARDS
════════════════════════════════════════ */
function renderDueSection() {
  const due = customers.filter((c) => isDue(c.lastServiceDate));
  const section = document.getElementById("due-section");
  const container = document.getElementById("due-cards");
  document.getElementById("stat-due").textContent = due.length;

  if (!due.length) { section.style.display = "none"; return; }
  section.style.display = "block";
  container.innerHTML = "";

  due.forEach((c) => {
    const mo = monthsAgo(c.lastServiceDate);
    const card = document.createElement("div");
    card.style.cssText = `border-radius:12px;border:1px solid rgba(217,119,6,0.25);background:var(--card-bg);padding:1rem;gap:12px;display:flex;flex-direction:column;transition:border-color 0.2s`;
    card.onmouseenter = () => (card.style.borderColor = "rgba(217,119,6,0.5)");
    card.onmouseleave = () => (card.style.borderColor = "rgba(217,119,6,0.25)");
    card.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:36px;height:36px;border-radius:50%;background:var(--warn-bg);border:1px solid rgba(217,119,6,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
            <span style="color:var(--warn);font-weight:700;font-size:0.875rem">${c.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p style="color:var(--text);font-weight:600;font-size:0.875rem;line-height:1.2">${c.name}</p>
            <p style="color:var(--muted);font-size:0.72rem;font-family:monospace">${c.contactNumber}</p>
          </div>
        </div>
        <span class="due-badge">${mo}mo ago</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--muted)">
        <svg style="width:14px;height:14px;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.address}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--muted)">
        <svg style="width:14px;height:14px;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Last service: <span style="color:var(--warn);font-weight:600">${formatDate(c.lastServiceDate)}</span>
      </div>
      ${c.notes
        ? `<p style="font-size:0.75rem;color:var(--muted);border-top:1px solid var(--border);padding-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"
               title="${c.notes}">${c.notes}</p>`
        : ""}`;
    container.appendChild(card);
  });
}

/* ════════════════════════════════════════
   STATS
════════════════════════════════════════ */
function updateStats() {
  const now = new Date();
  const thirtyAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const recent = customers.filter((c) => {
    if (!c.lastServiceDate) return false;
    const [y, m, d] = c.lastServiceDate.split("-").map(Number);
    return new Date(y, m - 1, d) >= thirtyAgo;
  });
  const thisMonth = customers.filter((c) => {
    if (!c.lastServiceDate) return false;
    const [y, m] = c.lastServiceDate.split("-").map(Number);
    return m - 1 === now.getMonth() && y === now.getFullYear();
  });

  document.getElementById("stat-total").textContent  = customers.length;
  document.getElementById("stat-recent").textContent = recent.length;
  document.getElementById("stat-month").textContent  = thisMonth.length;
}

/* ════════════════════════════════════════
   MODAL
════════════════════════════════════════ */
function openModal() {
  document.getElementById("modal-overlay").classList.add("open");
  document.getElementById("modal-title").textContent      = "Add Customer";
  document.getElementById("modal-save-label").textContent = "Save Customer";
  document.getElementById("edit-id").value = "";
  clearForm();
  setSaving(false);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("open");
  document.getElementById("form-error").classList.add("hidden");
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById("modal-overlay")) closeModal();
}

function clearForm() {
  ["f-name", "f-phone", "f-address", "f-date", "f-notes"]
    .forEach((id) => (document.getElementById(id).value = ""));
}

function setSaving(on) {
  const btn = document.getElementById("save-btn");
  btn.disabled = on;
  document.getElementById("modal-save-label").textContent = on
    ? "Saving…"
    : document.getElementById("edit-id").value
      ? "Update Customer"
      : "Save Customer";
}

/* ════════════════════════════════════════
   SAVE  —  POST /customer/add
            PUT  /customer/update/:id
════════════════════════════════════════ */
async function saveCustomer() {
  const name            = document.getElementById("f-name").value.trim();
  const contactNumber   = document.getElementById("f-phone").value.trim();
  const address         = document.getElementById("f-address").value.trim();
  const lastServiceDate = document.getElementById("f-date").value;
  const notes           = document.getElementById("f-notes").value.trim();
  const err             = document.getElementById("form-error");
  const editId          = document.getElementById("edit-id").value;

  if (!name || !contactNumber || !address || !lastServiceDate) {
    err.textContent = "Please fill in all required fields.";
    err.classList.remove("hidden");
    return;
  }
  err.classList.add("hidden");

  const dto = { name, contactNumber, address, lastServiceDate, notes };

  setSaving(true);
  try {
    if (editId) {
      const updated = await apiFetch(API.UPDATE(editId), {
        method: "PUT",
        body: JSON.stringify(dto),
      });
      const idx = customers.findIndex((c) => c.id == editId);
      if (idx !== -1) customers[idx] = updated;
    } else {
      const created = await apiFetch(API.ADD, {
        method: "POST",
        body: JSON.stringify(dto),
      });
      customers.push(created);
    }
    refresh();
    closeModal();
  } catch (e) {
    err.textContent = "Server error — please try again.";
    err.classList.remove("hidden");
    console.error(e);
  } finally {
    setSaving(false);
  }
}

/* ════════════════════════════════════════
   EDIT  —  populates modal from in-memory list
════════════════════════════════════════ */
function editCustomer(id) {
  const c = customers.find((c) => c.id === id);
  if (!c) return;
  document.getElementById("f-name").value    = c.name;
  document.getElementById("f-phone").value   = c.contactNumber;
  document.getElementById("f-address").value = c.address;
  document.getElementById("f-date").value    = c.lastServiceDate;
  document.getElementById("f-notes").value   = c.notes || "";
  document.getElementById("edit-id").value   = c.id;
  document.getElementById("modal-title").textContent      = "Edit Customer";
  document.getElementById("modal-save-label").textContent = "Update Customer";
  document.getElementById("modal-overlay").classList.add("open");
  setSaving(false);
}

/* ════════════════════════════════════════
   DELETE  —  DELETE /customer/delete/:id
════════════════════════════════════════ */
async function deleteCustomer(id, name) {
  if (!confirm(`Remove "${name}" from the system?`)) return;
  try {
    await apiFetch(API.DELETE(id), { method: "DELETE" });
    customers = customers.filter((c) => c.id !== id);
    refresh();
  } catch (e) {
    alert("Could not delete customer. Please try again.");
    console.error(e);
  }
}

async function clearAllCustomers() {

  if (!confirm("⚠️ This will delete ALL customers permanently.\n\nContinue?"))
    return;

  try {

    await apiFetch(API.CLEAR, { method: "DELETE" });

    currentPage = 0;
    await loadCustomers();

    alert("All customers cleared.");

  } catch (e) {

    alert("Server error while clearing customers.");
    console.error(e);

  }

}

/* ════════════════════════════════════════
   SEARCH
════════════════════════════════════════ */
function filterTable() {
  const q = document.getElementById("search-input").value.toLowerCase();
  if (!q) { renderTable(); return; }
  renderTable(
    customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contactNumber.toLowerCase().includes(q),
    ),
  );
}

/* ════════════════════════════════════════
   KEYBOARD
════════════════════════════════════════ */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
loadCustomers();

/* ════════════════════════════════════════
   BULK IMPORT
   Depends on:
     - SheetJS  (xlsx)    — loaded via CDN in index.html
     - Mammoth            — loaded via CDN in index.html
════════════════════════════════════════ */

const API_BULK = "/customer/bulk-add";

// Rows parsed from the file, kept in memory until submitted or cleared
let importRows = [];

// ── Modal open / close ──────────────────────────────────────────────────────
function openImportModal() {
  const overlay = document.getElementById("import-modal-overlay");
  overlay.style.display = "flex";
  clearImportPreview();
}

function closeImportModal() {
  document.getElementById("import-modal-overlay").style.display = "none";
  clearImportPreview();
}

function handleImportOverlayClick(e) {
  if (e.target === document.getElementById("import-modal-overlay")) closeImportModal();
}

// ── Drag-and-drop ───────────────────────────────────────────────────────────
function handleImportDrop(e) {
  e.preventDefault();
  document.getElementById("import-dropzone-box").style.borderColor = "var(--border)";
  const file = e.dataTransfer.files[0];
  if (file) processImportFile(file);
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (file) processImportFile(file);
  e.target.value = "";
}

// ── File dispatcher ─────────────────────────────────────────────────────────
function processImportFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  setImportStatus("Parsing file…");
  if (ext === "xlsx" || ext === "xls") {
    parseXlsx(file);
  } else if (ext === "docx") {
    parseDocx(file);
  } else {
    setImportStatus("❌ Unsupported file type. Use .xlsx, .xls, or .docx", true);
  }
}

// ── Date helpers ─────────────────────────────────────────────────────────────

// Given a raw cell value (Date object or string with one or many dates),
// returns the LATEST valid date as "YYYY-MM-DD", or "" if none found.
function pickLatestDate(raw) {
  if (!raw) return "";

  // SheetJS parsed it as a JS Date already
  if (raw instanceof Date) {
    const y = raw.getFullYear();
    if (y < 1990 || y > 2030) return "";
    return toISO(raw);
  }

  const str = String(raw).trim();
  if (!str) return "";

  // Split on commas — multiple service dates in one cell
  const parts = str.split(",").map(p => p.trim()).filter(Boolean);
  let latest = null;

  for (const part of parts) {
    // Collapse date ranges like "5/11-15/24" → "5/11/24"
    const cleaned = part.replace(/(\d{1,2})\/(\d{1,2})-\d{1,2}\//, "$1/$2/");

    const d = parseDate(cleaned);
    if (d && (!latest || d > latest)) latest = d;
  }

  return latest ? toISO(latest) : "";
}

function parseDate(str) {
  // MM/DD/YYYY
  let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const d = new Date(+m[3], +m[1] - 1, +m[2]);
    if (valid(d)) return d;
  }
  // MM/DD/YY
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
  if (m) {
    const yyyy = +m[3] <= 30 ? 2000 + +m[3] : 1900 + +m[3];
    const d = new Date(yyyy, +m[1] - 1, +m[2]);
    if (valid(d)) return d;
  }
  return null;
}

function valid(d) {
  return d instanceof Date && !isNaN(d) && d.getFullYear() >= 1990 && d.getFullYear() <= 2030;
}

function toISO(d) {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function cleanContact(raw) {
  if (!raw) return "";
  const s = String(raw).trim().replace(/\.0$/, ""); // strip Excel float suffix e.g. 9171234567.0
  return (s === "None" || s === "null") ? "" : s;
}

// ── Column finder ────────────────────────────────────────────────────────────
function findCol(headers, aliases) {
  for (const alias of aliases) {
    const idx = headers.indexOf(alias.toUpperCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

// ── XLSX parser (handles your Masterlist format) ─────────────────────────────
//
// Your file structure:
//   Row 1 → "CUSTOMER MASTERLIST"  (title)
//   Row 2 → blank
//   Row 3 → NO. | NAME | COMPLETE ADDRESS | DATE OF SERVICES | CONTACT NUMBER | TYPE OF SERVICES
//   Row 4+ → data
//
// This parser auto-detects the header row (searches first 5 rows for "NAME")
// so it also works with normal xlsx files where headers are on row 1.
function parseXlsx(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const wb  = XLSX.read(e.target.result, { type: "array", cellDates: true });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      // Read as 2D array — no auto header mapping yet
      const all = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

      if (!all.length) {
        setImportStatus("⚠️ The spreadsheet appears to be empty.", true);
        return;
      }

      // Auto-detect header row: first row (within top 5) that has a "NAME" cell
      let headerIdx = -1;
      for (let i = 0; i < Math.min(5, all.length); i++) {
        const cells = all[i].map(c => String(c).trim().toUpperCase());
        if (cells.includes("NAME")) { headerIdx = i; break; }
      }

      if (headerIdx === -1) {
        setImportStatus("⚠️ Could not find a header row containing 'NAME'.", true);
        return;
      }

      const headers = all[headerIdx].map(c => String(c).trim().toUpperCase());

      // Map column labels to array indices
      const COL = {
        name:            findCol(headers, ["NAME", "FULLNAME", "FULL NAME", "CUSTOMER NAME", "CUSTOMER"]),
        contactNumber:   findCol(headers, ["CONTACT NUMBER", "CONTACT NO", "CONTACT", "PHONE", "MOBILE", "TEL", "TELEPHONE"]),
        address:         findCol(headers, ["COMPLETE ADDRESS", "ADDRESS", "ADDR", "LOCATION"]),
        lastServiceDate: findCol(headers, ["DATE OF SERVICES", "DATE OF SERVICE", "LAST SERVICE DATE", "LAST SERVICE", "SERVICE DATE", "DATE"]),
        notes:           findCol(headers, ["TYPE OF SERVICES", "TYPE OF SERVICE", "NOTES", "NOTE", "REMARKS", "SERVICES", "COMMENTS"]),
      };

      if (COL.name === -1) {
        setImportStatus("⚠️ 'NAME' column not found.", true);
        return;
      }

      // Parse every row after the header
      const rows = [];
      for (let i = headerIdx + 1; i < all.length; i++) {
        const row  = all[i];
        const name = String(row[COL.name] ?? "").trim();
        if (!name) continue; // skip blank / number-only rows

        rows.push({
          name,
          contactNumber:   cleanContact(COL.contactNumber   !== -1 ? row[COL.contactNumber]   : ""),
          address:         String(COL.address         !== -1 ? row[COL.address]         : "").trim(),
          lastServiceDate: pickLatestDate(COL.lastServiceDate !== -1 ? row[COL.lastServiceDate] : ""),
          notes:           String(COL.notes           !== -1 ? row[COL.notes]           : "").trim(),
        });
      }

      if (!rows.length) {
        setImportStatus("⚠️ No valid rows found after the header.", true);
        return;
      }

      importRows = rows;
      renderImportPreview();
      setImportStatus(`✅ Parsed ${rows.length} customer(s) from "${file.name}"`);

    } catch (err) {
      setImportStatus("❌ Failed to parse spreadsheet: " + err.message, true);
      console.error(err);
    }
  };
  reader.readAsArrayBuffer(file);
}

// ── DOCX parser ─────────────────────────────────────────────────────────────
function parseDocx(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    mammoth.convertToHtml({ arrayBuffer: e.target.result })
      .then(function (result) {
        const doc    = new DOMParser().parseFromString(result.value, "text/html");
        const tables = doc.querySelectorAll("table");
        let rows = [];

        if (tables.length > 0) {
          const trs = Array.from(tables[0].querySelectorAll("tr"));
          if (trs.length < 2) {
            setImportStatus("⚠️ Table found but has no data rows.", true);
            return;
          }
          const headers = Array.from(trs[0].querySelectorAll("td,th"))
            .map(td => td.textContent.trim().toUpperCase());

          const COL = {
            name:            findCol(headers, ["NAME", "FULLNAME", "FULL NAME"]),
            contactNumber:   findCol(headers, ["CONTACT NUMBER", "CONTACT", "PHONE", "MOBILE"]),
            address:         findCol(headers, ["COMPLETE ADDRESS", "ADDRESS", "ADDR"]),
            lastServiceDate: findCol(headers, ["DATE OF SERVICES", "DATE OF SERVICE", "LAST SERVICE DATE", "DATE"]),
            notes:           findCol(headers, ["TYPE OF SERVICES", "TYPE OF SERVICE", "NOTES", "REMARKS"]),
          };

          for (let i = 1; i < trs.length; i++) {
            const cells = Array.from(trs[i].querySelectorAll("td,th")).map(td => td.textContent.trim());
            const name  = COL.name !== -1 ? cells[COL.name] ?? "" : "";
            if (!name) continue;
            rows.push({
              name,
              contactNumber:   cleanContact(COL.contactNumber   !== -1 ? cells[COL.contactNumber]   : ""),
              address:         COL.address         !== -1 ? cells[COL.address]         ?? "" : "",
              lastServiceDate: pickLatestDate(COL.lastServiceDate !== -1 ? cells[COL.lastServiceDate] : ""),
              notes:           COL.notes           !== -1 ? cells[COL.notes]           ?? "" : "",
            });
          }
        } else {
          // Plain-text / CSV fallback
          const lines = doc.body.textContent.split("\n").map(l => l.trim()).filter(Boolean);
          let start = (lines[0] && /name/i.test(lines[0])) ? 1 : 0;
          for (let i = start; i < lines.length; i++) {
            const p = lines[i].split(",").map(x => x.trim());
            if (!p[0]) continue;
            rows.push({
              name:            p[0],
              contactNumber:   cleanContact(p[4] ?? ""),
              address:         p[2] ?? "",
              lastServiceDate: pickLatestDate(p[3] ?? ""),
              notes:           p[5] ?? "",
            });
          }
        }

        if (!rows.length) {
          setImportStatus("⚠️ No valid rows found in the document.", true);
          return;
        }

        importRows = rows;
        renderImportPreview();
        setImportStatus(`✅ Parsed ${rows.length} customer(s) from "${file.name}"`);
      })
      .catch(err => {
        setImportStatus("❌ Failed to parse .docx: " + err.message, true);
        console.error(err);
      });
  };
  reader.readAsArrayBuffer(file);
}

// ── Preview rendering ────────────────────────────────────────────────────────
function renderImportPreview() {
  const wrap  = document.getElementById("import-preview-wrap");
  const tbody = document.getElementById("import-preview-tbody");
  const count = document.getElementById("import-preview-count");

  wrap.style.display = "block";
  count.textContent  = `— ${importRows.length} row(s)`;
  tbody.innerHTML    = "";

  importRows.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid var(--border)";
    tr.innerHTML = `
      <td style="padding:7px 12px;color:var(--muted)">${idx + 1}</td>
      <td style="padding:7px 12px;color:var(--text);font-weight:500">${row.name || '<span style="color:var(--danger)">missing</span>'}</td>
      <td style="padding:7px 12px;color:var(--muted);font-family:monospace;font-size:0.72rem">${row.contactNumber || "—"}</td>
      <td style="padding:7px 12px;color:var(--muted);max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${row.address}">${row.address || "—"}</td>
      <td style="padding:7px 12px;color:var(--muted)">${row.lastServiceDate || "—"}</td>
      <td style="padding:7px 12px;color:var(--muted);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${row.notes}">${row.notes || "—"}</td>
      <td style="padding:7px 12px;text-align:center">
        <button onclick="removeImportRow(${idx})"
                style="color:var(--danger);background:none;border:none;cursor:pointer;font-size:0.9rem;line-height:1"
                title="Remove this row">✕</button>
      </td>`;
    tbody.appendChild(tr);
  });

  document.getElementById("import-save-btn").disabled = importRows.length === 0;
  document.getElementById("import-save-label").textContent = `Import ${importRows.length}`;
}

function removeImportRow(idx) {
  importRows.splice(idx, 1);
  if (importRows.length === 0) {
    clearImportPreview();
    setImportStatus("All rows removed.");
  } else {
    renderImportPreview();
  }
}

function clearImportPreview() {
  importRows = [];
  document.getElementById("import-preview-wrap").style.display = "none";
  document.getElementById("import-status").style.display       = "none";
  document.getElementById("import-error-box").style.display    = "none";
  document.getElementById("import-save-btn").disabled          = true;
  document.getElementById("import-save-label").textContent     = "Import All";
}

// ── Status helper ────────────────────────────────────────────────────────────
function setImportStatus(msg, isError = false) {
  const wrap = document.getElementById("import-status");
  const text = document.getElementById("import-status-text");
  wrap.style.display = "block";
  text.textContent   = msg;
  text.style.color   = isError ? "var(--danger)" : "var(--muted)";
}

// ── Submit ───────────────────────────────────────────────────────────────────
async function submitImport() {
  if (!importRows.length) return;

  const btn   = document.getElementById("import-save-btn");
  const label = document.getElementById("import-save-label");
  btn.disabled      = true;
  label.textContent = "Importing…";

  try {
    const result = await apiFetch(API_BULK, {
      method: "POST",
      body:   JSON.stringify(importRows),
    });

    const errBox  = document.getElementById("import-error-box");
    const errText = document.getElementById("import-error-text");

    if (result.failed > 0) {
      errBox.style.display = "block";
      errText.textContent  = `⚠️ ${result.failed} row(s) failed:\n` + result.errors.join("\n");
    }

    setImportStatus(
      `✅ ${result.saved} customer(s) imported successfully.` +
      (result.failed > 0 ? ` ${result.failed} failed — see below.` : "")
    );

    currentPage = 0;
    await loadCustomers();

    if (result.failed === 0) setTimeout(closeImportModal, 1200);

  } catch (e) {
    setImportStatus("❌ Server error — " + e.message, true);
    console.error(e);
  } finally {
    btn.disabled          = false;
    label.textContent     = `Import ${importRows.length}`;
  }
}

function openClearModal() {
  document.getElementById("clear-modal-overlay").style.display = "flex";
}

function closeClearModal() {
  document.getElementById("clear-modal-overlay").style.display = "none";
}

async function confirmClearCustomers() {

  try {

    await apiFetch(API.CLEAR, { method: "DELETE" });

    currentPage = 0;
    await loadCustomers();

    closeClearModal();

  } catch (e) {

    alert("Server error while clearing customers.");
    console.error(e);

  }
}
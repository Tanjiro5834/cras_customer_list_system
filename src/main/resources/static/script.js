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
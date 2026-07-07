const API_BASE = "/api";
const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

let applications = [];
let listings = [];

// ── DOM refs ─────────────────────────────────────────────────────────────
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const appForm = document.getElementById("appForm");
const appIdInput = document.getElementById("appId");
const companyInput = document.getElementById("companyInput");
const roleInput = document.getElementById("roleInput");
const statusInput = document.getElementById("statusInput");
const urlInput = document.getElementById("urlInput");
const notesInput = document.getElementById("notesInput");
const deleteBtn = document.getElementById("deleteBtn");
const toast = document.getElementById("toast");

// ── Toast helper ─────────────────────────────────────────────────────────
function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2200);
}

// ── API layer ────────────────────────────────────────────────────────────
async function fetchApplications() {
  const res = await fetch(`${API_BASE}/applications`);
  if (!res.ok) throw new Error("Failed to load applications");
  return res.json();
}

async function createApplication(data) {
  const res = await fetch(`${API_BASE}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create application");
  return res.json();
}

async function updateApplication(id, data) {
  const res = await fetch(`${API_BASE}/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update application");
  return res.json();
}

async function deleteApplicationApi(id) {
  const res = await fetch(`${API_BASE}/applications/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete application");
  return res.json();
}

async function fetchListings() {
  const res = await fetch(`${API_BASE}/listings`);
  if (!res.ok) throw new Error("Failed to load listings");
  return res.json();
}

async function triggerScrape() {
  const res = await fetch(`${API_BASE}/scrape`, { method: "POST" });
  if (!res.ok) throw new Error("Scrape failed");
  return res.json();
}

// ── Rendering: board ─────────────────────────────────────────────────────
function renderBoard() {
  STATUSES.forEach((status) => {
    const col = document.getElementById(`col-${status}`);
    const countEl = document.getElementById(`count-${status}`);
    const items = applications.filter((a) => a.status === status);

    countEl.textContent = items.length;
    col.innerHTML = "";

    if (items.length === 0) {
      const hint = document.createElement("div");
      hint.className = "empty-col-hint";
      hint.textContent = "No applications here yet";
      col.appendChild(hint);
      return;
    }

    items.forEach((app) => col.appendChild(buildCard(app)));
  });
}

function buildCard(app) {
  const card = document.createElement("div");
  card.className = "card";
  card.draggable = true;
  card.dataset.id = app.id;

  card.innerHTML = `
    <p class="card-role">${escapeHtml(app.role)}</p>
    <p class="card-company">${escapeHtml(app.company)}</p>
    <div class="card-meta">
      <span>${app.date_applied || ""}</span>
      ${app.notes ? '<span class="card-notes-flag">● notes</span>' : ""}
    </div>
  `;

  card.addEventListener("click", () => openEditModal(app));

  card.addEventListener("dragstart", () => {
    card.classList.add("dragging");
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
  });

  return card;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ── Drag and drop wiring ──────────────────────────────────────────────────
function setupDragAndDrop() {
  document.querySelectorAll(".board-col").forEach((col) => {
    col.addEventListener("dragover", (e) => {
      e.preventDefault();
      col.classList.add("drag-over");
    });

    col.addEventListener("dragleave", () => {
      col.classList.remove("drag-over");
    });

    col.addEventListener("drop", async (e) => {
      e.preventDefault();
      col.classList.remove("drag-over");

      const dragging = document.querySelector(".card.dragging");
      if (!dragging) return;

      const appId = parseInt(dragging.dataset.id, 10);
      const newStatus = col.dataset.status;
      const app = applications.find((a) => a.id === appId);

      if (!app || app.status === newStatus) return;

      app.status = newStatus; // optimistic update
      renderBoard();

      try {
        await updateApplication(appId, { status: newStatus });
        showToast(`Moved to ${newStatus}`);
      } catch (err) {
        showToast("Could not save move — refreshing");
        await loadApplications();
      }
    });
  });
}

// ── Rendering: discover panel ─────────────────────────────────────────────
function renderDiscover() {
  const list = document.getElementById("discoverList");
  list.innerHTML = "";

  if (listings.length === 0) {
    const p = document.createElement("p");
    p.className = "empty-hint";
    p.textContent = 'Click "Pull new listings" to fetch fresh Python roles.';
    list.appendChild(p);
    return;
  }

  listings.forEach((listing) => {
    const item = document.createElement("div");
    item.className = "listing-item";
    item.innerHTML = `
      <p class="listing-title">${escapeHtml(listing.title)}</p>
      <p class="listing-company">${escapeHtml(listing.company)}</p>
      <p class="listing-tags">${escapeHtml(listing.tags)}</p>
      <div class="listing-actions">
        <button class="listing-save">Save to tracker</button>
        <a class="listing-link" href="${listing.url}" target="_blank" rel="noopener">View →</a>
      </div>
    `;

    item.querySelector(".listing-save").addEventListener("click", async () => {
      try {
        await createApplication({
          company: listing.company,
          role: listing.title,
          status: "Applied",
          listing_url: listing.url,
        });
        showToast(`Saved ${listing.title}`);
        await loadApplications();
      } catch (err) {
        showToast("Could not save listing");
      }
    });

    list.appendChild(item);
  });
}

// ── Modal handling ────────────────────────────────────────────────────────
function openAddModal() {
  modalTitle.textContent = "New application";
  appIdInput.value = "";
  companyInput.value = "";
  roleInput.value = "";
  statusInput.value = "Applied";
  urlInput.value = "";
  notesInput.value = "";
  deleteBtn.hidden = true;
  modalOverlay.hidden = false;
  companyInput.focus();
}

function openEditModal(app) {
  modalTitle.textContent = "Edit application";
  appIdInput.value = app.id;
  companyInput.value = app.company;
  roleInput.value = app.role;
  statusInput.value = app.status;
  urlInput.value = app.listing_url || "";
  notesInput.value = app.notes || "";
  deleteBtn.hidden = false;
  modalOverlay.hidden = false;
}

function closeModal() {
  modalOverlay.hidden = true;
}

// ── Event wiring ──────────────────────────────────────────────────────────
document.getElementById("addBtn").addEventListener("click", openAddModal);
document.getElementById("modalClose").addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

appForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    company: companyInput.value.trim(),
    role: roleInput.value.trim(),
    status: statusInput.value,
    listing_url: urlInput.value.trim(),
    notes: notesInput.value.trim(),
  };

  try {
    if (appIdInput.value) {
      await updateApplication(appIdInput.value, payload);
      showToast("Application updated");
    } else {
      await createApplication(payload);
      showToast("Application added");
    }
    closeModal();
    await loadApplications();
  } catch (err) {
    showToast("Something went wrong — try again");
  }
});

deleteBtn.addEventListener("click", async () => {
  if (!appIdInput.value) return;
  try {
    await deleteApplicationApi(appIdInput.value);
    showToast("Application deleted");
    closeModal();
    await loadApplications();
  } catch (err) {
    showToast("Could not delete — try again");
  }
});

document.getElementById("scrapeBtn").addEventListener("click", async () => {
  const spinner = document.getElementById("scrapeSpinner");
  spinner.hidden = false;
  try {
    const result = await triggerScrape();
    showToast(`Found ${result.added} new listing(s)`);
    await loadListings();
  } catch (err) {
    showToast("Could not reach RemoteOK — try again later");
  } finally {
    spinner.hidden = true;
  }
});

// ── Data loading ──────────────────────────────────────────────────────────
async function loadApplications() {
  try {
    applications = await fetchApplications();
    renderBoard();
    setupDragAndDrop();
  } catch (err) {
    showToast("Could not load applications — is the backend running?");
  }
}

async function loadListings() {
  try {
    listings = await fetchListings();
    renderDiscover();
  } catch (err) {
    showToast("Could not load listings");
  }
}

// ── Init ──────────────────────────────────────────────────────────────────
loadApplications();
loadListings();

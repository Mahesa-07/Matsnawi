// -*- coding: utf-8 -*-
// 🌙 Script Matsnawi Digital (versi rapi & nomor bait berlanjut antar bab)

// =========================
// VARIABEL GLOBAL
// =========================
let currentBab = 1;
const totalBab = 16;
let baits = [];
let currentPage = 1;
let baitsPerPage = 5;
let showTranslation = true;
let sidebarAnimating = false;
let baitOffset = 0; // nomor bait berlanjut antar bab

// Elemen penting
const baitContainer = document.getElementById("baitContainer");
const baitList = document.getElementById("baitList");
const langSwitch = document.getElementById("langSwitch");
const themeToggle = document.getElementById("themeToggle");
const baitPerPageSelect = document.getElementById("baitPerPage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const searchInput = document.getElementById("searchInput");
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const fileNav = document.getElementById("file-nav");
const controls = document.querySelector(".controls");

/* =========================
   SIDEBAR OPEN / CLOSE
========================= */
function openSidebar() {
  if (sidebarAnimating) return;
  sidebarAnimating = true;
  sidebar.classList.add("show");
  document.body.classList.add("sidebar-open");
  menuToggle.textContent = "✖️";
  setTimeout(() => (sidebarAnimating = false), 400);
}

function closeSidebar() {
  if (sidebarAnimating) return;
  sidebarAnimating = true;
  sidebar.classList.remove("show");
  document.body.classList.remove("sidebar-open");
  menuToggle.textContent = "☰";
  setTimeout(() => (sidebarAnimating = false), 400);
}

menuToggle.onclick = (e) => {
  e.stopPropagation();
  sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
};

document.addEventListener("click", (e) => {
  const t = e.target;
  if (t instanceof Node && !sidebar.contains(t) && !menuToggle.contains(t)) closeSidebar();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
});

/* =========================
   LOAD FILES & SIDEBAR
========================= */
async function loadBaitsFromIndex() {
  try {
    const res = await fetch("./assets/data/index.json");
    const index = await res.json();
    renderFileNav(index.files);
    if (index.files.length > 0) await loadBaitsFile(index.files[0].file);
  } catch (err) {
    baitContainer.innerHTML = `<p style="text-align:center;color:var(--accent)">⚠️ Gagal memuat data bait.</p>`;
    console.error(err);
  }
}

function renderFileNav(files) {
  fileNav.innerHTML = "";
  files.forEach((f) => {
    const btn = document.createElement("button");
    btn.textContent = f.title;
    btn.title = f.description || "";
    btn.onclick = async () => {
      document.querySelectorAll(".file-nav button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const babMatch = f.file.match(/bab(\d+)\.json$/);
      if (babMatch) {
        currentBab = parseInt(babMatch[1]);
        await loadBab(currentBab);
      } else {
        await loadBaitsFile(f.file);
      }
      closeSidebar();
    };
    fileNav.appendChild(btn);
  });

  const resetBtn = document.createElement("button");
  resetBtn.textContent = "🗑️ Reset Edit Lokal";
  resetBtn.onclick = clearLocalEdits;
  fileNav.appendChild(resetBtn);

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "💾 Unduh Editan Saya";
  exportBtn.onclick = exportLocalEdits;
  fileNav.appendChild(exportBtn);
}

/* =========================
   LOAD FILES & BAB
========================= */
async function loadBaitsFile(filename) {
  try {
    const resIndex = await fetch("./assets/data/index.json");
    const index = await resIndex.json();
    const currentFileIndex = index.files.findIndex((f) => f.file === filename);

    // Hitung offset dari bait sebelumnya
    let offset = 0;
    for (let j = 0; j < currentFileIndex; j++) {
      const prevRes = await fetch(index.files[j].file);
      const prevBaits = await prevRes.json();
      offset += prevBaits.length;
    }
    baitOffset = offset;

    const res = await fetch(filename);
    if (!res.ok) throw new Error(`File tidak ditemukan: ${filename}`);
    baits = await res.json();
    applyLocalEdits();
    currentPage = 1;
    renderSidebar();
    renderBaits();
  } catch (err) {
    baitContainer.innerHTML = `<p style="text-align:center;color:var(--accent)">⚠️ Gagal memuat file <b>${filename}</b>.</p>`;
    console.error("Kesalahan muat file:", err);
  }
}

async function loadBab(babIndex) {
  try {
    const res = await fetch(`./assets/data/bab${babIndex}.json`);
    if (!res.ok) throw new Error(`Gagal memuat Bab ${babIndex}`);

    const resIndex = await fetch("./assets/data/index.json");
    const index = await resIndex.json();
    const currentFileIndex = index.files.findIndex((f) => f.file === `bab${babIndex}.json`);

    let offset = 0;
    for (let j = 0; j < currentFileIndex; j++) {
      const prevRes = await fetch(index.files[j].file);
      const prevBaits = await prevRes.json();
      offset += prevBaits.length;
    }
    baitOffset = offset;

    baits = await res.json();
    currentPage = 1;
    renderSidebar();
    renderBaits();
    showToast(`📖 Bab ${babIndex} dimuat`);
  } catch (err) {
    console.error(err);
    showToast("❌ Tidak bisa memuat bab " + babIndex);
  }
}

/* =========================
   LOCAL EDIT
========================= */
function applyLocalEdits() {
  const saved = JSON.parse(localStorage.getItem("baitsEdited")) || [];
  saved.forEach((edited) => {
    const index = baits.findIndex((b) => b.id === edited.id);
    if (index !== -1) Object.assign(baits[index], edited);
  });
}

function saveLocalEdit(bait) {
  let saved = JSON.parse(localStorage.getItem("baitsEdited")) || [];
  const index = saved.findIndex((b) => b.id === bait.id);
  if (index !== -1) saved[index] = bait;
  else saved.push(bait);
  localStorage.setItem("baitsEdited", JSON.stringify(saved));
}

function clearLocalEdits() {
  localStorage.removeItem("baitsEdited");
  showToast("🗑️ Semua edit lokal dihapus!");
  renderBaits();
}

function exportLocalEdits() {
  const saved = JSON.parse(localStorage.getItem("baitsEdited")) || [];
  if (saved.length === 0) return showToast("⚠️ Belum ada editan tersimpan!");
  const blob = new Blob([JSON.stringify(saved, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "editan-matsnawi.json";
  a.click();
  URL.revokeObjectURL(a.href);
  showToast("💾 File editan diunduh!");
}

/* =========================
   SIDEBAR PER BAB + BAIT
========================= */
function renderSidebar() {
  baitList.innerHTML = "";
  const babGroup = document.createElement("div");
  const babHeader = document.createElement("div");
  babHeader.className = "sidebar-bab-header";
  babHeader.textContent = `📘 Bab ${currentBab}`;
  babGroup.appendChild(babHeader);

  const baitUl = document.createElement("ul");
  baits.forEach((b) => {
    const li = document.createElement("li");
    li.className = "bait-item";
    li.innerHTML = `<b>${baitOffset + b.id}.</b> ${b.indo.slice(0, 20)}...`;
    li.onclick = () => showBait(b.id);
    baitUl.appendChild(li);
  });
  babGroup.appendChild(baitUl);
  baitList.appendChild(babGroup);
}

/* =========================
   RENDER BAIT (NOMOR BERLANJUT)
========================= */
function renderBaits() {
  const start = (currentPage - 1) * baitsPerPage;
  const visible = baits.slice(start, start + baitsPerPage);
  baitContainer.style.opacity = 0;

  setTimeout(() => {
    baitContainer.innerHTML = visible.map((b, i) => {
      const baitNumber = baitOffset + start + i + 1;
      const marker = baitNumber % 5 === 0 ? `<div class="bait-marker">﴾${baitNumber}﴿</div>` : "";
      const titlePart = b.title ? `<h3 class="bait-title">${b.title}</h3>` : "";
      const descPart = b.description ? `<p class="bait-desc hidden">${b.description}</p>` : "";

      return `
        <div class="bait${b.title || b.description ? " with-title" : ""}" data-id="${b.id}">
          ${titlePart}
          <div class="text">${showTranslation ? b.indo : b.persia}</div>
          ${descPart}
          <div class="bait-actions">
            ${b.description ? `
              <button class="toggle-desc" data-id="${b.id}" title="Tampilkan deskripsi">
                <svg class="icon"><use href="#icon-eye"></use></svg>
              </button>` : ""}
            <button class="bookmark-btn" data-id="${b.id}" title="Bookmark">
              <svg class="icon"><use href="#icon-bookmark"></use></svg>
            </button>
            <button class="edit-btn" data-id="${b.id}" title="Edit">
              <svg class="icon"><use href="#icon-edit"></use></svg>
            </button>
            <button class="open-detail" data-id="${b.id}" title="Lihat Bait Penuh">
              <svg class="icon"><use href="#icon-open"></use></svg>
            </button>
          </div>
          ${marker}
        </div>`;
    }).join("");

    baitContainer.style.opacity = 1;
    initBookmarkButtons();
    initEditButtons();
    initDetailButtons();

    // Tombol toggle deskripsi
    baitContainer.querySelectorAll(".toggle-desc").forEach((btn) => {
      btn.addEventListener("click", () => {
        const bait = btn.closest(".bait");
        const desc = bait.querySelector(".bait-desc");
        if (!desc) return;
        const hidden = desc.classList.toggle("hidden");
        const use = btn.querySelector("use");
        use.setAttribute("href", hidden ? "#icon-eye" : "#icon-eye-off");
      });
    });

    controls.style.display = "flex";
  }, 150);
}

/* =========================
   DETAIL BAIT + PETUNJUK
========================= */
function showBait(id) {
  const bait = baits.find((b) => b.id === id);
  if (!bait) return;

  if (controls) controls.style.display = "none";

  const hasTitle = bait.title && bait.title.trim() !== "";
  const hasDesc = bait.description && bait.description.trim() !== "";

  const titlePart = hasTitle
    ? `<h3 class="bait-title">﴾${baitOffset + bait.id}﴿ ${bait.title}</h3>`
    : `<h3 class="bait-title">﴾${baitOffset + bait.id}﴿</h3>`;

  const hasShownHint = localStorage.getItem("shownSwipeHint") === "true";
  const hintPart = hasShownHint
    ? ""
    : `<div class="swipe-hint">
         <span>Geser ⬅️➡️ atau tekan panah kiri / kanan untuk berpindah bait</span>
       </div>`;

  baitContainer.innerHTML = `
    <div class="bait-detail">
      <button class="close-detail">⬅️ Kembali</button>
      ${titlePart}
      <div class="bait-text">
        <p class="persia">${bait.persia}</p>
        <p class="indo">${bait.indo}</p>
      </div>
      ${hintPart}
      ${hasDesc ? `<div class="bait-desc-bottom">${bait.description}</div>` : ""}
    </div>
  `;

  if (!hasShownHint) localStorage.setItem("shownSwipeHint", "true");

  document.querySelector(".close-detail").addEventListener("click", () => {
    renderBaits();
    if (controls) controls.style.display = "";
  });

  initSwipeNavigation(id);
  initKeyboardNavigation(id);
}

/* =========================
   SWIPE & KEYBOARD NAVIGASI
========================= */
let touchStartX = 0;
let touchEndX = 0;
const swipeThreshold = 50;

function initSwipeNavigation(id) {
  const detail = document.querySelector(".bait-detail");
  if (!detail) return;
  detail.ontouchstart = (e) => (touchStartX = e.changedTouches[0].screenX);
  detail.ontouchend = (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe(id);
  };
}

function handleSwipe(currentId) {
  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) < swipeThreshold) return;
  const detail = document.querySelector(".bait-detail");
  if (!detail) return;

  if (diff > 0) {
    const prev = baits.find((b) => b.id === currentId - 1);
    if (prev) {
      detail.classList.add("swipe-right");
      setTimeout(() => showBait(prev.id), 200);
    }
  } else {
    const next = baits.find((b) => b.id === currentId + 1);
    if (next) {
      detail.classList.add("swipe-left");
      setTimeout(() => showBait(next.id), 200);
    }
  }
}

function initKeyboardNavigation(currentId) {
  document.onkeydown = (e) => {
    const detail = document.querySelector(".bait-detail");
    if (!detail) return;
    const key = e.key;

    if (key === "ArrowLeft") {
      const prev = baits.find((b) => b.id === currentId - 1);
      if (prev) {
        detail.classList.add("swipe-right");
        setTimeout(() => showBait(prev.id), 200);
      }
    } else if (key === "ArrowRight") {
      const next = baits.find((b) => b.id === currentId + 1);
      if (next) {
        detail.classList.add("swipe-left");
        setTimeout(() => showBait(next.id), 200);
      }
    } else if (key === "Escape") {
      renderBaits();
      if (controls) controls.style.display = "";
    }
  };
}

/* =========================
   PENCARIAN & HIGHLIGHT
========================= */
searchInput?.addEventListener("input", () => {
  const query = (searchInput.value || "").toLowerCase().trim();
  if (!query) {
    renderBaits();
    return;
  }

  const filtered = baits.filter(
    (b) =>
      (b.persia || "").toLowerCase().includes(query) ||
      (b.indo || "").toLowerCase().includes(query)
  );

  baitContainer.innerHTML = filtered
    .map(
      (b) => `
      <div class="bait" data-id="${b.id}">
        <div class="text">${showTranslation ? b.indo : b.persia}</div>
        <div class="bait-actions">
          <button class="bookmark-btn" data-id="${b.id}" title="Bookmark">
            <svg class="icon"><use href="#icon-bookmark"></use></svg>
          </button>
          <button class="edit-btn" data-id="${b.id}" title="Edit">
            <svg class="icon"><use href="#icon-edit"></use></svg>
          </button>
          <button class="open-detail" data-id="${b.id}" title="Lihat Detail">
            <svg class="icon"><use href="#icon-open"></use></svg>
          </button>
        </div>
      </div>`
    )
    .join("");

  initBookmarkButtons();
  initEditButtons();
  initDetailButtons();

  // highlight kata
  highlightSearch(query);
});

function highlightSearch(term) {
  const baitDivs = document.querySelectorAll(".bait .text");
  baitDivs.forEach((div) => {
    const originalText = div.textContent;
    if (!term) {
      div.innerHTML = originalText;
      return;
    }
    const regex = new RegExp(`(${escapeRegExp(term)})`, "gi");
    div.innerHTML = originalText.replace(regex, `<mark class="highlight">$1</mark>`);
  });
}
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* =========================
   BOOKMARK SYSTEM
========================= */
// elemen (cek keberadaan)
const bookmarkPanel = document.getElementById("bookmark-panel");
const overlay = document.getElementById("bookmark-overlay");
const bookmarkToggle = document.getElementById("bookmark-toggle");
const bookmarkList = document.getElementById("bookmark-list");

// inisialisasi
function initBookmarkButtons() {
  document.querySelectorAll(".bookmark-btn").forEach((btn) => {
    // hapus listener duplikat
    btn.replaceWith(btn.cloneNode(true));
  });
  document.querySelectorAll(".bookmark-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const baitEl = btn.closest(".bait");
      const text = baitEl ? baitEl.querySelector(".text").innerText : "";
      saveBookmark(id, text);
    });
  });
}

function saveBookmark(id, text) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  if (!bookmarks.some((b) => b.id == id)) {
    bookmarks.push({ id, text });
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    showToast("✅ Bookmark disimpan!");
  } else {
    showToast("⚠️ Sudah ada!");
  }
}

function tampilkanBookmark() {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
  bookmarks = bookmarks.filter((b) => b && b.text && b.text !== "undefined");
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  if (!bookmarkList) return;
  bookmarkList.innerHTML =
    bookmarks.length === 0
      ? "<p>Belum ada bookmark.</p>"
      : bookmarks
          .map(
            (b) => `
      <div class="bookmark-item" data-id="${b.id}">
        <span class="bookmark-text">${b.text}</span>
        <button class="remove-bookmark" data-id="${b.id}" title="Hapus Bookmark">✖</button>
      </div>`
          )
          .join("");

  // pasang listener hapus
  bookmarkList.querySelectorAll(".remove-bookmark").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      showConfirmDialog(id);
    });
  });
}

bookmarkToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  const isShown = bookmarkPanel.classList.toggle("show");
  overlay?.classList.toggle("show", isShown);
  if (isShown) tampilkanBookmark();
});

overlay?.addEventListener("click", () => {
  bookmarkPanel?.classList.remove("show");
  overlay?.classList.remove("show");
});

// dialog konfirmasi hapus
const confirmDialog = document.getElementById("confirm-dialog");
const cancelRemove = document.getElementById("cancelRemove");
const confirmRemove = document.getElementById("confirmRemove");
let bookmarkIdToRemove = null;

function showConfirmDialog(id) {
  bookmarkIdToRemove = id;
  confirmDialog?.classList.add("active");
}

cancelRemove?.addEventListener("click", () => {
  confirmDialog?.classList.remove("active");
  bookmarkIdToRemove = null;
});

confirmRemove?.addEventListener("click", () => {
  if (bookmarkIdToRemove) {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarks = bookmarks.filter((b) => b && b.id != bookmarkIdToRemove);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    tampilkanBookmark();
    showToast("❌ Dihapus");
  }
  confirmDialog?.classList.remove("active");
  bookmarkIdToRemove = null;
});

/* =========================
   EDIT PANEL
========================= */
const editPanel = document.getElementById("edit-panel");
const editPersia = document.getElementById("edit-persia");
const editIndo = document.getElementById("edit-indo");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
let currentEditId = null;

function initEditButtons() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    // replace to remove duplicate listeners
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      const bait = baits.find((b) => b.id === id);
      if (!bait) return;
      currentEditId = id;
      if (editPersia) editPersia.value = bait.persia || "";
      if (editIndo) editIndo.value = bait.indo || "";
      editPanel?.classList.add("show");
    });
  });
}

saveEditBtn?.addEventListener("click", () => {
  if (!currentEditId) return;
  const newPersia = editPersia?.value.trim() || "";
  const newIndo = editIndo?.value.trim() || "";

  const bait = baits.find((b) => b.id === currentEditId);
  if (bait) {
    bait.persia = newPersia;
    bait.indo = newIndo;
    saveLocalEdit({ id: bait.id, persia: newPersia, indo: newIndo });

    const baitDiv = document.querySelector(`.bait[data-id="${bait.id}"]`);
    if (baitDiv) {
      const textEl = baitDiv.querySelector(".text");
      if (textEl) textEl.textContent = showTranslation ? newIndo : newPersia;
    }
    showToast("✅ Disimpan (lokal tersimpan)!");
  }

  closeEditPanel();
});

cancelEditBtn?.addEventListener("click", closeEditPanel);
function closeEditPanel() {
  editPanel?.classList.remove("show");
  currentEditId = null;
}

/* =========================
   LIHAT BAIT PENUH (MODAL)
========================= */
function initDetailButtons() {
  document.querySelectorAll(".open-detail").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      const bait = baits.find((b) => b.id === id);
      if (bait) showBaitModal(bait);
    });
  });
}

function showBaitModal(bait) {
  let modal = document.getElementById("baitModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "baitModal";
    modal.className = "bait-modal";
    modal.innerHTML = `
      <div class="bait-modal-content">
        <span class="close-modal">×</span>
        <h3 class="bait-title"></h3>
        <p class="persian"></p>
        <p class="translation"></p>
        <p class="bait-desc"></p>
      </div>`;
    document.body.appendChild(modal);
  }

  const modalTitle = modal.querySelector(".bait-title");
  const modalPersian = modal.querySelector(".persian");
  const modalTranslation = modal.querySelector(".translation");
  const modalDesc = modal.querySelector(".bait-desc");
  const closeBtn = modal.querySelector(".close-modal");

  modalTitle.textContent = bait.title || `Bait ${bait.id}`;
  modalPersian.textContent = bait.persia || "";
  modalTranslation.textContent = bait.indo || "";
  modalDesc.textContent = bait.description || bait.desc || "";
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  setTimeout(() => modal.classList.add("show"), 10);

  closeBtn.onclick = () => closeBaitModal(modal);
  modal.onclick = (e) => {
    if (e.target === modal) closeBaitModal(modal);
  };
}

function closeBaitModal(modal) {
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }, 250);
}

/* =========================
   TOAST NOTIF
========================= */
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 600);
  }, 2300);
}

/* =========================
   NAVIGASI & KONTROL
========================= */
baitPerPageSelect?.addEventListener("change", () => {
  baitsPerPage = parseInt(baitPerPageSelect.value, 10) || 5;
  currentPage = 1;
  renderBaits();
});

prevBtn?.addEventListener("click", async () => {
  if (currentPage > 1) {
    currentPage--;
    renderBaits();
  } else if (currentBab > 1) {
    currentBab--;
    await loadBab(currentBab);
  } else {
    showToast("📘 Sudah di bab pertama");
  }
});

nextBtn?.addEventListener("click", async () => {
  if (currentPage * baitsPerPage < baits.length) {
    currentPage++;
    renderBaits();
  } else if (currentBab < totalBab) {
    currentBab++;
    await loadBab(currentBab);
  } else {
    showToast("📖 Sudah di bab terakhir");
  }
});

// inisialisasi awal
window.addEventListener("DOMContentLoaded", async () => {
  await loadBaitsFromIndex();
  if (!searchInput) console.warn("❌ searchInput tidak ditemukan di DOM");

  langSwitch?.addEventListener("click", () => {
    showTranslation = !showTranslation;
    langSwitch.textContent = showTranslation ? "🇮🇩" : "🇬🇧";
    renderBaits();
  });

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  });

  console.log("✅ Matsnawi Digital siap 🌙✨");
});
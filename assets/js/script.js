// -*- coding: utf-8 -*-
// 🔹 Variabel global
let currentBab = 1;
const totalBab = 16; // ubah sesuai jumlah file JSON kamu
let baits = [];
let currentPage = 1;
let baitsPerPage = 5; // atau ambil dari dropdown kamu

let showTranslation = true;
let sidebarAnimating = false;
let baitOffset = 0; // 🌙 untuk menyimpan nomor awal dari file sebelumnya

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
  const target = e.target;
  if (target instanceof Node && !sidebar.contains(target) && !menuToggle.contains(target)) {
    closeSidebar();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
});

/* =========================
   LOAD FILES
========================= */
async function loadBaitsFromIndex() {
  try {
    const res = await fetch("./assets/data/index.json");
    const index = await res.json();
    renderFileNav(index.files);
    if (index.files.length > 0) await loadBaitsFile(index.files[0].file);
    return true;
  } catch (err) {
    baitContainer.innerHTML = `<p style="text-align:center;color:var(--accent)">⚠️ Gagal memuat data bait.</p>`;
    console.error(err);
    return false;
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

  // 🌙 Jika file bernama babX.json → panggil loadBab()
  const babMatch = f.file.match(/bab(\d+)\.json$/);
  if (babMatch) {
    currentBab = parseInt(babMatch[1]);
    await loadBab(currentBab);
  } else {
    // Jika bukan file bab, tetap gunakan sistem index.json
    await loadBaitsFile(f.file);
  }

  closeSidebar();
};
    fileNav.appendChild(btn);
  });
  // 🌙 Tambah tombol reset & ekspor edit lokal
const resetBtn = document.createElement("button");
  resetBtn.textContent = "🗑️ Reset Edit Lokal";
  resetBtn.classList.add("reset-local-btn");
  resetBtn.title = "Hapus semua perubahan lokal";
  resetBtn.onclick = clearLocalEdits;
  fileNav.appendChild(resetBtn);

  const exportBtn = document.createElement("button");
  exportBtn.textContent = "💾 Unduh Editan Saya";
  exportBtn.classList.add("export-local-btn");
  exportBtn.title = "Unduh semua hasil edit ke file JSON";
  exportBtn.onclick = exportLocalEdits;
  fileNav.appendChild(exportBtn);
}

async function loadBaitsFile(filename) {
  try {
    // Temukan file index-nya dari index.json
    const resIndex = await fetch("./assets/data/index.json");
    const index = await resIndex.json();
    const currentFileIndex = index.files.findIndex(f => f.file === filename);

    // 🌙 Hitung offset berdasarkan jumlah bait di file-file sebelumnya
    let offset = 0;
    for (let j = 0; j < currentFileIndex; j++) {
      const prevRes = await fetch(index.files[j].file);
      const prevBaits = await prevRes.json();
      offset += prevBaits.length;
    }
    baitOffset = offset; // simpan untuk render berikutnya

    // 🔹 Muat file yang diminta
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

/* =========================
   🔄 SINKRONISASI EDIT LOCAL
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
  if (index !== -1) saved[index] = bait; else saved.push(bait);
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
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "editan-matsnawi.json";
  a.click();
  URL.revokeObjectURL(url);
  showToast("💾 File editan diunduh!");
}
/* =========================
   RENDER SIDEBAR & BAIT
========================= */
function renderSidebar() {
  baitList.innerHTML = baits.map(
    (bait) => `<li class="bait-item" onclick="showBait(${bait.id})"><b>${bait.id}.</b> ${bait.indo.slice(0, 20)}...</li>`
  ).join("");
}
function renderBaits() {
  const start = (currentPage - 1) * baitsPerPage;
  const visible = baits.slice(start, start + baitsPerPage);
  baitContainer.style.opacity = 0;

  setTimeout(() => {
    baitContainer.innerHTML = visible.map((b, i) => {
      const baitNumber = baitOffset + start + i + 1; // ✅ penomoran berkelanjutan
      const marker = baitNumber % 5 === 0 ? `<div class="bait-marker">﴾${baitNumber}﴿</div>` : "";
      const titlePart = b.title ? `<h3 class="bait-title">${b.title}</h3>` : "";

      // ⬇️ Deskripsi disembunyikan default (class hidden)
      const descPart = b.description
        ? `<p class="bait-desc hidden">${b.description}</p>`
        : "";

      return `
        <div class="bait${b.title || b.description ? " with-title" : ""}" data-id="${b.id}">
          ${titlePart}
          <div class="text">${showTranslation ? b.indo : b.persia}</div>
          ${descPart}
          <div class="bait-actions">
            ${b.description ? `
              <button class="toggle-desc" data-id="${b.id}" title="Tampilkan deskripsi">
                <svg class="icon"><use href="#icon-eye"></use></svg>
              </button>
            ` : ""}
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

    // 🟣 Event toggle deskripsi
    baitContainer.querySelectorAll(".toggle-desc").forEach(btn => {
      btn.addEventListener("click", () => {
        const bait = btn.closest(".bait");
        const desc = bait.querySelector(".bait-desc");
        if (!desc) return;

        const hidden = desc.classList.toggle("hidden");
        const use = btn.querySelector("use");
        use.setAttribute("href", hidden ? "#icon-eye" : "#icon-eye-off");
        btn.setAttribute("title", hidden ? "Tampilkan deskripsi" : "Sembunyikan deskripsi");
      });
    });

    controls.style.display = "flex";
  }, 150);
}
/* =========================
   🔍 PENCARIAN
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
    const newDetail = baitContainer.querySelector(".bait-detail");
setTimeout(() => newDetail.classList.add("show"), 20);

  initBookmarkButtons();
  initEditButtons();
  initDetailButtons();
});
/* =========================
   ✨ PENYOROTAN TEKS (HIGHLIGHT)
========================= */
function highlightSearch(term) {
  const baitDivs = document.querySelectorAll(".bait .text");
  baitDivs.forEach(div => {
    const originalText = div.textContent;
    if (!term) {
      div.innerHTML = originalText;
      return;
    }
    const regex = new RegExp(`(${term})`, "gi");
    div.innerHTML = originalText.replace(regex, `<mark class="highlight">$1</mark>`);
  });
}

// Tambahkan listener tambahan agar highlight tetap aktif saat ketik cepat
searchInput?.addEventListener("input", () => {
  const term = (searchInput.value || "").trim().toLowerCase();
  highlightSearch(term);
});
/* =========================
   🔖 BOOKMARK SYSTEM
========================= */
// === ELEMENT DASAR ===
const bookmarkPanel = document.getElementById("bookmark-panel");
const overlay = document.getElementById("bookmark-overlay");
const bookmarkToggle = document.getElementById("bookmark-toggle");
const bookmarkList = document.getElementById("bookmark-list");

// === INISIALISASI BOOKMARK ===
function initBookmarkButtons() {
  document.querySelectorAll(".bookmark-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const text = btn.closest(".bait").querySelector(".text").innerText;
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

// === TAMPILKAN BOOKMARK ===
function tampilkanBookmark() {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];

  // Filter data valid
  bookmarks = bookmarks.filter(b => b && b.text && b.text !== "undefined");

  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  // Render tiap item sebagai .bookmark-item terpisah
  bookmarkList.innerHTML =
    bookmarks.length === 0
      ? "<p>Belum ada bookmark.</p>"
      : bookmarks.map(b => `
          <div class="bookmark-item">
            <span class="bookmark-text">${b.text}</span>
            <button class="remove-bookmark" data-id="${b.id}" title="Hapus Bookmark">✖</button>
          </div>
        `).join("");

// 🟣 Setel ulang listener tombol hapus untuk tiap item
  document.querySelectorAll(".remove-bookmark").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      bookmarkToRemove = btn.closest(".bookmark-item");
      bookmarkIdToRemove = id;
      confirmDialog.classList.add("active");
    });
  });
}

// === PANEL BOOKMARK TOGGLE ===
bookmarkToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  const isShown = bookmarkPanel.classList.toggle("show");
  overlay.classList.toggle("show", isShown);
  if (isShown) tampilkanBookmark();
});

overlay.addEventListener("click", () => {
  bookmarkPanel.classList.remove("show");
  overlay.classList.remove("show");
});

// === DIALOG KONFIRMASI ===
const confirmDialog = document.getElementById("confirm-dialog");
const cancelRemove = document.getElementById("cancelRemove");
const confirmRemove = document.getElementById("confirmRemove");

let bookmarkIdToRemove = null;

function showConfirmDialog(id) {
  bookmarkIdToRemove = id;
  confirmDialog.classList.add("active");
}

// Tombol “Tidak”
cancelRemove.addEventListener("click", () => {
  confirmDialog.classList.remove("active");
  bookmarkIdToRemove = null;
});

// Tombol “Hapus”
confirmRemove.addEventListener("click", () => {
  if (bookmarkIdToRemove) {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks")) || [];
    bookmarks = bookmarks.filter(b => b && b.id != bookmarkIdToRemove);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    tampilkanBookmark();
    showToast("❌ Dihapus");
  }
  confirmDialog.classList.remove("active");
  bookmarkIdToRemove = null;
});

/* =========================
   ✏️ EDIT PANEL
========================= */
const editPanel = document.getElementById("edit-panel");
const editPersia = document.getElementById("edit-persia");
const editIndo = document.getElementById("edit-indo");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
let currentEditId = null;

function initEditButtons() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.dataset.id);
      const bait = baits.find((b) => b.id === id);
      if (!bait) return;
      currentEditId = id;
      editPersia.value = bait.persia || "";
      editIndo.value = bait.indo || "";
      editPanel.classList.add("show");
    });
  });
}

saveEditBtn.addEventListener("click", () => {
  if (!currentEditId) return;
  const newPersia = editPersia.value.trim();
  const newIndo = editIndo.value.trim();

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

cancelEditBtn.addEventListener("click", closeEditPanel);
function closeEditPanel() {
  editPanel.classList.remove("show");
  currentEditId = null;
}
// 🔹 Fungsi memuat bab tertentu
async function loadBab(babIndex) {
  try {
    const res = await fetch(`./assets/data/bab${babIndex}.json`);
    if (!res.ok) throw new Error(`Gagal memuat Bab ${babIndex}`);
    baits = await res.json(); // langsung array
    currentPage = 1;
    renderBaits();
    showToast(`📖 Bab ${babIndex} dimuat`);
  } catch (err) {
    console.error(err);
    showToast("❌ Tidak bisa memuat bab " + babIndex);
  }
}


/* =========================
   🔍 LIHAT BAIT PENUH (MODAL)
========================= */
function initDetailButtons() {
  document.querySelectorAll(".open-detail").forEach((btn) => {
    btn.addEventListener("click", () => {
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

  // Tampilkan perlahan
  requestAnimationFrame(() => toast.classList.add("show"));

  // Hilangkan otomatis
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 600);
  }, 2300);
}

/* =========================
   NAVIGASI & KONTROL
========================= */
baitPerPageSelect.onchange = () => {
  baitsPerPage = parseInt(baitPerPageSelect.value);
  currentPage = 1;
  renderBaits();
};

// 🔹 Tombol navigasi
prevBtn.onclick = async () => {
  if (currentPage > 1) {
    currentPage--;
    renderBaits();
  } else if (currentBab > 1) {
    currentBab--;
    await loadBab(currentBab);
  } else {
    showToast("📘 Sudah di bab pertama");
  }
};

nextBtn.onclick = async () => {
  if (currentPage * baitsPerPage < baits.length) {
    currentPage++;
    renderBaits();
  } else if (currentBab < totalBab) {
    currentBab++;
    await loadBab(currentBab);
  } else {
    showToast("📖 Sudah di bab terakhir");
  }
};

// 🔹 Panggil pertama kali
loadBab(currentBab);

langSwitch.onclick = () => {
  showTranslation = !showTranslation;
  langSwitch.textContent = showTranslation ? "🇮🇩" : "🇬🇧";
  renderBaits();
};

themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light")
    ? "☀️"
    : "🌙";
};

/* =========================
   INIT UTAMA
========================= */
window.addEventListener("DOMContentLoaded", async () => {
  const loaded = await loadBaitsFromIndex();
  if (!loaded) return;

  const searchInput = document.getElementById("searchInput");
  if (!searchInput) {
    console.warn("❌ searchInput tidak ditemukan di DOM");
    return;
  }

  console.log("✅ Matsnawi Digital siap 🌙✨");

  langSwitch.textContent = "🌐";
});

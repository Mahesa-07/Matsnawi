// 🌙 Matsnawi Digital — Final Versi (Bab + Subbab + Bookmark + Edit)
// (Lengkap: Sidebar, Subbab lazy-load, Render, Bookmark, Edit, Toast, Search)

// =========================
// VARIABEL GLOBAL
// =========================
let currentBab = null;
let currentSubbab = null;
let cacheSubbabs = {};
let baits = []; // current loaded bait array (subbab)
let showTranslation = true;
let baitOffset = 0; // offset global untuk penomoran berurutan
let editingBait = null;
let pendingRemoveId = null;

// =========================
// ELEMEN DOM (pastikan id di HTML sesuai)
// =========================
const baitContainer = document.getElementById("baitContainer");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

const langSwitch = document.getElementById("langSwitch");
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");

const bookmarkToggle = document.getElementById("bookmark-toggle");
const bookmarkPanel = document.getElementById("bookmark-panel");
const bookmarkList = document.getElementById("bookmark-list");
const bookmarkOverlay = document.getElementById("bookmark-overlay");

const editPanel = document.getElementById("edit-panel");
const editPersia = document.getElementById("edit-persia");
const editIndo = document.getElementById("edit-indo");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const confirmDialog = document.getElementById("confirm-dialog");
const cancelRemove = document.getElementById("cancelRemove");
const confirmRemove = document.getElementById("confirmRemove");

// =========================
// BUILD SIDEBAR (bab -> subbab)
// =========================
// =========================
// BUILD SIDEBAR (Bab → Subbab → Bait Preview)
// =========================
async function buildSidebar() {
  const baitList = document.getElementById("baitList");
  baitList.innerHTML = "";

  const res = await fetch("./assets/data/index.json");
  const index = await res.json();

  index.files.forEach((bab) => {
    const babItem = document.createElement("div");
    babItem.className = "sidebar-bab";
    babItem.innerHTML = `<div class="bab-title" data-bab="${bab.bab}">📘 ${bab.title}</div>`;

    const subbabList = document.createElement("ul");
    subbabList.className = "subbab-list hidden";

    bab.subbabs.forEach((sub, subIndex) => {
      const subItem = document.createElement("li");
      subItem.className = "subbab-item";
      subItem.innerHTML = `
        <div class="subbab-title" data-file="${sub.file}">
          📖 ${sub.title} <span class="desc">${sub.description || ""}</span>
        </div>
        <ul class="bait-sublist hidden"></ul>
      `;
      subbabList.appendChild(subItem);

      // Klik subbab untuk buka daftar bait-nya
      const subTitle = subItem.querySelector(".subbab-title");
      const baitSublist = subItem.querySelector(".bait-sublist");

      subTitle.addEventListener("click", async () => {
        const visible = !baitSublist.classList.contains("hidden");
        document.querySelectorAll(".bait-sublist").forEach((l) => l.classList.add("hidden"));

        if (!visible) {
          await loadSubbabPreview(sub.file, baitSublist);
          baitSublist.classList.remove("hidden");
        } else {
          baitSublist.classList.add("hidden");
        }
      });

      // Klik dua kali subbab langsung load isi
      subTitle.addEventListener("dblclick", () => {
        loadSubbab(sub.file, bab.bab, subIndex, sub.title);
        closeSidebar();
      });
    });

    babItem.appendChild(subbabList);
    baitList.appendChild(babItem);

    // Klik bab → tampilkan subbab
    babItem.querySelector(".bab-title").addEventListener("click", () => {
      const visible = !subbabList.classList.contains("hidden");
      document.querySelectorAll(".subbab-list").forEach((l) => l.classList.add("hidden"));
      if (!visible) subbabList.classList.remove("hidden");
    });
  });
}

// =========================
// Tampilkan daftar bait (preview) di sidebar
// =========================
async function loadSubbabPreview(file, subList) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Gagal memuat ${file}`);
    const data = await res.json();

    subList.innerHTML = data
      .map(
        (b, i) => `
          <li class="bait-item" data-id="${b.id}">
            <span class="bait-number">${b.id}.</span>
            <span class="bait-text">${b.indo.slice(0, 25)}...</span>
          </li>`
      )
      .join("");

    subList.querySelectorAll(".bait-item").forEach((li) => {
      li.addEventListener("click", async () => {
        await loadSubbab(file, currentBab || 1, 0, "Subbab");
        scrollToBait(parseInt(li.dataset.id));
        closeSidebar();
      });
    });
  } catch (err) {
    console.error("loadSubbabPreview error:", err);
    subList.innerHTML = "<li>⚠️ Gagal memuat bait</li>";
  }
}

// =========================
// SIDEBAR TOGGLE
// =========================
function openSidebar() {
  sidebar.classList.add("show");
  menuToggle.textContent = "✖";
}
function closeSidebar() {
  sidebar.classList.remove("show");
  menuToggle.textContent = "☰";
}
menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
});
document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) closeSidebar();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
});

// =========================
// LOAD SUBBAB (lazy-load + caching + calculate offset)
// =========================
async function loadSubbab(file, babIndex, subIndex, title) {
  try {
    if (!file) return;

    if (currentSubbab === file) {
      showToast(`⚠️ ${title} sudah aktif`);
      return;
    }

    const prevBab = currentBab;
    const prevSubbab = currentSubbab;

    currentBab = babIndex;
    currentSubbab = file;

    // 🔹 Jika sudah pernah di-cache
    if (cacheSubbabs[file]) {
      baits = cacheSubbabs[file].data;
      baitOffset = cacheSubbabs[file].offset;
      renderBaits(baits, baitOffset);
      showToast(`📖 ${title} (cached)`);
      return;
    }

    // 🔹 Coba pakai offset dari subbab sebelumnya (jika masih dalam bab sama)
    let offset = 0;
    if (prevBab === babIndex && cacheSubbabs[prevSubbab]) {
      const prevData = cacheSubbabs[prevSubbab].data;
      const prevOffset = cacheSubbabs[prevSubbab].offset;
      offset = prevOffset + prevData.length;
    } else {
      // 🔹 Hitung offset global (subbab sebelum subIndex aktif)
      const indexRes = await fetch("./assets/data/index.json");
      const index = await indexRes.json();

      for (const bab of index.files) {
        const subs = Array.isArray(bab.subbabs) ? bab.subbabs : [];

        // Tambahkan semua bait dari bab sebelum bab aktif
        if (bab.bab < babIndex) {
          for (const s of subs) {
            const res = await fetch(s.file);
            const data = await res.json();
            offset += data.length;
          }
        }

        // Kalau bab yang sama, tambahkan hanya subbab sebelum subIndex aktif
        else if (bab.bab === babIndex) {
          for (let i = 0; i < subIndex; i++) {
            const res = await fetch(subs[i].file);
            const data = await res.json();
            offset += data.length;
          }
          break;
        }
      }
    }

    // 🔹 Ambil data subbab aktif
    const res = await fetch(file);
    if (!res.ok) throw new Error("Gagal fetch subbab");
    const subBaits = await res.json();

    // 🔹 Simpan ke cache
    cacheSubbabs[file] = { data: subBaits, offset };

    baits = subBaits;
    baitOffset = offset;

    renderBaits(baits, baitOffset);
    showToast(`📖 ${title} dimuat`);
  } catch (err) {
    console.error("loadSubbab error:", err);
    showToast(`❌ Gagal memuat ${title}`);
  }
}

// =========================
// RENDER BAIT
// - penting: gunakan data-id = baitNumber (global) untuk bookmark/scroll
// - simpan data-bait-index = index dalam array baits agar edit mudah
// =========================
function renderBaits() {
  baitContainer.style.opacity = 0;
  setTimeout(() => {
    baitContainer.innerHTML = baits
      .map((b, i) => {
        const baitNumber = baitOffset + i + 1; // nomor global
        const descPart = b.description
          ? `<p class="bait-desc hidden">${b.description}</p>`
          : "";

        return `
          <div class="bait" data-id="${baitNumber}" data-bait-index="${i}">
            ${b.title ? `<h3 class="bait-title">${b.title}</h3>` : ""}
            <div class="text">${escapeHtml(showTranslation ? b.indo : b.persia)}</div>
            ${descPart}

            <!-- 🔹 FOOTER BAR: nomor kiri + ikon kanan -->
            <div class="bait-footer">
              <div class="bait-marker">﴾${baitNumber}﴿</div>
              <div class="bait-actions">
                <button class="btn-desc" title="Lihat Deskripsi">
                  <svg width="20" height="20"><use href="#icon-open"></use></svg>
                </button>
                <button class="btn-bookmark" title="Bookmark">
                  <svg width="20" height="20"><use href="#icon-bookmark"></use></svg>
                </button>
                <button class="btn-edit" title="Edit">
                  <svg width="20" height="20"><use href="#icon-edit"></use></svg>
                </button>
              </div>
            </div>
          </div>`;
      })
      .join("");

    addBaitListeners();
    baitContainer.style.opacity = 1;
  }, 120);
}

// small helper to avoid inserting raw HTML (safer)
function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// =========================
// ADD LISTENERS FOR BAIT ACTIONS (edit / bookmark / desc)
// =========================
function addBaitListeners() {
  // Deskripsi toggle
  document.querySelectorAll(".btn-desc").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const desc = baitEl.querySelector(".bait-desc");
      if (!desc) return;
      desc.classList.toggle("hidden");
    };
  });

  // Bookmark toggle
  document.querySelectorAll(".btn-bookmark").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const id = parseInt(baitEl.dataset.id);
      toggleBookmark(id);
    };
  });

  // Edit open
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const idx = parseInt(baitEl.dataset.baitIndex, 10);
      if (Number.isNaN(idx)) return;
      editingBait = baits[idx];
      openEditPanel(editingBait);
    };
  });
}

// =========================
// SCROLL KE BAIT
// =========================
function scrollToBait(id) {
  const el = document.querySelector(`.bait[data-id='${id}']`);
  if (!el) {
    // jika saat ini belum load subbab yang mengandung bait ini,
    // kita bisa coba cari subbab yang punya bait dengan id global ini.
    // (untuk kesederhanaan: tampilkan toast)
    showToast("⚠️ Bait belum dimuat. Buka bab/subbab yang sesuai dahulu.");
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("highlighted");
  setTimeout(() => el.classList.remove("highlighted"), 1800);
}

// =========================
// EDIT PANEL
// =========================
function openEditPanel(bait) {
  editPersia.value = bait.persia || "";
  editIndo.value = bait.indo || "";
  editPanel.setAttribute("aria-hidden", "false");
  editPanel.classList.add("show");
}
function closeEditPanel() {
  editPanel.classList.remove("show");
  editPanel.setAttribute("aria-hidden", "true");
  editingBait = null;
}
saveEditBtn.addEventListener("click", () => {
  if (!editingBait) return;
  editingBait.persia = editPersia.value.trim();
  editingBait.indo = editIndo.value.trim();
  renderBaits();
  closeEditPanel();
  showToast("✅ Bait diperbarui (sementara)");
});
cancelEditBtn.addEventListener("click", closeEditPanel);

// =========================
// BOOKMARKS
// =========================
bookmarkToggle.addEventListener("click", toggleBookmarkPanel);
bookmarkOverlay.addEventListener("click", closeBookmarkPanel);

function toggleBookmarkPanel() {
  const isOpen = bookmarkPanel.classList.contains("show");
  isOpen ? closeBookmarkPanel() : openBookmarkPanel();
}
function openBookmarkPanel() {
  renderBookmarkList();
  bookmarkPanel.classList.add("show");
  bookmarkOverlay.classList.add("show");
}
function closeBookmarkPanel() {
  bookmarkPanel.classList.remove("show");
  bookmarkOverlay.classList.remove("show");
}

function toggleBookmark(id) {
  id = Number(id);
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  if (bookmarks.includes(id)) {
    // tanda hapus via confirm dialog
    pendingRemoveId = id;
    openConfirmDialog();
  } else {
    bookmarks.push(id);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    showToast("🔖 Ditambahkan ke Bookmark");
    renderBookmarkList();
  }
}

function renderBookmarkList() {
  const bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  if (!bookmarks.length) {
    bookmarkList.innerHTML = "<p>Tidak ada bookmark.</p>";
    return;
  }
  bookmarkList.innerHTML = bookmarks
    .map((id) => `<div class="bookmark-item" data-id="${id}">Bait ${id}</div>`)
    .join("");
  bookmarkList.querySelectorAll(".bookmark-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = Number(item.dataset.id);
      scrollToBait(id);
      closeBookmarkPanel();
    });
  });
}

// =========================
// KONFIRMASI HAPUS BOOKMARK
// =========================
function openConfirmDialog() {
  confirmDialog.setAttribute("aria-hidden", "false");
  confirmDialog.classList.add("show");
}
function closeConfirmDialog() {
  confirmDialog.classList.remove("show");
  confirmDialog.setAttribute("aria-hidden", "true");
}
cancelRemove.addEventListener("click", () => {
  pendingRemoveId = null;
  closeConfirmDialog();
});
confirmRemove.addEventListener("click", () => {
  if (!pendingRemoveId) return;
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  bookmarks = bookmarks.filter((id) => id !== pendingRemoveId);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  showToast("❌ Bookmark dihapus");
  closeConfirmDialog();
  renderBookmarkList();
  pendingRemoveId = null;
});

// =========================
// PENCARIAN
// =========================
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
    .map((b, i) => {
      const globalNum = baitOffset + i + 1;
      return `<div class="bait" data-id="${globalNum}">
        <div class="text">${escapeHtml(showTranslation ? b.indo : b.persia)}</div>
      </div>`;
    })
    .join("");
});

// =========================
// TOAST
// =========================
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = msg;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

// =========================
// UTAMA / INISIALISASI
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  // 1) bangun sidebar
  await buildSidebar();

  // 2) auto-load subbab pertama (jika ada)
  try {
    const res = await fetch("./assets/data/index.json");
    const index = await res.json();
    const firstFile = index.files?.[0]?.subbabs?.[0];
    if (firstFile && firstFile.file) {
      await loadSubbab(firstFile.file, index.files[0].bab, 0, firstFile.title);
    }
  } catch (err) {
    console.error("init load error:", err);
  }

  // 3) tombol bahasa & tema
  langSwitch?.addEventListener("click", () => {
    showTranslation = !showTranslation;
    langSwitch.textContent = showTranslation ? "🌐" : "🇮🇷";
    renderBaits();
  });
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  });

  console.log("✅ Matsnawi Digital aktif (Bookmark + Edit + Deskripsi)");
});
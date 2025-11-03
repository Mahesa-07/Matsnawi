// -*- coding: utf-8 -*-
// 🌙 Matsnawi Digital — versi scroll penuh (tanpa pagination)

// =========================
// VARIABEL GLOBAL
// =========================
let currentBab = 1;
const totalBab = 16;
let baits = [];
let showTranslation = true;
let baitOffset = 0;

// Elemen DOM
const baitContainer = document.getElementById("baitContainer");
const langSwitch = document.getElementById("langSwitch");
const themeToggle = document.getElementById("themeToggle");
const searchInput = document.getElementById("searchInput");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

// =========================
// SIDEBAR OPEN / CLOSE
// =========================
function openSidebar() {
  sidebar.classList.add("show");
  document.body.classList.add("sidebar-open");
  menuToggle.textContent = "✖";
}

function closeSidebar() {
  sidebar.classList.remove("show");
  document.body.classList.remove("sidebar-open");
  menuToggle.textContent = "☰";
}

menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
});

document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    closeSidebar();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
});

// =========================
// LOAD INDEX & FILE DATA
// =========================
async function loadBaitsFromIndex() {
  try {
    const res = await fetch("./assets/data/index.json");
    const index = await res.json();
    renderSidebarFromIndex(index.files);
    await loadBaitsFile(index.files[0].file);
  } catch (err) {
    baitContainer.innerHTML = `<p style="text-align:center;color:var(--accent)">⚠️ Gagal memuat data bait.</p>`;
    console.error(err);
  }
}

// =========================
// SIDEBAR BAB + BAIT
// =========================
async function renderSidebarFromIndex(files) {
  const baitList = document.getElementById("baitList");
  baitList.innerHTML = "";

  for (const f of files) {
    const babMatch = f.file.match(/bab(\d+)\.json$/);
    const babIndex = babMatch ? parseInt(babMatch[1]) : null;
    const babItem = document.createElement("div");
    babItem.className = "sidebar-bab";
    babItem.innerHTML = `<div class="bab-title" data-bab="${babIndex}">📘 ${f.title}</div>`;

    const baitContainer = document.createElement("ul");
    baitContainer.className = "bait-sublist hidden";
    babItem.appendChild(baitContainer);
    baitList.appendChild(babItem);

    // Klik bab -> tampilkan daftar bait
    babItem.querySelector(".bab-title").addEventListener("click", async () => {
      const subList = babItem.querySelector(".bait-sublist");
      const isVisible = !subList.classList.contains("hidden");
      document.querySelectorAll(".bait-sublist").forEach((ul) => ul.classList.add("hidden"));

      if (!isVisible && babIndex) {
        await loadBabPreview(babIndex, subList);
        subList.classList.remove("hidden");
      } else {
        subList.classList.add("hidden");
      }
    });
  }
}

// =========================
// LOAD BAIT PREVIEW (untuk sidebar)
// =========================
async function loadBabPreview(babIndex, subList) {
  try {
    const res = await fetch(`./assets/data/bab${babIndex}.json`);
    const data = await res.json();

    subList.innerHTML = data
      .map(
        (b) => `
      <li class="bait-item" data-id="${b.id}">
        <span class="bait-number">${b.id}.</span>
        <span class="bait-text">${b.indo.slice(0, 25)}...</span>
      </li>`
      )
      .join("");

    subList.querySelectorAll(".bait-item").forEach((li) => {
      li.addEventListener("click", async () => {
        currentBab = babIndex;
        await loadBab(currentBab);
        const baitId = parseInt(li.dataset.id);
        setTimeout(() => scrollToBait(baitId), 400);
        closeSidebar();
      });
    });
  } catch (err) {
    subList.innerHTML = "<li>⚠️ Gagal memuat bait</li>";
    console.error(err);
  }
}

// =========================
// SCROLL KE BAIT
// =========================
function scrollToBait(baitId) {
  const target = document.querySelector(`.bait[data-id='${baitId}']`);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("highlighted");
    setTimeout(() => target.classList.remove("highlighted"), 1800);
  }
}

// =========================
// LOAD BAB UTAMA
// =========================
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
    renderBaits();
    showToast(`📖 Bab ${babIndex} dimuat`);
  } catch (err) {
    console.error(err);
    showToast("❌ Tidak bisa memuat bab " + babIndex);
  }
}

// =========================
// RENDER SEMUA BAIT (scroll penuh)
// =========================
function renderBaits() {
  baitContainer.style.opacity = 0;
  setTimeout(() => {
    baitContainer.innerHTML = baits
      .map((b, i) => {
        const baitNumber = baitOffset + i + 1;
        const marker = baitNumber % 5 === 0 ? `<div class="bait-marker">﴾${baitNumber}﴿</div>` : "";
        const titlePart = b.title ? `<h3 class="bait-title">${b.title}</h3>` : "";
        const descPart = b.description
          ? `<p class="bait-desc hidden">${b.description}</p>`
          : "";

        return `
          <div class="bait${b.title || b.description ? " with-title" : ""}" data-id="${b.id}">
            ${titlePart}
            <div class="text">${showTranslation ? b.indo : b.persia}</div>
            ${descPart}
            ${marker}
          </div>`;
      })
      .join("");
    baitContainer.style.opacity = 1;
  }, 150);
}

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
    .map(
      (b) => `
      <div class="bait" data-id="${b.id}">
        <div class="text">${showTranslation ? b.indo : b.persia}</div>
      </div>`
    )
    .join("");

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

// =========================
// TOAST MESSAGE
// =========================
function showToast(msg) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.innerHTML = msg;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 600);
  }, 2200);
}

// =========================
// INISIALISASI
// =========================
window.addEventListener("DOMContentLoaded", async () => {
  await loadBaitsFromIndex();

  langSwitch?.addEventListener("click", () => {
    showTranslation = !showTranslation;
    langSwitch.textContent = showTranslation ? "🇮🇩" : "🇮🇷";
    renderBaits();
  });

  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  });

  console.log("✅ Matsnawi Digital aktif dalam mode scroll penuh 🌙📜");
});
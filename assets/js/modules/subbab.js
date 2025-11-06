// subbab.js — fungsi utama untuk memuat & menampilkan subbab
import { escapeHtml } from "./utils.js";
import { showToast } from "./toast.js";
import { openEditPanel } from "./editPanel.js";
import { toggleBookmark } from "./bookmark.js";
import { elements, currentBab, currentSubbab, cacheSubbabs, baits, showTranslation, baitOffset } from "./state.js";

// ========== LOAD SUBBAB ==========
export async function loadSubbab(file, babIndex, subIndex, title) {
  try {
    if (!file) return;
    if (currentSubbab === file) return showToast(`⚠️ ${title} sudah aktif`);

    let offset = 0;
    const indexRes = await fetch("./assets/data/index.json");
    const index = await indexRes.json();

    for (const bab of index.files) {
      if (bab.bab < babIndex) {
        for (const s of bab.subbabs) {
          const res = await fetch(s.file);
          offset += (await res.json()).length;
        }
      } else if (bab.bab === babIndex) {
        for (let i = 0; i < subIndex; i++) {
          const res = await fetch(bab.subbabs[i].file);
          offset += (await res.json()).length;
        }
        break;
      }
    }

    const res = await fetch(file);
    if (!res.ok) throw new Error("Gagal fetch subbab");
    const subBaits = await res.json();

    cacheSubbabs[file] = { data: subBaits, offset };
    baits.length = 0;
    baits.push(...subBaits);
    baitOffset = offset;

    renderBaits();
    showToast(`📖 ${title} dimuat`);
  } catch (err) {
    console.error("loadSubbab error:", err);
    showToast(`❌ Gagal memuat ${title}`);
  }
}

// ========== RENDER BAIT ==========
export function renderBaits() {
  const c = elements.baitContainer;
  c.classList.add("bait-exit");

  setTimeout(() => {
    c.classList.remove("bait-exit");
    c.classList.add("bait-enter");
    c.innerHTML = baits
      .map((b, i) => {
        const baitNumber = baitOffset + i + 1;
        return `
          <div class="bait" data-id="${baitNumber}" data-bait-index="${i}">
            ${b.title ? `<h3>${b.title}</h3>` : ""}
            <div class="text">${escapeHtml(showTranslation ? b.indo : b.inggris)}</div>
            ${b.description ? `<p class="bait-desc hidden">${b.description}</p>` : ""}
            <div class="bait-footer">
              <div class="bait-marker">﴾${baitNumber}﴿</div>
              <div class="bait-actions">
                <button class="btn-desc" title="Lihat Deskripsi">📄</button>
                <button class="btn-bookmark" title="Bookmark">🔖</button>
                <button class="btn-edit" title="Edit">✏️</button>
              </div>
            </div>
          </div>`;
      })
      .join("");

    addBaitListeners();
    addNextButtonIfEnd();

    requestAnimationFrame(() => {
      c.classList.add("bait-enter-active");
      setTimeout(() => c.classList.remove("bait-enter", "bait-enter-active"), 600);
    });
  }, 400);
}

// ========== NEXT BUTTON ==========
export function addNextButtonIfEnd() {
  const old = document.querySelector(".next-sub-btn");
  if (old) old.remove();

  const nextBtn = document.createElement("button");
  nextBtn.className = "next-sub-btn";
  nextBtn.textContent = "⟩⟩ Selanjutnya";

  nextBtn.onclick = async () => {
    try {
      const res = await fetch("./assets/data/index.json");
      const index = await res.json();
      const babNow = index.files.find(b => b.bab === currentBab);
      if (!babNow) return showToast("⚠️ Data bab tidak ditemukan");

      const subs = babNow.subbabs || [];
      const currentSubIndex = subs.findIndex(s => s.file === currentSubbab);

      if (currentSubIndex < subs.length - 1) {
        const nextSub = subs[currentSubIndex + 1];
        await loadSubbab(nextSub.file, babNow.bab, currentSubIndex + 1, nextSub.title);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else showToast("✨ Kamu sudah di akhir karya ini.");
    } catch {
      showToast("⚠️ Tidak bisa memuat subbab berikutnya.");
    }
  };

  elements.baitContainer.appendChild(nextBtn);
}

// ========== LISTENER PER BAIT ==========
function addBaitListeners() {
  document.querySelectorAll(".btn-desc").forEach(btn => {
    btn.onclick = e => e.currentTarget.closest(".bait").querySelector(".bait-desc")?.classList.toggle("hidden");
  });
  document.querySelectorAll(".btn-bookmark").forEach(btn => {
    btn.onclick = e => toggleBookmark(parseInt(e.currentTarget.closest(".bait").dataset.id));
  });
  document.querySelectorAll(".btn-edit").forEach(btn => {
    btn.onclick = e => {
      const baitEl = e.currentTarget.closest(".bait");
      const idx = parseInt(baitEl.dataset.baitIndex, 10);
      if (!Number.isNaN(idx)) openEditPanel(baits[idx]);
    };
  });
}
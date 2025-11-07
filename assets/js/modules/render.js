// assets/js/modules/render.js

import { baits, baitOffset, showTranslation } from "./state.js";
import { escapeHtml } from "./utils.js";
import { toggleBookmark } from "./bookmark.js";
import { openEditPanel } from "./editPanel.js";
import { showToast } from "./toast.js";

export function renderBaits() {
  const baitContainer = document.getElementById("baitContainer");
  baitContainer.classList.add("bait-exit");

  setTimeout(() => {
    baitContainer.classList.remove("bait-exit");
    baitContainer.classList.add("bait-enter");

    baitContainer.innerHTML = baits
      .map((b, i) => {
        const baitNumber = baitOffset + i + 1;
        const descPart = b.description ? `<p class="bait-desc hidden">${b.description}</p>` : "";

        return `
          <div class="bait" data-id="${baitNumber}" data-bait-index="${i}">
            ${b.title ? `<h3 class="bait-title">${b.title}</h3>` : ""}
            <div class="text">${escapeHtml(showTranslation ? b.indo : b.inggris)}</div>
            ${descPart}
            <div class="bait-footer">
              <div class="bait-marker">﴾${baitNumber}﴿</div>
              <div class="bait-actions">
                <button class="btn-desc" title="Lihat Deskripsi"><svg width="20" height="20"><use href="#icon-open"></use></svg></button>
                <button class="btn-bookmark" title="Bookmark"><svg width="20" height="20"><use href="#icon-bookmark"></use></svg></button>
                <button class="btn-edit" title="Edit"><svg width="20" height="20"><use href="#icon-edit"></use></svg></button>
              </div>
            </div>
          </div>`;
      })
      .join("");

    addBaitListeners();
    addNextButtonIfEnd();

    requestAnimationFrame(() => {
      baitContainer.classList.add("bait-enter-active");
      setTimeout(() => {
        baitContainer.classList.remove("bait-enter", "bait-enter-active");
      }, 600);
    });
  }, 400);
}

export function clearBaits() {
  const baitContainer = document.getElementById("baitContainer");
  if (baitContainer) baitContainer.innerHTML = "";
  console.log("🌾 Semua bait telah dihapus (termasuk bait0).");
}

function addBaitListeners() {
  document.querySelectorAll(".btn-desc").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const desc = baitEl.querySelector(".bait-desc");
      if (desc) desc.classList.toggle("hidden");
    };
  });

  document.querySelectorAll(".btn-bookmark").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const id = parseInt(baitEl.dataset.id);
      toggleBookmark(id);
    };
  });

  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.onclick = (e) => {
      const baitEl = e.currentTarget.closest(".bait");
      const idx = parseInt(baitEl.dataset.baitIndex, 10);
      openEditPanel(baits[idx]);
    };
  });
}

function addNextButtonIfEnd() {
  const baitContainer = document.getElementById("baitContainer");

  const oldBtn = document.querySelector(".next-sub-btn");
  if (oldBtn) oldBtn.remove();

  const nextBtn = document.createElement("button");
  nextBtn.className = "next-sub-btn";
  nextBtn.innerHTML = "⟩⟩ Selanjutnya";
  nextBtn.addEventListener("click", () => {
    showToast("fitur next masih di modul subbab — ini akan dihubungkan sesudah semua modul beres");
  });

  baitContainer.appendChild(nextBtn);
}
// assets/js/modules/search.js
import { baits, baitOffset, showTranslation } from "./state.js";
import { escapeHtml } from "./utils.js";
import { renderBaits } from "./render.js";

const searchInput = document.getElementById("searchInput");

export function initSearch() {
  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const q = (searchInput.value || "").toLowerCase().trim();
    if (!q) {
      renderBaits();
      return;
    }

    const filtered = baits.filter(
      (b) =>
        (b.inggris || "").toLowerCase().includes(q) ||
        (b.indo || "").toLowerCase().includes(q)
    );

    const baitContainer = document.getElementById("baitContainer");

    baitContainer.innerHTML = filtered
      .map((b, i) => {
        const globalNum = baitOffset + i + 1;
        const text = showTranslation ? b.indo : b.inggris;

        const highlighted = escapeHtml(text).replace(
          new RegExp(`(${q})`, "gi"),
          `<span class="highlight">$1</span>`
        );

        return `<div class="bait" data-id="${globalNum}">
          <div class="text">${highlighted}</div>
        </div>`;
      })
      .join("");
  });
}
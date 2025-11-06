// search.js
import { elements, baits, baitOffset, showTranslation } from "./state.js";
import { escapeHtml } from "./utils.js";
import { renderBaits } from "./subbab.js";

elements.searchInput?.addEventListener("input", () => {
  const query = elements.searchInput.value.trim().toLowerCase();
  if (!query) return renderBaits();

  const filtered = baits.filter(
    b => (b.indo || "").toLowerCase().includes(query) || (b.inggris || "").toLowerCase().includes(query)
  );

  elements.baitContainer.innerHTML = filtered
    .map((b, i) => {
      const globalNum = baitOffset + i + 1;
      const text = showTranslation ? b.indo : b.inggris;
      const highlighted = escapeHtml(text).replace(new RegExp(`(${query})`, "gi"), `<span class="highlight">$1</span>`);
      return `<div class="bait" data-id="${globalNum}"><div class="text">${highlighted}</div></div>`;
    })
    .join("");
});
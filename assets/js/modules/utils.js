// utils.js
export function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function scrollToBait(id) {
  const el = document.querySelector(`.bait[data-id='${id}']`);
  if (!el) {
    alert("⚠️ Bait belum dimuat. Buka bab/subbab yang sesuai dahulu.");
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("highlighted");
  setTimeout(() => el.classList.remove("highlighted"), 1800);
}

export function clearBaits(container) {
  container.innerHTML = "";
  console.log("🌾 Semua bait telah dihapus (termasuk bait0).");
}
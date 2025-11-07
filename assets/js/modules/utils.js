// utils.js

// safer HTML escape
export function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// scroll ke bait global
export function scrollToBait(id) {
  const el = document.querySelector(`.bait[data-id='${id}']`);
  if (!el) {
    // bukan error, hanya info
    // jangan panggil toast di utils -> toast ada modul lain
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("highlighted");
  setTimeout(() => el.classList.remove("highlighted"), 1800);
}
// assets/js/main.js  (ENTRY)

// state (dipakai untuk toggle bahasa)
import { showTranslation } from "./modules/state.js";

// modul utama
import { buildSidebar }     from "./modules/sidebar.js";
import { loadSubbab }       from "./modules/subbab.js";
import { initSearch }       from "./modules/search.js";
import "./modules/bookmarkPanel.js";
import { renderBaits }      from "./modules/render.js";

// UI kecil
import { showToast } from "./modules/toast.js";

// DOM ELEMENT
const langSwitch   = document.getElementById("langSwitch");
const themeToggle  = document.getElementById("themeToggle");
const menuToggle   = document.getElementById("menuToggle");
const sidebar      = document.getElementById("sidebar");

// === INIT ===
document.addEventListener("DOMContentLoaded", async () => {

  // 1) sidebar
  await buildSidebar();

  // 2) auto load subbab pertama
  try {
    const res = await fetch("./assets/data/index.json");
    const index = await res.json();
    const firstSub = index.files?.[0]?.subbabs?.[0];
    if (firstSub) {
      await loadSubbab(firstSub.file, index.files[0].bab, 0, firstSub.title);
    }
  } catch (err) {
    console.error("init load error:", err);
  }

  // 3) search
  initSearch();

  // 4) toggle bahasa
  langSwitch?.addEventListener("click", () => {
    showTranslation = !showTranslation;
    langSwitch.textContent = showTranslation ? "🇮🇩" : "🇬🇧";
    renderBaits();
  });

  // 5) tema
  themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  });
});

// === SIDEBAR TOGGLE (ditaruh di main supaya modul sidebar tetap pure DOM) ===
menuToggle?.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.toggle("show");
});
document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    sidebar.classList.remove("show");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && sidebar.classList.contains("show")) {
    sidebar.classList.remove("show");
  }
});
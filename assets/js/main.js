// main.js — titik awal aplikasi
import { buildSidebar } from "./modules/sidebar.js";
import { loadSubbab, renderBaits } from "./modules/subbab.js";
import { elements, showTranslation } from "./modules/state.js";
import { showToast } from "./modules/toast.js";

// 🔎 Validasi index.json dan subfile sebelum inisialisasi
async function validateIndex() {
  try {
    const res = await fetch("./assets/data/index.json");
    if (!res.ok) throw new Error("index.json tidak ditemukan atau rusak");

    const index = await res.json();
    if (!Array.isArray(index.files)) throw new Error("Format index.json tidak valid");

    // periksa tiap subfile
    for (const bab of index.files) {
      if (!bab.subbabs || !Array.isArray(bab.subbabs)) continue;
      for (const sub of bab.subbabs) {
        const check = await fetch(sub.file);
        if (!check.ok) {
          console.warn(`⚠️ File hilang: ${sub.file}`);
          showToast(`⚠️ Gagal memuat: ${sub.title}`);
        }
      }
    }

    console.log("✅ Semua file JSON diverifikasi");
    return true;
  } catch (err) {
    console.error("❌ Kesalahan validasi:", err);
    showToast("❌ index.json rusak atau tidak lengkap");
    return false;
  }
}

// ==========================
// 🚀 INISIALISASI UTAMA
// ==========================
document.addEventListener("DOMContentLoaded", async () => {
  const valid = await validateIndex();
  if (!valid) return;

  // 1️⃣ Bangun sidebar
  await buildSidebar();

  // 2️⃣ Muat bab & subbab pertama
  try {
    const res = await fetch("./assets/data/index.json");
    const index = await res.json();
    const firstFile = index.files?.[0]?.subbabs?.[0];
    if (firstFile?.file) {
      await loadSubbab(firstFile.file, index.files[0].bab, 0, firstFile.title);
    }
  } catch (err) {
    console.error("init load error:", err);
  }

  // 3️⃣ Toggle bahasa
  elements.langSwitch?.addEventListener("click", () => {
    showTranslation = !showTranslation;
    elements.langSwitch.textContent = showTranslation ? "🇮🇩" : "🇬🇧";
    renderBaits();
  });

  // 4️⃣ Toggle tema
  elements.themeToggle?.addEventListener("click", () => {
    document.body.classList.toggle("light");
    elements.themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
  });

  console.log("✅ Matsnawi Digital aktif (ESModule + validasi index)");
});
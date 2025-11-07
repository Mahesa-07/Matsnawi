// assets/js/modules/subbab.js

import {
  currentBab,
  currentSubbab,
  cacheSubbabs,
  baits,
  baitOffset,
} from "./state.js";

import { showToast } from "./toast.js";
import { renderBaits } from "./render.js"; // nanti kita buat render.js
import { closeSidebar } from "./sidebar.js";


/**
 * LOAD SUBBAB (lazy-load + caching + offset)
 */
export async function loadSubbab(file, babIndex, subIndex, title) {
  try {
    if (!file) return;

    if (currentSubbab === file) {
      showToast(`⚠️ ${title} sudah aktif`);
      return;
    }

    // simpan dulu previous
    const prevBab = currentBab;
    const prevSubbab = currentSubbab;

    // update state object direct
    currentBab = babIndex;
    currentSubbab = file;

    // jika sudah cache
    if (cacheSubbabs[file]) {
      const c = cacheSubbabs[file];
      baits.length = 0;
      baits.push(...c.data);
      baitOffset = c.offset;

      renderBaits();
      showToast(`📖 ${title} (cached)`);
      return;
    }

    // calculate offset
    let offset = 0;

    if (prevBab === babIndex && cacheSubbabs[prevSubbab]) {
      offset = cacheSubbabs[prevSubbab].offset + cacheSubbabs[prevSubbab].data.length;
    } else {
      const indexRes = await fetch("./assets/data/index.json");
      const index = await indexRes.json();

      for (const bab of index.files) {
        const subs = Array.isArray(bab.subbabs) ? bab.subbabs : [];

        if (bab.bab < babIndex) {
          for (const s of subs) {
            const r = await fetch(s.file);
            const d = await r.json();
            offset += d.length;
          }
        }

        else if (bab.bab === babIndex) {
          for (let i = 0; i < subIndex; i++) {
            const r = await fetch(subs[i].file);
            const d = await r.json();
            offset += d.length;
          }
          break;
        }
      }
    }

    const res = await fetch(file);
    const subBaits = await res.json();

    cacheSubbabs[file] = { data: subBaits, offset };

    baits.length = 0;
    baits.push(...subBaits);
    baitOffset = offset;

    renderBaits();
    showToast(`📖 ${title} dimuat`);
    closeSidebar();

  } catch (err) {
    console.error("loadSubbab error:", err);
    showToast(`❌ Gagal memuat segarkan halaman ${title}`);
  }
}
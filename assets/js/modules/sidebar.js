// sidebar.js
import { loadSubbab } from "./subbab.js";
import { scrollToBait } from "./utils.js";
import { showToast } from "./toast.js";
import { elements, currentBab, currentSubbab } from "./state.js";

export async function buildSidebar() {
  const baitList = document.getElementById("baitList");
  baitList.innerHTML = "";

  const res = await fetch("./assets/data/index.json");
  const index = await res.json();

  index.files.forEach((bab) => {
    const babItem = document.createElement("div");
    babItem.className = "sidebar-bab";
    babItem.innerHTML = `<div class="bab-title" data-bab="${bab.bab}">📘 ${bab.title}</div>`;

    const subbabList = document.createElement("ul");
    subbabList.className = "subbab-list hidden";

    bab.subbabs.forEach((sub, subIndex) => {
      const subItem = document.createElement("li");
      subItem.className = "subbab-item";
      subItem.innerHTML = `
        <div class="subbab-title" data-file="${sub.file}">
          📖 ${sub.title} <span class="desc">${sub.description || ""}</span>
        </div>
        <ul class="bait-sublist hidden"></ul>
      `;
      subbabList.appendChild(subItem);

      const subTitle = subItem.querySelector(".subbab-title");
      const baitSublist = subItem.querySelector(".bait-sublist");

      subTitle.addEventListener("click", async () => {
        const visible = !baitSublist.classList.contains("hidden");
        document.querySelectorAll(".bait-sublist").forEach((l) => l.classList.add("hidden"));
        if (!visible) {
          await loadSubbabPreview(sub.file, baitSublist);
          baitSublist.classList.remove("hidden");
        } else baitSublist.classList.add("hidden");
      });

      subTitle.addEventListener("dblclick", () => {
        loadSubbab(sub.file, bab.bab, subIndex, sub.title);
        closeSidebar();
      });
    });

    babItem.appendChild(subbabList);
    baitList.appendChild(babItem);

    babItem.querySelector(".bab-title").addEventListener("click", () => {
      const visible = !subbabList.classList.contains("hidden");
      document.querySelectorAll(".subbab-list").forEach((l) => l.classList.add("hidden"));
      if (!visible) subbabList.classList.remove("hidden");
    });
  });
}

export async function loadSubbabPreview(file, subList) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Gagal memuat ${file}`);
    const data = await res.json();

    subList.innerHTML = data
      .map((b) => `<li class="bait-item" data-id="${b.id}"><span>${b.id}.</span> ${b.indo.slice(0, 25)}...</li>`)
      .join("");

    subList.querySelectorAll(".bait-item").forEach((li) => {
      li.addEventListener("click", async () => {
        await loadSubbab(file, currentBab || 1, 0, "Subbab");
        scrollToBait(parseInt(li.dataset.id));
        closeSidebar();
      });
    });
  } catch (err) {
    console.error("loadSubbabPreview error:", err);
    subList.innerHTML = "<li>⚠️ Gagal memuat bait</li>";
  }
}

export function openSidebar() {
  elements.sidebar.classList.add("show");
  elements.menuToggle.textContent = "✖";
}
export function closeSidebar() {
  elements.sidebar.classList.remove("show");
  elements.menuToggle.textContent = "☰";
}

elements.menuToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  elements.sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
});
document.addEventListener("click", (e) => {
  if (!elements.sidebar.contains(e.target) && !elements.menuToggle.contains(e.target)) closeSidebar();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && elements.sidebar.classList.contains("show")) closeSidebar();
});
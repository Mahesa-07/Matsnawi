// assets/js/modules/sidebar.js
import { loadSubbab } from "./subbab.js";
import { showToast } from "./toast.js";

export async function buildSidebar() {
  const baitList = document.getElementById("baitList");
  baitList.innerHTML = "";

  const res = await fetch("./assets/data/index.json");
  const index = await res.json();

  index.files.forEach((bab) => {
    const babItem = document.createElement("div");
    babItem.className = "sidebar-bab";
    babItem.innerHTML = `<div class="bab-title" data-bab="${bab.bab}">${bab.title}</div>`;

    const subbabList = document.createElement("ul");
    subbabList.className = "subbab-list hidden";

    bab.subbabs.forEach((sub, subIndex) => {
      const subItem = document.createElement("li");
      subItem.className = "subbab-item";
      subItem.innerHTML = `
        <div class="subbab-title" data-file="${sub.file}">${sub.title} <span class="desc">${sub.description || ""}</span>
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
        } else {
          baitSublist.classList.add("hidden");
        }
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
    const data = await res.json();

    subList.innerHTML = data
      .map(
        (b) => `
          <li class="bait-item" data-id="${b.id}">
            <span class="bait-number">${b.id}.</span>
            <span class="bait-text">${b.indo.slice(0, 25)}...</span>
          </li>`
      )
      .join("");

    subList.querySelectorAll(".bait-item").forEach((li) => {
      li.addEventListener("click", async () => {
        await loadSubbab(file, 1, 0, "Subbab");
        closeSidebar();
      });
    });
  } catch {
    showToast("⚠️ Gagal memuat bait");
  }
}

export function openSidebar() {
  document.getElementById("sidebar").classList.add("show");
}
export function closeSidebar() {
  document.getElementById("sidebar").classList.remove("show");
}
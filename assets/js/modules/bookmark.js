// assets/js/modules/bookmark.js
// pure ESModule

import { showToast } from "./toast.js";
import { scrollToBait } from "./utils.js";
import { openConfirmDialog } from "./confirmDialog.js";

export function toggleBookmark(id) {
  id = Number(id);
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);

  if (bookmarks.includes(id)) {
    openConfirmDialog(id);
  } else {
    bookmarks.push(id);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    showToast("🔖 Ditambahkan ke Bookmark");
    renderBookmarkList();
  }
}

export function renderBookmarkList() {
  const bookmarkList = document.getElementById("bookmark-list");
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]")
    .map(Number)
    .filter((id) => Number.isFinite(id) && id > 0);

  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

  if (!bookmarks.length) {
    bookmarkList.innerHTML = "<p>Tidak ada bookmark.</p>";
    return;
  }

  bookmarkList.innerHTML = bookmarks
    .map(
      (id) => `
      <div class="bookmark-item" data-id="${id}">
        <span>Bait ${id}</span>
        <button class="remove-bookmark" title="Hapus">✖</button>
      </div>`
    )
    .join("");

  bookmarkList.querySelectorAll(".bookmark-item").forEach((item) => {
    const id = Number(item.dataset.id);

    item.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-bookmark")) {
        openConfirmDialog(id);
        e.stopPropagation();
        return;
      }

      scrollToBait(id);
    });
  });
}

export function removeBookmark(id) {
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  bookmarks = bookmarks.filter((x) => x !== id && Number.isFinite(x));
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  renderBookmarkList();
  showToast("❌ Bookmark dihapus");
}
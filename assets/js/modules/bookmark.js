// bookmark.js
import { elements, pendingRemoveId } from "./state.js";
import { scrollToBait } from "./utils.js";
import { showToast } from "./toast.js";

export function toggleBookmark(id) {
  id = Number(id);
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  if (bookmarks.includes(id)) {
    openConfirmDialog(id);
  } else {
    bookmarks.push(id);
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    renderBookmarkList();
    showToast("🔖 Ditambahkan ke Bookmark");
  }
}

export function renderBookmarkList() {
  const list = JSON.parse(localStorage.getItem("bookmarks") || "[]")
    .map(Number)
    .filter(id => Number.isFinite(id) && id > 0);
  localStorage.setItem("bookmarks", JSON.stringify(list));

  elements.bookmarkList.innerHTML = !list.length
    ? "<p>Tidak ada bookmark.</p>"
    : list.map(id => `<div class="bookmark-item" data-id="${id}">Bait ${id} <button class="remove-bookmark">✖</button></div>`).join("");

  elements.bookmarkList.querySelectorAll(".bookmark-item").forEach(item => {
    const id = Number(item.dataset.id);
    item.addEventListener("click", e => {
      if (e.target.classList.contains("remove-bookmark")) {
        openConfirmDialog(id);
        e.stopPropagation();
        return;
      }
      scrollToBait(id);
      closeBookmarkPanel();
    });
  });
}

export function openBookmarkPanel() {
  renderBookmarkList();
  elements.bookmarkPanel.classList.add("show");
  elements.bookmarkOverlay.classList.add("show");
}
export function closeBookmarkPanel() {
  elements.bookmarkPanel.classList.remove("show");
  elements.bookmarkOverlay.classList.remove("show");
}

export function openConfirmDialog(id) {
  elements.confirmDialog.classList.add("show");
  elements.confirmDialog.dataset.target = id;
}
export function closeConfirmDialog() {
  elements.confirmDialog.classList.remove("show");
}

elements.confirmRemove.addEventListener("click", () => {
  const id = Number(elements.confirmDialog.dataset.target);
  if (!id) return;
  let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]").map(Number);
  bookmarks = bookmarks.filter(x => x !== id);
  localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  renderBookmarkList();
  showToast("❌ Bookmark dihapus");
  closeConfirmDialog();
});

elements.cancelRemove.addEventListener("click", closeConfirmDialog);
elements.bookmarkToggle.addEventListener("click", () => {
  elements.bookmarkPanel.classList.contains("show") ? closeBookmarkPanel() : openBookmarkPanel();
});
elements.bookmarkOverlay.addEventListener("click", closeBookmarkPanel);
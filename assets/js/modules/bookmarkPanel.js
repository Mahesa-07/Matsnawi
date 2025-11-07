// assets/js/modules/bookmarkPanel.js

import { renderBookmarkList } from "./bookmark.js";

const bookmarkToggle  = document.getElementById("bookmark-toggle");
const bookmarkPanel   = document.getElementById("bookmark-panel");
const bookmarkOverlay = document.getElementById("bookmark-overlay");

export function openBookmarkPanel() {
  renderBookmarkList();
  bookmarkPanel.classList.add("show");
  bookmarkOverlay.classList.add("show");
}

export function closeBookmarkPanel() {
  bookmarkPanel.classList.remove("show");
  bookmarkOverlay.classList.remove("show");
}

export function toggleBookmarkPanel() {
  const isOpen = bookmarkPanel.classList.contains("show");
  isOpen ? closeBookmarkPanel() : openBookmarkPanel();
}

bookmarkToggle?.addEventListener("click", toggleBookmarkPanel);
bookmarkOverlay?.addEventListener("click", closeBookmarkPanel);
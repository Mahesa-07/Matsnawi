// assets/js/modules/confirmDialog.js

import { removeBookmark } from "./bookmark.js";

let pending = null;

const confirmDialog = document.getElementById("confirm-dialog");
const cancelRemove = document.getElementById("cancelRemove");
const confirmRemove = document.getElementById("confirmRemove");

export function openConfirmDialog(id) {
  pending = id;
  confirmDialog.setAttribute("aria-hidden", "false");
  confirmDialog.classList.add("show");
}

export function closeConfirmDialog() {
  confirmDialog.classList.remove("show");
  confirmDialog.setAttribute("aria-hidden", "true");
  pending = null;
}

cancelRemove?.addEventListener("click", () => {
  pending = null;
  closeConfirmDialog();
});

confirmRemove?.addEventListener("click", () => {
  if (!pending) return;
  removeBookmark(pending);
  closeConfirmDialog();
  pending = null;
});
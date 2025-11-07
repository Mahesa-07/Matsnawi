// assets/js/modules/editPanel.js

import { baits } from "./state.js";
import { renderBaits } from "./render.js";
import { showToast } from "./toast.js";

const editPanel = document.getElementById("edit-panel");
const editinggris = document.getElementById("edit-inggris");
const editIndo = document.getElementById("edit-indo");
const saveEditBtn = document.getElementById("saveEditBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let editingBait = null;

export function openEditPanel(bait) {
  editingBait = bait;
  editinggris.value = bait.inggris || "";
  editIndo.value = bait.indo || "";
  editPanel.setAttribute("aria-hidden", "false");
  editPanel.classList.add("show");
}

export function closeEditPanel() {
  editPanel.classList.remove("show");
  editPanel.setAttribute("aria-hidden", "true");
  editingBait = null;
}

saveEditBtn?.addEventListener("click", () => {
  if (!editingBait) return;
  editingBait.inggris = editinggris.value.trim();
  editingBait.indo = editIndo.value.trim();
  renderBaits();
  closeEditPanel();
  showToast("✅ Bait diperbarui (sementara)");
});

cancelEditBtn?.addEventListener("click", closeEditPanel);
// editPanel.js
import { elements, editingBait } from "./state.js";
import { renderBaits } from "./subbab.js";
import { showToast } from "./toast.js";

export function openEditPanel(bait) {
  elements.editinggris.value = bait.inggris || "";
  elements.editIndo.value = bait.indo || "";
  elements.editPanel.classList.add("show");
}

export function closeEditPanel() {
  elements.editPanel.classList.remove("show");
}

elements.saveEditBtn.addEventListener("click", () => {
  if (!editingBait) return;
  editingBait.inggris = elements.editinggris.value.trim();
  editingBait.indo = elements.editIndo.value.trim();
  renderBaits();
  closeEditPanel();
  showToast("✅ Bait diperbarui (sementara)");
});

elements.cancelEditBtn.addEventListener("click", closeEditPanel);
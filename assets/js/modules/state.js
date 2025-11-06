// state.js — variabel global & elemen DOM
export let currentBab = null;
export let currentSubbab = null;
export let cacheSubbabs = {};
export let baits = [];
export let showTranslation = true;
export let baitOffset = 0;
export let editingBait = null;
export let pendingRemoveId = null;

export const elements = {
  baitContainer: document.getElementById("baitContainer"),
  sidebar: document.getElementById("sidebar"),
  menuToggle: document.getElementById("menuToggle"),
  langSwitch: document.getElementById("langSwitch"),
  themeToggle: document.getElementById("themeToggle"),
  searchInput: document.getElementById("searchInput"),
  bookmarkToggle: document.getElementById("bookmark-toggle"),
  bookmarkPanel: document.getElementById("bookmark-panel"),
  bookmarkList: document.getElementById("bookmark-list"),
  bookmarkOverlay: document.getElementById("bookmark-overlay"),
  editPanel: document.getElementById("edit-panel"),
  editinggris: document.getElementById("edit-inggris"),
  editIndo: document.getElementById("edit-indo"),
  saveEditBtn: document.getElementById("saveEditBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  confirmDialog: document.getElementById("confirm-dialog"),
  cancelRemove: document.getElementById("cancelRemove"),
  confirmRemove: document.getElementById("confirmRemove"),
};
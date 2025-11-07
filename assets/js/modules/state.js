// global state shared
export let currentBab = null;
export let currentSubbab = null;
export let cacheSubbabs = {};
export let baits = [];
export let showTranslation = true;
export let baitOffset = 0;
export let editingBait = null;
export let pendingRemoveId = null;

// setter helper kalau perlu
export function setCurrentSubbab(v){ currentSubbab = v }
export function setBaits(arr){ baits = arr }
export function setOffset(n){ baitOffset = n }
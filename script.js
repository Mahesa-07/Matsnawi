/* Minimal interactive features:
 - search toggle + filtering
 - bookmark per line (localStorage)
 - notes modal per line (localStorage)
 - font size controls
 - page transition on internal links
*/

document.addEventListener('DOMContentLoaded', () => {
  // helpers
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));

  // search UI
  const openSearchBtns = qsa('#open-search');
  const searchBar = qs('#searchBar');
  const searchInput = qs('#searchInput');
  const clearSearch = qs('#clearSearch');

  openSearchBtns.forEach(b => b && b.addEventListener('click', () => {
    searchBar.style.display = (searchBar.style.display === 'block') ? 'none' : 'block';
    searchInput?.focus();
  }));

  clearSearch?.addEventListener('click', () => {
    searchInput.value = '';
    applySearch('');
  });

  searchInput?.addEventListener('input', e => applySearch(e.target.value));

  function applySearch(q) {
    const lines = qsa('.baits .bait');
    const qlow = (q || '').toLowerCase().trim();
    lines.forEach(li => {
      const text = li.querySelector('.line-text')?.innerText.toLowerCase() || '';
      if (!qlow || text.indexOf(qlow) !== -1) {
        li.style.display = '';
        // simple highlight
        const html = li.querySelector('.line-text').innerText;
        if (qlow) {
          const re = new RegExp(escapeRegExp(qlow), 'ig');
          li.querySelector('.line-text').innerHTML = html.replace(re, m => `<mark class="search-mark">${m}</mark>`);
        } else {
          li.querySelector('.line-text').innerText = html;
        }
      } else {
        li.style.display = 'none';
      }
    });
  }
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // bookmarks
  const BOOK_KEY = 'bookapp_bookmarks_v1';
  function loadBookmarks(){ try { return JSON.parse(localStorage.getItem(BOOK_KEY) || '[]'); } catch(e){ return []; } }
  function saveBookmarks(arr){ localStorage.setItem(BOOK_KEY, JSON.stringify(arr)); }

  function updateBookmarkUI() {
    const list = loadBookmarks();
    qsa('.baits .bait').forEach(li => {
      const id = li.dataset.lineId;
      const btn = li.querySelector('.btn-action.bookmark');
      if (list.includes(id)) btn.classList.add('bookmarked'); else btn.classList.remove('bookmarked');
    });
  }

  qsa('.btn-action.bookmark').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const li = e.currentTarget.closest('.bait');
      const id = li.dataset.lineId;
      let list = loadBookmarks();
      if (list.includes(id)) {
        list = list.filter(x => x !== id);
      } else {
        list.push(id);
      }
      saveBookmarks(list);
      updateBookmarkUI();
    });
  });

  // notes
  const NOTE_KEY = 'bookapp_notes_v1';
  function loadNotes(){ try { return JSON.parse(localStorage.getItem(NOTE_KEY) || '{}'); } catch(e){ return {}; } }
  function saveNotes(obj){ localStorage.setItem(NOTE_KEY, JSON.stringify(obj)); }

  let currentNoteLine = null;
  const noteModal = qs('#noteModal');
  const noteInput = qs('#noteInput');
  const noteLinePreview = qs('#noteLinePreview');
  const saveNoteBtn = qs('#saveNote');
  const deleteNoteBtn = qs('#deleteNote');

  // attach note buttons
  qsa('.btn-action.note').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const li = e.currentTarget.closest('.bait');
      const id = li.dataset.lineId;
      currentNoteLine = id;
      const notes = loadNotes();
      noteInput.value = notes[id] || '';
      noteLinePreview.textContent = li.querySelector('.line-text')?.innerText || '';
      const bs = new bootstrap.Modal(noteModal);
      bs.show();
      // mark UI
      updateNoteUI();
    });
  });

  saveNoteBtn?.addEventListener('click', () => {
    if (!currentNoteLine) return;
    const notes = loadNotes();
    const val = noteInput.value.trim();
    if (val) notes[currentNoteLine] = val;
    else delete notes[currentNoteLine];
    saveNotes(notes);
    updateNoteUI();
    bootstrap.Modal.getInstance(noteModal)?.hide();
  });

  deleteNoteBtn?.addEventListener('click', () => {
    if (!currentNoteLine) return;
    const notes = loadNotes();
    delete notes[currentNoteLine];
    saveNotes(notes);
    noteInput.value = '';
    updateNoteUI();
    bootstrap.Modal.getInstance(noteModal)?.hide();
  });

  function updateNoteUI(){
    const notes = loadNotes();
    qsa('.baits .bait').forEach(li => {
      const id = li.dataset.lineId;
      const btn = li.querySelector('.btn-action.note');
      if (notes[id]) btn.classList.add('has-note'); else btn.classList.remove('has-note');
    });
  }

  // font size controls
  const btnPlus = qs('#btn-font-plus');
  const btnMinus = qs('#btn-font-minus');
  const FONT_KEY = 'bookapp_fontsize_v1';
  function getFontSize(){ return parseInt(localStorage.getItem(FONT_KEY) || '18', 10); }
  function applyFontSize(size){ document.documentElement.style.setProperty('--base-font-size', size + 'px'); localStorage.setItem(FONT_KEY, String(size)); }
  btnPlus?.addEventListener('click', () => applyFontSize(getFontSize() + 1));
  btnMinus?.addEventListener('click', () => applyFontSize(Math.max(12, getFontSize() - 1)));

  // page transition for internal links
  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // only intercept local html links
    if (href.endsWith('.html') || href.startsWith('./') || href === 'index.html' || href.startsWith('#')) {
      // allow normal anchors
      e.preventDefault();
      document.body.classList.remove('page-enter');
      document.body.classList.add('page-exit');
      setTimeout(() => { window.location.href = href; }, 260);
    }
  });

  // initial setup
  updateBookmarkUI();
  updateNoteUI();
  applyFontSize( getFontSize() );

  // reveal enter animation (remove then add to retrigger)
  requestAnimationFrame(() => {
    document.body.classList.remove('page-enter');
    void document.body.offsetWidth;
    document.body.classList.add('page-enter');
  });
});

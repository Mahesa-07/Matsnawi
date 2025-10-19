/* Matsnawi01 — interaksi: drawer, search, nav, bookmark, footnote */
document.addEventListener('DOMContentLoaded', () => {
  const btnDrawer = document.getElementById('btnDrawer');
  const drawer = document.getElementById('drawer');
  const closeDrawer = document.getElementById('closeDrawer');
  const overlay = document.getElementById('overlay');
  const toc = document.querySelector('.toc');

  const btnSearch = document.getElementById('btnSearch');
  const searchBox = document.getElementById('searchBox');
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');

  const btnBookmark = document.getElementById('btnBookmark');

  const chapters = Array.from(document.querySelectorAll('.chapter'));

  const fnPopup = document.getElementById('fnPopup');
  const fnText = document.getElementById('fnText');
  const fnClose = document.getElementById('fnClose');

  // Drawer open/close
  function openDrawer(){ drawer.classList.add('open'); overlay.classList.add('show'); drawer.setAttribute('aria-hidden','false'); }
  function closeDrawerFn(){ drawer.classList.remove('open'); overlay.classList.remove('show'); drawer.setAttribute('aria-hidden','true'); }
  btnDrawer.addEventListener('click', openDrawer);
  closeDrawer.addEventListener('click', closeDrawerFn);
  overlay.addEventListener('click', closeDrawerFn);

  // TOC navigation (smooth)
  toc.addEventListener('click', e => {
    const a = e.target.closest('a[data-target]');
    if(!a) return;
    e.preventDefault();
    const id = a.dataset.target;
    showChapter(id);
    closeDrawerFn();
  });

  // Show chapter by id
  function showChapter(id){
    chapters.forEach(c => c.classList.remove('active'));
    const target = document.getElementById(id);
    if(!target) return;
    target.classList.add('active');
    window.scrollTo({top:0, behavior:'smooth'});
    // update location hash without jumping
    history.replaceState(null, '', '#' + id);
  }

  // Search toggle & search behavior
  btnSearch.addEventListener('click', () => {
    const visible = searchBox.style.display === 'flex';
    searchBox.style.display = visible ? 'none' : 'flex';
    if(!visible) setTimeout(()=> searchInput.focus(), 120);
  });
  clearSearch.addEventListener('click', () => {
    searchInput.value = ''; filterChapters(''); searchBox.style.display = 'none';
  });
  function filterChapters(q){
    q = (q||'').trim().toLowerCase();
    chapters.forEach(ch => {
      const text = ch.textContent.toLowerCase();
      ch.style.display = q ? (text.includes(q) ? 'block' : 'none') : 'block';
    });
  }
  searchInput.addEventListener('input', e => filterChapters(e.target.value));

  // Chapter nav buttons (prev/next)
  document.querySelectorAll('.nav-chapter button').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = btn.dataset.target;
      showChapter(id);
    });
  });

  // Bookmark (store active chapter id + inner scroll)
  btnBookmark.addEventListener('click', () => {
    const active = document.querySelector('.chapter.active') || chapters[0];
    const payload = { id: active.id, y: active.scrollTop || 0 };
    localStorage.setItem('matsnawi_bookmark', JSON.stringify(payload));
    btnBookmark.animate([{transform:'scale(1.06)'},{transform:'scale(1)'}], {duration:160});
    alert('📍 Posisi bacaan tersimpan: ' + active.dataset.title);
  });

  // Restore bookmark
  const raw = localStorage.getItem('matsnawi_bookmark');
  if(raw){
    try{
      const obj = JSON.parse(raw);
      if(obj && obj.id && document.getElementById(obj.id)){
        showChapter(obj.id);
        setTimeout(()=> { const ch = document.getElementById(obj.id); if(ch) ch.scrollTop = obj.y || 0; }, 220);
      }
    }catch(e){}
  }

  // Footnote: open popup on tap/click
  document.querySelectorAll('.fn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const note = btn.dataset.note || '';
      fnText.textContent = note;
      fnPopup.hidden = false;
      overlay.classList.add('show');
      // prevent drawer overlay confusion
      overlay.addEventListener('click', closeFnPopupOnce);
    });
  });
  function closeFnPopupOnce(){
    fnPopup.hidden = true;
    overlay.classList.remove('show');
    overlay.removeEventListener('click', closeFnPopupOnce);
  }
  fnClose.addEventListener('click', () => { fnPopup.hidden = true; overlay.classList.remove('show'); });

  // small helpers: goTop button
  document.getElementById('goTop').addEventListener('click', () => { window.scrollTo({top:0,behavior:'smooth'}); closeDrawerFn(); });

  // Hash navigation (open chapter if hash present)
  if(location.hash){
    const id = location.hash.replace('#','');
    if(document.getElementById(id)) setTimeout(()=> showChapter(id), 120);
  }
});

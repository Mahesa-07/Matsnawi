// ==============================================
// 🌿 Matsnawi Digital — versi lengkap & stabil
// ==============================================

document.addEventListener('DOMContentLoaded', ()=>{

  const menuBtn = document.getElementById('menu-btn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const sidebarSearch = document.getElementById('sidebarSearch');
  const headerSearch = document.getElementById('headerSearch');
  const themeToggle = document.getElementById('themeToggle');
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');
  const bookmarkToggle = document.getElementById('bookmarkToggle');
  const bookmarkPanel = document.getElementById('bookmarkPanel');
  const bookmarkList = document.getElementById('bookmarkList');

  let savedBookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

  // ⏳ Loading hilang lembut
  function hideLoading(){
    loading.classList.add('hide');
    setTimeout(()=>loading.remove(),700);
  }

  // 📜 Sidebar
  menuBtn.addEventListener('click', ()=>{
    sidebar.classList.toggle('active');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', ()=>{
    sidebar.classList.remove('active');
    overlay.classList.remove('show');
  });

  // 🔍 Cari bab di sidebar
  sidebarSearch.addEventListener('input', e=>{
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#toc li').forEach(li=>{
      li.style.display = li.textContent.toLowerCase().includes(q) ? 'block' : 'none';
    });
  });

  // 🌌 Efek bokeh lembut
  (function(){
    const canvas = document.getElementById('bokeh-bg');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let w,h, particles=[];
    function resize(){
      w=canvas.width=innerWidth; h=canvas.height=innerHeight;
      particles=[];
      const count = innerWidth<700 ? 30 : 60;
      for(let i=0;i<count;i++){
        particles.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*8+2,dx:(Math.random()-0.5)*0.25,dy:(Math.random()-0.5)*0.25,alpha:Math.random()*0.4});
      }
    }
    resize(); window.addEventListener('resize',()=>setTimeout(resize,120));
    function draw(){
      ctx.clearRect(0,0,w,h);
      for(const p of particles){
        const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
        g.addColorStop(0,`rgba(199,162,90,${p.alpha})`);
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fill();
        p.x+=p.dx; p.y+=p.dy;
        if(p.x<0||p.x>w)p.dx*=-1;
        if(p.y<0||p.y>h)p.dy*=-1;
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // ✨ Pencarian teks di konten
  headerSearch.addEventListener('input', debounce(e=>{
    const q=e.target.value.trim();
    clearHighlights();
    if(!q) return;
    const re=new RegExp(escapeRegExp(q),'gi');
    document.querySelectorAll('.content p').forEach(p=>{
      const txt=p.textContent;
      p.innerHTML=txt.replace(re,m=>`<mark class="hl">${m}</mark>`)+'<button class="options-btn">⋮</button>';
    });
  },200));

  // 💫 Menu opsi: Catatan & Bookmark
  document.addEventListener('click', e => {
    const btn = e.target.closest('.options-btn');
    const menu = e.target.closest('.options-menu');

    // Tutup menu jika klik di luar
    if (!btn && !menu) {
      document.querySelectorAll('.options-menu').forEach(m => m.remove());
      return;
    }

    // Klik tombol ⋮ → buka menu
    if (btn) {
      const p = btn.closest('p');
      if (!p) return;
      document.querySelectorAll('.options-menu').forEach(m => m.remove());
      const div = document.createElement('div');
      div.className = 'options-menu';
      div.innerHTML = `
        <button class="show-note">Catatan</button>
        <button class="bookmark">Tandai Kalimat</button>
      `;
      p.appendChild(div);
      return;
    }

    // Klik di dalam menu
    if (menu) {
      const p = menu.closest('p');

      // ✨ Popup Catatan elegan
      if (e.target.classList.contains('show-note')) {
        const note = p.dataset.note || 'Tidak ada catatan.';
        menu.remove();

        const popup = document.createElement('div');
        popup.className = 'note-popup';
        popup.innerHTML = `
          <div class="note-box">
            <div style="margin-bottom:8px;">${note}</div>
            <button class="close-note">Tutup</button>
          </div>
        `;
        document.body.appendChild(popup);

        popup.querySelector('.close-note').addEventListener('click', ()=>{
          popup.classList.add('fade');
          setTimeout(()=>popup.remove(),250);
        });
      }

      // 🔖 Tandai Kalimat
      if (e.target.classList.contains('bookmark')) {
        p.classList.toggle('bookmarked');
        menu.remove();
        const text = p.textContent.trim();
        if (p.classList.contains('bookmarked')) {
          savedBookmarks.push(text);
        } else {
          savedBookmarks = savedBookmarks.filter(t => t !== text);
        }
        refreshBookmarkPanel();
        localStorage.setItem('bookmarks', JSON.stringify(savedBookmarks));

        const msg = document.createElement('span');
        msg.textContent = p.classList.contains('bookmarked') ? '📖 Ditandai' : '❌ Dihapus';
        msg.style.position = 'absolute';
        msg.style.right = '8px';
        msg.style.bottom = '-6px';
        msg.style.color = 'var(--gold)';
        msg.style.fontSize = '.85em';
        msg.style.opacity = '0';
        p.appendChild(msg);
        setTimeout(() => { msg.style.transition = 'opacity .4s'; msg.style.opacity = '1'; }, 10);
        setTimeout(() => msg.remove(), 1200);
      }
    }
  });

  // 🌿 Sistem Bookmark Panel
  function refreshBookmarkPanel() {
    bookmarkList.innerHTML = savedBookmarks.length
      ? savedBookmarks.map((b,i)=>`<li data-index="${i}">${b}</li>`).join('')
      : '<li><em>Belum ada kalimat ditandai</em></li>';
  }

  bookmarkToggle.addEventListener('click', ()=>{
    bookmarkPanel.classList.toggle('hidden');
    refreshBookmarkPanel();
  });

  bookmarkList.addEventListener('click', e=>{
    if(e.target.tagName === 'LI' && e.target.dataset.index){
      const text = e.target.textContent.trim();
      const p = Array.from(document.querySelectorAll('p')).find(el=>el.textContent.trim().includes(text));
      if(p){
        p.scrollIntoView({behavior:'smooth', block:'center'});
        p.animate([{background:'rgba(199,162,90,0.25)'},{background:'transparent'}],{duration:1200});
      }
    }
  });

  // 🌗 Tema gelap / terang
  themeToggle.addEventListener('click',()=>{
    document.body.classList.toggle('light');
    themeToggle.textContent=document.body.classList.contains('light')?'☀️':'🌙';
  });

  // 🌙 Transisi antar bab
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const href=a.getAttribute('href');
      if(href.startsWith('#')){
        e.preventDefault();
        const target=document.querySelector(href);
        if(!target)return;
        content.style.opacity=0;
        setTimeout(()=>{
          window.location.hash=href;
          content.style.opacity=1;
          target.scrollIntoView({behavior:'smooth',block:'start'});
        },250);
      }
    });
  });

  // 🧩 Fungsi bantu
  function escapeRegExp(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
  function debounce(fn,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),ms);};}
  function clearHighlights(){document.querySelectorAll('mark.hl').forEach(m=>m.outerHTML=m.innerHTML);}

  // 🌿 Jalankan loading fade-out
  setTimeout(hideLoading,600);
});
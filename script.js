// Toggle TOC (Daftar Isi)
const tocBtn = document.getElementById('tocBtn');
const toc = document.getElementById('toc');
tocBtn.addEventListener('click', () => toc.classList.toggle('active'));

// Mode terang/gelap
const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
});

// Navigasi antar bab otomatis via daftar isi
document.querySelectorAll('.toc a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const id = link.getAttribute('href').substring(1);
    document.querySelectorAll('.chapter').forEach(ch => ch.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    toc.classList.remove('active');
  });
});
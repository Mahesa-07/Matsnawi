
const chapters = document.querySelectorAll('.chapter');
let current = 0;

function showChapter(index) {
  chapters.forEach((ch, i) => {
    ch.classList.toggle('active', i === index);
  });
}

document.getElementById('nextBtn').addEventListener('click', () => {
  current = (current + 1) % chapters.length;
  showChapter(current);
});

document.getElementById('prevBtn').addEventListener('click', () => {
  current = (current - 1 + chapters.length) % chapters.length;
  showChapter(current);
});

document.getElementById('tocBtn').addEventListener('click', () => {
  document.getElementById('toc').classList.toggle('hidden');
});

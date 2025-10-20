// Event untuk tombol tampil/sembunyi kutipan
document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".toggle-quote");

  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const quote = button.nextElementSibling;
      const isHidden = quote.classList.toggle("hidden");

      if (isHidden) {
        button.textContent = "💫 Tampilkan Kutipan";
        quote.style.display = "none";
      } else {
        button.textContent = "🔒 Sembunyikan Kutipan";
        quote.style.display = "block";
        quote.style.animation = "fadeIn 0.6s ease";
      }
    });
  });
});

// Toggle navigasi untuk mobile
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

if (toggle) {
  toggle.addEventListener('click', () => {
    links.classList.toggle('show');
  });
}

// Scroll halus ke elemen saat klik tautan internal
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

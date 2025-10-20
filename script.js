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

// === Sidebar Toggle ===
const sidebar = document.getElementById('sidebar');
const openBtn = document.querySelector('.nav-toggle');
const closeBtn = document.getElementById('closeBtn');

// Buka sidebar
openBtn.addEventListener('click', () => {
  sidebar.classList.add('show');
});

// Tutup sidebar
closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('show');
});

// Tutup otomatis setelah klik link
document.querySelectorAll('.sidebar-links a').forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('show');
  });
});
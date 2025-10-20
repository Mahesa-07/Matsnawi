document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menu-btn");

  // === Sidebar Toggle ===
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("show");

    // Tombol memudar saat sidebar muncul
    if (sidebar.classList.contains("active")) {
      menuBtn.style.opacity = "0";
      menuBtn.style.pointerEvents = "none";
    } else {
      menuBtn.style.opacity = "1";
      menuBtn.style.pointerEvents = "auto";
    }
  });

  // Tutup sidebar saat klik overlay
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("show");

    // Tampilkan kembali tombol
    menuBtn.style.opacity = "1";
    menuBtn.style.pointerEvents = "auto";
  });

  // === Tombol Kutipan ===
  const toggleButtons = document.querySelectorAll(".toggle-quote");

  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const quote = button.nextElementSibling;
      const isHidden = quote.classList.toggle("hidden");

      if (isHidden) {
        button.textContent = "💫 Tampilkan Kutipan";
      } else {
        button.textContent = "🔒 Sembunyikan Kutipan";
        quote.style.animation = "fadeIn 0.6s ease";
      }
    });
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menu-btn");
  const themeToggle = document.getElementById("themeToggle");

  // === Sidebar Toggle ===
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("show");

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
    menuBtn.style.opacity = "1";
    menuBtn.style.pointerEvents = "auto";
  });

  // === Tombol Tema ===
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});
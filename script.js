document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menu-btn");
  const searchBox = document.getElementById("searchBox");

  // Sidebar toggle
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("show");
    menuBtn.style.opacity = sidebar.classList.contains("active") ? "0" : "1";
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("show");
    menuBtn.style.opacity = "1";
  });

  // Tombol kutipan
  document.querySelectorAll(".toggle-quote").forEach(btn => {
    btn.addEventListener("click", () => {
      const quote = btn.nextElementSibling;
      const hidden = quote.classList.toggle("hidden");
      btn.textContent = hidden ? "💫 Tampilkan Kutipan" : "🔒 Sembunyikan Kutipan";
      if (!hidden) quote.style.animation = "fadeIn 0.6s ease";
    });
  });

  // Pencarian daftar isi
  searchBox.addEventListener("input", e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll(".sidebar ul li").forEach(li => {
      const text = li.textContent.toLowerCase();
      li.style.display = text.includes(term) ? "block" : "none";
    });
  });

  // 🌌 Efek Bokeh dengan Glow
  const canvas = document.getElementById("bokeh-bg");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Buat partikel
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 8 + 2,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      glow: Math.random() * 0.8 + 0.3,
      color: `rgba(199,162,90,${Math.random() * 0.6})`
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      // Efek glow lembut
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fill();

      // Gerak lambat dan halus
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    requestAnimationFrame(animate);
  }
  animate();
});
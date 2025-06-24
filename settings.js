document.addEventListener('DOMContentLoaded', () => {
  const autoToggle = document.getElementById('auto-refresh-toggle');
  const message = document.getElementById('message');
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');

  // Force dark mode
  document.body.classList.add('dark');

  // Aurora particle background
  canvas.width = 450;
  canvas.height = 600;
  const particles = [];
  const auroraBands = [
    { y: 100, height: 50, color: 'rgba(96, 165, 250, 0.15)', speed: 0.02 },
    { y: 200, height: 60, color: 'rgba(96, 165, 250, 0.15)', speed: -0.03 },
  ];

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 1;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.speedY = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.4 + 0.2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
      this.opacity = Math.max(0.2, this.opacity + (Math.random() * 0.02 - 0.01));
    }
    draw() {
      ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < 30; i++) {
      particles.push(new Particle());
    }
  }

  function drawAurora() {
    auroraBands.forEach(band => {
      band.y += band.speed;
      if (band.y < -band.height) band.y = canvas.height;
      if (band.y > canvas.height) band.y = -band.height;
      ctx.fillStyle = band.color;
      ctx.fillRect(0, band.y, canvas.width, band.height);
    });
  }

  let isAnimating = true;
  function animateBackground() {
    if (!isAnimating) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAurora();
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateBackground);
  }

  initParticles();
  animateBackground();

  window.addEventListener('blur', () => isAnimating = false);
  window.addEventListener('focus', () => {
    isAnimating = true;
    animateBackground();
  });

  // Load toggle state
  chrome.storage.local.get('autoRefreshEnabled', (data) => {
    autoToggle.checked = data.autoRefreshEnabled || false;
  });

  // Toggle auto refresh
  autoToggle.addEventListener('change', () => {
    chrome.storage.local.set({ autoRefreshEnabled: autoToggle.checked }, () => {
      chrome.runtime.sendMessage({ action: autoToggle.checked ? 'enableAuto' : 'disableAuto' });
      message.textContent = 'Settings saved!';
      message.classList.remove('error');
      message.style.display = 'block';
      setTimeout(() => message.style.display = 'none', 2000);
    });
  });
});

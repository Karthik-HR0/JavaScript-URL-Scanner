document.addEventListener('DOMContentLoaded', () => {
  const urlList = document.getElementById('url-list');
  const copyBtn = document.getElementById('copy-btn');
  const message = document.getElementById('message');
  const urlCount = document.querySelector('#url-count span');
  const settingsBtn = document.getElementById('settings-btn');
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
    for (let i = 0; i < 30; i++) { // Reduced for performance
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

  // Pause animation when popup is not visible
  window.addEventListener('blur', () => isAnimating = false);
  window.addEventListener('focus', () => {
    isAnimating = true;
    animateBackground();
  });

  // Open settings page
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Sanitize URLs
  function sanitizeUrl(url) {
    try {
      new URL(url);
      return url.endsWith('.js') ? decodeURIComponent(url).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    } catch {
      return '';
    }
  }

  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError || !tabs[0]) {
      const li = document.createElement('li');
      li.innerHTML = `<i class="bx bx-error-circle"></i> Error: ${chrome.runtime.lastError?.message || 'No tab found'}`;
      urlList.appendChild(li);
      setTimeout(() => li.classList.add('show'), 100);
      message.textContent = 'Failed to fetch URLs';
      message.classList.add('error');
      message.style.display = 'block';
      setTimeout(() => message.style.display = 'none', 2000);
      return;
    }
    const tabId = tabs[0].id;
    chrome.storage.local.get([`urls_${tabId}`], (result) => {
      const urls = result[`urls_${tabId}`] || [];
      urlCount.textContent = urls.length;
      if (urls.length === 0) {
        const li = document.createElement('li');
        li.innerHTML = '<i class="bx bx-info-circle"></i> No JavaScript files found';
        urlList.appendChild(li);
        setTimeout(() => li.classList.add('show'), 100);
        copyBtn.disabled = true;
        message.textContent = 'No JavaScript files found';
        message.classList.add('error');
        message.style.display = 'block';
        setTimeout(() => message.style.display = 'none', 2000);
        return;
      }

      copyBtn.disabled = false;
      urls.forEach((url, index) => {
        const sanitizedUrl = sanitizeUrl(url);
        if (!sanitizedUrl) return; // Skip invalid URLs
        const li = document.createElement('li');
        const icon = document.createElement('i');
        icon.className = 'bx bx-link-alt';
        const a = document.createElement('a');
        a.href = url;
        a.textContent = sanitizedUrl;
        a.target = '_blank';
        const copySingleBtn = document.createElement('button');
        copySingleBtn.className = 'copy-single-btn';
        copySingleBtn.innerHTML = '<i class="bx bx-copy"></i>';
        copySingleBtn.title = 'Copy URL';
        copySingleBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(url).then(() => {
            message.textContent = 'URL copied!';
            message.classList.remove('error');
            message.style.display = 'block';
            setTimeout(() => message.style.display = 'none', 2000);
          }).catch(() => {
            message.textContent = 'Copy failed!';
            message.classList.add('error');
            message.style.display = 'block';
            setTimeout(() => message.style.display = 'none', 2000);
          });
        });
        li.appendChild(icon);
        li.appendChild(a);
        li.appendChild(copySingleBtn);
        urlList.appendChild(li);
        setTimeout(() => li.classList.add('show'), index * 100 + 100);
      });

      copyBtn.addEventListener('click', () => {
        const text = urls.join('\n');
        navigator.clipboard.writeText(text).then(() => {
          message.textContent = 'All URLs copied!';
          message.classList.remove('error');
          message.style.display = 'block';
          setTimeout(() => message.style.display = 'none', 2000);
        }).catch(() => {
          message.textContent = 'Copy failed!';
          message.classList.add('error');
          message.style.display = 'block';
          setTimeout(() => message.style.display = 'none', 2000);
        });
      });
    });
  });
});


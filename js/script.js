/**
 * Bhavya Streets Cafe — Main JavaScript
 * Includes: Preloader, Navbar, Smooth Scroll, AOS, Parallax,
 *           Hero Particles, Counter Animation, Reviews Slider,
 *           Menu Lightbox, Lazy Loading
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. PRELOADER
  ============================================================ */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 1800);
  });

  /* ============================================================
     2. NAVBAR — Sticky + Active link + Hamburger
  ============================================================ */
  const navbar   = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');

  // Scroll: add class when past 80px
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
    updateActiveNav();
    handleBackToTop();
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close nav on link click (mobile)
  allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on backdrop click
  document.addEventListener('click', e => {
    if (navLinks.classList.contains('open') && !navbar.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  // Active link based on scroll position
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 100;
    sections.forEach(sec => {
      const id = sec.getAttribute('id');
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      const link = document.querySelector(`.nav-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < bottom);
      }
    });
  }

  /* ============================================================
     3. BACK TO TOP BUTTON
  ============================================================ */
  const btt = document.getElementById('backToTop');
  function handleBackToTop() {
    btt.classList.toggle('visible', window.scrollY > 400);
  }

  /* ============================================================
     4. HERO PARTICLE CANVAS
  ============================================================ */
  const particleContainer = document.getElementById('heroParticles');
  if (particleContainer) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1';
    particleContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resizeCanvas() {
      canvas.width  = particleContainer.offsetWidth;
      canvas.height = particleContainer.offsetHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * canvas.width;
        this.y  = Math.random() * canvas.height;
        this.r  = Math.random() * 2 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.alpha = Math.random() * 0.35 + 0.05;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245,197,24,${this.alpha})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.min(120, Math.floor(canvas.width * canvas.height / 8000));
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    initParticles();
    animateParticles();

    const ro = new ResizeObserver(() => {
      resizeCanvas();
      initParticles();
    });
    ro.observe(particleContainer);
  }

  /* ============================================================
     5. INTERSECTION OBSERVER — AOS (Animate On Scroll)
  ============================================================ */
  const aosEls = document.querySelectorAll('[data-aos]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    aosEls.forEach(el => observer.observe(el));
  } else {
    aosEls.forEach(el => el.classList.add('aos-animate'));
  }

  /* ============================================================
     6. COUNTER ANIMATION
  ============================================================ */
  const counters = document.querySelectorAll('.stat-number[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isDecimal = String(target).includes('.');
        const duration = 1800;
        const step = 16;
        const increment = target / (duration / step);
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = isDecimal
            ? current.toFixed(1)
            : Math.floor(current);
          if (current >= target) {
            el.textContent = isDecimal ? target.toFixed(1) : target;
            if (target === 30) el.textContent = '30 Min';
          }
        }, step);

        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObserver.observe(el));

  /* ============================================================
     7. REVIEWS SLIDER
  ============================================================ */
  const track    = document.getElementById('reviewsTrack');
  const dotsEl   = document.getElementById('revDots');
  const cards    = document.querySelectorAll('.review-card');
  let revIndex   = 0;
  let autoPlay;

  function getVisible() {
    if (window.innerWidth < 480) return 1;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function totalSlides() {
    return Math.ceil(cards.length / getVisible());
  }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const d = document.createElement('div');
      d.className = 'rdot' + (i === revIndex ? ' active' : '');
      d.addEventListener('click', () => { revIndex = i; updateSlider(); });
      dotsEl.appendChild(d);
    }
  }

  function updateSlider() {
    const visible   = getVisible();
    const cardWidth = track.clientWidth / visible;
    const gap       = 24;
    const offset    = revIndex * (cardWidth + gap) * visible;
    track.style.transform = `translateX(-${offset}px)`;
    document.querySelectorAll('.rdot').forEach((d, i) => {
      d.classList.toggle('active', i === revIndex);
    });
  }

  window.slideReviews = function(dir) {
    const ts = totalSlides();
    revIndex = (revIndex + dir + ts) % ts;
    updateSlider();
    resetAutoPlay();
  };

  function resetAutoPlay() {
    clearInterval(autoPlay);
    autoPlay = setInterval(() => slideReviews(1), 5000);
  }

  buildDots();
  updateSlider();
  resetAutoPlay();

  window.addEventListener('resize', () => {
    buildDots();
    updateSlider();
  });

  // Touch/drag support for reviews
  let touchStartX = 0;
  let isDragging  = false;
  let dragStartX  = 0;

  track.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX;
  });
  track.addEventListener('mousemove', e => {
    if (!isDragging) return;
    e.preventDefault();
  });
  track.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 50) slideReviews(diff > 0 ? 1 : -1);
  });
  track.addEventListener('mouseleave', () => { isDragging = false; });

  track.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) slideReviews(diff > 0 ? 1 : -1);
  });

  /* ============================================================
     8. MENU LIGHTBOX
  ============================================================ */
  const menuImages = [
    'images/menu1.png',
    'images/menu2.png',
    'images/menu3.png',
    'images/bhavya2.jpeg',
    'images/bhavya3.jpeg',
    'images/bhavya1.jpeg'
  ];
  let currentMenuSlide = 0;
  const popup    = document.getElementById('menuPopup');
  const popupImg = document.getElementById('popupImg');
  const pdots    = document.getElementById('popupDots');

  function buildPopupDots() {
    if (!pdots) return;
    pdots.innerHTML = '';
    menuImages.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'pdot' + (i === currentMenuSlide ? ' active' : '');
      d.addEventListener('click', () => { currentMenuSlide = i; updatePopup(); });
      pdots.appendChild(d);
    });
  }

  function updatePopup() {
    popupImg.src = menuImages[currentMenuSlide];
    document.querySelectorAll('.pdot').forEach((d, i) =>
      d.classList.toggle('active', i === currentMenuSlide));
  }

  window.openMenuPopup = function(index) {
    currentMenuSlide = index;
    popup.classList.add('open');
    document.body.style.overflow = 'hidden';
    buildPopupDots();
    updatePopup();
  };

  window.closeMenuPopup = function() {
    popup.classList.remove('open');
    document.body.style.overflow = '';
  };

  window.changeMenuSlide = function(dir) {
    currentMenuSlide = (currentMenuSlide + dir + menuImages.length) % menuImages.length;
    updatePopup();
    document.querySelectorAll('.pdot').forEach((d, i) =>
      d.classList.toggle('active', i === currentMenuSlide));
  };

  // Close popup on backdrop click
  popup.addEventListener('click', e => {
    if (e.target === popup) closeMenuPopup();
  });

  // Keyboard navigation for popup
  document.addEventListener('keydown', e => {
    if (!popup.classList.contains('open')) return;
    if (e.key === 'Escape')       closeMenuPopup();
    if (e.key === 'ArrowRight')   changeMenuSlide(1);
    if (e.key === 'ArrowLeft')    changeMenuSlide(-1);
  });

  /* ============================================================
     9. LAZY LOADING (native + fallback polyfill)
  ============================================================ */
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.dataset.src) img.src = img.dataset.src;
    });
  } else {
    // Fallback for older browsers
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const lazyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          lazyObserver.unobserve(img);
        }
      });
    });
    lazyImgs.forEach(img => lazyObserver.observe(img));
  }

  // Add loaded class after each image loads (for fade-in)
  document.querySelectorAll('img').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'));
    }
  });

  /* ============================================================
     10. PARALLAX HERO on mouse move
  ============================================================ */
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    document.addEventListener('mousemove', e => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const xShift = ((clientX / innerWidth) - 0.5) * 20;
      const yShift = ((clientY / innerHeight) - 0.5) * 10;
      heroSection.style.backgroundPosition = `calc(50% + ${xShift}px) calc(50% + ${yShift}px)`;
    }, { passive: true });
  }

  /* ============================================================
     11. SMOOTH LINK HIGHLIGHT GLOW on hover
  ============================================================ */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      btn.style.setProperty('--mouse-x', `${x}%`);
      btn.style.setProperty('--mouse-y', `${y}%`);
    });
  });

  /* ============================================================
     12. FLOATING ICONS — stagger restart on visibility
  ============================================================ */
  // Already handled via CSS animation

  /* ============================================================
     13. GALLERY LIGHTBOX (optional click to zoom)
  ============================================================ */
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (!img) return;
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:9000;
        background:rgba(0,0,0,0.92);
        display:flex;align-items:center;justify-content:center;
        cursor:zoom-out;
        animation:fadeIn 0.3s ease;
      `;
      const bigImg = document.createElement('img');
      bigImg.src = img.src;
      bigImg.style.cssText = 'max-width:90vw;max-height:90vh;border-radius:12px;object-fit:contain;';
      overlay.appendChild(bigImg);
      overlay.addEventListener('click', () => overlay.remove());
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
      });
      document.body.appendChild(overlay);
    });
  });

  /* ============================================================
     14. DISH CARD — tilt effect on mouse move
  ============================================================ */
  document.querySelectorAll('.dish-card:not(.dish-cta-card)').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ============================================================
     15. OPEN HOURS STATUS — dynamic "Open Now" / "Opens at 6 PM"
  ============================================================ */
  const openEls = document.querySelectorAll('.open-now');
  const now = new Date();
  const hour = now.getHours();
  const isOpen = hour >= 18; // 6 PM onwards

  openEls.forEach(el => {
    el.textContent = isOpen ? '🟢 Open Now' : '🔴 Opens at 6 PM';
    el.style.color = isOpen ? '#25d366' : '#ff6b6b';
  });

  /* ============================================================
     16. CONSOLE BRANDING
  ============================================================ */
  console.log('%c🍜 Bhavya Streets Cafe Website', 'color:#f5c518;font-size:1.2rem;font-weight:bold;');
  console.log('%cBest Momos in Kalwa | Best Sandwich & Burger in Parsik Nagar', 'color:#aaa');

  /* ============================================================
     17. SERVICE WORKER (basic offline support)
  ============================================================ */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

});

/* ============================================================
   CSS @keyframes injected via JS for gallery overlay fadeIn
   ============================================================ */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
`;
document.head.appendChild(style);

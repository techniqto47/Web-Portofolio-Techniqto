/* ═══════════════════════════════════════════════════════
   TECHNIQTO — SMAN 47 JAKARTA
   script.js
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ─── PARTICLE CANVAS ────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles, animFrame;

  // Config
  const CONFIG = {
    count:        90,
    baseRadius:   1.2,
    speedMin:     0.12,
    speedMax:     0.45,
    connectDist:  130,
    opacity:      0.55,
    colorPrimary: [242, 138, 46],    // orange
    colorSecond:  [45, 212, 191],    // teal
    colorThird:   [124, 58, 237],    // purple
  };

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomColor() {
    const palette = [CONFIG.colorPrimary, CONFIG.colorSecond, CONFIG.colorThird];
    return palette[Math.floor(Math.random() * palette.length)];
  }

  function createParticle() {
    const color = randomColor();
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * (CONFIG.speedMax - CONFIG.speedMin) * 2 + CONFIG.speedMin * (Math.random() > 0.5 ? 1 : -1),
      vy: (Math.random() - 0.5) * (CONFIG.speedMax - CONFIG.speedMin) * 2 + CONFIG.speedMin * (Math.random() > 0.5 ? 1 : -1),
      r:  Math.random() * CONFIG.baseRadius + 0.5,
      color,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: CONFIG.count }, createParticle);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.02;

      // Wrap edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      const pulseR = p.r + Math.sin(p.pulse) * 0.3;
      const [r, g, b] = p.color;

      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${CONFIG.opacity})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDist) {
          const alpha = (1 - dist / CONFIG.connectDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animFrame = requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(canvas);

  init();
  tick();

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cancelAnimationFrame(animFrame);
    ctx.clearRect(0, 0, W, H);
  }
})();


/* ─── NAVBAR SCROLL EFFECT ───────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');

  if (!nav) return;

  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);
    lastY = y;
  }, { passive: true });

  // Burger toggle
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animate burger
      const spans = burger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    });

    // Close on link click
    menu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        document.body.style.overflow = '';
        const spans = burger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      });
    });
  }
})();


/* ─── SMOOTH ACTIVE NAV LINKS ────────────────────────── */
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__links a');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--clr-cream)'
              : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => observer.observe(s));
})();


/* ─── COUNTER ANIMATION ──────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat__number[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1400;
    const startTime = performance.now();

    function update(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(c => observer.observe(c));
})();


/* ─── TIMELINE SCROLL REVEAL ─────────────────────────── */
(function initTimeline() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  items.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(item);
  });
})();


/* ─── DIVISION CARDS STAGGER ─────────────────────────── */
(function initDivisionCards() {
  const cards = document.querySelectorAll('.division-card');
  if (!cards.length) return;

  // Set initial state
  cards.forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const delay = parseFloat(card.dataset.delay || 0);
          setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(card);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach((card, i) => {
    card.dataset.delay = i * 120;
    observer.observe(card);
  });
})();


/* ─── REPO CARDS STAGGER ─────────────────────────────── */
(function initRepoCards() {
  const cards = document.querySelectorAll('.repo-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.55s var(--ease-out), transform 0.55s var(--ease-out), border-color 0.3s, box-shadow 0.3s';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const delay = parseFloat(card.dataset.delay || 0);
          setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(card);
        }
      });
    },
    { threshold: 0.1 }
  );

  cards.forEach((card, i) => {
    card.dataset.delay = i * 100;
    observer.observe(card);
  });
})();


/* ─── ABOUT SECTION REVEAL ───────────────────────────── */
(function initAboutReveal() {
  const aboutLeft  = document.querySelector('.about__text');
  const aboutRight = document.querySelector('.about__visual');
  if (!aboutLeft || !aboutRight) return;

  const els = [aboutLeft, aboutRight];
  els.forEach((el, i) => {
    el.style.opacity   = '0';
    el.style.transform = i === 0 ? 'translateX(-24px)' : 'translateX(24px)';
    el.style.transition = 'opacity 0.8s var(--ease-out), transform 0.8s var(--ease-out)';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el === aboutRight ? 150 : 0;
          setTimeout(() => {
            el.style.opacity   = '1';
            el.style.transform = 'translate(0)';
          }, delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.2 }
  );

  els.forEach(el => observer.observe(el));
})();


/* ─── CONTACT SECTION REVEAL ─────────────────────────── */
(function initContactReveal() {
  const inner = document.querySelector('.contact__inner');
  if (!inner) return;

  inner.style.opacity   = '0';
  inner.style.transform = 'translateY(32px)';
  inner.style.transition = 'opacity 0.9s var(--ease-out), transform 0.9s var(--ease-out)';

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(inner);
})();


/* ─── SECTION HEADER REVEAL ──────────────────────────── */
(function initSectionHeaders() {
  const headers = document.querySelectorAll('.section__header');

  headers.forEach(header => {
    header.style.opacity   = '0';
    header.style.transform = 'translateY(20px)';
    header.style.transition = 'opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out)';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  headers.forEach(h => observer.observe(h));
})();


/* ─── CURSOR GLOW (desktop only) ─────────────────────── */
(function initCursorGlow() {
  if (window.innerWidth < 768) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(242,138,46,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
    opacity: 0;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX  = 0, glowY  = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;
    glow.style.left = glowX + 'px';
    glow.style.top  = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }

  animateGlow();
})();


/* ─── GALLERY LIGHTBOX ───────────────────────────────── */
(function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery__item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (!galleryItems.length) return;

  let currentIndex = 0;
  const images = Array.from(galleryItems).map(item => item.dataset.image);

  function openLightbox(index) {
    currentIndex = index;
    lightboxImage.src = images[currentIndex];
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImage.src = images[currentIndex];
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImage.src = images[currentIndex];
  }

  // Event listeners
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxNext.addEventListener('click', showNext);
  lightboxPrev.addEventListener('click', showPrev);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;

    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'Escape') closeLightbox();
  });

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Stagger gallery items animation
  galleryItems.forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(24px)';
    item.style.transition = 'opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out)';
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const delay = parseFloat(item.dataset.delay || 0);
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, delay);
          observer.unobserve(item);
        }
      });
    },
    { threshold: 0.15 }
  );

  galleryItems.forEach((item, i) => {
    item.dataset.delay = i * 120;
    observer.observe(item);
  });
})();
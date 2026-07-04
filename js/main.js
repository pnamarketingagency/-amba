/* =========================================================================
   $AMBA / wolfsamba — interaction layer
   Boot sequence · Lenis kinetic scroll · GSAP reveals · text splintering
   YouTube hero loop (36–138s) · theatre lightbox · terminal feed · nav · cursor
   ========================================================================= */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOUCH = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------------------------------------------------------------------
     1. TEXT SPLINTERING  — split .splinter headings into per-char spans
     --------------------------------------------------------------------- */
  function splitText() {
    $$('.splinter').forEach((el) => {
      const text = el.textContent;
      el.setAttribute('aria-label', text);
      el.textContent = '';
      [...text].forEach((ch) => {
        const span = document.createElement('span');
        span.className = 'char';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = ch === ' ' ? ' ' : ch;
        el.appendChild(span);
      });
    });
  }

  /* ---------------------------------------------------------------------
     2. BOOT SEQUENCE
     --------------------------------------------------------------------- */
  function boot() {
    const boot = $('#boot');
    const log = $('#boot-log');
    const fill = $('#boot-fill');
    if (!boot) return Promise.resolve();

    const lines = [
      ['[ OK ] ', 'ok', 'CTOWN_OS v3.6 // cold boot'],
      ['[ .. ] ', 'dim', 'mounting /western_sydney ...'],
      ['[ OK ] ', 'ok', 'audio engine online'],
      ['[ .. ] ', 'dim', 'loading discography [WMUWIMI · WHITE TEE · FOREVER FALLIN]'],
      ['[WARN] ', 'warn', 'signal detected: ON THE BLOCK'],
      ['[ OK ] ', 'ok', 'establishing uplink @theallmightywolfsamba'],
      ['[ OK ] ', 'ok', 'PRINCE_OF_CTOWN authenticated'],
    ];

    const finish = () => {
      boot.classList.add('done');
      document.body.dataset.booted = 'true';
      setTimeout(() => boot.remove(), 650);
    };

    if (REDUCED) {
      log.innerHTML = lines.map((l) => `<span class="${l[1]}">${l[0]}</span>${l[2]}`).join('\n');
      if (fill) fill.style.width = '100%';
      setTimeout(finish, 400);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let i = 0;
      const step = () => {
        if (i < lines.length) {
          const l = lines[i];
          log.innerHTML += `<span class="${l[1]}">${l[0]}</span>${l[2]}\n`;
          if (fill) fill.style.width = `${Math.round(((i + 1) / lines.length) * 100)}%`;
          i++;
          setTimeout(step, 260 + Math.random() * 160);
        } else {
          setTimeout(() => { finish(); resolve(); }, 500);
        }
      };
      setTimeout(step, 300);
    });
  }

  /* ---------------------------------------------------------------------
     3. LENIS KINETIC SCROLL + GSAP SCROLLTRIGGER
     --------------------------------------------------------------------- */
  let lenis = null;
  function initScroll() {
    const hasGSAP = window.gsap && window.ScrollTrigger;
    if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

    if (!REDUCED && window.Lenis) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true, lerp: 0.09 });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      if (hasGSAP) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
      }
    }

    document.body.classList.add('reveal-ready');

    if (!hasGSAP) {
      // Fallback: reveal everything immediately
      $$('[data-reveal]').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }

    if (REDUCED) {
      $$('[data-reveal]').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
    } else {
      // Section content reveals
      $$('[data-reveal]').forEach((el) => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%' },
        });
      });

      // Text splintering on scroll for section/footer titles
      $$('.section-title.splinter, .footer-title.splinter').forEach((el) => {
        const chars = $$('.char', el);
        gsap.set(chars, { yPercent: 110, opacity: 0, rotateX: -80 });
        gsap.to(chars, {
          yPercent: 0, opacity: 1, rotateX: 0,
          duration: 0.6, ease: 'back.out(1.6)', stagger: 0.03,
          scrollTrigger: { trigger: el, start: 'top 85%' },
        });
      });
    }
  }

  /* ---------------------------------------------------------------------
     4. HERO INTRO (title splinter) — runs after boot
     --------------------------------------------------------------------- */
  function heroIntro() {
    if (!window.gsap) return;
    const chars = $$('#hero .hero-title .char');
    if (REDUCED || !chars.length) {
      gsap.set(chars, { opacity: 1, y: 0 });
      $$('#hero [data-reveal]').forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }
    gsap.set(chars, { yPercent: 120, opacity: 0, skewX: 12 });
    const tl = gsap.timeline();
    tl.to(chars, {
      yPercent: 0, opacity: 1, skewX: 0,
      duration: 0.7, ease: 'power4.out', stagger: 0.035,
    }).to('#hero [data-reveal]', {
      opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.12,
    }, '-=0.3');
  }

  /* ---------------------------------------------------------------------
     5. RANDOM GLITCH PULSE on branded headings
     --------------------------------------------------------------------- */
  function glitchPulse() {
    if (REDUCED) return;
    const targets = $$('.glitch');
    if (!targets.length) return;
    setInterval(() => {
      const el = targets[Math.floor(Math.random() * targets.length)];
      el.classList.add('is-glitching');
      setTimeout(() => el.classList.remove('is-glitching'), 400);
    }, 2600);
  }

  /* ---------------------------------------------------------------------
     6. YOUTUBE: hero background loop + theatre modal
     --------------------------------------------------------------------- */
  const HERO_ID = '9jAKxDFDbS4';
  const HERO_START = 36;
  const HERO_END = 138;
  let heroPlayer = null;
  let modalPlayer = null;
  let heroLoopTimer = null;

  window.onYouTubeIframeAPIReady = function () {
    // Hero background player
    if ($('#hero-video')) {
      heroPlayer = new YT.Player('hero-video', {
        videoId: HERO_ID,
        playerVars: {
          autoplay: 1, mute: 1, controls: 0, disablekb: 1, fs: 0,
          modestbranding: 1, rel: 0, playsinline: 1, start: HERO_START,
          iv_load_policy: 3, loop: 1, playlist: HERO_ID, cc_load_policy: 0,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            if (!REDUCED) e.target.playVideo();
            // Poll to loop the 36–138s segment
            heroLoopTimer = setInterval(() => {
              try {
                if (heroPlayer && heroPlayer.getCurrentTime && heroPlayer.getCurrentTime() >= HERO_END) {
                  heroPlayer.seekTo(HERO_START, true);
                }
              } catch (_) {}
            }, 500);
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) heroPlayer.seekTo(HERO_START, true);
          },
        },
      });
    }
  };

  function initMute() {
    const btn = $('#mute-toggle');
    if (!btn) return;
    const iconM = $('#icon-muted');
    const iconU = $('#icon-unmuted');
    const label = $('#mute-label');
    let muted = true;
    btn.addEventListener('click', () => {
      if (!heroPlayer || !heroPlayer.unMute) return;
      muted = !muted;
      if (muted) {
        heroPlayer.mute();
        iconM.classList.remove('hidden'); iconU.classList.add('hidden');
        label.textContent = 'SOUND OFF';
      } else {
        heroPlayer.unMute(); heroPlayer.setVolume(70);
        if (heroPlayer.playVideo) heroPlayer.playVideo();
        iconU.classList.remove('hidden'); iconM.classList.add('hidden');
        label.textContent = 'SOUND ON';
      }
    });
  }

  /* ----- Theatre modal ----- */
  function initTheatre() {
    const modal = $('#theatre-modal');
    if (!modal) return;
    let lastFocus = null;

    const open = (videoId) => {
      lastFocus = document.activeElement;
      modal.hidden = false;
      if (lenis) lenis.stop();
      document.body.style.overflow = 'hidden';
      // (Re)build the player each open for a clean start
      const mount = $('#modal-video');
      mount.innerHTML = '';
      const holder = document.createElement('div');
      holder.id = 'modal-video-inner';
      mount.appendChild(holder);
      if (window.YT && YT.Player) {
        modalPlayer = new YT.Player('modal-video-inner', {
          videoId,
          playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
        });
      } else {
        holder.outerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="Video player"></iframe>`;
      }
      $('.theatre-close', modal).focus();
      document.addEventListener('keydown', onKey);
    };

    const close = () => {
      modal.hidden = true;
      if (modalPlayer && modalPlayer.destroy) { try { modalPlayer.destroy(); } catch (_) {} modalPlayer = null; }
      $('#modal-video').innerHTML = '';
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      document.removeEventListener('keydown', onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // simple focus trap → keep focus on close btn
        e.preventDefault();
        $('.theatre-close', modal).focus();
      }
    };

    $$('.js-open-theatre').forEach((btn) => {
      btn.addEventListener('click', () => open(btn.dataset.yt || HERO_ID));
    });
    $$('.js-close-theatre', modal).forEach((el) => el.addEventListener('click', close));
  }

  /* ---------------------------------------------------------------------
     7. NAVIGATION — scroll state, anchor smooth-scroll, mobile menu
     --------------------------------------------------------------------- */
  function initNav() {
    const nav = $('#nav');
    const onScroll = () => {
      if (!nav) return;
      const y = window.scrollY || window.pageYOffset;
      nav.classList.toggle('is-scrolled', y > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const menu = $('#mobile-menu');
    const toggle = $('#nav-toggle');
    const setMenu = (open) => {
      menu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    if (toggle) toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));

    // Smooth anchor scrolling (works with or without Lenis)
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (menu && menu.classList.contains('is-open')) setMenu(false);
        if (lenis) {
          lenis.scrollTo(target, { offset: -10, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ---------------------------------------------------------------------
     8. TERMINAL LIVE FEED (typed)
     --------------------------------------------------------------------- */
  function initTerminal() {
    const feed = $('#terminal-feed');
    if (!feed) return;

    const lines = [
      { t: '<span class="p">$</span> whoami', d: 240 },
      { t: '  <span class="u">$amba</span> // aka wolfsamba — the Prince of CTown', d: 500 },
      { t: '<span class="p">$</span> cat ./location.txt', d: 240 },
      { t: '  Western Sydney // C-TOWN // AU', d: 500 },
      { t: '<span class="p">$</span> feed --pull @theallmightywolfsamba', d: 260 },
      { t: '  <span class="h">[LIVE]</span> new visual dropped: ON THE BLOCK', d: 420 },
      { t: '  <span class="h">[LIVE]</span> in studio — next wave loading...', d: 420 },
      { t: '  <span class="u">></span> tap the chips below to link up', d: 300 },
    ];

    const trigger = () => {
      if (feed.dataset.done) return;
      feed.dataset.done = 'true';
      if (REDUCED) {
        feed.innerHTML = lines.map((l) => l.t).join('\n') + '\n<span class="boot-caret"></span>';
        return;
      }
      let i = 0;
      const type = () => {
        if (i < lines.length) {
          feed.innerHTML += (i ? '\n' : '') + lines[i].t;
          i++;
          setTimeout(type, lines[i - 1].d);
        } else {
          feed.innerHTML += '\n<span class="boot-caret"></span>';
        }
      };
      type();
    };

    if (window.gsap && window.ScrollTrigger && !REDUCED) {
      ScrollTrigger.create({ trigger: feed, start: 'top 80%', once: true, onEnter: trigger });
    } else {
      // Fallback observer
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { trigger(); io.disconnect(); } });
      }, { threshold: 0.3 });
      io.observe(feed);
    }
  }

  /* ---------------------------------------------------------------------
     9. CUSTOM CURSOR
     --------------------------------------------------------------------- */
  function initCursor() {
    if (REDUCED || TOUCH) return;
    const dot = $('#cursor');
    if (!dot) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
    const render = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      dot.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(render);
    };
    render();
    const hot = 'a, button, .track-card, [tabindex="0"], .theatre-thumb, .social-chip';
    document.addEventListener('mouseover', (e) => { if (e.target.closest(hot)) dot.classList.add('is-hot'); });
    document.addEventListener('mouseout', (e) => { if (e.target.closest(hot)) dot.classList.remove('is-hot'); });
  }

  /* ---------------------------------------------------------------------
     BOOTSTRAP
     --------------------------------------------------------------------- */
  function main() {
    $('#year') && ($('#year').textContent = new Date().getFullYear());
    splitText();
    initScroll();
    initNav();
    initTheatre();
    initMute();
    initTerminal();
    initCursor();
    glitchPulse();

    boot().then(heroIntro);
    // Safety: if boot promise stalls, still play the hero intro
    setTimeout(() => { if (!document.body.dataset.introDone) { document.body.dataset.introDone = 'true'; } }, 4000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }
})();

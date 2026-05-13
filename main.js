import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import * as THREE from 'three'

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

  // --- Lenis Smooth Scroll ---
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  const lenis = isTouchDevice ? null : new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1.0,
    smoothWheel: true,
  });

  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    window.addEventListener('scroll', () => {
      ScrollTrigger.update();
    });
  }

  // --- Preloader ---
  const preloader = document.querySelector('.preloader');
  const preloaderCounter = document.querySelector('.preloader-counter');
  const words = document.querySelectorAll('.preloader-words span');

  let loadProgress = { value: 0 };
  let wordTimeline = gsap.timeline({ repeat: -1 });

  words.forEach((word) => {
    wordTimeline
      .to(word, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" })
      .to(word, { y: -20, opacity: 0, duration: 0.4, ease: "power2.in", delay: 0.5 });
  });

  if (preloader && preloaderCounter) {
    gsap.to(loadProgress, {
      value: 100,
      duration: 2.5,
      ease: "power1.inOut",
      onUpdate: () => {
        preloaderCounter.textContent = Math.round(loadProgress.value) + '%';
      },
      onComplete: () => {
        wordTimeline.kill();
        gsap.to(preloader, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 1.2,
          ease: "expo.inOut",
          onComplete: () => {
            preloader.style.display = 'none';
            initScrollAnimations();
          }
        });
        gsap.set('.media-consent', { display: 'block' });
        gsap.from('.media-consent', { y: 20, opacity: 0, duration: 0.5, delay: 0.5 });
      }
    });
  } else {
    initScrollAnimations();
    gsap.set('.media-consent', { display: 'block' });
  }

  function initScrollAnimations() {
    initHeroAnimations();
    
    ScrollTrigger.refresh();

    // Hero Parallax
    gsap.to('.cinematic-bg', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    gsap.to('.cinematic-content', {
      yPercent: -30,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Marquees
    setupMarquee('.ticker-section .track-ltr', 80, 1);
    setupMarquee('.ticker-section .track-rtl', 80, -1);
    setupMarquee('.atelier-marquee.row-1 .track', 40, -1);
    setupMarquee('.atelier-marquee.row-2 .track', 45, 1);
    setupMarquee('.keyword-marquee .marquee-track', 35, -1);
    setupMarquee('.collection-ticker .ticker-track', 25, -1);

    // The Craft
    gsap.from('.craft-img', {
      opacity: 0,
      x: 50,
      stagger: 0.1,
      duration: 0.8,
      scrollTrigger: {
        trigger: '.the-craft',
        start: 'top 70%'
      }
    });

    // Founder Quote
    const quote = document.querySelector('.quote-text');
    if(quote) {
        const wordsText = quote.innerText.split(' ');
        quote.innerHTML = '';
        wordsText.forEach(word => {
          const span = document.createElement('span');
          span.innerText = word;
          span.style.opacity = 0;
          span.style.display = 'inline-block';
          span.style.marginRight = '0.25em';
          span.style.transform = 'translateY(10px)';
          quote.appendChild(span);
        });
        gsap.to('.quote-text span', {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.founder-quote', start: 'top 70%' }
        });
    }

    // Consciousness
    const labels = document.querySelectorAll('.label-float');
    labels.forEach((label, i) => {
      gsap.to(label, {
        opacity: 1, scale: 1, duration: 1.2, delay: i * 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.consciousness', start: 'top 50%' },
        onComplete: () => {
          gsap.to(label, { y: '+=15', x: '+=10', duration: 3 + Math.random() * 2, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() });
        }
      });
    });

    gsap.to('.grass-1', { y: -50, ease: 'none', scrollTrigger: { trigger: '.consciousness', start: 'top bottom', end: 'bottom top', scrub: true }});
    gsap.to('.grass-2', { y: -100, ease: 'none', scrollTrigger: { trigger: '.consciousness', start: 'top bottom', end: 'bottom top', scrub: true }});
    gsap.to('.grass-3', { y: -70, ease: 'none', scrollTrigger: { trigger: '.consciousness', start: 'top bottom', end: 'bottom top', scrub: true }});
    gsap.to('.brand-lockup', { y: 30, ease: 'none', scrollTrigger: { trigger: '.consciousness', start: 'top bottom', end: 'bottom top', scrub: true }});

    // Editorial Grid
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
      const speed = parseFloat(item.getAttribute('data-speed')) || 1;
      gsap.fromTo(item, { y: 50 * speed }, { y: -50 * speed, ease: 'none', scrollTrigger: { trigger: '.editorial-grid', start: 'top bottom', end: 'bottom top', scrub: true }});
    });

    // Founder Note
    gsap.to('.founder-img', { yPercent: -20, ease: 'none', scrollTrigger: { trigger: '.founder-note', start: 'top bottom', end: 'bottom top', scrub: true }});

    // General Fade Ups
    document.querySelectorAll('.fade-up').forEach((el) => {
      gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' }});
    });

    // Floating Illustrations Parallax
    document.querySelectorAll('.floating-illustration').forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed')) || 1;
      gsap.to(el, {
        y: -100 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    ScrollTrigger.refresh();
  }

  // --- Magnetic elements ---
  document.querySelectorAll('.nav button, .brand-logo, .footer-link').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 0.6, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
    });
  });

  // --- Menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const menuOverlay = document.querySelector('.menu-overlay');
  let menuOpen = false;

  if (menuToggle && menuOverlay) {
    menuToggle.addEventListener('click', () => {
      menuOpen = !menuOpen;
      menuOverlay.classList.toggle('open', menuOpen);
      menuToggle.textContent = menuOpen ? 'CLOSE' : 'MENU';
    });
    document.querySelectorAll('.menu-inner a').forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        menuOverlay.classList.remove('open');
        menuToggle.textContent = 'MENU';
      });
    });
  }

  // --- Hero Animations ---
  function initHeroAnimations() {
    if (document.querySelector('.cinematic-title')) {
      const tl = gsap.timeline();
      gsap.set('.cinematic-title', { clearProps: 'transform' });
      tl.from('.cinematic-overlay', { opacity: 0, duration: 2, ease: 'power2.inOut' })
        .fromTo('.cinematic-title', { y: 150, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 1.8, ease: 'expo.out' }, '-=1')
        .from('.cinematic-meta', { y: 20, opacity: 0, duration: 1.2, ease: 'power3.out' }, '-=1.2')
        .from('.cinematic-subtitle', { y: 20, opacity: 0, duration: 1.2, ease: 'power3.out' }, '-=1')
        .from('.cinematic-ctas', { y: 20, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.8');
    }
  }

  // --- Marquee Logic ---
  function setupMarquee(selector, duration, direction = -1) {
    const tracks = document.querySelectorAll(selector);
    tracks.forEach(track => {
      const content = track.innerHTML;
      track.innerHTML = content + content;
      const animation = direction === -1 
        ? gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: duration, ease: "none", repeat: -1 })
        : gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: duration, ease: "none", repeat: -1 });

      ScrollTrigger.create({
        trigger: track, start: "top bottom", end: "bottom top",
        onEnter: () => animation.play(), onLeave: () => animation.pause(),
        onEnterBack: () => animation.play(), onLeaveBack: () => animation.pause()
      });
    });
  }

  // --- WebGL ---
  const webglCanvas = document.querySelector('#webgl-canvas');
  if (webglCanvas) {
    const renderer = new THREE.WebGLRenderer({ canvas: webglCanvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    const grainVertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;
    const grainFragmentShader = `uniform float uTime; uniform float uOpacity; varying vec2 vUv; float random(vec2 p) { return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453); } void main() { float noise = random(vUv + uTime); gl_FragColor = vec4(vec3(0.0), noise * uOpacity); }`;
    const grainMaterial = new THREE.ShaderMaterial({
      vertexShader: grainVertexShader, fragmentShader: grainFragmentShader,
      uniforms: { uTime: { value: 0 }, uOpacity: { value: window.innerWidth < 1024 ? 0.02 : 0.04 } },
      transparent: true, depthTest: false
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), grainMaterial));

    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    function updateWebGL() {
      if (window.innerWidth >= 1024) {
        grainMaterial.uniforms.uTime.value = performance.now() * 0.001;
        renderer.render(scene, camera);
      }
      requestAnimationFrame(updateWebGL);
    }
    updateWebGL();
  }

  // Monogram Parallax
  gsap.to('.philosophy-monogram', {
    y: -100, scrollTrigger: { trigger: '.founder-note', start: 'top bottom', end: 'bottom top', scrub: 1 }
  });

  // Collection Progress
  const grid = document.querySelector('.editorial-grid');
  const progressBar = document.querySelector('.progress-bar');
  if (grid && progressBar) {
    grid.addEventListener('scroll', () => {
      const progress = (grid.scrollLeft / (grid.scrollWidth - grid.clientWidth)) * 100;
      progressBar.style.width = `${progress}%`;
    });
  }
});

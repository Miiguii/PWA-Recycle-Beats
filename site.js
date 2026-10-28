/* ============================================================
   RECYCLE BEATS — JS del sitio (PWA Ready)
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Año dinámico ---------- */
  const yearEl = document.getElementById('rb-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Menú móvil ---------- */
  const nav = document.getElementById('rb-nav-menu');
  const toggle = document.getElementById('rb-nav-toggle');

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  function toggleNav() {
    if (!nav || !toggle) return;
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  }

  if (toggle && nav) {
    toggle.addEventListener('click', toggleNav);
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 900) closeNav(); });
  }

  /* ---------- Reveal al scroll ---------- */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.rb-section, .rb-hero__content, .rb-polaroid, .rb-card, .rb-timeline__item'
    );
    targets.forEach((el) => el.classList.add('rb-reveal'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    targets.forEach((el) => observer.observe(el));
  }

  /* ---------- Enlace activo en navbar ---------- */
  const navLinks = Array.from(document.querySelectorAll('.rb-navbar__nav a[href^="#"]'));

  if (navLinks.length && 'IntersectionObserver' in window) {
    const linkById = new Map();
    navLinks.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      if (id) linkById.set(id, a);
    });

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const link = linkById.get(entry.target.id);
          if (!link) return;
          navLinks.forEach((a) => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    linkById.forEach((_link, id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  }

  /* ---------- PWA: Registrar Service Worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then((registration) => {
          console.log('Service Worker registrado con éxito:', registration.scope);
        })
        .catch((error) => {
          console.error('Error al registrar el Service Worker:', error);
        });
    });
  }

  /* ---------- PWA: Lógica del botón de instalación ---------- */
  let deferredPrompt;
  const installBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    // Previene que el navegador muestre su propio mini-infobar
    e.preventDefault();
    // Guarda el evento para que se pueda activar más tarde
    deferredPrompt = e;
    // Muestra el botón personalizado
    if (installBtn) installBtn.style.display = 'inline-flex';
  });

  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      // Muestra el prompt de instalación nativo
      deferredPrompt.prompt();
      // Espera a que el usuario responda
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`El usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
      // Ya no podemos usar este prompt
      deferredPrompt = null;
      // Ocultamos el botón
      installBtn.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    // Oculta el botón de instalación si la app se instaló correctamente
    if (installBtn) installBtn.style.display = 'none';
    console.log('¡Recycle Beats fue instalada con éxito!');
  });

    /* ---------- Envío del formulario de contacto (AJAX) ---------- */
  const form = document.getElementById('contacto-form');
  const status = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault(); // Evita que la página se recargue
      
      const data = new FormData(form);
      const button = form.querySelector('button');
      const originalText = button.textContent;

      button.textContent = 'Enviando...';
      button.disabled = true;
      status.style.display = 'none';

      try {
        const response = await fetch(form.action, {
          method: form.method,
          body: data,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // Éxito
          status.textContent = '¡Mensaje enviado con éxito! Te responderemos pronto.';
          status.style.display = 'block';
          status.style.backgroundColor = 'var(--rb-verde)';
          status.style.color = 'white';
          form.reset(); // Limpia los campos
        } else {
          // Error del servidor
          status.textContent = 'Hubo un problema al enviar. Intenta de nuevo.';
          status.style.display = 'block';
          status.style.backgroundColor = 'var(--rb-rojo)';
          status.style.color = 'white';
        }
      } catch (error) {
        // Error de red
        status.textContent = 'Error de conexión. Revisa tu internet.';
        status.style.display = 'block';
        status.style.backgroundColor = 'var(--rb-rojo)';
        status.style.color = 'white';
      }

      button.textContent = originalText;
      button.disabled = false;
    });
  }

})();


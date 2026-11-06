
   // RECYCLE BEATS — JS del sitio (PWA)
  

(function () {
  'use strict';

  /*  Año dinámico */
  const yearEl = document.getElementById('rb-year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* Menú móvil */
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

  /* Reveal al scroll */
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

  /*  Enlace activo en navbar  */
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

  /*  PWA: Registrar Service Worker  */
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

  /*  PWA: Lógica del botón de instalación  */
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

    /*  Envío del formulario de contacto (AJAX)  */
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

  
    /* ESTRUCTURA DE NOTIFICACIONES PUSH (Frontend) */
  
  // Llave pública (En un entorno real, esta llave viene del servidor)
  // Esta es una llave de ejemplo, sirve para que la estructura no marque error.
  const PUBLIC_VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8';

  // Convertir la llave base64 a un formato que entienda el navegador
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

    // Función para suscribirse (Versión corregida y a prueba de errores)
  async function suscribirPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Tu navegador no soporta notificaciones push.');
      return;
    }

    try {
      // 1. Pedir permiso al usuario
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Permiso de notificaciones denegado.');
        return;
      }

      // 2. ESPERAR a que el Service Worker esté listo (Aquí estaba el error)
      console.log('Esperando a que el Service Worker esté listo...');
      const registration = await navigator.serviceWorker.ready;
      
      // 3. Verificar si ya hay una suscripción activa para no duplicar
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // 4. Si no hay, suscribir al usuario
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
        });
      }

      console.log('Suscripción exitosa:', subscription);

      // 5. ENVIAR LA SUSCRIPCIÓN AL SERVIDOR (Aquí conectarías con el backend)
      /*
      await fetch('http://localhost:8080/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      */
      
      alert('¡Te has suscrito a las notificaciones con éxito! (Revisa la consola)');

    } catch (error) {
      console.error('Error al suscribirse a notificaciones:', error);
      alert('Hubo un error al activar las notificaciones. Revisa la consola (F12) para más detalles.');
    }
  }
})();


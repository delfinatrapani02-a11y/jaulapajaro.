// jaula pájaro · interacciones
(function () {
  const sinCursor = window.matchMedia('(hover: none)').matches;
  const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esCelu = () => window.matchMedia('(max-width: 900px)').matches;

  /* ---------- menú ---------- */
  const boton = document.querySelector('.cabecera-menu');
  const menu = document.getElementById('menu');
  if (boton && menu) {
    const abrir = (si) => {
      menu.hidden = !si;
      boton.setAttribute('aria-expanded', String(si));
      boton.setAttribute('aria-label', si ? 'cerrar menú' : 'abrir menú');
      document.body.classList.toggle('menu-abierto', si);
      if (esCelu()) document.body.classList.toggle('sin-scroll', si);
    };
    boton.addEventListener('click', () => abrir(menu.hidden));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) abrir(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { abrir(false); boton.focus(); } });
  }

  /* ---------- trazos: en el celu se dibujan solos al aparecer ---------- */
  if (sinCursor && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
    }, { threshold: 0.8 });
    document.querySelectorAll('main .trazo:not(.no-solo), .tarjeta').forEach((el) => io.observe(el));
  }

  /* ---------- isotipo: el pájaro se va y vuelve ---------- */
  const escena = document.querySelector('.escena');
  if (escena && !quieto) {
    let volando = false;
    const volar = () => {
      if (volando) return;
      volando = true;
      escena.classList.remove('vuela');
      void escena.offsetWidth;
      escena.classList.add('vuela');
      setTimeout(() => { volando = false; }, 6200);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { volar(); io.disconnect(); } }, { threshold: 0.6 });
      io.observe(escena);
    }
    escena.addEventListener(sinCursor ? 'click' : 'mouseenter', volar);
  }

  /* ---------- poetools ---------- */
  const caja = document.querySelector('.caja');
  const velo = document.querySelector('.velo');
  if (caja && velo) {
    const pista = document.querySelector('.pista');
    let ultimo = null;
    caja.addEventListener('click', (e) => {
      if (e.target.closest('.papel')) return;
      const abierta = caja.classList.toggle('abierta');
      if (pista) pista.textContent = abierta ? 'ahora tocá un papel' : 'tocá la caja';
    });
    const abrirHoja = (id, desde) => {
      const plantilla = document.getElementById('poetool-' + id);
      if (!plantilla) return;
      ultimo = desde || null;
      velo.innerHTML = '';
      velo.appendChild(plantilla.content.cloneNode(true));
      velo.hidden = false;
      document.body.classList.add('sin-scroll');
      const cerrar = velo.querySelector('.hojita-cerrar');
      if (cerrar) cerrar.focus();
    };
    const cerrarHoja = () => {
      velo.hidden = true;
      velo.innerHTML = '';
      document.body.classList.remove('sin-scroll');
      if (ultimo) ultimo.focus();
    };
    document.querySelectorAll('[data-poetool]').forEach((b) => {
      b.addEventListener('click', (e) => { e.stopPropagation(); caja.classList.add('abierta'); abrirHoja(b.dataset.poetool, b); });
    });
    velo.addEventListener('click', (e) => { if (e.target === velo || e.target.closest('.hojita-cerrar')) cerrarHoja(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !velo.hidden) cerrarHoja(); });
  }

  /* ---------- cuaderno del registro poético ---------- */
  const cuaderno = document.querySelector('.cuaderno');
  if (cuaderno) {
    const hojas = Array.from(cuaderno.querySelectorAll('.hoja'));
    const ant = document.querySelector('[data-hoja="anterior"]');
    const sig = document.querySelector('[data-hoja="siguiente"]');
    const cont = document.querySelector('.paginador-cuenta');
    let inicio = 0;
    const porVista = () => (esCelu() ? 1 : 2);
    const mostrar = (animar) => {
      const n = porVista();
      inicio = Math.max(0, Math.min(inicio - (inicio % n), Math.max(0, hojas.length - 1)));
      hojas.forEach((h, i) => {
        const ver = i >= inicio && i < inicio + n;
        h.hidden = !ver;
        h.classList.toggle('entra', ver && animar);
      });
      const total = Math.ceil(hojas.length / n);
      const actual = Math.floor(inicio / n) + 1;
      if (cont) cont.textContent = (n === 1 ? 'página ' : 'pliego ') + actual + ' de ' + total;
      if (ant) ant.disabled = actual === 1;
      if (sig) sig.disabled = actual === total;
    };
    if (ant) ant.addEventListener('click', () => { inicio -= porVista(); mostrar(true); });
    if (sig) sig.addEventListener('click', () => { inicio += porVista(); mostrar(true); });
    window.addEventListener('resize', () => mostrar(false));
    mostrar(false);
  }

  /* ---------- formularios (Netlify Forms) ---------- */
  document.querySelectorAll('form[data-netlify]').forEach((form) => {
    const anon = form.querySelector('[name="anonimo"]');
    const firma = form.querySelector('[name="firma"]');
    if (anon && firma) {
      anon.addEventListener('change', () => {
        firma.disabled = anon.checked;
        firma.placeholder = anon.checked ? 'anónimo' : 'como querés que aparezca';
        if (anon.checked) firma.value = '';
      });
    }
    const archivo = form.querySelector('input[type="file"]');
    const rotulo = form.querySelector('.caja-archivo');
    if (archivo && rotulo) {
      archivo.addEventListener('change', () => {
        const f = archivo.files && archivo.files[0];
        if (f && f.size > 8 * 1024 * 1024) { rotulo.textContent = 'ese archivo pesa más de 8 MB, probá con uno más liviano'; archivo.value = ''; return; }
        rotulo.textContent = f ? f.name : 'elegí un archivo (jpg, png, mp3)';
      });
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const envio = form.querySelector('[type="submit"]');
      const gracias = form.querySelector('.gracias');
      const datos = new FormData(form);
      const conArchivo = !!form.querySelector('input[type="file"]');
      if (envio) { envio.disabled = true; envio.dataset.texto = envio.innerHTML; envio.textContent = 'mandando…'; }
      try {
        const r = await fetch('/', conArchivo
          ? { method: 'POST', body: datos }
          : { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(datos).toString() });
        if (!r.ok) throw new Error(r.status);
        form.reset();
        if (envio) envio.hidden = true;
        if (gracias) { gracias.hidden = false; gracias.focus(); }
      } catch (err) {
        if (envio) { envio.disabled = false; envio.innerHTML = envio.dataset.texto; }
        alert('Uy, no se pudo mandar. Probá de nuevo en un rato o escribinos a lajaulapajaro@gmail.com');
      }
    });
  });
})();

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

  /* ---------- intervenciones del manifiesto: se dibujan solas al aparecer (compu y celu) ---------- */
  if ('IntersectionObserver' in window) {
    const ioSolo = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); ioSolo.unobserve(e.target); } });
    }, { threshold: 1, rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('.trazo.solo, .resalte').forEach((el) => ioSolo.observe(el));
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
  /* achica y pasa a JPG solo las imágenes que lo necesitan (pesadas o en formatos raros como HEIC) */
  const LIVIANA = 2 * 1024 * 1024;
  const prepararImagen = async (f) => {
    if (!f || !f.type.startsWith('image/')) return f;
    const comun = /^image\/(jpeg|png|gif)$/.test(f.type);
    if (comun && f.size <= LIVIANA) return f;
    try {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.src = url;
      await img.decode();
      const lado = 2000;
      const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * escala);
      c.height = Math.round(img.naturalHeight * escala);
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      const blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.85));
      if (!blob || blob.size >= f.size && comun) return f;
      const nombre = f.name.replace(/\.[^.]+$/, '') + '.jpg';
      return new File([blob], nombre, { type: 'image/jpeg' });
    } catch (err) {
      return f; // si el navegador no puede leerla, se manda como está
    }
  };

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
    const textoInicial = rotulo ? rotulo.textContent : '';
    let urlPrevia = null;
    const limpiarArchivo = (mensaje) => {
      if (!rotulo) return;
      if (urlPrevia) { URL.revokeObjectURL(urlPrevia); urlPrevia = null; }
      rotulo.classList.remove('cargado', 'error-archivo');
      rotulo.textContent = mensaje || textoInicial;
      if (mensaje) rotulo.classList.add('error-archivo');
    };
    if (archivo && rotulo) {
      archivo.addEventListener('change', () => {
        const f = archivo.files && archivo.files[0];
        if (!f) { limpiarArchivo(); return; }
        // las imágenes pesadas se achican al mandar; el límite duro queda para audios
        if (!f.type.startsWith('image/') && f.size > 8 * 1024 * 1024) { archivo.value = ''; limpiarArchivo('✗ ese archivo pesa más de 8 MB, probá con uno más liviano'); return; }
        limpiarArchivo();
        const esImagen = f.type.startsWith('image/');
        rotulo.textContent = '';
        rotulo.classList.add('cargado');
        if (esImagen) {
          const img = document.createElement('img');
          urlPrevia = URL.createObjectURL(f);
          img.src = urlPrevia; img.alt = ''; img.className = 'miniatura';
          img.onerror = () => img.remove(); // ej. fotos HEIC que el navegador no puede mostrar
          rotulo.appendChild(img);
        }
        const info = document.createElement('span');
        info.className = 'info-archivo';
        const ok = document.createElement('strong');
        ok.textContent = esImagen ? '✓ foto cargada' : '✓ archivo cargado';
        const nombre = document.createElement('span');
        nombre.className = 'nombre-archivo';
        nombre.textContent = f.name;
        const cambiar = document.createElement('span');
        cambiar.className = 'cambiar-archivo';
        cambiar.textContent = 'tocá acá para cambiarlo';
        info.append(ok, nombre, cambiar);
        rotulo.appendChild(info);
      });
      form.addEventListener('reset', () => setTimeout(() => limpiarArchivo(), 0));
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const envio = form.querySelector('[type="submit"]');
      const gracias = form.querySelector('.gracias');
      const datos = new FormData(form);
      const conArchivo = !!form.querySelector('input[type="file"]');
      if (envio) { envio.disabled = true; envio.dataset.texto = envio.innerHTML; envio.textContent = 'mandando…'; }
      const original = datos.get('archivo');
      if (original instanceof File && original.size > 0) {
        const lista = await prepararImagen(original);
        if (lista.size > 8 * 1024 * 1024) {
          if (envio) { envio.disabled = false; envio.innerHTML = envio.dataset.texto; }
          alert('La foto pesa demasiado y no la pudimos achicar. Probá con una captura de pantalla de la foto.');
          return;
        }
        if (lista !== original) datos.set('archivo', lista, lista.name);
      }
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

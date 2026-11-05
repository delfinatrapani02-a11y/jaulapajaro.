// Comentarios de las notas, guardados en Netlify Blobs (no necesita GitHub ni tokens).
// GET  /api/comentarios?nota=/archivo/notas/slug/  → comentarios visibles de esa nota
// POST /api/comentarios  {nota, nombre, texto}     → publica un comentario al instante
// Moderación (necesita la variable MODERAR_CLAVE en Netlify y el header x-clave):
// GET    /api/comentarios?todos=1                  → todos, con los ocultos
// PATCH  /api/comentarios  {clave: "slug/id", oculto: true|false}
// DELETE /api/comentarios  {clave: "slug/id"}
import { getStore } from "@netlify/blobs";

const json = (status, cuerpo) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const limpiar = (t, max) => String(t || "").replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F]/g, "").trim().slice(0, max);
const slugDe = (nota) => (/^\/archivo\/notas\/([a-z0-9-]+)\/$/.exec(nota) || [])[1];
const esModeradora = (req) => !!process.env.MODERAR_CLAVE && req.headers.get("x-clave") === process.env.MODERAR_CLAVE;

async function leer(store, prefix) {
  const { blobs } = await store.list(prefix ? { prefix } : undefined);
  const todos = await Promise.all(blobs.map(async (b) => ({ clave: b.key, ...(await store.get(b.key, { type: "json" })) })));
  return todos.filter((c) => c.texto).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

export default async (req) => {
  const store = getStore({ name: "comentarios", consistency: "strong" });
  const url = new URL(req.url);

  if (req.method === "GET") {
    if (url.searchParams.get("todos")) {
      if (!esModeradora(req)) return json(401, { error: "clave incorrecta" });
      return json(200, { comentarios: await leer(store) });
    }
    const slug = slugDe(url.searchParams.get("nota"));
    if (!slug) return json(400, { error: "nota inválida" });
    const lista = (await leer(store, `${slug}/`)).filter((c) => !c.oculto).map(({ nombre, texto, fecha }) => ({ nombre, texto, fecha }));
    return json(200, { comentarios: lista });
  }

  let datos;
  try { datos = await req.json(); } catch { return json(400, { error: "datos inválidos" }); }

  if (req.method === "POST") {
    if (datos.web) return json(200, { ok: true }); // campo trampa para bots
    const nota = limpiar(datos.nota, 200);
    const slug = slugDe(nota);
    const nombre = limpiar(datos.nombre, 60) || "anónimo";
    const texto = limpiar(datos.texto, 1500);
    if (!slug) return json(400, { error: "nota inválida" });
    if (texto.length < 2) return json(400, { error: "el comentario está vacío" });
    const fecha = new Date().toISOString();
    await store.setJSON(`${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, { nota, nombre, texto, fecha, oculto: false });
    return json(200, { ok: true, comentario: { nombre, texto, fecha } });
  }

  if (req.method === "PATCH" || req.method === "DELETE") {
    if (!esModeradora(req)) return json(401, { error: "clave incorrecta" });
    const clave = String(datos.clave || "");
    const actual = await store.get(clave, { type: "json" });
    if (!actual) return json(404, { error: "no existe" });
    if (req.method === "DELETE") await store.delete(clave);
    else await store.setJSON(clave, { ...actual, oculto: !!datos.oculto });
    return json(200, { ok: true });
  }

  return json(405, { error: "método no permitido" });
};

export const config = { path: "/api/comentarios" };

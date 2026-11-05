// Recibe un comentario de una nota y lo guarda en el repo como archivo JSON.
// Netlify vuelve a publicar el sitio solo y el comentario aparece en 1 o 2 minutos.
// Necesita la variable de entorno GITHUB_TOKEN (ver README).

const REPO = "delfinatrapani02-a11y/jaulapajaro.";
const RAMA = "main";
const CARPETA = "src/_data/comentarios";

const responder = (status, cuerpo) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { "content-type": "application/json" } });

const limpiar = (t, max) => String(t || "").replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000B-\u001F]/g, "").trim().slice(0, max);

export default async (req) => {
  if (req.method !== "POST") return responder(405, { error: "método no permitido" });
  if (!process.env.GITHUB_TOKEN) return responder(500, { error: "falta configurar GITHUB_TOKEN" });

  let datos;
  try { datos = await req.json(); } catch { return responder(400, { error: "datos inválidos" }); }

  // campo trampa: las personas no lo ven, los bots lo completan
  if (datos.web) return responder(200, { ok: true });

  const nota = limpiar(datos.nota, 200);
  const nombre = limpiar(datos.nombre, 60) || "anónimo";
  const texto = limpiar(datos.texto, 1500);
  if (!/^\/archivo\/notas\/[a-z0-9-]+\/$/.test(nota)) return responder(400, { error: "nota inválida" });
  if (texto.length < 2) return responder(400, { error: "el comentario está vacío" });

  const ahora = new Date();
  const slug = nota.split("/")[3];
  const archivo = `${CARPETA}/${slug}--${ahora.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14)}-${Math.random().toString(36).slice(2, 6)}.json`;
  const contenido = { nota, nombre, texto, fecha: ahora.toISOString(), oculto: false };

  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURI(archivo)}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "user-agent": "jaula-pajaro-comentarios"
    },
    body: JSON.stringify({
      message: `comentario: ${nombre} en «${slug}»`,
      content: Buffer.from(JSON.stringify(contenido, null, 2) + "\n").toString("base64"),
      branch: RAMA
    })
  });
  if (!r.ok) {
    console.error("github", r.status, await r.text());
    return responder(502, { error: "no se pudo guardar" });
  }
  return responder(200, { ok: true, comentario: contenido });
};

export const config = { path: "/api/comentar" };

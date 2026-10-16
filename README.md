# jaula pájaro

Sitio web de **Jaula Pájaro**, un proyecto sobre la poesía como forma de mirar el mundo cotidiano (TIF, Ciencias de la Comunicación, UBA).

> “la jaula se ha vuelto pájaro y se ha volado” — Alejandra Pizarnik

## Cómo cargar contenido (sin tocar código)

Entrá a **`/admin`** del sitio (por ejemplo `https://jaulapajaro.netlify.app/admin`) y logueate con GitHub. Desde ahí se editan:

| sección del panel | qué es | dónde vive |
|---|---|---|
| Notas | las notas del archivo | `src/notas/*.md` |
| Entrevistas | las entrevistas del archivo | `src/entrevistas/*.md` |
| Registro poético | cada pieza pegada en el cuaderno | `src/registro/*.md` |
| Poetools (la caja) | los 5 papeles y sus recursos | `src/_data/poetools.json` |
| Datos generales | frases del encabezado, mail, Instagram, Substack | `src/_data/sitio.json` |

Cada vez que guardan, el panel hace un commit en este repo y Netlify vuelve a publicar el sitio solo (tarda 1 o 2 minutos). Si marcan **Borrador**, la nota no se publica.

Las fotos que suben desde el panel quedan en `src/img/subidas/`.

## Formularios

- **¿qué poema encontraste hoy?** (`poesia-encontrada`) y **contacto** usan Netlify Forms. Las respuestas llegan en Netlify → el sitio → *Forms*. Ahí se puede activar que lleguen por mail.
- El **newsletter** manda a Substack. El link se cambia en *Datos generales*.

## Configuración en Netlify (una sola vez)

1. Netlify → *Add new site* → *Import from Git* → elegir este repo. La configuración ya está en `netlify.toml` (no hay que tocar nada).
2. Para que funcione el panel `/admin` con GitHub:
   - En GitHub: *Settings → Developer settings → OAuth Apps → New OAuth App*.
     - Homepage URL: la dirección del sitio.
     - Authorization callback URL: `https://api.netlify.com/auth/done`
   - Copiar el *Client ID* y generar un *Client secret*.
   - En Netlify: el sitio → *Site configuration → Access & security → OAuth* → *Install provider* → GitHub → pegar ID y secret.
3. En `src/admin/config.yml`, `repo:` tiene que ser `usuario/nombre-del-repo`, y `site_url` la dirección real.
4. Sumar a Sofía como colaboradora del repo (GitHub → *Settings → Collaborators*) para que pueda entrar al panel.
5. Forms: en Netlify → *Forms* → activar la detección de formularios si aparece desactivada.

## Para programar

```bash
npm install
npm run dev     # http://localhost:8080
npm run build   # genera _site/
```

Hecho con [Eleventy](https://www.11ty.dev/) y [Decap CMS](https://decapcms.org/). Paleta: `#E4D5B7` `#BFE3FA` `#FC0611` `#C41E2B` `#82292A` `#480E01`. Tipografías: Cormorant Garamond y Bree Serif.

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.addPassthroughCopy({ "src/img/favicon.png": "favicon.png" });

  const porFecha = (a, b) => new Date(b.data.fecha || b.date) - new Date(a.data.fecha || a.date);

  eleventyConfig.addCollection("notas", (api) =>
    api.getFilteredByGlob("src/notas/*.md").filter((n) => !n.data.borrador).sort(porFecha)
  );
  eleventyConfig.addCollection("entrevistas", (api) =>
    api.getFilteredByGlob("src/entrevistas/*.md").filter((n) => !n.data.borrador).sort(porFecha)
  );
  eleventyConfig.addCollection("registro", (api) =>
    api.getFilteredByGlob("src/registro/*.md").filter((n) => !n.data.borrador).sort(porFecha)
  );

  // agrupa piezas del registro en páginas del cuaderno
  eleventyConfig.addFilter("enPaginas", (lista, porPagina = 3) => {
    const paginas = [];
    for (let i = 0; i < lista.length; i += porPagina) paginas.push(lista.slice(i, i + porPagina));
    return paginas;
  });

  // rotaciones "a mano", estables según el índice
  const giros = ["-2.4deg", "1.8deg", "-1deg", "2.6deg", "-2deg", "1.2deg", "-1.6deg", "2.2deg"];
  eleventyConfig.addFilter("giro", (i) => giros[i % giros.length]);
  const desfase = ["0px", "48px", "12px", "-24px", "28px", "0px"];
  eleventyConfig.addFilter("desfase", (i) => desfase[i % desfase.length]);
  const garabatos = [
    "M 60 70 C 110 50, 170 70, 168 118 C 166 160, 100 176, 60 156 C 24 138, 28 86, 80 72 C 120 62, 150 76, 160 92",
    "M 40 70 Q 50 58 60 70 Q 70 58 80 70 M 100 50 Q 108 40 116 50 Q 124 40 132 50 M 120 96 Q 130 84 140 96 Q 150 84 160 96 M 60 120 Q 66 112 72 120 Q 78 112 84 120",
    "M 30 170 C 60 150, 90 120, 120 86 M 104 84 L 122 84 L 120 102 M 128 60 C 150 40, 182 48, 176 72 C 170 96, 136 92, 136 70",
    "M 50 60 C 80 54, 120 64, 150 58 M 46 80 C 86 76, 112 84, 154 78 M 96 104 L 96 150 M 96 166 L 96 170",
    "M 100 110 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0 M 100 56 V 70 M 100 150 V 164 M 46 110 H 60 M 140 110 H 154",
    "M 64 104 C 64 66 136 66 136 104 V 180 H 64 Z M 78 82 V 180 M 92 74 V 180 M 108 74 V 180 M 122 82 V 180 M 64 140 H 136"
  ];
  eleventyConfig.addFilter("garabato", (i) => garabatos[i % garabatos.length]);
  eleventyConfig.addFilter("dosDigitos", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("fechaLarga", (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  });
  eleventyConfig.addFilter("minutos", (texto) => Math.max(1, Math.round(String(texto || "").split(/\s+/).length / 180)));
  eleventyConfig.addFilter("corto", (t) => String(t || "").length < 70);

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}

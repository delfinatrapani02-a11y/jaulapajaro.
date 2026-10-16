export default {
  layout: "nota.njk",
  tipo: "notas",
  eleventyComputed: {
    permalink: (data) => (data.borrador ? false : `/archivo/notas/${data.page.fileSlug}/`)
  }
};

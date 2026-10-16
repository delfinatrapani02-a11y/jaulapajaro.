export default {
  layout: "nota.njk",
  tipo: "entrevistas",
  eleventyComputed: {
    permalink: (data) => (data.borrador ? false : `/archivo/entrevistas/${data.page.fileSlug}/`)
  }
};

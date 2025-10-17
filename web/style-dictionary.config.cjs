/** @type {import('style-dictionary').Config} */
module.exports = {
  source: [
    "tokens/**/*.json"
  ],
  platforms: {
    css: {
      transforms: [
        "attribute/cti",
        "name/cti/kebab",
        "color/hex",
      ],
      buildPath: "src/styles/",
      files: [
        {
          destination: "tokens.css",
          format: "css/variables",
          options: {
            selector: ":root"
          }
        }
      ]
    }
  }
};

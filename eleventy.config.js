export default function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("styles");

    // Add shortcode for current year
    eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
};
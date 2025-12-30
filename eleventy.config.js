const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const mdTableOfContents = require("markdown-it-table-of-contents");
const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
    
    // Add plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginSyntaxHighlight);
    eleventyConfig.addPlugin(pluginNavigation);
    
    eleventyConfig.addPassthroughCopy("styles");
    eleventyConfig.addPassthroughCopy("images");

    // Customize Markdown library and settings:
    let markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    }).use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.ariaHidden({
        placement: "after",
        class: "direct-link",
        symbol: "#",
        level: [1, 2, 3, 4],
        }),
        slugify: eleventyConfig.getFilter("slug"),
    }).use(mdTableOfContents, {
        containerHeaderHtml: "<h2>Table of Contents</h2>",
        containerClass: "table-of-contents",
      });

    eleventyConfig.setLibrary("md", markdownLibrary);

    eleventyConfig.addFilter("readableDate", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
          "dd LLL yyyy"
        );
    });

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
    });
};
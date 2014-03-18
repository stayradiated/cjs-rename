/*
 * languages.js
 *
 * Handles all the supported file extensions.
 * Each extension has a single regex that is used to find any required
 * dependencies.
 *
 * TODO: Currently the regex needs to have two capture groups.
 * The first one is ignored, and the second should be the actual path.
 * This is because to be able to detect a space or a start of a line, we need
 * to use a capture group.
 *
 */

'use strict';

var DEFAULT = 'js';

var languages = {
  js: /(\s|^)require\s*\(\s*['"](\.[^'"]+)['"]\)/g,
  coffee: /(\s|^)require\s*\(?\s*['"](\.[^'"]+)['"]\)?/g
};

var extensions = '\\.(' + Object.keys(languages).join('|') + ')$';
extensions = new RegExp(extensions);

module.exports = {
  extensions: extensions,
  get: function (extname) {
    if (extname[0] === '.') extname = extname.slice(1);
    return languages[extname] || languages[DEFAULT];
  }
};

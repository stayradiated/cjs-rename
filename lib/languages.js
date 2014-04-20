/*
 * languages.js
 *
 * Handles all the supported file extensions.
 * Each extension has a single regex that is used to find any required
 * dependencies.
 *
 */

'use strict';

var DEFAULT = 'js';

var languages = {
  js: /\brequire\s*\(\s*['"](\.[^'"]+)['"]\)/g,
  coffee: /\brequire\s*\(?\s*['"](\.[^'"]+)['"]\)?/g
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

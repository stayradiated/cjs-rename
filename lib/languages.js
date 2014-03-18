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

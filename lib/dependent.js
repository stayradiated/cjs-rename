/*
 *
 * Dependent.js
 *
 * Pass in some code, and it will allow you to update any.
 *
 */

'use strict';

var extension = require('./extension');
var fs        = require('./fs');
var Path      = require('path');

var REGEX = /([^\.\w]|^)require\s*\(?\s*['"](\.[^'"]+)['"]/g;

var dependent = function (source, fn) {
  var folder = Path.dirname(source);
  return fs.read(source).then(function (contents) {
    return contents.replace(REGEX, function (line, _, path) {
      var fullPath = Path.resolve(folder, path);
      return line.replace(path, fn(fullPath, path));
    });
  });
};

module.exports = dependent;

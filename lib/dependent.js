/*
 *
 * Dependent.js
 *
 * Pass in some code, and it will allow you to update any.
 *
 */

'use strict';

var fs   = require('./fs');
var Path = require('./path');
var languages = require('./languages');

var dependent = function (source, fn) {
  return fs.read(source).then(function (contents) {
    return dependent.parse(source, contents, fn);
  });
};

dependent.parse = function (source, contents, fn) {
  var folder = Path.dirname(source);
  var extension = Path.extname(source);
  var regex = languages.get(extension);

  return contents.replace(regex, function (line, _, path) {
    var fullPath = Path.resolve(folder, path);
    return line.replace(path, fn(fullPath, path));
  });
};

module.exports = dependent;

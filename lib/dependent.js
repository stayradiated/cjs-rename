/*
 *
 * dependent.js
 *
 * This handles all the 'require()' calls and extracts the path.
 * It works with multiple languages.
 *
 * Basically you pass in some code, and it runs it through a regex to get all
 * the dependencies.
 * Then it resolves each dependency into an absolute path.
 * Each path is then sent to the callback, and the contents is updated with the
 * return value.
 *
 */

'use strict';

var fs        = require('./fs');
var Path      = require('./path');
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

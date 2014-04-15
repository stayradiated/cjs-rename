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


/*
 * dependent
 *
 * Go through a files dependencies and replace them
 *
 * - source (string) : path to file
 * - fn (function) : callback
 * > promise > string : file contents with replacements made
 */

var dependent = function (source, fn) {
  return fs.read(source).then(function (contents) {
    return dependent.parse(source, contents, fn);
  });
};


/*
 * dependent parse
 *
 * Does the same as `dependent`, except you supply the file contents.
 *
 * callback -> is passed two arguments: `fullPath` and `path`.
 *   - `fullPath` is the absolute path to the file
 *   - `path` is the original text from the file contents
 *
 * e.g. require('./foo') =>
 *    fullPath: '/home/folder/foo.js'
 *    path: './foo'
 *
 * if the callback returns `undefined`, then no change is made.
 *
 * - source (string) : path to file
 * - contents (string) : source contents
 * - fn (function)  : callback
 * > string : file contents with replacements made
 */

dependent.parse = function (source, contents, fn) {
  var folder = Path.dirname(source);
  var extension = Path.extname(source);
  var regex = languages.get(extension);

  return contents.replace(regex, function (line, path) {
    var fullPath = Path.resolve(folder, path);
    var newPath = fn(fullPath, path);
    newPath = newPath === undefined ? path : newPath;
    return line.replace(path, newPath);
  });
};


module.exports = dependent;

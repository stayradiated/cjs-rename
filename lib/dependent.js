/*
 *
 * Dependent.js
 *
 * Pass in some code, and it will allow you to update any.
 *
 */

var REGEX = /([^\.\w]|^)require\s*\(?\s*['"](\.[^'"]+)['"]/g;

var dependent = function (contents, fn) {
  return contents.replace(REGEX, function (line, _, path) {
    return fn(line, path);
  });
};

module.exports = dependent;

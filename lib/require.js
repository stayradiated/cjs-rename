/*
 *
 * Require.js
 *
 * Pass in some code, and it will allow you to update any.
 *
 */

var REGEX = //;

module.exports = function (contents, fn) {
  return contents.replace(REGEX, fn);
};

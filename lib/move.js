/*
 *
 * Move.js
 * 
 * Move a file from one place to another.
 * Will fix all required paths in that file.
 *
 * Does not check that required files exist.
 * Uses 'path.resolve', 'path.dirname' and 'path.relative'
 *
 */

'use strict';

var fs        = require('./fs');
var dependent = require('./dependent');
var Path      = require('./path');


/*
 * Move
 *
 * Move a file from one place to another.
 * But it also resolves require()s.
 *
 * - from (string) : path to move from
 * - to (string) : path to move to
 */

var move = function (from, to) {

  return fs.read(from).then(function (contents) {
    return fs.remove(from).return(contents);
  }).then(function (contents) {
    contents = move.parse(from, to, contents);
    return fs.write(to, contents);
  });

};

move.parse = function (from, to, contents) {
  var folder = Path.dirname(to);
  return dependent.parse(from, contents, function (fullPath, original) {
    return Path.relativeTo(folder, fullPath);
  });
};

module.exports = move;

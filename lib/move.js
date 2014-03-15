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
var extension = require('./extension');
var Path      = require('path');


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

  var folder = Path.dirname(from);

  return fs.read(from).then(function (contents) {
    return fs.remove(from).return(contents);
  }).then(function (contents) {
    contents = dependent(contents, function (fullPath, original) {
      var newPath = Path.relative(folder, fullPath);
      if (newPath[0] !== '.') newPath = './' + newPath;

      return newPath;
    });
    return fs.write(to, contents);
  });

};

module.exports = move;

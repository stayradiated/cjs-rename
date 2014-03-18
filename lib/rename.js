'use strict';

var Promise   = require('bluebird');
var dependent = require('./dependent');
var Path      = require('./path');
var scan      = require('./scan');

var IGNORE = function () { return undefined; };
var EXISTS = function (x) { return x !== undefined; };


/*
 * Rename
 *
 * TODO: figure out the difference between files and filelist
 * files = [{ from: '...', to: '...' }]
 * filelist = [ '...', '...', '...' ]
 *
 * - files (array)
 * - filelist (array)
 * > promise > array of changes
 */

var rename = function rename (files, filelist) {
  var self = this;

  return Promise.map(filelist, function (file) {
    return rename.parse(file, files).catch(IGNORE);
  }).filter(EXISTS);

};


/*
 * Parse
 *
 * This function does most of the work.
 *
 * 1. Get the path to the folder that the file is in.
 * 2. Match any 'require()'s in the file contents
 *    For each require:
 *    3. Get the fullpath to the required file
 *    4. Check the path against the path we are looking for
 *    5. Replace the path with a relative path to the new file
 *    6. Mark the file as modified
 * 7. Check if we made any modifications
 * 8. Add a new record to `this.changes`
 *
 * - filepath (string) : path to the file
 * - files (array) : output of `rename.scan`
 * > boolean : if changes were made or not
 */

rename.parse = function parse (filepath, files) {
  var count = 0;
  var folder = Path.dirname(filepath);
  var len = files.length;

  return dependent(filepath, function (fullPath, original) {
    for (var i = 0; i < len; i++) {
      var file = files[i];

      fullPath = Path.extension.match(fullPath, file.from);
      if (fullPath !== file.from) continue;

      count += 1;
      var newPath = Path.relativeTo(folder, file.to);
      return Path.extension.match(newPath, original, file.to);
    }
    return original;
  }).then(function (output) {

    // Don't do anything unless we made changes
    if (count === 0) return undefined;

    // Return info
    return {
      path: filepath,
      count: count,
      contents: output
    };

  });
};


module.exports = rename;

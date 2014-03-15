'use strict';

var Promise = require('bluebird');
var fs      = require('./fs');
var Path    = require('path');
var dependent = require('./dependent');
var extension = require('./extension');


/**
 * Rename
 *
 * - opts (object) : options
 *   - from (string) : path to current file name
 *   - to (string) : path to new file name
 *   - folder (string) : path to folder to search
 *   - [cwd] (string) : path to cwd 
 *   - [dryrun] (boolean) : whether to save changes or not
 */

function Rename (opts) { 
  if (! (this instanceof Rename)) return new Rename(opts);

  // Required options
  if (! opts.to) throw 'Must specify "options.to"';
  if (! opts.from) throw 'Must specify "options.from"';

  // Expand relative paths
  this.cwd    = opts.cwd || process.cwd();
  this.from   = Path.resolve(this.cwd, opts.from);
  this.folder = opts.folder ? Path.resolve(this.cwd, opts.folder) : this.cwd;
  this.to     = Path.resolve(this.cwd, opts.to);
  this.dryrun = opts.dryrun === true;

  // Will store a record of all the files modified
  this.changes = [];
}


/**
 * Run
 *
 * Start the rename process.
 *
 * - [fn] (function) : callback
 * > promise
 */

Rename.prototype.run = function run (fn) {
  var self = this;

  return fs.readdir(this.folder)
  .map(function (file) {
    return self._replace(file);
  }).then(function () {
    if (! self.dryrun) return self.save();
  }).then (function () {
    if (fn) fn(null, self.changes);
    return self.changes;
  }).catch(function (err) {
    if (fn) fn(err);
    throw err;
  });

};


/**
 * Save
 *
 * Save changes to disk.
 */

Rename.prototype.save = function save () {
  Promise.map(this.changes, function(file) {
    fs.write(file.path, file.contents);
  });
};



/**
 * (Private) Replace
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
 * - contents (string) : the contents of the file
 * > boolean : if changes were made or not
 */

Rename.prototype._replace = function _replace (filepath) {
  var self = this;
  var changes = 0;
  var folder = Path.dirname(filepath);

  return dependent(filepath, function (fullPath, original) {
    fullPath = extension.match(fullPath, self.from);
    if (fullPath !== self.from) return original;

    changes += 1;
    var newPath = self._relativeTo(folder);
    return extension.match(newPath, original, self.to);
  }).then(function (output) {

    // Don't do anything unless we made changes
    if (! changes) return false;

    // Add to pending
    self.changes.push({ path: filepath, count: changes, contents: output });
    return true;
  });
};



/**
 * (Private) Relative To
 *
 * Get the relative path to the `this.to` path from a folder.
 * Used to get the new path for 'require("../some/relative/path")';
 *
 * - folder (string) : path to a folder. e.g. `/foo/bar`
 * > string : relative path to `this.to`. e.g. `../bar/app.js`
 */

Rename.prototype._relativeTo = function _relativeTo (folder) {
  var path = Path.relative(folder, this.to);
  if (path[0] !== '.') path = './' + path;
  return path;
};

module.exports = Rename;

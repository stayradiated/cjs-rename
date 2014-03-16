'use strict';

var Promise   = require('bluebird');
var fs        = require('./fs');
var dependent = require('./dependent');
var Path      = require('./path');
var move      = require('./move');


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
    if (file === self.from) {
      return self._move(self.from, self.to);
    } 
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
  Promise.map(this.changes, function(change) {
    switch (change.type) {
      case 'fix':
        return fs.write(change.path, change.contents);
      case 'move':
        return move(change.from, change.to);
    }
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
    fullPath = Path.extension.match(fullPath, self.from);
    if (fullPath !== self.from) return original;

    changes += 1;
    var newPath = Path.relativeTo(folder, self.to);
    return Path.extension.match(newPath, original, self.to);
  }).then(function (output) {

    // Don't do anything unless we made changes
    if (! changes) return false;

    // Add to pending
    self.changes.push({
      type: 'fix',
      path: filepath,
      count: changes,
      contents: output
    });
    return true;
  });
};

Rename.prototype._move = function (from, to) {
  this.changes.push({
    type: 'move',
    from: from,
    to: to
  });
};


module.exports = Rename;

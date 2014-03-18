'use strict';

var Promise   = require('bluebird');
var fs        = require('./fs');
var dependent = require('./dependent');
var Path      = require('./path');
var move      = require('./move');
var scan      = require('./scan');


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
  this.mode   = opts.mode || 'path';

  // Will store a recored of all the files to be moved
  this.files = [];

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
  return fs.readdir(this.folder)
  .bind(this).then(this._scan)
  .then(function () {
    if (! this.dryrun) return this.save();
  }).then (function () {
    if (fn) fn(null, this.changes);
    return this.changes;
  }).catch(function (err) {
    if (fn) fn(err);
    throw err;
  });
};

Rename.prototype._scan = function _scan (contents) {
  var self = this;

  this.files = scan({
    mode: this.mode,
    from: this.from,
    to: this.to,
    input: contents
  });

  return Promise.map(contents, function (file) {
    return self._replace(file).catch(function (err) {
      console.log('err', err);
    });
  });

};


/**
 * Save
 *
 * Save changes to disk.
 * It's a two stage process:
 * 1. Write changes to disk
 * 2. Move files around
 *
 */

Rename.prototype.save = function save () {
  return Promise.map(this.changes, function (file) {
    return fs.write(file.path, file.contents);
  }).return(this.files).map(function (file) {
    return move(file.from, file.to);
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
  var count = 0;
  var folder = Path.dirname(filepath);
  var len = this.files.length;
  var file;

  return dependent(filepath, function (fullPath, original) {
    for (var i = 0; i < len; i++) {
      file = self.files[i];

      fullPath = Path.extension.match(fullPath, file.from);
      if (fullPath !== file.from) continue;

      count += 1;
      var newPath = Path.relativeTo(folder, file.to);
      return Path.extension.match(newPath, original, file.to);
    }

    return original;
  }).then(function (output) {

    // Don't do anything unless we made changes
    if (count === 0) return false;

    // Add to pending
    self.changes.push({
      path: filepath,
      count: count,
      contents: output
    });
    return true;
  });
};

module.exports = Rename;

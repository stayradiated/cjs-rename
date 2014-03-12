'this.folderuse strict';

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
 *   - [save] (boolean) : whether to save changes or not
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
  this.dryrun = !! opts.dryrun;

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
    return self._readFile(file);
  }).then(function () {
    if (self.dryrun) return self.save();
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
 * (Private) Read File
 *
 * Reads the contents of a file.
 * Also handles errors.
 *
 * - path (string) : path to a file
 * > promise > resolves with the output of `this._replace`
 */

Rename.prototype._readFile = function _readFile (path) {
  var self = this;

  return fs.read(path).then(function (contents) {
    return self._replace(path, contents);
  }).catch(function (err) {
    throw new Error('Error reading:' + path + '. Message:', err);
  });
};

/*
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

Rename.prototype._replace = function _replace (filepath, contents) {
  var self = this;
  var changes = 0;
  var folder = Path.dirname(filepath);

  var output = dependent(contents, function (line, path) {
    var fullPath = Path.resolve(folder, path);
    fullPath = extension.match(fullPath, self.from);
    if (fullPath !== self.from) return line;

    changes += 1;
    var newPath = self._relativeTo(folder);
    newPath = extension.match(newPath, path, self.to);
    return line.replace(path, newPath);
  });

  // Don't do anything unless we made changes
  if (! changes) return false;

  // Add to pending
  this.changes.push({ path: filepath, count: changes, contents: output });
  return true;
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

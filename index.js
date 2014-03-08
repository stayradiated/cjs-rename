'use strict';

var Promise = require('bluebird');
var readdir = Promise.promisify(require('recursive-readdir-filter'));
var fs      = Promise.promisifyAll(require('fs'));
var Path    = require('path');

var JS_EXTN = /\.js$/;
var REQUIRE = /[^\.\w]require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g;
var READDIR_OPTIONS = {
  filterDir: function (stat) {
    return stat.name !== 'node_modules';
  },
  filterFile: function (stat) {
    return JS_EXTN.test(stat.name);
  }
};

// options = {
// from: <path to old name>
// to: <path to new name>
// folder: [ <folders to rename files in> ]
// }

function Rename (options) { 
  if (! (this instanceof Rename)) return new Rename(options);

  // Required options
  if (! options.to) throw 'Must specify "options.to"';
  if (! options.from) throw 'Must specify "options.from"';
  if (! options.folder) throw 'Must specify "options.folder"';

  // Expand relative paths
  this.cwd    = options.cwd || process.cwd();
  this.from   = Path.resolve(this.cwd, options.from);
  this.folder = Path.resolve(this.cwd, options.folder);
  this.to     = Path.resolve(this.cwd, options.to);

  // Will store a record of all the files modified
  this.changes = [];
}


/**
 * Run
 *
 * Start the rename process.
 *
 * - fn (function) : callback
 */

Rename.prototype.run = function run (fn) {
  var self = this;

  return readdir(this.folder, READDIR_OPTIONS).then(function (files) {
    var promises = [];
    for (var i = 0, len = files.length; i < len; i++) {
      promises.push(self._readFile(files[i]))
    }
    return Promise.all(promises);
  }).then(function () {
    return fn(null, self.changes);
  }).catch(function (err) {
    fn(err);
  }).done();

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
  return fs.readFileAsync(path).then(function (contents) {
    return self._replace(path, contents.toString());
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
 * 9. Save the file
 *
 * - filepath (string) : path to the file
 * - contents (string) : the contents of the file
 * > undefined : if the file didn't change
 * > promise : resolves when the file is written
 */

Rename.prototype._replace = function _replace (filepath, contents) {
  var self = this;
  var changes = 0;
  var folder = Path.dirname(filepath);

  var output = contents.replace(REQUIRE, function (line, path) {
    var fullPath = Path.resolve(folder, path);
    fullPath = self._addExtension(fullPath);
    if (fullPath !== self.from) return line;

    changes += 1;
    var newPath = self._relativeTo(folder);
    return line.replace(path, newPath);
  });

  // Don't do anything unless we made changes
  if (! changes) return;

  // Update file
  var relativeFilepath = Path.relative(this.cwd, filepath);
  this.changes.push({ path: relativeFilepath, count: changes });
  return fs.writeFileAsync(filepath, output);
};


/*
 * (Private) Add Extension
 *
 * Adds the '.js' extension to a path.
 * If the path already has athe extension, it will not do anything.
 * Used because 'require("./file")' don't require extensions.
 *
 * - path (string) : path to a js file. e.g. `./foo`
 * > string : path to a js file with extension. e.g `./foo.js`
 */

Rename.prototype._addExtension = function _addExtension (path) {
  if (JS_EXTN.test(path)) return path;
  return path + '.js';
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
}

module.exports = Rename;

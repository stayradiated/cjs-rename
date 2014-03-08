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

Rename.prototype.run = function (fn) {
  var self = this;

  return readdir(this.folder, READDIR_OPTIONS).then(function (files) {

    var promises = [];

    for (var i = 0, len = files.length; i < len; i++) {
      promises.push(self._readFile(files[i]))
    }

    Promise.all(promises).then(function () {
      fn(null, self.changes);
    });

  }).catch(function (err) {
    fn(err);
  });

};

Rename.prototype._readFile = function _readFile (path) {
  var self = this;
  return fs.readFileAsync(path).then(function (contents) {

    // Ignore files that don't have the '.js' extension
    if (! JS_EXTN.test(path)) return;

    // Parse the file contents
    self._replace(path, contents.toString());

  }).catch(function (err) {

    // log files that could not be read
    throw new Error('Error reading:' + path + '. Message:', err);

  });

};

Rename.prototype._replace = function _parseFile (filepath, contents) {
  var self = this;
  var changes = 0;
  var folder = Path.dirname(filepath);

  var output = contents.replace(REQUIRE, function (line, path) {

    // Get the full path to the required file
    var fullPath = Path.resolve(folder, path);

    // Add the '.js' extension if it doesn't have it already
    fullPath = self._forceExtension(fullPath);

    // Check if the path matches what are are replacing
    if (fullPath !== self.from) return line;

    // Get the relative path to the new file from this file
    var newPath = self._relative(folder);

    changes += 1;
    return line.replace(path, newPath);

  });

  // Don't do anything unless we made changes
  if (! changes) return;

  var relativeFilepath = Path.relative(this.cwd, filepath);

  this.changes.push({
    path: relativeFilepath,
    count: changes
  });

  // Write to disk
  return fs.writeFileAsync(filepath, output);
};

Rename.prototype._forceExtension = function _forceExtension (path) {
  if (JS_EXTN.test(path)) {
    return path;
  } else {
    return path + '.js';
  }
};

Rename.prototype._relative = function (folder) {
  var path = Path.relative(folder, this.to);
  if (path[0] !== '.') {
    path = './' + path;
  }
  return path;
}

module.exports = Rename;

/*
 *
 * fs.js
 *
 * Handles working with the file system.
 *
 * This includes:
 *   - Reading a files contents
 *   - Writing a files contents
 *   - Getting a list of files in a directory
 *
 * All methods return promises.
 *
 */

'use strict';

var Promise = require('bluebird');
var readdir = Promise.promisify(require('recursive-readdir-filter'));
var nodefs  = Promise.promisifyAll(require('fs'));

var EXTENSIONS = /\.(js|coffee)$/;
var READDIR_OPTIONS = {
  filterDir: function (stat) {
    return stat.name !== 'node_modules';
  },
  filterFile: function (stat) {
    return EXTENSIONS.test(stat.name);
  }
};



var fs = {

  readdir: function (dir) {
    return readdir(dir, READDIR_OPTIONS);
  },

  read: function (path) {
    return nodefs.readFileAsync(path).call('toString');
  },

  write: function (path, contents) {
    return nodefs.writeFileAsync(path, contents);
  },

  remove: function (path) {
    return nodefs.unlinkAsync(path);
  }

};

module.exports= fs;

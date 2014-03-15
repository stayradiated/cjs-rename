/**
 * Mock FS
 *
 * Simple stub for ../lib/fs
 */

'use strict';

var Promise = require('bluebird');

var fs = {
  _data: {},

  readdir: function (path) {
    return Promise.resolve([]);
  },

  read: function (path) {
    var value = fs._data[path];
    return Promise.resolve(value);
  },

  write: function (path, contents) {
    fs._data[path] = contents;
    return Promise.resolve();
  },

  remove: function (path) {
    delete fs._data[path];
    return Promise.resolve();
  },

};

module.exports = fs;

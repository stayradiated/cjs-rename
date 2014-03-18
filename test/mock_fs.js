/**
 * Mock FS
 *
 * Simple stub for ../lib/fs
 */

'use strict';

var Promise = require('bluebird');

var fs = {
  MOCK: true,
  _data: {},

  readdir: function (path) {
    var match = [];
    for (var key in this._data) {
      if (key.indexOf(path) === 0) {
        match.push(key);
      }
    }
    return Promise.resolve(match);
  },

  read: function (path) {
    var value = fs._data[path];
    return value === undefined ?
      Promise.reject(path) : Promise.resolve(value);
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

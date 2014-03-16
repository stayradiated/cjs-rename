/*
 *
 * extension.js
 *
 * Handles path extensions.
 * Uses the core node module 'path'.
 *
 */

'use strict';

var nodepath = require('path');

var Path = {

  dirname: nodepath.dirname,
  relative: nodepath.relative,
  resolve: nodepath.resolve,

  /**
   * (Private) Relative To
   *
   * Get the relative path to the `this.to` path from a folder.
   * Used to get the new path for 'require("./some/relative/path")';
   *
   * - folder (string) : path to a folder. e.g. `/foo/bar`
   * > string : relative path to `this.to`. e.g. `../bar/app.js`
   */

  relativeTo: function (folder, path) {
    var newPath = nodepath.relative(folder, path);
    if (newPath[0] !== '.') newPath = './' + newPath;
    return newPath;
  },

  extension: {

    get: nodepath.extname,

    exists: function (path) {
      return this.get(path).length > 0;
    },

    /*
     * Match Extension
     *
     * Adds or removes the extension from a path, depending if another path
     * has that extension.
     *
     * Example:
     *   ['path.js', 'original'] => 'path'
     *   ['path', 'original.js'] => 'path.js'
     *   ['path', 'original'] => 'path'
     *   ['path.js', 'original.js'] => 'path.js'
     *
     * - path (string) : path to fix
     * - original (string) : path to match against
     * - [extension] (string) : extension to add. Default: original
     * > string : fixed path
     */

    match: function (path, original, extension) {
      var pathExt = this.exists(path);
      var origExt = this.exists(original);

      if (pathExt === origExt) {
        return path;
      } else if (origExt) { // add extension
        return path + this.get(extension || original);
      } else { // remove extension
        return path.slice(0, -1 * this.get(path).length);
      }
    }

  }

};

module.exports = Path;

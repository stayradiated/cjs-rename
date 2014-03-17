/*
 * scan.js
 *
 * > for v0.0.5
 *
 * Scans through an array of file paths, and returns the ones that match a
 * query.
 *
 * - mode: "search", "path"
 * - from: "... search term ..."
 * - to: "... replace term ..."
 * - input: [ "path", "path" ]
 *
 * scan({
 *   mode: "search",
 *   from: "foo",
 *   to: "bar",
 *   input: [
 *      '/home/project/lib/foo.js',
 *      '/home/project/lib/qux.js',
 *      '/home/project/test/foo.js',
 *      '/home/project/test/qux.js'
 *   ]
 * });
 *
 * returns [
 *   { from: "/home/project/lib/foo.js",  to: "/home/project/lib/bar.js"  },
 *   { from: "/home/project/test/foo.js", to: "/home/project/test/bar.js" }
 * ]
 *
 * Extensions are automatically handled like so:
 *
 * +---+---+------------------------------------------------------------------+
 * | F | T | Result                                                           |
 * +---+---+------------------------------------------------------------------+
 * | o | o | Only match with `from` extension.                                |
 * |   |   | And replace with `to` extension.                                 |
 * +---+---+------------------------------------------------------------------+
 * | o |   | Only match with `from` extension.                                |
 * |   |   | And replace with `from` extension.                               |
 * +---+---+------------------------------------------------------------------+
 * |   | o | Match any extension.                                             |
 * |   |   | And replace with `to` extension.                                 |
 * +---+---+------------------------------------------------------------------+
 * |   |   | Match any extension.                                             |
 * |   |   | And replace with matched extension.                              |
 * +---+---+------------------------------------------------------------------+
 *
 */

'use strict';

var Path = require('./path');

var scan = function (options) {
  switch (options.mode) {
    case 'search':
      return scan.search(options);
    case 'path':
      return scan.search(options);
  }
};

scan.path = function (options) {
  var to     = options.to;
  var from   = options.from;
  var input  = options.input;
  var output = [];

  var path;
  for (var i = 0, len = input.length; i < len; i++) {
    path = input[i];

    // if from does not have extension
    // get extension from path and add it to from
    // e.g. from = '/foo' -> path = '/foo.js' -> from = '/foo.js'

    // if to does not have extension
    // if from has extension -> use to extension
    // if from has no extension -> use match extension

    if (path === from) {
      output.push({
        from: path,
        to: to
      });
    }
  }

  return output;
};

scan.search = function (options) {
};

module.exports = scan;

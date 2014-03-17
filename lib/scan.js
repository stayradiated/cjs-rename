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

var GET_MATCH = function (path) {
  for (var i = 0, len = this.length; i < len; i++) {
    if (this[i].from === path) return this[i];
  }
  return undefined;
};

var scan = function (options) {
  var match;
  switch (options.mode) {
    case 'path':
      match = scan.path(options);
      break;
    case 'search':
      match = scan.search(options);
      break;
  }
  match.get = GET_MATCH;
  return match;
};

scan.path = function (options) {
  var output = [];

  var path, from, to;
  for (var i = 0, len = options.input.length; i < len; i++) {
    path = options.input[i];
    from = Path.extension.match(options.from, path);
    to = Path.extension.match(options.to, from);

    if (path === from) {
      output.push({ from: path, to: to });
    }
  }

  return output;
};

scan.search = function (options) {
  var output = [];

  var toFile = Path.basename(options.to);
  var fromFile = Path.basename(options.from);

  var path, basename, folder, from, to;
  for (var i = 0, len = options.input.length; i < len; i++) {

    path = options.input[i];
    basename = Path.basename(path);
    from = Path.extension.match(fromFile, basename);

    if (basename === from) {
      folder = Path.dirname(path);
      to = Path.extension.match(toFile, basename);
      output.push({
        from: path,
        to: Path.join(folder, to)
      });
    }
  }

  return output;
};

module.exports = scan;

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
var xtnd = require('xtnd');


/*
 * Scan
 *
 * - options (object)
 *   - mode (string)
 *   - input (array)
 *   - to (string)
 *   - from (string)
 * > array
 */

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


/*
 * Scan Path
 *
 * - options (object)
 */

scan.path = function (options) {
  var paths = xtnd.map(options.input, function (path) {
    var from = Path.extension.match(options.from, path);
    var to = Path.extension.match(options.to, from);
    if (path === from) return { from: path, to: to, move: true };
  });
  if (! paths.length) {
    paths.push({ from: options.from, to: options.to, move: false });
  }
  return paths;
};


/*
 * Scan Search
 *
 * Scan files by searching for matching filenames
 *
 * - options (object)
 *   - to (string) : to path
 *   - from (string) : from path
 *   - input (array) : array of file paths
 * > array [{ from: '...', to: '...' }, {...}]
 */

scan.search = function (options) {
  var output = [];

  // Get filenames from paths.
  // e.g. /folder/foo.js => foo.js
  var toFile = Path.basename(options.to);
  var fromFile = Path.basename(options.from);

  return xtnd.map(options.input, function (path) {
    var basename = Path.basename(path);
    var from = Path.extension.match(fromFile, basename);
    if (basename === from) {
      var to = Path.extension.match(toFile, basename);
      var folder = Path.dirname(path);
      return {
        from: path,
        to: Path.join(folder, to),
        move: true
      };
    }
  });
};


/*
 * (Private) Get Match
 *
 * Helper fn for scan results.
 * Returns the result with a matching 'from' path.
 * Returns undefined if it can't find anything.
 *
 * - path (string) : path to search for
 * > object : { from: path, to: '...' }
 */

var GET_MATCH = function (path) {
  return xtnd.find(this, function (val) {
    if (val.from === path) return val;
  });
};


module.exports = scan;

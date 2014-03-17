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
  var toExt   = Path.extension.get(options.to);
  var fromExt = Path.extension.get(options.from);

  var path, pathExt, from, to;
  for (var i = 0, len = options.input.length; i < len; i++) {

    path = options.input[i];
    pathExt = Path.extension.get(path);

    // if options.from does not have extension
    // then from = options.from + pathExt
    // e.g. from = '/foo' -> path = '/foo.js' -> from = '/foo.js'

    from = fromExt.length ? options.from
      : options.from + pathExt;

    // if options.to does not have extension
    //  if from has extension
    //    to = options.to + fromExt
    //  else
    //    to = options.to + pathExt
    // else
    //  just use options.to

    to = toExt.length ? options.to :
      options.to + (fromExt.length ? fromExt : pathExt );

    if (path === from) {
      output.push({ from: path, to: to });
    }
  }

  return output;
};

scan.search = function (options) {
};

module.exports = scan;

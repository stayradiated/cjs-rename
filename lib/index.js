'use strict';

var Promise = require('bluebird');
var fs      = require('./fs');
var Path    = require('./path');
var rename  = require('./rename');
var scan    = require('./scan');
var move    = require('./move');

var MODE_PATH = 'path';
var MODE_SEARCH = 'search';
var MODE_DEFAULT = MODE_PATH;

/*
 * App
 *
 * - opts (object) : options
 *   - from (string) : path to current file name
 *   - to (string) : path to new file name
 *   - [cwd] (string) : path to cwd. Default process.cwd()
 *   - [dryrun] (boolean) : whether to save changes or not
 *   - [mode] (string) : 'search' or 'path'. Default: 'path'
 */

var App = function (opts) {
  if (! (this instanceof App)) return new App(opts);

  // Required options
  if (! opts.to) throw 'Must specify "options.to"';
  if (! opts.from) throw 'Must specify "options.from"';

  // Expand relative paths
  this.cwd    = opts.cwd || process.cwd();
  this.from   = opts.from;
  this.to     = opts.to;
  this.dryrun = opts.dryrun === true;
  this.mode   = opts.mode || MODE_DEFAULT;

  // Resolve paths to absolute values
  if (this.mode === MODE_PATH) {
    this.to = Path.resolve(this.cwd, this.to);
    this.from = Path.resolve(this.cwd, this.from);
  }

  // Will store a recored of all the files to be moved
  this.files = [];

  // Will store a record of all the files modified
  this.changes = [];
};


/*
 * Run
 *
 * Start the rename process.
 *
 * - [fn] (function) : callback
 * > promise > this.changes
 */

App.prototype.run = function run (fn) {
  return Promise.bind(this)
  .then(function () {
    return fs.readdir(this.cwd);
  }).then(function (filelist) {
    this.files = scan({
      mode: this.mode,
      from: this.from,
      to: this.to,
      input: filelist
    });
    return rename(this.files, filelist);
  }).then(function (changes) {
    this.changes = changes;
    if (! this.dryrun) return this.save();
  }).then(function () {
    if (fn) fn(null, this.changes);
    return this.changes;
  }).catch(function (err) {
    if (fn) fn(err);
    throw err;
  });
};


/*
 * Save
 *
 * Save changes to disk.
 * It's a two stage process:
 * 1. Write changes to disk
 * 2. Move files around
 *
 */

App.prototype.save = function save () {
  return Promise.map(this.changes, function (file) {
    return fs.write(file.path, file.contents);
  }).return(this.files).map(function (file) {
    return move(file.from, file.to);
  });
};


module.exports = App;

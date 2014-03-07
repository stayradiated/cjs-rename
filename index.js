'use strict';

var readdir = require('recursive-readdir');
var commander = require('commander');
var fs = require('fs');
var Path = require('path');
var recast = require('recast');
var traverse = require('ast-traverse');

var builders = recast.types.builders;
var types = recast.types.namedTypes;

var JS_EXTN = /\.js$/;

// options = {
// from: <path to old name>
// to: <path to new name>
// folder: [ <folders to rename files in> ]
// }

function Rename (options) { 
  console.log(options);

  if (! options.to) throw 'Must specify "options.to"';
  if (! options.from) throw 'Must specify "options.from"';
  if (! options.folder) throw 'Must specify "options.folder"';

  this.from = Path.resolve(__dirname, options.from);
  this.folder = Path.resolve(__dirname, options.folder);
  this.to = options.to;

  console.log(this);

}

Rename.prototype.init = function () {
  var self = this;

  // TODO: use an array of folders
  readdir(this.folder, function (err, files) {

    if (err) {
      return console.log('Error with folder', err);
    }

    for (var i = 0, len = files.length; i < len; i++) {
      self._readFile(files[i]);
    }
  });

};

Rename.prototype._readFile = function _readFile (path) {
  var self = this;
  fs.readFile(path, function (err, contents) {
    if (err) {
      console.log('Error parsing:' + path + '. Message:', err);
    } else if (! JS_EXTN.test(path)) {
      console.log('Ignoring', path);
    } else {
      self._parseFile(path, contents.toString());
    }
  });
};

Rename.prototype._parseFile = function _parseFile (filepath, contents) {

  console.log('\n===', filepath);

  var ast = recast.parse(contents);
  var visitor = this._Visitor(filepath);
  visitor.visit(ast);

  if (visitor.modified) {
    // console.log(recast.print(ast).code);
  }

};

Rename.prototype._forceExtension = function _forceExtension (path) {
  if (JS_EXTN.test(path)) {
    return path;
  } else {
    return path + '.js';
  }
};

Rename.prototype._Visitor = function (filepath) {
  var self = this;
  var visitor = null;
  var Visitor =  recast.Visitor.extend({
    visitCallExpression: function (node) {
      var func = node.callee;

      var isIdentifier = types.Identifier.check(func);
      if (! isIdentifier) return;

      var isRequire = func.name === 'require';
      if (! isRequire) return;

      var hasArg = node.arguments.length;
      if (! hasArg) return;

      var arg = node.arguments[0];

      var argIsString = types.Literal.check(arg);
      if (! argIsString) return;

      var path = arg.value;

      var isRelativePath = (path[0] === '.'); 
      if (! isRelativePath) return;

      var path = Path.resolve(self.folder, path);
      path = self._forceExtension(path);

      if (path !== self.from) return;

      console.log(path);
      visitor.modified = true;

      // replace argument
      arg.value = Path.relative(filepath, self.to);

      console.log(arg);

    }
  });
  visitor = new Visitor();
  return visitor;
};

module.exports = Rename;

'use strict';

var assert = require('assert');
var rewire = require('rewire');
var fs     = require('./mock_fs');

var Rename = rewire('../lib/rename');
var dependent = rewire('../lib/dependent');
var move = rewire('../lib/move');

var SAMPLE = {
  cwd: '/Home',
  to: './new.js',
  from: './old.js',
  folder: '.'
};

describe('rename', function () {

  before(function () {
    move.__set__('fs', fs);
    dependent.__set__('fs', fs);
    Rename.__set__('fs', fs);
    Rename.__set__('move', move);
    Rename.__set__('dependent', dependent);
  });

  describe('constructor', function () {

    it('should use absolute paths', function () {

      var rename = new Rename({
        cwd: '/Home',
        to: './files/foo.js',
        from: './files/bar.js',
        folder: './files'
      });

      assert.equal(rename.cwd, '/Home');
      assert.equal(rename.to, '/Home/files/foo.js');
      assert.equal(rename.from, '/Home/files/bar.js');
      assert.equal(rename.folder, '/Home/files');
    });

    it('should work without "new" keyword', function () {
      // gets jshint to shutup about a missing new keyword
      var renameFactory = Rename;
      var rename = renameFactory(SAMPLE);

      assert(rename instanceof Rename);
      assert.equal(rename.cwd, '/Home');
    });

  });

  describe('_replace', function (done) {

    it('should match paths without extensions', function (done) {
      var path = '/test/rename/replace.js';

      var rename = new Rename({
        cwd: '/test/rename',
        from: './old.js',
        to: './new.js'
      });

      rename.files = [{
        from: '/test/rename/old.js',
        to: '/test/rename/new.js'
      }];

      var input = [
        'require("./old");',
        'require("./old.js");',
        'require("./old.coffee");',
        'require("./old.min.js");'
      ].join('\n');

      var output = [{
        path: path,
        count: 2,
        contents: [
          'require("./new");',
          'require("./new.js");',
          'require("./old.coffee");',
          'require("./old.min.js");'
        ].join('\n')
      }];

      fs.write(path, input);

      rename._replace(path, input).then(function () {
        assert.deepEqual(rename.changes, output);
        done();
      }).done();
    });

  });

  describe('_scan', function () {

    it('should scan for matching files', function (done) {

      var rename = new Rename({
        cwd: '/test/rename/_scan',
        from: 'old',
        to: 'new'
      });

      fs.write('/test/rename/_scan/old.js', '');
      fs.write('/test/rename/_scan/foo.js', '');

      rename._scan([
        '/test/rename/_scan/old.js',
        '/test/rename/_scan/foo.js',
        '/test/rename/_scan/bar.js'
      ]).then(function () {
        // TODO: assert something
        done();
      }).done();

    });

  });

  describe('run', function () {

    it('should replace by searching', function (done) {

      var prefix = '/test/rename/run';

      var rename = new Rename({
        cwd: prefix,
        from: 'old',
        to: 'new',
        mode: 'search'
      });

      fs.write(prefix + '/old.js','');
      fs.write(prefix + '/folder/old.js', '');

      rename.run().then(function () {
        return fs.readdir(prefix);
      }).then(function (files) {
        assert.deepEqual(files, expectedFiles);
        done();
      }).done();

      var expectedFiles = [
        prefix + '/new.js',
        prefix + '/folder/new.js',
      ];

    });

  });

});

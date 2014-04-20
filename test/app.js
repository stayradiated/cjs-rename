'use strict';

var assert = require('chai').assert;
var unwire = require('unwire');
var App = require('../lib/index');
var ncp = require('ncp');
var fs = require('fs');
var mfs = require('./mock_fs');

var TESTDIR = __dirname + '/testdir';
var BACKUP = __dirname + '/testdir-backup';
var EXPECTED = __dirname + '/testdir-expected';

var SAMPLE = {
  cwd: '/Home',
  to: './new.js',
  from: './old.js',
  folder: '.'
};

var sort = function (arr) {
  return arr.sort(function (a, b) {
    a = a.path || a.from;
    b = b.path || b.from;
    return a.localeCompare(b);
  });
};

describe('app', function () {

  beforeEach(function (done) {
    ncp(BACKUP, TESTDIR, function (err) {
      if (err) return console.error(err);
      done();
    }); 
  });

  describe('constructor', function () {

    it('should use absolute paths', function () {

      var app = new App({
        cwd: '/Home',
        to: './files/foo.js',
        from: './files/bar.js',
        folder: './files'
      });

      assert.equal(app.cwd, '/Home');
      assert.equal(app.to, '/Home/files/foo.js');
      assert.equal(app.from, '/Home/files/bar.js');
    });

    it('should work without "new" keyword', function () {
      // gets jshint to shutup about a missing new keyword
      var factory = App;
      var app = factory(SAMPLE);

      assert(app instanceof App);
      assert.equal(app.cwd, '/Home');
    });

  });


  it('should rename file dependencies', function (done) {

    var expectedChanges = [
      { path: TESTDIR + '/custom.coffee', count: 3,
        contents: fs.readFileSync(EXPECTED + '/custom.coffee').toString() },
      { path: TESTDIR + '/extension.js', count: 3,
        contents: fs.readFileSync(EXPECTED + '/extension.js').toString() },
      { path: TESTDIR + '/quotes.js', count: 2,
        contents: fs.readFileSync(EXPECTED + '/quotes.js').toString() },
      { path: TESTDIR + '/folder/parent.js', count: 1,
        contents: fs.readFileSync(EXPECTED + '/folder/parent.js').toString() },
      { path: TESTDIR + '/regex.js', count: 1,
        contents: fs.readFileSync(EXPECTED + '/regex.js').toString() }
    ];

    var app = new App({
      to: './done',
      from: './replace',
      cwd: __dirname + '/testdir'
    });

    app.run(function (err, changes) {
      assert.ifError(err);
      assert.deepEqual(sort(changes), sort(expectedChanges));
      done();
    }).done();
  });

  describe('run', function () {

    var App;
    
    before(function () {
      unwire.flush();
      var move = unwire('../lib/move');
      App = unwire('../lib/index');
      move.__set__('fs', mfs);
      App.__set__('fs', mfs);
    });

    after(function () {
      unwire.flush();
    });

    it('should replace by searching', function (done) {

      var prefix = '/test/app/run';

      var app = new App({
        cwd: prefix,
        from: 'old',
        to: 'new',
        mode: 'search'
      });

      mfs.write(prefix + '/old.js','');
      mfs.write(prefix + '/folder/old.js', '');

      app.run().then(function () {
        return mfs.readdir(prefix);
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

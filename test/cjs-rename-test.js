var assert = require('assert');
var Rename = require('../lib/rename');
var ncp = require('ncp');
var fs = require('fs');

var TESTDIR = __dirname + '/testdir';
var BACKUP = __dirname + '/testdir-backup';
var EXPECTED = __dirname + '/testdir-expected';

var SAMPLE = {
  cwd: '/Home',
  to: '/new.js',
  from: '/old.js',
  folder: '.'
};

describe('cjs-rename', function () {

  before(function (done) {
    ncp(BACKUP, TESTDIR, done); 
  });

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
    var rename = Rename(SAMPLE);

    assert(rename instanceof Rename);
    assert.equal(rename.cwd, '/Home');
  });

  it('should rename files', function (done) {

    var expectedChanges = [
      { path: TESTDIR + '/extension.js', count: 2,
        contents: fs.readFileSync(EXPECTED + '/extension.js').toString() },
      { path: TESTDIR + '/quotes.js', count: 2,
        contents: fs.readFileSync(EXPECTED + '/quotes.js').toString() },
      { path: TESTDIR + '/folder/parent.js', count: 1,
        contents: fs.readFileSync(EXPECTED + '/folder/parent.js').toString() }
    ];

    var rename = new Rename({
      cwd: __dirname,
      to: './testdir/done.js',
      from: './testdir/replace.js',
      folder: './testdir/',
      save: true
    });

    rename.run(function (err, changes) {
      assert.ifError(err);
      assert.deepEqual(changes, expectedChanges);
      done();
    });
  });

  it('should add extension', function () {
    var rename = new Rename(SAMPLE);

    assert.equal(rename._addExtension('test'), 'test.js');
    assert.equal(rename._addExtension('test.js'), 'test.js');
  });

  it('should create relative paths', function () {
    var rename = new Rename(SAMPLE);

    assert.equal(rename._relativeTo('/Home/folder'), '../../new.js');
    assert.equal(rename._relativeTo('/Home'), '../new.js');
  });

});

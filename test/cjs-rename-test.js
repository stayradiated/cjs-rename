var assert = require('assert');
var Rename = require('../index');
var ncp = require('ncp');

var TESTDIR = __dirname + '/testdir';
var TESTDIR_BACKUP = __dirname + '/testdir-backup';

var SAMPLE = {
  cwd: '/Home',
  to: '/new.js',
  from: '/old.js',
  folder: '.'
};

describe('cjs-rename', function () {

  before(function (done) {
    ncp(TESTDIR_BACKUP, TESTDIR, done); 
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
      { path: 'testdir/extension.js', count: 2 },
      { path: 'testdir/quotes.js', count: 2 },
      { path: 'testdir/folder/parent.js', count: 1 }
    ];

    var rename = new Rename({
      cwd: __dirname,
      to: './testdir/new-name.js',
      from: './testdir/replace.js',
      folder: './testdir/'
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

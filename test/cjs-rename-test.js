var assert = require('assert');
var Rename = require('../index');
var ncp = require('ncp');

var TESTDIR = __dirname + '/testdir';
var TESTDIR_BACKUP = __dirname + '/testdir-backup';

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

  it('should rename files', function (done) {

    var rename = new Rename({
      cwd: __dirname,
      to: './testdir/new-name.js',
      from: './testdir/replace.js',
      folder: './testdir/'
    });

    rename.run(function (err, changes) {
      assert.ifError(err);
      console.log(changes);
      done();
    });

  });

});

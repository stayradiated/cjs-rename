'use strict';

var assert = require('assert');
var scan = require('../lib/scan');

describe('scan', function () {

  var INPUT = [

    '/pass.js',
    '/fail.js',

    '/pass.coffee',
    '/fail.coffee',

    '/folder/pass.js',
    '/folder/fail.js'

  ];

  describe('.path', function () {

    var testPath = function (options, expected) {
      var output = scan.path(options);
      assert.deepEqual(output, expected);
    };

    it('should match paths without extensions', function () {

      var options = {
        from: '/pass',
        to: '/done',
        input: INPUT
      };

      var expected = [
        { from: '/pass.js', to: '/done.js' },
        { from: '/pass.coffee', to: '/done.coffee' }
      ];

      testPath(options, expected);

    });

    it('should match paths with extensions', function () {

      var options = {
        from: '/pass.js',
        to: '/done.js',
        input: INPUT
      };

      var expected = [
        { from: '/pass.js', to: '/done.js' }
      ];

      testPath(options, expected);

    });

    it('should use `to` extension', function () {

      var options = {
        from: '/pass',
        to: '/done.js',
        input: INPUT
      };

      var expected = [
        { from: '/pass.js', to: '/done.js', },
        { from: '/pass.coffee', to: '/done.js', }
      ];

      testPath(options, expected);

    });

    it('should match in a folder', function () {

      var options = {
        from: '/folder/pass',
        to: '/folder/done',
        input: INPUT
      };

      var expected = [
        { from: '/folder/pass.js', to: '/folder/done.js' }
      ];

      testPath(options, expected);

    });

  });

  describe('.search', function () {
  });

});

'use strict';

var assert = require('chai').assert;
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
        { from: '/pass.js', to: '/done.js', move: true },
        { from: '/pass.coffee', to: '/done.coffee', move: true }
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
        { from: '/pass.js', to: '/done.js', move: true }
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
        { from: '/pass.js', to: '/done.js', move: true },
        { from: '/pass.coffee', to: '/done.js', move: true }
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
        { from: '/folder/pass.js', to: '/folder/done.js', move: true }
      ];

      testPath(options, expected);

    });

    it('should match files that do not exist', function () {
      
      var options = {
        from: '/missing.js',
        to: '/done.js'
      };

      var expected = [
        { from: '/missing.js', to: '/done.js', move: false }
      ];

      testPath(options, expected);

    });

  });

  describe('.search', function () {

    var testSearch = function (options, expected) {
      var output = scan.search(options);
      assert.deepEqual(output, expected);
    };

    it('should search without any extensions', function () {

      var options = {
        from: 'pass',
        to: 'done',
        input: INPUT
      };

      var expected = [
        { from: '/pass.js', to: '/done.js', move: true },
        { from: '/pass.coffee', to: '/done.coffee', move: true },
        { from: '/folder/pass.js', to: '/folder/done.js', move: true }
      ];

      testSearch(options, expected);

    });

    it('should search with extension', function () {

      var options = {
        from: 'pass.js',
        to: 'done',
        input: INPUT
      };

      var expected = [
        { from: '/pass.js', to: '/done.js', move: true },
        { from: '/folder/pass.js', to: '/folder/done.js', move: true }
      ];

      testSearch(options, expected);

    });

    it('should replace with extension', function () {

      var options = {
        from: 'pass',
        to: 'done.js',
        input: INPUT
      };

      var expected = [
        { from: '/pass.js', to: '/done.js', move: true },
        { from: '/pass.coffee', to: '/done.js', move: true },
        { from: '/folder/pass.js', to: '/folder/done.js', move: true }
      ];

      testSearch(options, expected);

    });

    it('should search and replace with extension', function () {

      var options = {
        from: 'pass.js',
        to: 'done.js',
        input: INPUT
      };

      var expected = [
        { from: '/pass.js', to: '/done.js', move: true },
        { from: '/folder/pass.js', to: '/folder/done.js', move: true }
      ];

      testSearch(options, expected);

    });

  });

});

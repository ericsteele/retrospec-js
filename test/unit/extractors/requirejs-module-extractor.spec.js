/*
 * requirejs-module-extractor.spec.js
 * https://github.com/ericsteele/retrospec.js
 *
 * Copyright (c) 2014 Eric Steele
 * Licensed under the MIT license.
 * https://github.com/ericsteele/retrospec.js/blob/master/LICENSE
 */
'use strict';

// Load the Chai Assertion Library
var chai = require('chai');

// Extend Chai with assertions about promises
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

// Grab Chai's assert, expect, and should interfaces
var assert = chai.assert,
    expect = chai.expect,
    should = chai.should(); // Note that should has to be executed

// Load utilities for handling and transforming file paths
var path = require('path');

// Directory containing code snippets used in our tests
var codeSnippetDirectory = path.resolve(__dirname, '../../input/code-snippets');

// Directory containing some real projects we can use for our tests
var projectsDirectory = path.resolve(__dirname, '../../input/projects');

// Module under test
var extractor = require('../../../src/extractors/requirejs-module-extractor');

describe('requirejs-module-extractor.js', function() {

  describe('.fromFile("empty.js")', function() {
    it('should extract 0 modules', function(done) {
      extractor.fromFile('empty.js', codeSnippetDirectory)
               .should.eventually.have.length(0)
               .notify(done);
    });
  });

  describe('.fromFile("single-define.js")', function() {
    it('should extract 1 module with 4 dependencies', function(done) {
      var expected = [{
        id:           'requirejs/single-define',
        dependencies: ['a','b','c','x'],
        path:         'requirejs/single-define.js',
        hash:         '9e9bf24b9dfc549949f86ef1ff184d5606c431c0'
      }];

      extractor.fromFile('requirejs/single-define.js', codeSnippetDirectory)
               .should.eventually.eql(expected)
               .notify(done);
    });
  });

  describe('.fromFile("multiple-defines.js")', function() {
    it('should extract 1 module with 12 dependencies', function(done) {
      var expected = [{
        id:           'requirejs/multiple-defines',
        dependencies: ['a','b','c','d','e','f','g','h','i','x','y','z'],
        path:         'requirejs/multiple-defines.js',
        hash:         'aa2c119ec94b1190da6d9cc6dea9c21621758d29'
      }];

      extractor.fromFile('requirejs/multiple-defines.js', codeSnippetDirectory)
               .should.eventually.eql(expected)
               .notify(done);
    });
  });

  describe('.fromFile("nested-defines.js")', function() {
    it('should extract 1 module with 12 dependencies', function(done) {
      var expected = [{
        id:           'requirejs/nested-defines',
        dependencies: ['a','b','c','d','e','f','g','h','i','x','y','z'],
        path:         'requirejs/nested-defines.js',
        hash:         '1753180b6c4d49c6053dde13197112289cf12ded'
      }];

      extractor.fromFile('requirejs/nested-defines.js', codeSnippetDirectory)
               .should.eventually.eql(expected)
               .notify(done);
    });
  });

  // rev-1.4.5-2ef45a1
  describe('.fromDirectory(["**/*.js"], "jquery-mobile/rev-1.4.5-2ef45a1/js")', function() {
    it('should extract 83 modules', function(done) {
      var cwd = path.resolve(projectsDirectory, 'jquery-mobile/rev-1.4.5-2ef45a1/js');

      extractor.fromDirectory(['**/*.js'], cwd)
               .should.eventually.have.length(83)
               .notify(done);
    });
  });

  // rev-1.3.1-74b4bec
  describe('.fromDirectory(["**/*.js"], "jquery-mobile/rev-1.3.1-74b4bec/js")', function() {
    it('should extract 66 modules', function(done) {
      var cwd = path.resolve(projectsDirectory, 'jquery-mobile/rev-1.3.1-74b4bec/js');

      extractor.fromDirectory(['**/*.js'], cwd)
               .should.eventually.have.length(66)
               .notify(done);
    });
  });

});
/*
 * select-tests.js
 * https://github.com/ericsteele/retrospec.js
 *
 * Copyright (c) 2014 Eric Steele
 * Licensed under the MIT license.
 * https://github.com/ericsteele/retrospec.js/blob/master/LICENSE
 */
'use strict';

// exports
module.exports = selectTests;

// array of modules whose dependent tests have been traced
var tracedModules;

// object map of selected test files
var selectedTests;

/**
 * Selects regression tests.
 * 
 * @param  {Project} project [description]
 * @param  {Object}  diffs   [description]
 * 
 * @return {Array} - array of regression test paths
 */
function selectTests(project, diffs) {
  // reset temp storage
  tracedModules = [];
  selectedTests = {};

  // select tests
  selectNewTests(diffs);
  selectRegressionTests(project, diffs);

  return mapToArray(selectedTests);
}

/**
 * [selectTestFile description]
 * 
 * @param  {[type]} testFilePath [description]
 * 
 * @return {[type]}              [description]
 */
function selectTestFile(testFilePath) {
  if(selectedTests[testFilePath] !== 1) {
    selectedTests[testFilePath] = 1;
  }
}

/**
 * [mapToArray description]
 * 
 * @param  {[type]} map [description]
 * 
 * @return {[type]}     [description]
 */
function mapToArray(map) {
  var array = [];

  // push all test names into an array
  for (var key in map) {
    if (map.hasOwnProperty(key)) {
      array.push(key);
    }
  }

  return array;
}

/**
 * [selectNewTests description]
 * 
 * @param  {[type]} diffs [description]
 * 
 * @return {[type]}       [description]
 */
function selectNewTests(diffs) {
  diffs.testSuites.forEach(function(testSuite) { 
    if (testSuite.change === 'Add') {
      selectTestFile(testSuite.id);
    }
  });
}

/**
 * [selectRegressionTests description]
 * 
 * @param  {[type]} project    [description]
 * @param  {[type]} diffs      [description]
 * 
 * @return {[type]}            [description]
 */
function selectRegressionTests(project, diffs) {
  diffs.modules.forEach(function(diff) {
    if (diff.change === 'Add' || diff.change === 'Edit' || diff.change === 'Move') {
      var module = project.moduleMap[diff.id];
      selectTestsForModule(module, project);
    }
  });
}

/**
 * [selectRegressionTestsForModule description]
 * 
 * @param  {String} module     [description]
 * @param  {Object} modules    [description]
 * @param  {Object} testSuites [description]
 * 
 * @return {Array} [description]
 */
function selectTestsForModule(module, project) {
  if(tracedModules.indexOf(module.id) !== -1) {
    return {};
  }

  // make sure we don't select tests for the module more than once
  tracedModules.push(module.id);

  // select all tests that depend on the module
  getTestSuitesThatDependOnModule(module, project.testSuiteMap);

  // select all tests for modules that depend on this module
  var dependentModules = findModuleDependents(module, project.moduleMap);
  selectTestsForModules(dependentModules, project);
}

/**
 * [selectTestsForModules description]
 * 
 * @param  {[type]} modules [description]
 * @param  {[type]} project [description]
 * 
 * @return {[type]}         [description]
 */
function selectTestsForModules(modules, project) {
  for(var i = 0, iEnd = modules.length; i < iEnd; i++) {
    selectTestsForModule(modules[i], project);
  }
}

/**
 * [getTestSuitesThatDependOnModule description]
 * 
 * @param  {[type]} module       [description]
 * @param  {[type]} testSuiteMap [description]
 * 
 * @return {[type]}              [description]
 */
function getTestSuitesThatDependOnModule(module, testSuiteMap) {
  for (var key in testSuiteMap) {
    if (testSuiteMap.hasOwnProperty(key)) {
      var testSuite = testSuiteMap[key];
      for(var i = 0, iEnd = testSuite.dependencies.length; i < iEnd; i++) {
        var dependency = testSuite.dependencies[i];
        if (dependency === module.id) {
          selectTestFile(key);
        }
      }
    }
  }
}

/**
 * [findModuleDependents description]
 * 
 * @param  {[type]} moduleName [description]
 * @param  {[type]} modules    [description]
 * 
 * @return {[type]}            [description]
 */
function findModuleDependents(module, modules) {
  var dependents = [];

  for (var moduleName in modules) {
    if (modules.hasOwnProperty(moduleName)) {
      var mod = modules[moduleName];
      if (mod.dependencies.indexOf(module.id) !== -1) {
        dependents.push(mod);
      }
    }
  }

  return dependents;
}
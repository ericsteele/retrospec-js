'use strict';

/**
 * @ngdoc filter
 * @name filter
 * @kind function
 *
 * @description
 * Selects a subset of items from `array` and returns it as a new array.
 *
 * @param {Array} array The source array.
 * @param {string|Object|function()} expression The predicate to be used for selecting items from
 *   `array`.
 *
 *   Can be one of:
 *
 *   - `string`: The string is evaluated as an expression and the resulting value is used for substring match against
 *     the contents of the `array`. All strings or objects with string properties in `array` that contain this string
 *     will be returned. The predicate can be negated by prefixing the string with `!`.
 *
 *   - `Object`: A pattern object can be used to filter specific properties on objects contained
 *     by `array`. For example `{name:"M", phone:"1"}` predicate will return an array of items
 *     which have property `name` containing "M" and property `phone` containing "1". A special
 *     property name `$` can be used (as in `{$:"text"}`) to accept a match against any
 *     property of the object. That's equivalent to the simple substring match with a `string`
 *     as described above. The predicate can be negated by prefixing the string with `!`.
 *     For Example `{name: "!M"}` predicate will return an array of items which have property `name`
 *     not containing "M".
 *
 *   - `function(value, index)`: A predicate function can be used to write arbitrary filters. The
 *     function is called for each element of `array`. The final result is an array of those
 *     elements that the predicate returned true for.
 *
 * @param {function(actual, expected)|true|undefined} comparator Comparator which is used in
 *     determining if the expected value (from the filter expression) and actual value (from
 *     the object in the array) should be considered a match.
 *
 *   Can be one of:
 *
 *   - `function(actual, expected)`:
 *     The function will be given the object value and the predicate value to compare and
 *     should return true if the item should be included in filtered result.
 *
 *   - `true`: A shorthand for `function(actual, expected) { return angular.equals(expected, actual)}`.
 *     this is essentially strict comparison of expected and actual.
 *
 *   - `false|undefined`: A short hand for a function which will look for a substring match in case
 *     insensitive way.
 *
 * @example
   <example>
     <file name="index.html">
       <div ng-init="friends = [{name:'John', phone:'555-1276'},
                                {name:'Mary', phone:'800-BIG-MARY'},
                                {name:'Mike', phone:'555-4321'},
                                {name:'Adam', phone:'555-5678'},
                                {name:'Julie', phone:'555-8765'},
                                {name:'Juliette', phone:'555-5678'}]"></div>

       Search: <input ng-model="searchText">
       <table id="searchTextResults">
         <tr><th>Name</th><th>Phone</th></tr>
         <tr ng-repeat="friend in friends | filter:searchText">
           <td>{{friend.name}}</td>
           <td>{{friend.phone}}</td>
         </tr>
       </table>
       <hr>
       Any: <input ng-model="search.$"> <br>
       Name only <input ng-model="search.name"><br>
       Phone only <input ng-model="search.phone"><br>
       Equality <input type="checkbox" ng-model="strict"><br>
       <table id="searchObjResults">
         <tr><th>Name</th><th>Phone</th></tr>
         <tr ng-repeat="friendObj in friends | filter:search:strict">
           <td>{{friendObj.name}}</td>
           <td>{{friendObj.phone}}</td>
         </tr>
       </table>
     </file>
     <file name="protractor.js" type="protractor">
       var expectFriendNames = function(expectedNames, key) {
         element.all(by.repeater(key + ' in friends').column(key + '.name')).then(function(arr) {
           arr.forEach(function(wd, i) {
             expect(wd.getText()).toMatch(expectedNames[i]);
           });
         });
       };

       it('should search across all fields when filtering with a string', function() {
         var searchText = element(by.model('searchText'));
         searchText.clear();
         searchText.sendKeys('m');
         expectFriendNames(['Mary', 'Mike', 'Adam'], 'friend');

         searchText.clear();
         searchText.sendKeys('76');
         expectFriendNames(['John', 'Julie'], 'friend');
       });

       it('should search in specific fields when filtering with a predicate object', function() {
         var searchAny = element(by.model('search.$'));
         searchAny.clear();
         searchAny.sendKeys('i');
         expectFriendNames(['Mary', 'Mike', 'Julie', 'Juliette'], 'friendObj');
       });
       it('should use a equal comparison when comparator is true', function() {
         var searchName = element(by.model('search.name'));
         var strict = element(by.model('strict'));
         searchName.clear();
         searchName.sendKeys('Julie');
         strict.click();
         expectFriendNames(['Julie'], 'friendObj');
       });
     </file>
   </example>
 */
function filterFilter() {
  return function(array, expression, comparator) {
    if (!isArray(array)) return array;

    var predicateFn;
    var matchAgainstAnyProp;

    switch (typeof expression) {
      case 'function':
        predicateFn = expression;
        break;
      case 'boolean':
      case 'number':
      case 'string':
        matchAgainstAnyProp = true;
        //jshint -W086
      case 'object':
        //jshint +W086
        predicateFn = createPredicateFn(expression, comparator, matchAgainstAnyProp);
        break;
      default:
        return array;
    }

    return array.filter(predicateFn);
  };
}

// Helper functions for `filterFilter`
function createPredicateFn(expression, comparator, matchAgainstAnyProp) {
  var predicateFn;

  if (comparator === true) {
    comparator = equals;
  } else if (!isFunction(comparator)) {
    comparator = function(actual, expected) {
      if (isObject(actual) || isObject(expected)) {
        // Prevent an object to be considered equal to a string like `'[object'`
        return false;
      }

      actual = lowercase('' + actual);
      expected = lowercase('' + expected);
      return actual.indexOf(expected) !== -1;
    };
  }

  predicateFn = function(item) {
    return deepCompare(item, expression, comparator, matchAgainstAnyProp);
  };

  return predicateFn;
}

function deepCompare(actual, expected, comparator, matchAgainstAnyProp) {
  var actualType = typeof actual;
  var expectedType = typeof expected;

  if ((expectedType === 'string') && (expected.charAt(0) === '!')) {
    return !deepCompare(actual, expected.substring(1), comparator, matchAgainstAnyProp);
  } else if (actualType === 'array') {
    // In case `actual` is an array, consider it a match
    // if ANY of it's items matches `expected`
    return actual.some(function(item) {
      return deepCompare(item, expected, comparator, matchAgainstAnyProp);
    });
  }

  switch (actualType) {
    case 'object':
      var key;
      if (matchAgainstAnyProp) {
        for (key in actual) {
          if ((key.charAt(0) !== '$') && deepCompare(actual[key], expected, comparator)) {
            return true;
          }
        }
        return false;
      } else if (expectedType === 'object') {
        for (key in expected) {
          var expectedVal = expected[key];
          if (isFunction(expectedVal)) {
            continue;
          }

          var keyIsDollar = key === '$';
          var actualVal = keyIsDollar ? actual : actual[key];
          if (!deepCompare(actualVal, expectedVal, comparator, keyIsDollar)) {
            return false;
          }
        }
        return true;
      } else {
        return comparator(actual, expected);
      }
      break;
    case 'function':
      return false;
    default:
      return comparator(actual, expected);
  }
}
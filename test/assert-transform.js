"use strict";

var _ = require("lodash");
var babel = require("babel-core");
var colors = require("colors/safe");
var e = require("core-error-predicates");
var jsdiff = require("diff");
var path = require("path");
var Promise = require("bluebird");

var fs = Promise.promisifyAll(require("fs"));

var getDiff = function getDiff(obj) {
  return jsdiff.diffTrimmedLines(obj.actual, obj.expected);
}

var generateErrorMessage = function generateError(diff) {
  return diff.map(function(part){
    var color = part.added ? "green" : part.removed ? "red" : "grey";
    return colors[color](part.value);
  })
  .reduce(function (previousValue, currentValue) {
    return previousValue += currentValue
  }, "");
}

// TODO: Allow initial / expected to be Strings
module.exports = function (initial, expected, babelConfig) {
  return Promise.props({
    actual: fs.readFileAsync(path.join(__dirname, initial), "utf8")
      .then(_.partialRight(babel.transform, babelConfig))
      .then(function (result) { return result.code; })
      .then(_.trim),
    expected: fs.readFileAsync(path.join(__dirname, expected), "utf8")
      .then(_.trim),
  })
  .then(getDiff)
  .then(function (diff) {
    if (diff.length === 1) { return true; }
    else { throw new Error(generateErrorMessage(diff)); }
  });
}

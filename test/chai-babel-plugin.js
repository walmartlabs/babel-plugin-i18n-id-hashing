var _ = require("lodash");
var babel = require("babel-core");
var fs = require("fs");
var jsdiff = require("diff");
var path = require("path");

// TODO: This should be customizable
var options = {
  "presets": [ "es2015", "react" ],
  "plugins": [
    ["../lib/index.js", {
      "methodName": ["defaultMessages"],
    }]
  ]
};

module.exports = function (chai, utils) {

  utils.addMethod(chai.Assertion.prototype, "transformedIntoSync", function (filePath) {
    // first, our instanceof check, shortcut
    new chai.Assertion(this._obj);

    // Get the file
    // TODO: make this work for relative paths
    var expectedFileContents = fs.readFileSync(path.join(__dirname, filePath), "utf8");
    expectedFileContents = _.trim(expectedFileContents);

    // Transform actual
    // TODO: make this work for relative paths
    var transformedFile = babel.transformFileSync(path.join(__dirname, this._obj), options).code
    transformedFile = _.trim(transformedFile);

    // Get diff
    var diff = jsdiff.diffTrimmedLines(transformedFile, expectedFileContents);

    // assertion
    var errorMessage = "expected babel.transformFile(#{this}) === " + filePath + "\n\n";
    errorMessage += "Actual:\n----------\n" + transformedFile + " \n\n";
    errorMessage += "Expected:\n----------\n" + expectedFileContents;

    var negationErrorMessage = "expected babel.transformFile(#{this}) !== " + filePath + "\n\n";
    negationErrorMessage += "Actual:\n----------\n" + transformedFile + " \n\n";
    negationErrorMessage += "Expected:\n----------\n" + expectedFileContents;

    this.assert(
      diff.length === 1,
      errorMessage,
      negationErrorMessage
    );
  });


};

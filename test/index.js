"use strict";

var _ = require("lodash");
var babel = require("babel-core");
var e = require("core-error-predicates");
var jsdiff = require("diff");
var path = require("path");
var Promise = require("bluebird");

// Promisified Functions
var fs = Promise.promisifyAll(require("fs"));
var glob = Promise.promisify(require("glob"));
var transformFile = Promise.promisify(babel.transformFile);

var getDirectories = function getDirectories(srcpath) {
  return fs.readdirAsync(srcpath)
    .filter((fileName) => {
      return fs.statAsync(path.join(srcpath, fileName))
        .then(stat => stat.isDirectory())
        .catch(e.FileAccessError, () => {
          throw new Error("File Access Error for: " + path.join(srcpath, fileName));
        });
    });
}

var getDiff = function getDiff(obj) {
  return jsdiff.diffTrimmedLines(obj.actual, obj.expected);
}

var assertTransformation = function (directoryName) {
  // TODO: This should be customizable
  var options = {
    "presets": [ "es2015", "react" ],
    "plugins": [ "../lib/index.js" ]
  };

  Promise.props({
    actual: glob(path.join(__dirname, "/" + directoryName + "/actual.js*"))
      .then(_.first)
      .then(_.partialRight(transformFile, options))
      .then(result => result.code)
      .then(_.trim),
    expected: fs.readFileAsync(path.join(__dirname, "/" + directoryName + "/expected.js"), "utf8")
      .then(_.trim),
  })
  .then(getDiff)
  .then((diff) => {
    return diff.length === 1
      ? "✓ " + directoryName
      : "❌ " + directoryName;
  })
  .then(console.log);
}

getDirectories(__dirname)
  .each(assertTransformation)
  .catch((e) => { throw e; });

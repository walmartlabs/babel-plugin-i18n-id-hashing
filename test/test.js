"use strict";

var _ = require("lodash");
var assert = require("assert");
var babel = require("babel-core");
var e = require("core-error-predicates");
var jsdiff = require("diff");
var path = require("path");
var Promise = require("bluebird");

// Promisified Functions
var fs = Promise.promisifyAll(require("fs"));
var transformFile = Promise.promisify(babel.transformFile);

function getDirectories(srcpath) {
  return fs.readdirAsync(srcpath)
    .filter((fileName) => {
      return fs.statAsync(path.join(srcpath, fileName))
        .then(stat => stat.isDirectory())
        .catch(e.FileAccessError, () => {
          throw new Error("File Access Error for: " + path.join(srcpath, fileName));
        });
    });
}

var assertTransformation = function (directoryName) {
  var options = {
    "plugins": [ "../lib/index.js" ]
  };

  Promise.props({
    actual: transformFile(path.join(__dirname, "/" + directoryName + "/actual.js"), options)
      .then(result => result.code)
      .then(_.trim),
    expected: fs.readFileAsync(path.join(__dirname, "/" + directoryName + "/expected.js"), "utf8")
      .then(_.trim),
  })
  .then((result) => {
    var diff = jsdiff.diffTrimmedLines(result.actual, result.expected);
    assert.equal(diff.length, 1);
  });
}

getDirectories(__dirname)
  .each(assertTransformation)

// import {defineMessages} from "react-intl";
//
// var defaultMessages = defineMessages({
//   "something": {
//     "id": "my-clever-id",
//     "description": "This is the place where the things go",
//     "defaultMessage": "Oh Yea"
//   }
// })
//
// defaultMessages["something"];
// defaultMessages.something;
// defaultMessages["something" + "something"]
// var x = ""
// defaultMessages[x]
// defaultMessages["some" + x]

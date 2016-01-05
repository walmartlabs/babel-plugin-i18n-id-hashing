var _ = require("lodash");
var chai = require("chai");
var assertTransform = require("./assert-transform.js");

var expect = chai.expect;

var babelOptions = {
  "presets": [ "es2015" ],
  "plugins": [
    ["../lib/index.js", {}]
  ]
};

describe("babel-plugin-i18n-id-hashing", function() {
  it("should change the key and the id property in defineMessages", function () {
    return assertTransform("./define-messages/actual.js", "./define-messages/expected.js", babelOptions);
  });
  it("should transform dot property access to specified method", function () {
    return assertTransform("./dot-property-accessor/actual.js", "./dot-property-accessor/expected.js", babelOptions);
  });
  it("should transform inline expression accessors", function () {
    return assertTransform("./expression-accessor/actual.js", "./expression-accessor/expected.js", babelOptions);
  });
  it("should transform a jsx file", function () {
    var jsxBabelOpts = _.clone(babelOptions);
    jsxBabelOpts.presets.push("react");
    return assertTransform("./jsx-define-messages/actual.jsx", "./jsx-define-messages/expected.js", jsxBabelOpts);
  });
  it("should transform string literal accessors", function () {
    return assertTransform("./string-literal-accessor/actual.js", "./string-literal-accessor/expected.js", babelOptions);
  });
  it("should transform variable accessors", function () {
    return assertTransform("./variable-accessor/actual.js", "./variable-accessor/expected.js", babelOptions);
  });
  describe("options", function () {
    // -    ["../lib/index.js", {
    // -      "methodName": ["defaultMessages", "translations"],
    // -    }]
    it("should transform 'defineMessages' by default");
    it("should not transform anything when 'methodName' is an empty array");
    it("should transform any method defined in the 'methodName' array");
  });
});

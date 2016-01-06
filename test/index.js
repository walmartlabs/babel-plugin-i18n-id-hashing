var _ = require("lodash");
var assertTransform = require("assert-transform");
var babel = require("babel-core");
var path = require("path");

var BABEL_OPTIONS = {
  "presets": [ "es2015" ],
  "plugins": [
    ["../lib/index.js", {}]
  ]
};

describe("babel-plugin-i18n-id-hashing", function() {
  before(function () {
    // TODO: WTF babel needs to warm up! This is Bullshit!
    this.timeout(10000);
    babel.transform("const x = 1;", BABEL_OPTIONS);
  })

  it("should change the key and the id property in defineMessages", function () {
    return assertTransform(
      path.join(__dirname, "./define-messages/actual.js"),
      path.join(__dirname, "./define-messages/expected.js"), BABEL_OPTIONS);
  });
  it("should transform dot property access to specified method", function () {
    return assertTransform(
      path.join(__dirname, "./dot-property-accessor/actual.js"),
      path.join(__dirname,"./dot-property-accessor/expected.js"), BABEL_OPTIONS);
  });
  it("should transform inline expression accessors", function () {
    return assertTransform(
      path.join(__dirname, "./expression-accessor/actual.js"),
      path.join(__dirname,"./expression-accessor/expected.js"), BABEL_OPTIONS);
  });
  it("should transform a jsx file", function () {
    var jsxBabelOpts = _.clone(BABEL_OPTIONS);
    jsxBabelOpts.presets.push("react");
    return assertTransform(
      path.join(__dirname, "./jsx-define-messages/actual.jsx"),
      path.join(__dirname,"./jsx-define-messages/expected.js"), jsxBabelOpts);
  });
  it("should transform string literal accessors", function () {
    return assertTransform(
      path.join(__dirname, "./string-literal-accessor/actual.js"),
      path.join(__dirname,"./string-literal-accessor/expected.js"), BABEL_OPTIONS);
  });
  it("should transform variable accessors", function () {
    return assertTransform(
      path.join(__dirname, "./variable-accessor/actual.js"),
      path.join(__dirname,"./variable-accessor/expected.js"), BABEL_OPTIONS);
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

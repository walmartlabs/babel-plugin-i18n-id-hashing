var _ = require("lodash");
var babel = require("babel-core");

var assertTransform = require("./assert-transform.js");

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
    return assertTransform("./define-messages/actual.js", "./define-messages/expected.js", BABEL_OPTIONS);
  });
  it("should transform dot property access to specified method", function () {
    return assertTransform("./dot-property-accessor/actual.js", "./dot-property-accessor/expected.js", BABEL_OPTIONS);
  });
  it("should transform inline expression accessors", function () {
    return assertTransform("./expression-accessor/actual.js", "./expression-accessor/expected.js", BABEL_OPTIONS);
  });
  it("should transform a jsx file", function () {
    var jsxBabelOpts = _.clone(BABEL_OPTIONS);
    jsxBabelOpts.presets.push("react");
    return assertTransform("./jsx-define-messages/actual.jsx", "./jsx-define-messages/expected.js", jsxBabelOpts);
  });
  it("should transform string literal accessors", function () {
    return assertTransform("./string-literal-accessor/actual.js", "./string-literal-accessor/expected.js", BABEL_OPTIONS);
  });
  it("should transform variable accessors", function () {
    return assertTransform("./variable-accessor/actual.js", "./variable-accessor/expected.js", BABEL_OPTIONS);
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

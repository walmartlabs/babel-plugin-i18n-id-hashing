var _ = require("lodash");
var assertTransform = require("assert-transform");
var babel = require("babel-core");
var path = require("path");

var BABEL_OPTIONS = {
  "presets": [ "es2015" ],
  "plugins": [
    [path.resolve(__dirname, "../lib/index.js"), {}]
  ]
};

describe("babel-plugin-i18n-id-hashing", function() {
  before(function () {
    // TODO: WTF babel needs to warm up! This is Bullshit!
    this.timeout(10000);
    babel.transform("const x = 1;", BABEL_OPTIONS);
  })

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
  it("should transform variable accessors inside an object spread", function () {
    const babelOptions = _.merge({}, BABEL_OPTIONS, {
      "plugins": [
        "babel-plugin-transform-object-rest-spread",
        [path.resolve(__dirname, "../lib/index.js"), {}]
      ]
    });

    return assertTransform(
      path.join(__dirname, "./object-spread-literal-accessor/actual.js"),
      path.join(__dirname,"./object-spread-literal-accessor/expected.js"), babelOptions);
  });
  it("should transform variable accessors inside a jsx object spread", function () {
    const babelOptions = _.merge({}, BABEL_OPTIONS, {
      "presets": [ "es2015", "react" ],
      "plugins": [
        "babel-plugin-transform-object-rest-spread",
        [path.resolve(__dirname, "../lib/index.js"), {}]
      ]
    });

    return assertTransform(
      path.join(__dirname, "./object-spread-literal-accessor-jsx/actual.js"),
      path.join(__dirname,"./object-spread-literal-accessor-jsx/expected.js"), babelOptions);
  });

  describe("options", function () {
    it("should transform 'defineMessages' by default (string keys)", function () {
      return assertTransform(
        path.join(__dirname, "./define-messages-string-keys/actual.js"),
        path.join(__dirname, "./define-messages-string-keys/expected.js"), BABEL_OPTIONS);
    });
    it("should transform 'defineMessages' by default (literal keys)", function () {
      return assertTransform(
        path.join(__dirname, "./define-messages-literal-keys/actual.js"),
        path.join(__dirname, "./define-messages-literal-keys/expected.js"), BABEL_OPTIONS);
    });
    it("should transform 'defineMessages' by default (sequence expression)", function () {
      return assertTransform(
        path.join(__dirname, "./define-messages-sequence-expression/actual.js"),
        path.join(__dirname,"./define-messages-sequence-expression/expected.js"), BABEL_OPTIONS);
    });
    it("should not transform anything when 'varsContainingMessages' is an empty array", function () {
      var babelOpts = _.clone(BABEL_OPTIONS);
      babelOpts.plugins[0][1] = {
        "varsContainingMessages": []
      };

      return assertTransform(
        path.join(__dirname, "./no-transform/actual.js"),
        path.join(__dirname, "./no-transform/expected.js"), babelOpts);
    });
    it("should transform any method defined in the 'varsContainingMessages' array", function () {
      var babelOpts = _.clone(BABEL_OPTIONS);
      babelOpts.plugins[0][1] = {
        "varsContainingMessages": ["translations"]
      };

      return assertTransform(
        path.join(__dirname, "./dot-property-accessor-alternate-naming/actual.js"),
        path.join(__dirname, "./dot-property-accessor-alternate-naming/expected.js"), babelOpts);
    });
  });
});

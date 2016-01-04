var chai = require("chai");
var chaiBabelPlugin = require("./chai-babel-plugin.js");

chai.use(chaiBabelPlugin);

var expect = chai.expect;

describe("babel-plugin-i18n-id-hashing", function(done) {
  it("should change the key and the id property in defineMessages", function () {
    expect("./define-messages/actual.js").to.be
      .transformedIntoSync("./define-messages/expected.js");
  });
  it("should transform dot property access to specified method", function () {
    expect("./dot-property-accessor/actual.js").to.be
      .transformedIntoSync("./dot-property-accessor/expected.js")
  });
  it("should transform inline expression accessors", function () {
    expect("./expression-accessor/actual.js").to.be
      .transformedIntoSync("./expression-accessor/expected.js")
  });
  it("should transform a jsx file", function () {
    expect("./jsx-define-messages/actual.jsx").to.be
      .transformedIntoSync("./jsx-define-messages/expected.js")
  });
  it("should transform string literal accessors", function () {
    expect("./string-literal-accessor/actual.js").to.be
      .transformedIntoSync("./string-literal-accessor/expected.js")
  });
  it("should transform variable accessors", function () {
    expect("./variable-accessor/actual.js").to.be
      .transformedIntoSync("./variable-accessor/expected.js")
  });
});

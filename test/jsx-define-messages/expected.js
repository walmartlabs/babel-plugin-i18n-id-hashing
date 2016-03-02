"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactIntl = require("react-intl");

var defaultMessages = (0, _reactIntl.defineMessages)({
  "c63c96bba4ba4f28992169dd214843d63818e26c.cancel-button": {
    id: "c63c96bba4ba4f28992169dd214843d63818e26c.cancel-button",
    description: "a",
    defaultMessage: "Cancel"
  }
});

var CancelButton = function CancelButton() {
  return React.createElement(
    "button",
    null,
    React.createElement(_reactIntl.FormattedMessage, defaultMessages["c63c96bba4ba4f28992169dd214843d63818e26c.cancel-button"])
  );
};

exports.default = CancelButton;

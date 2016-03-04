"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactIntl = require("react-intl");

var defaultMessages = (0, _reactIntl.defineMessages)({
  "421c782d54676002912302e78cab6e448edcf239.cancel-button": {
    id: "421c782d54676002912302e78cab6e448edcf239.cancel-button",
    description: "a",
    defaultMessage: "Cancel"
  }
});

var CancelButton = function CancelButton() {
  return React.createElement(
    "button",
    null,
    React.createElement(_reactIntl.FormattedMessage, defaultMessages["421c782d54676002912302e78cab6e448edcf239.cancel-button"])
  );
};

exports.default = CancelButton;

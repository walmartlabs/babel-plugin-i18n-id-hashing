"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactIntl = require("react-intl");

var defaultMessages = (0, _reactIntl.defineMessages)({
  "a6e363212bf6d854c6658b1fb64cb238a076e8a0.undefined": {
    id: "a6e363212bf6d854c6658b1fb64cb238a076e8a0.undefined",
    description: "a",
    defaultMessage: "Cancel"
  }
});

var CancelButton = function CancelButton(_ref) {
  var translations = _ref.translations;
  return React.createElement(
    "button",
    null,
    React.createElement(_reactIntl.FormattedMessage, translations["a6e363212bf6d854c6658b1fb64cb238a076e8a0.a6e363212bf6d854c6658b1fb64cb238a076e8a0.a6e363212bf6d854c6658b1fb64cb238a076e8a0.cancel-button"])
  );
};

exports.default = CancelButton;

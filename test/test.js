import {defineMessages} from "react-intl";

var defaultMessages = defineMessages({
  "something": {
    "id": "my-clever-id",
    "description": "This is the place where the things go",
    "defaultMessage": "Oh Yea"
  }
})

defaultMessages["something"];
defaultMessages.something;
defaultMessages["something" + "something"]
var x = ""
defaultMessages[x]
defaultMessages["some" + x]

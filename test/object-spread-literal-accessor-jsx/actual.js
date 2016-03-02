import {defineMessages} from "react-intl";

var defaultMessages = {
  "something": {
    id: "something",
    description: "Lorem Khaled Ipsum is a major key to success. You see the hedges, how I got it shaped up?",
    defaultMessage: "Major Keys to Success"
  }
}

var x = (
  <div
    {...defaultMessages["something"]}
    className="i-hate-javascript"
    >
  </div>
);

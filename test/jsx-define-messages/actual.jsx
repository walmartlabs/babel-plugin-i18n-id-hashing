import {FormattedMessage, defineMessages} from "react-intl";

const defaultMessages = defineMessages({
  "cancel-button": {
    id: "cancel-button",
    description: "a",
    defaultMessage: "Cancel"
  }
});

const CancelButton = () => (
  <button>
    <FormattedMessage {...defaultMessages["cancel-button"]}/>
  </button>
);

export default CancelButton;

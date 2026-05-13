import type messages from "../../messages/ko.json";

type Messages = typeof messages;

declare global {
  type IntlMessages = Messages;
}

export {};

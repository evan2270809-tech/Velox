import type messages from "../../messages/en.json";

type Messages = typeof messages;

declare global {
  type IntlMessages = Messages;
}

export {};

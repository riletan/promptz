import { BackendBase } from "@aws-amplify/backend";
import { aws_events as events } from "aws-cdk-lib";

export type MessagingResources = {
  eventBus: events.EventBus;
};

export function defineMessaging(backend: BackendBase): MessagingResources {
  const eventStack = backend.createStack("PromptzMessagingStack");
  const eventBus = new events.EventBus(eventStack, "PromptzEventBus", {
    eventBusName: `PromptzEventBus-${process.env["PROMPTZ_ENV"]}`,
  });

  return {
    eventBus,
  };
}

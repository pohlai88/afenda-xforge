import type { z } from "zod";
import { createEventBus } from "./event-bus.ts";
import type {
  SubscriptionHandle,
  SubscriptionOptions,
  TypedEventHandler,
} from "./types.ts";

export const subscribe = <TSchema extends z.ZodType>(
  subject: string,
  consumerName: string,
  handler: TypedEventHandler<TSchema>,
  options: Omit<SubscriptionOptions, "consumerName"> & { source?: string } = {}
): Promise<SubscriptionHandle> => {
  const bus = createEventBus({
    module: options.source ?? consumerName,
  });

  return bus.subscribe(subject, handler, {
    ...options,
    consumerName,
  });
};

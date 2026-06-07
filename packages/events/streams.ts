import { loadEventsKeys } from "./keys.ts";
import type { StreamDefinition } from "./types.ts";

export const getXForgeStreams = (): StreamDefinition[] => {
  const { NATS_STREAM_PREFIX } = loadEventsKeys();

  return [
    {
      name: `${NATS_STREAM_PREFIX}_EXECUTION`,
      retention: "limits",
      subjects: ["xforge.execution.>"],
    },
    {
      name: `${NATS_STREAM_PREFIX}_CACHE`,
      retention: "workqueue",
      subjects: ["xforge.cache.>"],
    },
    {
      name: `${NATS_STREAM_PREFIX}_SEARCH`,
      retention: "workqueue",
      subjects: ["xforge.search.>"],
    },
    {
      name: `${NATS_STREAM_PREFIX}_INTEGRATIONS`,
      retention: "workqueue",
      subjects: ["xforge.linear.>", "xforge.workday.>"],
    },
  ];
};

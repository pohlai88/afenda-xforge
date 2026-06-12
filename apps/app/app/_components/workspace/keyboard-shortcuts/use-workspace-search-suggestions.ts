"use client";

import { useEffect, useState } from "react";
import {
  WORKSPACE_SEARCH_MIN_QUERY_LENGTH,
  type WorkspaceSearchResponse,
} from "../../../../lib/workspace-search/contract.ts";

const SEARCH_DEBOUNCE_MS = 250;

type WorkspaceSearchSuggestionsState = {
  available: boolean;
  loading: boolean;
  results: WorkspaceSearchResponse["results"];
};

const emptyState: WorkspaceSearchSuggestionsState = {
  available: false,
  loading: false,
  results: [],
};

export function useWorkspaceSearchSuggestions(
  query: string,
  enabled: boolean
): WorkspaceSearchSuggestionsState {
  const [state, setState] = useState<WorkspaceSearchSuggestionsState>(emptyState);

  useEffect(() => {
    if (!enabled) {
      setState(emptyState);
      return;
    }

    const normalizedQuery = query.trim();

    if (normalizedQuery.length < WORKSPACE_SEARCH_MIN_QUERY_LENGTH) {
      setState(emptyState);
      return;
    }

    let cancelled = false;
    setState((current) => ({
      ...current,
      loading: true,
    }));

    const timeout = window.setTimeout(() => {
      const loadSuggestions = async (): Promise<void> => {
        try {
          const response = await fetch(
            `/api/me/workspace-search?q=${encodeURIComponent(normalizedQuery)}&limit=10`
          );

          if (!response.ok) {
            throw new Error("Workspace search request failed");
          }

          const payload = (await response.json()) as WorkspaceSearchResponse;

          if (!cancelled) {
            setState({
              available: payload.available,
              loading: false,
              results: payload.results,
            });
          }
        } catch {
          if (!cancelled) {
            setState(emptyState);
          }
        }
      };

      loadSuggestions().catch(() => {
        if (!cancelled) {
          setState(emptyState);
        }
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [enabled, query]);

  return state;
}

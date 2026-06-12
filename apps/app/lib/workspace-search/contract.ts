export const WORKSPACE_SEARCH_MIN_QUERY_LENGTH = 2;
export const WORKSPACE_SEARCH_DEFAULT_LIMIT = 10;
export const WORKSPACE_SEARCH_MAX_LIMIT = 25;

export type WorkspaceSearchResult = {
  description?: string;
  href?: string;
  id: string;
  indexKey: string;
  indexLabel: string;
  rankingScore: number | null;
  title: string;
};

export type WorkspaceSearchResponse = {
  available: boolean;
  query: string;
  results: WorkspaceSearchResult[];
};

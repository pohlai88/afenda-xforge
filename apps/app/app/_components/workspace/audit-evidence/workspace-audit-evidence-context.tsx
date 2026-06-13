"use client";

import type { ReactElement, ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  WorkspaceAuditEvidenceEvent,
  WorkspaceAuditEvidenceScope,
  WorkspaceAuditEvidenceSheet,
} from "./workspace-audit-evidence.contract.ts";
import { fetchWorkspaceAuditEvidence } from "./workspace-audit-evidence.client.ts";
import {
  AUDIT_EVIDENCE_BOTTOM_OPEN_STORAGE_KEY,
  AUDIT_EVIDENCE_RIGHT_OPEN_STORAGE_KEY,
  persistAuditEvidencePanelOpen,
  readAuditEvidencePanelOpen,
} from "./workspace-audit-evidence-panel.constants.ts";

type WorkspaceAuditEvidenceContextValue = {
  bottomOpen: boolean;
  closeSheet: (sheet: WorkspaceAuditEvidenceSheet) => void;
  error: string | null;
  events: readonly WorkspaceAuditEvidenceEvent[];
  loading: boolean;
  openSheet: (sheet: WorkspaceAuditEvidenceSheet) => void;
  refresh: () => void;
  rightOpen: boolean;
  scope: WorkspaceAuditEvidenceScope;
  selectEvent: (event: WorkspaceAuditEvidenceEvent) => void;
  selectedEvent: WorkspaceAuditEvidenceEvent | null;
  selectedEventId: string | null;
  setScope: (scope: WorkspaceAuditEvidenceScope) => void;
  toggleSheet: (sheet: WorkspaceAuditEvidenceSheet) => void;
  total: number;
};

const WorkspaceAuditEvidenceContext = createContext<
  WorkspaceAuditEvidenceContextValue | undefined
>(undefined);

export function WorkspaceAuditEvidenceProvider({
  children,
  initialScope = {},
}: {
  children: ReactNode;
  initialScope?: WorkspaceAuditEvidenceScope;
}): ReactElement {
  const [scope, setScope] = useState<WorkspaceAuditEvidenceScope>(initialScope);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [panelsHydrated, setPanelsHydrated] = useState(false);
  const [events, setEvents] = useState<readonly WorkspaceAuditEvidenceEvent[]>(
    []
  );
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const requestVersionRef = useRef(0);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const setBottomPanelOpen = useCallback((open: boolean): void => {
    setBottomOpen(open);
    persistAuditEvidencePanelOpen(AUDIT_EVIDENCE_BOTTOM_OPEN_STORAGE_KEY, open);
  }, []);

  const setRightPanelOpen = useCallback((open: boolean): void => {
    setRightOpen(open);
    persistAuditEvidencePanelOpen(AUDIT_EVIDENCE_RIGHT_OPEN_STORAGE_KEY, open);
  }, []);

  const loadEvents = useCallback(async (): Promise<void> => {
    const requestVersion = requestVersionRef.current + 1;
    requestVersionRef.current = requestVersion;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchWorkspaceAuditEvidence(scope, { limit: 20 });

      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setEvents(result.items);
      setTotal(result.total);

      if (
        selectedEventId &&
        !result.items.some((event) => event.id === selectedEventId)
      ) {
        setSelectedEventId(null);
        setRightPanelOpen(false);
      }
    } catch (loadError) {
      if (requestVersion !== requestVersionRef.current) {
        return;
      }

      setEvents([]);
      setTotal(0);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load audit evidence."
      );
    } finally {
      if (requestVersion === requestVersionRef.current) {
        setLoading(false);
      }
    }
  }, [scope, selectedEventId, setRightPanelOpen]);

  const openSheet = useCallback(
    (sheet: WorkspaceAuditEvidenceSheet): void => {
      if (sheet === "bottom") {
        setBottomPanelOpen(true);
        return;
      }

      setRightPanelOpen(true);
    },
    [setBottomPanelOpen, setRightPanelOpen]
  );

  const closeSheet = useCallback(
    (sheet: WorkspaceAuditEvidenceSheet): void => {
      if (sheet === "bottom") {
        setBottomPanelOpen(false);
        return;
      }

      setRightPanelOpen(false);
    },
    [setBottomPanelOpen, setRightPanelOpen]
  );

  const toggleSheet = useCallback(
    (sheet: WorkspaceAuditEvidenceSheet): void => {
      if (sheet === "bottom") {
        setBottomPanelOpen(!bottomOpen);
        return;
      }

      setRightPanelOpen(!rightOpen);
    },
    [bottomOpen, rightOpen, setBottomPanelOpen, setRightPanelOpen]
  );

  const selectEvent = useCallback(
    (event: WorkspaceAuditEvidenceEvent): void => {
      setSelectedEventId(event.id);
      setRightPanelOpen(true);
    },
    [setRightPanelOpen]
  );

  useEffect(() => {
    setBottomOpen(
      readAuditEvidencePanelOpen(AUDIT_EVIDENCE_BOTTOM_OPEN_STORAGE_KEY)
    );
    setRightOpen(readAuditEvidencePanelOpen(AUDIT_EVIDENCE_RIGHT_OPEN_STORAGE_KEY));
    setPanelsHydrated(true);
  }, []);

  useEffect(() => {
    if (!panelsHydrated) {
      return;
    }

    if (!bottomOpen && !rightOpen) {
      return;
    }

    void loadEvents();
  }, [bottomOpen, loadEvents, panelsHydrated, rightOpen, scope]);

  const value = useMemo(
    () => ({
      bottomOpen,
      closeSheet,
      error,
      events,
      loading,
      openSheet,
      refresh: () => {
        void loadEvents();
      },
      rightOpen,
      scope,
      selectEvent,
      selectedEvent,
      selectedEventId,
      setScope,
      toggleSheet,
      total,
    }),
    [
      bottomOpen,
      closeSheet,
      error,
      events,
      loadEvents,
      loading,
      openSheet,
      rightOpen,
      scope,
      selectEvent,
      selectedEvent,
      selectedEventId,
      toggleSheet,
      total,
    ]
  );

  return (
    <WorkspaceAuditEvidenceContext.Provider value={value}>
      {children}
    </WorkspaceAuditEvidenceContext.Provider>
  );
}

export function useWorkspaceAuditEvidence(): WorkspaceAuditEvidenceContextValue {
  const context = useContext(WorkspaceAuditEvidenceContext);

  if (!context) {
    throw new Error(
      "useWorkspaceAuditEvidence must be used within WorkspaceAuditEvidenceProvider"
    );
  }

  return context;
}

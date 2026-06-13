"use client";

import {
  Input,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@repo/ui";
import type { KeyboardEvent, ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatEisenhowerMatrixMetadataLabel } from "./app-sidebar-metadata.labels.ts";
import { OrbitEisenhowerMatrix } from "./orbit-eisenhower-matrix.tsx";
import type {
  OrbitMatrixTabId,
  OrbitTrailItem,
  OrbitTrailPressure,
} from "./orbit-trail.ts";
import {
  applyActivePressurePrefix,
  canPinPressureItem,
  countMatrixOrbitTrailItems,
  createOrbitTrailItem,
  isOrbitMatrixPressureTab,
  ORBIT_TRAIL_FOCUS_EVENT,
  ORBIT_TRAIL_MATRIX_LIMIT,
  ORBIT_TRAIL_STORAGE_KEY,
  readStoredOrbitTrailItems,
} from "./orbit-trail.ts";
import {
  WORKSPACE_METADATA_GROUP_LABEL_CLASS,
  WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS,
} from "./workspace-shell.classes.ts";

export function AuthenticatedSidebarOrbitTrailBlock(): ReactElement {
  const [items, setItems] = useState<OrbitTrailItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [query, setQuery] = useState("");
  const [activePressure, setActivePressure] =
    useState<OrbitTrailPressure>("important");
  const [expandedTab, setExpandedTab] = useState<OrbitMatrixTabId | null>(
    "guide"
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const matrixCount = countMatrixOrbitTrailItems(items);

  useEffect(() => {
    setItems(readStoredOrbitTrailItems());
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(ORBIT_TRAIL_STORAGE_KEY, JSON.stringify(items));
  }, [items, storageReady]);

  const addCurrentInput = useCallback((): void => {
    const nextItem = createOrbitTrailItem(
      applyActivePressurePrefix(query, activePressure)
    );
    if (!nextItem) {
      return;
    }

    setItems((current) => [nextItem, ...current]);
    if (nextItem.pressure !== "routine") {
      setActivePressure(nextItem.pressure);
      setExpandedTab(nextItem.pressure);
    }
    setQuery("");
  }, [activePressure, query]);

  useEffect(() => {
    const focusInput = (event: Event): void => {
      if (!(event instanceof CustomEvent)) {
        inputRef.current?.focus();
        return;
      }

      const forceAdd = event.detail?.forceAdd === true;
      const focusProject = event.detail?.focusProject === true;

      if (forceAdd && query.trim()) {
        addCurrentInput();
        return;
      }

      if (focusProject && !query.trim()) {
        setQuery("/");
      }

      inputRef.current?.focus();
    };

    window.addEventListener(ORBIT_TRAIL_FOCUS_EVENT, focusInput);
    return () =>
      window.removeEventListener(ORBIT_TRAIL_FOCUS_EVENT, focusInput);
  }, [addCurrentInput, query]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== "Enter" || !query.trim()) {
      return;
    }

    event.preventDefault();
    addCurrentInput();
  };

  const handleToggleTab = (tab: OrbitMatrixTabId): void => {
    if (isOrbitMatrixPressureTab(tab)) {
      setActivePressure(tab);
    }

    setExpandedTab((current) => (current === tab ? null : tab));
  };

  const togglePin = (itemId: string): void => {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        if (item.pinned) {
          return { ...item, pinned: false };
        }

        if (!canPinPressureItem(current, item.pressure, itemId)) {
          return item;
        }

        return { ...item, pinned: true };
      })
    );
  };

  const markDone = (itemId: string): void => {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, done: true } : item
      )
    );
  };

  return (
    <SidebarGroup className="min-w-0 p-0">
      <SidebarGroupLabel className={WORKSPACE_METADATA_GROUP_LABEL_CLASS}>
        {formatEisenhowerMatrixMetadataLabel(
          matrixCount,
          ORBIT_TRAIL_MATRIX_LIMIT
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent
        className={`min-w-0 space-y-1 ${WORKSPACE_METADATA_LABEL_TO_ITEM_GAP_CLASS}`}
      >
        <OrbitEisenhowerMatrix
          expandedTab={expandedTab}
          items={items}
          onDone={markDone}
          onPin={togglePin}
          onToggleTab={handleToggleTab}
        />
        <Input
          aria-label="Add Orbit Trail item"
          className="sr-only"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          tabIndex={-1}
          value={query}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

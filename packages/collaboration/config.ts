type EmptyState = Record<string, never>;

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
    };
    RoomEvent: EmptyState;
    RoomInfo: EmptyState;
    Storage: EmptyState;
    ThreadMetadata: EmptyState;
    UserMeta: {
      id: string;
      info: {
        avatar?: string;
        color: string;
        name?: string;
      };
    };
  }
}

export {};

"use client";

import {
  NotificationFeedPopover,
  NotificationIconButton,
} from "@knocklabs/react";
import type { ReactElement, RefObject } from "react";
import { useRef, useState } from "react";
import { loadNotificationsKeys } from "../keys.js";

// Required CSS import, unless you're overriding the styling.
import "@knocklabs/react/dist/index.css";
import "../styles.css";

const knockKeys = loadNotificationsKeys();

export const NotificationsTrigger = (): ReactElement | null => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef<HTMLButtonElement>(null);

  const handleClose = (event: Event): void => {
    if (event.target === notifButtonRef.current) {
      return;
    }

    setIsVisible(false);
  };

  if (!knockKeys.NEXT_PUBLIC_KNOCK_API_KEY) {
    return null;
  }

  return (
    <>
      <NotificationIconButton
        onClick={(): void => setIsVisible(!isVisible)}
        ref={notifButtonRef}
      />
      {notifButtonRef.current && (
        <NotificationFeedPopover
          buttonRef={notifButtonRef as RefObject<HTMLElement>}
          isVisible={isVisible}
          onClose={handleClose}
        />
      )}
    </>
  );
};

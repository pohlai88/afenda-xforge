"use client";

import { List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactElement } from "react";
import { useState } from "react";

const NAV_ITEMS = ["Products", "About", "Blog"] as const;

const glassStyle = {
  background: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow:
    "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
};

const glassBlur = {
  backdropFilter: "blur(24px) saturate(1.8)",
  WebkitBackdropFilter: "blur(24px) saturate(1.8)",
};

const ctaStyle = {
  background:
    "linear-gradient(135deg, rgba(255, 160, 50, 0.75), rgba(220, 60, 40, 0.6))",
  border: "1px solid rgba(255, 180, 80, 0.25)",
  boxShadow: "0 2px 16px rgba(220, 80, 30, 0.4)",
};

const ctaHoverStyle = {
  background:
    "linear-gradient(135deg, rgba(255, 180, 80, 0.9), rgba(235, 75, 45, 0.8))",
  boxShadow: "0 4px 24px rgba(220, 80, 30, 0.6)",
};

type GlassNavbarProps = {
  brandLabel?: string;
  ctaLabel?: string;
  items?: readonly string[];
};

export function GlassNavbar({
  brandLabel = "Studio",
  ctaLabel = "Get Started",
  items = NAV_ITEMS,
}: GlassNavbarProps): ReactElement {
  const [active, setActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex w-full max-w-[720px] flex-col">
      <motion.nav
        animate={{ y: 0 }}
        className="relative isolate flex w-full items-center gap-1 rounded-full px-2 py-2"
        initial={{ y: -40 }}
        style={glassStyle}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-[-1] rounded-full"
          style={glassBlur}
        />

        <button
          className="flex cursor-pointer items-center gap-2 px-3"
          onClick={() => setActive(null)}
          type="button"
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            className="size-6 rounded-lg"
            style={{ background: "linear-gradient(135deg, #FF6BF5, #FFBE0B)" }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <span className="font-semibold text-sm text-white/90">{brandLabel}</span>
        </button>

        <div className="flex-1" />

        <div className="hidden items-center gap-1 sm:flex">
          {items.map((item, index) => (
            <motion.button
              className="relative cursor-pointer rounded-full px-5 py-2 font-medium text-sm"
              key={item}
              onClick={() => setActive(index)}
              onHoverEnd={() => setHovered(null)}
              onHoverStart={() => setHovered(index)}
              style={{
                color:
                  active === index || hovered === index
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.5)",
              }}
              type="button"
              whileTap={{ scale: 0.97 }}
            >
              {active === index ? (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  layoutId="glass-nav-active"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10">{item}</span>
            </motion.button>
          ))}

          <motion.button
            className="ml-2 cursor-pointer rounded-full px-5 py-2 font-semibold text-sm text-white"
            style={ctaStyle}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            type="button"
            whileHover={{ scale: 1.04, ...ctaHoverStyle }}
            whileTap={{ scale: 0.96 }}
          >
            {ctaLabel}
          </motion.button>
        </div>

        <motion.button
          className="mr-2 flex cursor-pointer items-center justify-center rounded-full p-2 text-white/70 sm:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          style={{ background: "rgba(255,255,255,0.08)" }}
          type="button"
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence initial={false} mode="wait">
            {menuOpen ? (
              <motion.span
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                initial={{ rotate: -90, opacity: 0 }}
                key="x"
                transition={{ duration: 0.15 }}
              >
                <X size={18} weight="bold" />
              </motion.span>
            ) : (
              <motion.span
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                initial={{ rotate: 90, opacity: 0 }}
                key="menu"
                transition={{ duration: 0.15 }}
              >
                <List size={18} weight="bold" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative isolate mt-2 flex flex-col gap-1 rounded-2xl p-2 sm:hidden"
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            style={glassStyle}
            transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div
              className="pointer-events-none absolute inset-0 z-[-1] rounded-2xl"
              style={glassBlur}
            />
            {items.map((item, index) => (
              <button
                className="cursor-pointer rounded-full px-5 py-2.5 text-left font-medium text-sm transition-colors"
                key={item}
                onClick={() => {
                  setActive(index);
                  setMenuOpen(false);
                }}
                style={{
                  color:
                    active === index
                      ? "rgba(255,255,255,0.95)"
                      : "rgba(255,255,255,0.55)",
                  background:
                    active === index ? "rgba(255,255,255,0.1)" : "transparent",
                }}
                type="button"
              >
                {item}
              </button>
            ))}
            <button
              className="mt-1 cursor-pointer rounded-full px-5 py-2.5 font-semibold text-sm text-white"
              onClick={() => setMenuOpen(false)}
              style={ctaStyle}
              type="button"
            >
              {ctaLabel}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Full-page AI Canvas demo shell (dark background + hero image). */
export function GlassNavbarShowcase(): ReactElement {
  return (
    <div className="relative flex min-h-[min(520px,70vh)] w-full items-center justify-center overflow-hidden rounded-xl bg-[#1A1A19]">
      <img
        alt=""
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-60"
        src="https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866"
      />
      <div className="relative w-[calc(100%-2rem)] max-w-[720px]">
        <GlassNavbar />
      </div>
    </div>
  );
}

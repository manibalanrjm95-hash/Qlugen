"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const CAL_LINK =
  "gokul-fameix/ai-development-agency-for-products-agents-automation";

declare global {
  interface Window {
    Cal?: any;
  }
}

export function CalBookingModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const initEmbed = () => {
      const calNs = window.Cal?.ns?.["default"];
      if (calNs && containerRef.current) {
        calNs("inline", {
          elementOrSelector: containerRef.current,
          config: { layout: "month_view" },
          calLink: CAL_LINK,
        });
      } else {
        setTimeout(initEmbed, 150);
      }
    };

    const timer = setTimeout(initEmbed, 80);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-5xl h-[85vh] rounded-2xl bg-white overflow-hidden shadow-2xl">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 z-20 rounded-full bg-gray-100 hover:bg-gray-200 p-2 transition-colors cursor-pointer"
          aria-label="Close booking modal"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>
        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%", overflow: "scroll" }}
        />
      </div>
    </div>
  );
}

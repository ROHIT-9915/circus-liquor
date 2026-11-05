"use client";

import React from "react";
import styles from "./hero.module.css";

interface ScrollIndicatorProps {
  opacity?: number;
  label?: string;
  onClick?: () => void;
}

export default function ScrollIndicator({
  opacity = 1,
  label = "SCROLL TO EXPLORE",
  onClick,
}: ScrollIndicatorProps) {
  const isVisible = opacity > 0.01;

  return (
    <div
      className={styles.scrollIndicatorWrapper}
      style={{
        opacity: Math.max(0, Math.min(1, opacity)),
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 0.4s ease-out",
      }}
      onClick={onClick}
      role="button"
      tabIndex={isVisible ? 0 : -1}
      aria-label="Scroll down to begin cinematic experience"
    >
      <div className={styles.scrollContent}>
        <span className={styles.scrollLabel}>{label}</span>
        <div className={styles.scrollTrack}>
          <div className={styles.scrollThumb} />
        </div>
      </div>
    </div>
  );
}

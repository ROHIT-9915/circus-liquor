"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroNavigation from "./HeroNavigation";
import ScrollIndicator from "./ScrollIndicator";
import ScrollVideo, { ScrollVideoHandle } from "./ScrollVideo";
import styles from "./hero.module.css";

// Register ScrollTrigger safely in browser context
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// React 19 subscription for prefers-reduced-motion
function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

interface CircusHeroProps {
  scrollDistance?: string; // Configurable scroll duration, default "+=3200px"
  scrubDuration?: number;  // Configurable scrub smoothing, tuned to 0.45s for tactile responsiveness
}

export default function CircusHero({
  scrollDistance = "+=3200px",
  scrubDuration = 0.45,
}: CircusHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const videoHandleRef = useRef<ScrollVideoHandle | null>(null);

  // Text overlay refs for GSAP animation
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const milestone1Ref = useRef<HTMLDivElement | null>(null);
  const milestone2Ref = useRef<HTMLDivElement | null>(null);
  const climaxRef = useRef<HTMLDivElement | null>(null);

  // Local state for UI feedback
  const [indicatorOpacity, setIndicatorOpacity] = useState<number>(1);
  const [videoDuration, setVideoDuration] = useState<number>(10);

  // Read prefers-reduced-motion via standard sync store
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  // Main GSAP ScrollTrigger timeline setup
  useEffect(() => {
    // If reduced motion is requested, do not pin the hero section
    if (isReducedMotion) return;

    const container = containerRef.current;
    const viewport = viewportRef.current;
    if (!container || !viewport) return;

    // Use GSAP context for clean garbage collection & unmount revert
    const ctx = gsap.context(() => {
      // Virtual playhead object smoothly interpolated by GSAP's scrub engine
      const virtualPlayhead = { time: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: viewport,
          start: "top top",
          end: scrollDistance,
          scrub: scrubDuration,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Subtle indicator fade out during the initial 15% scroll
            const indOpacity = Math.max(0, 1 - self.progress / 0.15);
            setIndicatorOpacity(indOpacity);
          },
        },
      });

      // 1. Primary Video Playhead Tween (Full Timeline Duration 0.0 -> 1.0)
      // This guarantees sub-millisecond, spring-damped forward & reverse scrubbing
      tl.to(
        virtualPlayhead,
        {
          time: videoDuration,
          ease: "none",
          duration: 1,
          onUpdate: () => {
            videoHandleRef.current?.seekToTime(virtualPlayhead.time);
          },
        },
        0
      );

      // 2. Headline Fade & Gentle Lift (0.00 -> 0.18)
      if (headlineRef.current) {
        tl.to(
          headlineRef.current,
          {
            opacity: 0,
            y: -24,
            ease: "power1.out",
            duration: 0.18,
          },
          0
        );
      }

      // 3. Milestone 1: Architectural Rotation (0.26 -> 0.38 in, 0.44 -> 0.52 out)
      if (milestone1Ref.current) {
        tl.fromTo(
          milestone1Ref.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.12, ease: "power1.out" },
          0.26
        ).to(
          milestone1Ref.current,
          { opacity: 0, y: -16, duration: 0.08, ease: "power1.in" },
          0.44
        );
      }

      // 4. Milestone 2: Orbital Ribbon Harmony (0.54 -> 0.66 in, 0.72 -> 0.80 out)
      if (milestone2Ref.current) {
        tl.fromTo(
          milestone2Ref.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.12, ease: "power1.out" },
          0.54
        ).to(
          milestone2Ref.current,
          { opacity: 0, y: -16, duration: 0.08, ease: "power1.in" },
          0.72
        );
      }

      // 5. Climax Grand Finale: The Reserve Unveiled (0.84 -> 1.00)
      if (climaxRef.current) {
        tl.fromTo(
          climaxRef.current,
          { opacity: 0, y: 24, pointerEvents: "none" },
          { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.16, ease: "power1.out" },
          0.84
        );
      }
    }, container);

    // Refresh ScrollTrigger on window resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [scrollDistance, scrubDuration, isReducedMotion, videoDuration]);

  const handleScrollIndicatorClick = () => {
    const targetScroll = window.innerHeight * 1.5;
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const handleExploreClick = () => {
    const reserveSection = document.getElementById("curated-reserve");
    if (reserveSection) {
      reserveSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section ref={containerRef} className={styles.heroSection} aria-label="Circus Liquor Cinematic Hero">
      <div ref={viewportRef} className={styles.heroViewport}>
        {/* Minimal Luxury Navigation */}
        <HeroNavigation onExploreClick={handleExploreClick} />

        {/* Central Video Composition */}
        <div className={styles.videoStage}>
          <ScrollVideo
            ref={videoHandleRef}
            src="/videos/circus-liquor-hero.mp4"
            onDurationChange={(dur) => setVideoDuration(dur)}
            isReducedMotion={isReducedMotion}
          />
        </div>

        {/* Editorial Overlays & Milestones */}
        <div className={styles.heroOverlay}>
          {/* Headline Block (Initial View) */}
          <div ref={headlineRef} className={styles.headlineBlock}>
            <span className={styles.brandLabel}>Circus Liquor Signature</span>
            <h1 className={styles.mainHeading}>
              An Experience Beyond the Ordinary.
            </h1>
            <p className={styles.subHeading}>
              Discover a world of exceptional spirits, crafted moments, and timeless taste.
            </p>
          </div>

          {/* Synchronized Narrative Callouts */}
          <div className={styles.milestonesContainer} aria-hidden="true">
            {/* Milestone 1: Left */}
            <div ref={milestone1Ref} className={`${styles.milestoneCard} ${styles.milestoneLeft}`}>
              <span className={styles.milestoneIndex}>Plate 01 // Mechanical Form</span>
              <h3 className={styles.milestoneTitle}>Architectural Precision</h3>
              <p className={styles.milestoneDesc}>
                Precision-engineered rings rotating in perpetual synchrony, enshrining the spirit.
              </p>
            </div>

            {/* Milestone 2: Right */}
            <div ref={milestone2Ref} className={`${styles.milestoneCard} ${styles.milestoneRight}`}>
              <span className={styles.milestoneIndex}>Plate 02 // Orbital Ribbon</span>
              <h3 className={styles.milestoneTitle}>Champagne Aura</h3>
              <p className={styles.milestoneDesc}>
                Golden ribbon trajectory tracing French winter wheat and natural Gensac spring water.
              </p>
            </div>
          </div>

          {/* Final Climax Block (at ~90-100% progress) */}
          <div ref={climaxRef} className={styles.climaxBlock}>
            <h2 className={styles.climaxTitle}>The Reserve is Unveiled.</h2>
            <p className={styles.subHeading} style={{ margin: "0 auto" }}>
              Every bottle curated for the most discerning connoisseurs of extraordinary craft.
            </p>
            <a href="#curated-reserve" className={styles.climaxCta} onClick={handleExploreClick}>
              <span>Enter The Collection</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        {/* Minimal Editorial Scroll Indicator */}
        {!isReducedMotion && (
          <ScrollIndicator
            opacity={indicatorOpacity}
            label="SCROLL TO EXPLORE"
            onClick={handleScrollIndicatorClick}
          />
        )}
      </div>
    </section>
  );
}

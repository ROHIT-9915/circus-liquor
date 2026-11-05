"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./hero.module.css";

export interface ScrollVideoHandle {
  seekToTime: (time: number) => void;
  seekToProgress: (progress: number) => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  getVideoElement: () => HTMLVideoElement | null;
}

interface ScrollVideoProps {
  src?: string;
  onDurationChange?: (duration: number) => void;
  onReady?: () => void;
  className?: string;
  isReducedMotion?: boolean;
}

const ScrollVideo = forwardRef<ScrollVideoHandle, ScrollVideoProps>(
  function ScrollVideo(
    {
      src = "/videos/circus-liquor-hero.mp4",
      onDurationChange,
      onReady,
      className,
      isReducedMotion = false,
    },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [duration, setDuration] = useState<number>(10);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Target seek time tracked via ref for zero React re-render overhead
    const targetTimeRef = useRef<number>(0);
    const isSeekingRef = useRef<boolean>(false);
    const rafIdRef = useRef<number | null>(null);
    const seekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Continuous 60fps/120fps seek scheduler
    const performSeek = useCallback(() => {
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) {
        rafIdRef.current = requestAnimationFrame(performSeek);
        return;
      }

      if (!video.seeking && !isSeekingRef.current) {
        const totalDuration = video.duration;
        const clampedTarget = Math.max(0.001, Math.min(targetTimeRef.current, totalDuration - 0.001));
        const delta = Math.abs(video.currentTime - clampedTarget);

        // Sub-frame delta threshold (~1/80s) ensures immediate update without noise
        if (delta > 0.012) {
          isSeekingRef.current = true;

          // Safety guard: release lock if browser seeked event is delayed
          if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
          seekTimeoutRef.current = setTimeout(() => {
            isSeekingRef.current = false;
          }, 100);

          try {
            const extVideo = video as HTMLVideoElement & { fastSeek?: (time: number) => void };
            if (typeof extVideo.fastSeek === "function") {
              extVideo.fastSeek(clampedTarget);
            } else {
              video.currentTime = clampedTarget;
            }
          } catch {
            video.currentTime = clampedTarget;
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(performSeek);
    }, []);

    // Exposed imperative methods for GSAP ScrollTrigger
    useImperativeHandle(
      ref,
      () => ({
        seekToTime: (time: number) => {
          targetTimeRef.current = time;
        },
        seekToProgress: (progress: number) => {
          const video = videoRef.current;
          const currentDuration = video?.duration || duration || 10;
          const clampedProgress = Math.max(0, Math.min(1, progress));
          targetTimeRef.current = clampedProgress * currentDuration;
        },
        getDuration: () => {
          return videoRef.current?.duration || duration || 10;
        },
        getCurrentTime: () => {
          return videoRef.current?.currentTime || 0;
        },
        getVideoElement: () => videoRef.current,
      }),
      [duration]
    );

    // Release lock immediately on seeked so consecutive frames decode smoothly
    const handleSeeked = useCallback(() => {
      isSeekingRef.current = false;
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }
    }, []);

    // Start RAF seek loop
    useEffect(() => {
      rafIdRef.current = requestAnimationFrame(performSeek);
      return () => {
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
        if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
      };
    }, [performSeek]);

    // Handle metadata loaded
    const handleLoadedMetadata = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      const dur = video.duration;
      if (dur && !Number.isNaN(dur) && dur > 0) {
        setDuration(dur);
        onDurationChange?.(dur);
      }

      video.pause();

      if (isReducedMotion) {
        video.currentTime = Math.min(5.0, dur * 0.5);
      } else {
        video.currentTime = 0.001;
      }

      setIsLoaded(true);
      onReady?.();
    }, [onDurationChange, onReady, isReducedMotion]);

    const handleCanPlay = useCallback(() => {
      if (!isLoaded) {
        setIsLoaded(true);
        onReady?.();
      }
    }, [isLoaded, onReady]);

    const handleError = useCallback(() => {
      const video = videoRef.current;
      const errorMsg = video?.error?.message || "Failed to load reference video asset.";
      console.warn("Video load error:", errorMsg);
      setLoadError("Unable to stream cinematic video. Please verify the asset path.");
    }, []);

    return (
      <div className={`${styles.videoWrapper} ${className || ""}`}>
        {/* Loading placeholder skeleton */}
        {!isLoaded && !loadError && (
          <div className={styles.videoSkeleton} aria-busy="true" aria-live="polite">
            <div className={styles.skeletonRing} />
            <span className={styles.skeletonText}>INITIALIZING ARCHIVE...</span>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className={styles.videoError}>
            <p className={styles.errorTitle}>Cinematic Asset Unavailable</p>
            <p className={styles.errorDetails}>{loadError}</p>
          </div>
        )}

        {/* Reference Video Element */}
        <video
          ref={videoRef}
          src={src}
          className={`${styles.heroVideo} ${isLoaded ? styles.heroVideoLoaded : ""}`}
          playsInline
          muted
          autoPlay={false}
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onSeeked={handleSeeked}
          onError={handleError}
          aria-label="Circus Liquor cinematic scroll animation featuring Grey Goose reserve bottle"
        />
      </div>
    );
  }
);

export default ScrollVideo;

"use client";

import React, { useState } from "react";
import styles from "./hero.module.css";

interface HeroNavigationProps {
  onExploreClick?: () => void;
}

export default function HeroNavigation({ onExploreClick }: HeroNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className={styles.navigation}>
      <div className={styles.navContainer}>
        {/* Brand Wordmark (Left) */}
        <div className={styles.navBrand}>
          <a href="#" className={styles.navLogo} aria-label="Circus Liquor Home">
            <span className={styles.logoTitle}>CIRCUS LIQUOR</span>
            <span className={styles.logoSubtitle}>FINE SPIRITS &bull; EST. 1959</span>
          </a>
        </div>

        {/* Minimal Editorial Nav Links (Center) */}
        <nav className={`${styles.navCenter} ${mobileMenuOpen ? styles.navCenterOpen : ""}`} aria-label="Main Navigation">
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="#collection" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                Collection
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="#vault" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                The Vault
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="#craft" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                Craftsmanship
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="#heritage" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
                Our Story
              </a>
            </li>
          </ul>
        </nav>

        {/* Action Button & Menu Icon (Right) */}
        <div className={styles.navRight}>
          <a
            href="#curated-reserve"
            className={styles.exploreButton}
            onClick={(e) => {
              if (onExploreClick) {
                e.preventDefault();
                onExploreClick();
              }
            }}
          >
            <span className={styles.exploreText}>Explore Reserve</span>
            <span className={styles.exploreArrow} aria-hidden="true">&rarr;</span>
          </a>

          {/* Minimal Hamburger for Mobile */}
          <button
            type="button"
            className={styles.mobileMenuToggle}
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`${styles.menuBar} ${mobileMenuOpen ? styles.menuBarTopOpen : ""}`} />
            <span className={`${styles.menuBar} ${mobileMenuOpen ? styles.menuBarBottomOpen : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

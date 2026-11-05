"use client";

import React from "react";
import styles from "./reserve.module.css";

export default function BrandFooter() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>CIRCUS LIQUOR</span>
            <span className={styles.footerTagline}>FINE SPIRITS &bull; EST. 1959</span>
          </div>

          <div className={styles.footerNav}>
            <span className={styles.footerNavTitle}>EXPERIENCE</span>
            <ul className={styles.footerList}>
              <li><a href="#collection">Curated Reserve</a></li>
              <li><a href="#vault">The Vault</a></li>
              <li><a href="#craft">Craftsmanship</a></li>
              <li><a href="#story">Our Heritage</a></li>
            </ul>
          </div>

          <div className={styles.footerNav}>
            <span className={styles.footerNavTitle}>LOCATION &amp; HOURS</span>
            <p className={styles.footerText}>5600 Vineland Ave</p>
            <p className={styles.footerText}>North Hollywood, CA 91601</p>
            <p className={styles.footerText}>Daily: 9:00 AM &ndash; 1:00 AM</p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p className={styles.legalNotice}>
            Enjoy Responsibly. Must be 21 years of age or older to purchase and consume alcohol.
          </p>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Circus Liquor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

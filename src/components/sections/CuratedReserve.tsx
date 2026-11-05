"use client";

import React from "react";
import styles from "./reserve.module.css";

export default function CuratedReserve() {
  return (
    <section id="curated-reserve" className={styles.reserveSection} aria-label="Curated Reserve Selection">
      <div className={styles.container}>
        {/* Editorial Subheader */}
        <div className={styles.sectionHeader}>
          <span className={styles.tagline}>THE CURATED RESERVE</span>
          <h2 className={styles.title}>Spirits of Distinction.</h2>
          <p className={styles.description}>
            Born from an unwavering dedication to exceptional craft, Circus Liquor curates
            the world&rsquo;s most revered single-estate spirits, small-batch reserves, and rare vintages.
          </p>
        </div>

        {/* Brand Pillars Grid */}
        <div className={styles.pillarsGrid}>
          {/* Pillar 1 */}
          <div className={styles.pillarCard}>
            <span className={styles.pillarNumber}>01</span>
            <h3 className={styles.pillarTitle}>The Rare Vault</h3>
            <p className={styles.pillarText}>
              Limited-edition bottles and archival releases sourced directly from historic
              European and artisanal American distilleries.
            </p>
            <div className={styles.pillarLine} />
          </div>

          {/* Pillar 2 */}
          <div className={styles.pillarCard}>
            <span className={styles.pillarNumber}>02</span>
            <h3 className={styles.pillarTitle}>Terroir &amp; Provenance</h3>
            <p className={styles.pillarText}>
              Every selection tells the story of its origin &mdash; from Picardie winter wheat
              to crystal-clear limestone spring waters of Gensac-la-Pallue.
            </p>
            <div className={styles.pillarLine} />
          </div>

          {/* Pillar 3 */}
          <div className={styles.pillarCard}>
            <span className={styles.pillarNumber}>03</span>
            <h3 className={styles.pillarTitle}>Private Concierge</h3>
            <p className={styles.pillarText}>
              Personal cellar consultations, curated private tasting flights, and tailored
              acquisition services for true collectors.
            </p>
            <div className={styles.pillarLine} />
          </div>
        </div>

        {/* Brand Quote Showcase */}
        <div className={styles.quoteBlock}>
          <blockquote className={styles.quoteText}>
            &ldquo;We believe that an extraordinary spirit is not merely consumed &mdash; it is remembered.&rdquo;
          </blockquote>
          <cite className={styles.quoteAuthor}>Circus Liquor Cellar Master</cite>
        </div>
      </div>
    </section>
  );
}

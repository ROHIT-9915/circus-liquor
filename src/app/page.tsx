import React from "react";
import CircusHero from "@/components/hero/CircusHero";
import CuratedReserve from "@/components/sections/CuratedReserve";
import BrandFooter from "@/components/sections/BrandFooter";

export default function Home() {
  return (
    <main>
      {/* Cinematic Scroll-Controlled Hero */}
      <CircusHero scrollDistance="+=3200px" scrubDuration={0.6} />

      {/* Subsequent Editorial Brand Reserve Section */}
      <CuratedReserve />

      {/* Brand Footer */}
      <BrandFooter />
    </main>
  );
}

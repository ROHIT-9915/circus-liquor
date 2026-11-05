# Circus Liquor — Cinematic Scroll-Animated Hero

A production-grade, cinematic web experience for **Circus Liquor**, featuring luxury minimalism, an editorial typography pairing, and butter-smooth, scroll-controlled video scrubbing powered by Next.js 16 and GSAP ScrollTrigger.

---

## Brand & Aesthetic Direction

- **Brand**: Circus Liquor (Fine Spirits &bull; Est. 1959)
- **Design Language**: Luxury minimalism, editorial layout, and cinematic composition
- **Palette**:
  - **Warm Cream**: `#F5F0E7`
  - **Soft Beige**: `#E9DFD0`
  - **Champagne Gold**: `#C5A46D`
  - **Dark Brown**: `#30251E`
  - **White**: `#FFFFFF`
- **Typography**:
  - **Primary Serif**: `Cormorant Garamond` (classic editorial headlines and plates)
  - **Secondary Sans**: `Plus Jakarta Sans` (modern, legible supporting text and navigation)

---

## Key Features & Architecture

### 1. Deterministic Scroll-Controlled Video Playback
- **Timeline-Bound Scrubbing**: Driven by GSAP `ScrollTrigger` pinned for a configurable duration (default: `+=3200px` / ~3.5vh) with spring-damped easing (`scrub: 0.45`).
- **Zero React Re-render Overhead**: Scroll progress communicates directly through an imperative ref handle (`ScrollVideoHandle`), keeping the 60fps/120fps seek loop decoupled from the React render lifecycle.
- **Continuous RAF Seek Engine**: A non-blocking `requestAnimationFrame` loop in `ScrollVideo.tsx` monitors `video.currentTime` vs. `targetTime`, querying hardware `fastSeek` with fallback to `currentTime`.

### 2. All-Intra Keyframe Video Optimization (`-g 1`)
- **Root Cause Diagnosed**: Standard web MP4 encoding places keyframes (I-frames) every 100–250 frames. When scrubbing backward (scrolling up), HTML5 decoders had to rewind and sequentially decode up to hundreds of frames, creating hitching and lag.
- **Optimization Applied**: Re-encoded the reference 10s video using `ffmpeg` with `-g 1` (All-Intra) and `+faststart`. Every single frame (240 out of 240) is an independent keyframe, enabling instantaneous **~1–3ms seeking** in both forward and reverse directions.

### 3. Synchronized Editorial Narrative
As the user scrolls through the 10-second sequence, narrative elements seamlessly weave into the animation:
- **0% &ndash; 18%**: The introductory brand headline gently fades and lifts (`y: -24`), focusing attention on the bottle.
- **0% &ndash; 15%**: The restrained scroll indicator needle line fades out.
- **26% &ndash; 52%**: **Plate 01 // Mechanical Form** appears on the left, celebrating architectural precision.
- **54% &ndash; 80%**: **Plate 02 // Orbital Ribbon** appears on the right, tracing the champagne gold aura.
- **84% &ndash; 100%**: The **Climax Reserve Card** emerges over the completed formation, welcoming visitors to enter the collection.

### 4. Seamless Continuation & Curated Reserve
When the 100% scroll threshold is reached, the pinned section unpins naturally, and the page flows into **The Curated Reserve** showcase, introducing rare vaults, terroir provenance, and private concierge services.

### 5. Accessibility & Reduced Motion
- Uses React 19's `useSyncExternalStore` to listen to `prefers-reduced-motion: reduce`.
- When active, the scroll pin is automatically disabled, presenting the bottle in a static composition with standard scroll behavior.

---

## Project Structure

```text
circus-liquor/
├── app/ (src/app/)
│   ├── globals.css         # Brand color variables, luxury scrollbar, typography
│   ├── layout.tsx          # Google Fonts (Cormorant Garamond & Plus Jakarta Sans), SEO metadata
│   └── page.tsx            # Composition: CircusHero + CuratedReserve + BrandFooter
├── components/ (src/components/)
│   ├── hero/
│   │   ├── CircusHero.tsx      # Main pinned ScrollTrigger orchestrator
│   │   ├── HeroNavigation.tsx  # Wordmark, links, mobile drawer menu, pill CTA
│   │   ├── ScrollIndicator.tsx # Minimal pulsating gold indicator
│   │   ├── ScrollVideo.tsx     # Continuous RAF seek engine & video player
│   │   └── hero.module.css     # Scoped hero styling & responsive queries
│   └── sections/
│       ├── CuratedReserve.tsx  # Editorial reserve & craftsmanship pillars
│       ├── BrandFooter.tsx     # Brand footer with cellar details & 21+ notice
│       └── reserve.module.css  # Scoped reserve styling
├── public/
│   └── videos/
│       ├── circus-liquor-hero.mp4          # Optimized All-Intra 240-keyframe video
│       └── circus-liquor-hero-original.mp4 # Pristine original video backup
└── scripts/
    └── verify_experience.mjs   # Automated CDP headless browser verification suite
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 20.18 LTS)
- npm 9+

### Installation & Run

1. **Clone and enter the directory**:
   ```bash
   cd circus-liquor
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## Production Build & Verification

```bash
# Type check and build optimized static assets
npm run build

# Run ESLint validation
npm run lint

# Run headless browser test suite (verifies seeking, milestones & responsive viewports)
node --experimental-websocket scripts/verify_experience.mjs
```

---

## Configuration & Tuning

In `src/components/hero/CircusHero.tsx`, you can tune the scroll feel to match client preferences:

```tsx
<CircusHero
  scrollDistance="+=3200px" // Total scroll distance (e.g. "+=2800px" for faster, "+=4000px" for slower)
  scrubDuration={0.45}      // GSAP scrub interpolation in seconds (lower = more direct, higher = smoother glide)
/>
```

---

## License

Private &bull; Circus Liquor Client Project &bull; All Rights Reserved.

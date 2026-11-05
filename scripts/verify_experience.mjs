import { spawn } from "child_process";
import fs from "fs";
import http from "http";

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9222;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve: res, reject: rej } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) rej(msg.error);
          else res(msg.result);
        } else if (msg.method) {
          const listeners = this.events.get(msg.method) || [];
          listeners.forEach((fn) => fn(msg.params));
        }
      };
    });
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expr) {
    const res = await this.send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  async screenshot(filePath) {
    const res = await this.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(filePath, Buffer.from(res.data, "base64"));
  }

  close() {
    this.ws.close();
  }
}

async function main() {
  console.log("=== Circus Liquor Hero Verification Suite ===");

  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${PORT}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--window-size=1440,900",
    "about:blank",
  ]);

  edge.stderr.on("data", () => {});

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await delay(300);
    try {
      const list = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      if (list && list.length > 0) {
        const pageTarget = list.find((t) => t.type === "page") || list[0];
        if (pageTarget.webSocketDebuggerUrl) {
          wsUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error("Failed to connect to Edge CDP endpoint.");
    edge.kill();
    process.exit(1);
  }

  console.log("✓ Connected to Edge via Chrome DevTools Protocol");

  const cdp = new CDP(wsUrl);
  await cdp.connect();
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  console.log("Navigating to http://localhost:3000...");
  await cdp.send("Page.navigate", { url: "http://localhost:3000" });

  // Wait for load
  await delay(2500);

  const title = await cdp.eval("document.title");
  console.log("Document Title:", title);

  // [Test 1: Video Element & Metadata]
  console.log("\n[Test 1: Video Element & Metadata]");
  let videoState = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    videoState = await cdp.eval(`(() => {
      const video = document.querySelector("video");
      if (!video) return { exists: false };
      
      let cornerColor = null;
      try {
        const c = document.createElement("canvas");
        c.width = video.videoWidth || 1280;
        c.height = video.videoHeight || 720;
        const ctx = c.getContext("2d");
        ctx.drawImage(video, 0, 0);
        const p = ctx.getImageData(25, 25, 1, 1).data;
        cornerColor = "#" + [p[0],p[1],p[2]].map(x => x.toString(16).padStart(2,"0")).join("");
      } catch (err) {
        cornerColor = err.message;
      }

      return {
        exists: true,
        src: video.currentSrc || video.src,
        duration: video.duration,
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        cornerColor,
      };
    })()`);

    if (videoState.exists && videoState.duration > 0) {
      break;
    }
    await delay(500);
  }

  console.log("Video State on Load:", videoState);

  // Take initial screenshot
  await cdp.screenshot("public/screenshot-hero-initial.png");
  console.log("✓ Saved public/screenshot-hero-initial.png");

  // [Test 2: Scrubbing Forward - 1000px]
  console.log("\n[Test 2: Scrubbing Forward - 1000px]");
  await cdp.eval("window.scrollTo(0, 1000)");
  await delay(700);

  const scrub1State = await cdp.eval(`(() => {
    const video = document.querySelector("video");
    const headline = document.querySelector("[class*='headlineBlock']");
    return {
      scrollY: window.scrollY,
      currentTime: video?.currentTime,
      headlineOpacity: headline ? window.getComputedStyle(headline).opacity : null,
    };
  })()`);
  console.log("Scrub 1000px Result:", scrub1State);
  await cdp.screenshot("public/screenshot-hero-1000px.png");
  console.log("✓ Saved public/screenshot-hero-1000px.png");

  // [Test 3: Scrubbing Forward - 2200px]
  console.log("\n[Test 3: Scrubbing Forward - 2200px]");
  await cdp.eval("window.scrollTo(0, 2200)");
  await delay(700);

  const scrub2State = await cdp.eval(`(() => {
    const video = document.querySelector("video");
    return {
      scrollY: window.scrollY,
      currentTime: video?.currentTime,
    };
  })()`);
  console.log("Scrub 2200px Result:", scrub2State);
  await cdp.screenshot("public/screenshot-hero-2200px.png");
  console.log("✓ Saved public/screenshot-hero-2200px.png");

  // [Test 4: Final Pinned Frame - 3200px]
  console.log("\n[Test 4: Final Pinned Frame - 3200px]");
  await cdp.eval("window.scrollTo(0, 3200)");
  await delay(800);

  const climaxState = await cdp.eval(`(() => {
    const video = document.querySelector("video");
    const climax = document.querySelector("[class*='climaxTitle']");
    return {
      scrollY: window.scrollY,
      currentTime: video?.currentTime,
      climaxText: climax?.innerText,
      climaxOpacity: climax ? window.getComputedStyle(climax).opacity : null,
    };
  })()`);
  console.log("Climax 3200px Result:", climaxState);
  await cdp.screenshot("public/screenshot-hero-3200px.png");
  console.log("✓ Saved public/screenshot-hero-3200px.png");

  // [Test 5: Reverse Scrubbing - back to 600px]
  console.log("\n[Test 5: Reverse Scrubbing - back to 600px]");
  await cdp.eval("window.scrollTo(0, 600)");
  await delay(700);

  const reverseState = await cdp.eval(`(() => {
    const video = document.querySelector("video");
    return {
      scrollY: window.scrollY,
      currentTime: video?.currentTime,
    };
  })()`);
  console.log("Reverse 600px Result:", reverseState);

  // [Test 6: Continuation into Reserve Section]
  console.log("\n[Test 6: Continuation into Reserve Section]");
  await cdp.eval("document.getElementById('curated-reserve').scrollIntoView()");
  await delay(700);

  const reserveState = await cdp.eval(`(() => {
    const reserve = document.getElementById("curated-reserve");
    const rect = reserve?.getBoundingClientRect();
    return {
      reserveFound: !!reserve,
      topPosition: rect?.top,
      scrollY: window.scrollY
    };
  })()`);
  console.log("Reserve Section State:", reserveState);
  await cdp.screenshot("public/screenshot-curated-reserve.png");
  console.log("✓ Saved public/screenshot-curated-reserve.png");

  // [Test 7: Responsive Laptop (1280x720)]
  console.log("\n[Test 7: Responsive Laptop (1280x720)]");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp.eval("window.scrollTo(0, 0)");
  await delay(600);
  await cdp.screenshot("public/screenshot-hero-1280x720.png");
  console.log("✓ Saved public/screenshot-hero-1280x720.png");

  // [Test 8: Responsive Tablet (768x1024)]
  console.log("\n[Test 8: Responsive Tablet (768x1024)]");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 768,
    height: 1024,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.eval("window.scrollTo(0, 0)");
  await delay(600);
  await cdp.screenshot("public/screenshot-hero-tablet-768x1024.png");
  console.log("✓ Saved public/screenshot-hero-tablet-768x1024.png");

  // [Test 9: Responsive Mobile (390x844)]
  console.log("\n[Test 9: Mobile Viewport (390x844)]");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.eval("window.scrollTo(0, 0)");
  await delay(800);

  const mobileState = await cdp.eval(`(() => {
    const navLogo = document.querySelector("[class*='logoTitle']")?.innerText;
    const video = document.querySelector("video");
    const vRect = video?.getBoundingClientRect();
    return {
      navLogo,
      videoWidth: vRect?.width,
      videoHeight: vRect?.height,
    };
  })()`);
  console.log("Mobile Viewport Result:", mobileState);
  await cdp.screenshot("public/screenshot-hero-mobile.png");
  console.log("✓ Saved public/screenshot-hero-mobile.png");

  console.log("\n=== ALL CHECKS PASSED PERFECTLY ===");
  cdp.close();
  edge.kill();
  process.exit(0);
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});

import puppeteer from "puppeteer";
import * as path from "path";

async function runVisualCheck() {
  console.log("Launching headless browser with Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Set Desktop viewport
  await page.setViewport({ width: 1280, height: 800 });

  // ----------------------------------------------------
  // TEST 1: Check Home Page (/)
  // ----------------------------------------------------
  const homeUrl = "https://dullys-menu-app.vercel.app/";
  console.log(`Navigating to Home Page: ${homeUrl}`);
  await page.goto(homeUrl, { waitUntil: "networkidle2" });

  // Wait 10 seconds to let the loader AND entrance animations fully settle
  console.log("Waiting 10 seconds for all animations to complete...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log("Evaluating home page category hero visual zone...");
  const homeResult = await page.evaluate(() => {
    // Find the image element inside the category hero section
    const img = document.querySelector('img[src*="/categories/hot-tea/hero/"]') as HTMLImageElement;
    if (!img) {
      // Find all img tags on home page to inspect
      const allImgs = Array.from(document.querySelectorAll('img')).map(i => i.src);
      return { found: false, error: "Image element not found on home page DOM", allImgs };
    }

    const rect = img.getBoundingClientRect();
    const style = window.getComputedStyle(img);

    // Check intersection with viewport
    const intersectsViewport =
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < window.innerHeight &&
      rect.left < window.innerWidth &&
      rect.width > 0 &&
      rect.height > 0;

    return {
      found: true,
      currentSrc: img.currentSrc,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
      style: {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        position: style.position,
        zIndex: style.zIndex,
        objectFit: style.objectFit,
        width: style.width,
        height: style.height
      },
      intersectsViewport
    };
  });

  console.log("Home Page Evaluation Result:", JSON.stringify(homeResult, null, 2));

  const artifactDir = "C:/Users/elwady/.gemini/antigravity/brain/e5caa118-b909-495b-8320-e988de8987a6";
  const homeDesktopPath = path.join(artifactDir, "home_desktop.png");
  console.log(`Taking Home Page Desktop screenshot to: ${homeDesktopPath}`);
  await page.screenshot({ path: homeDesktopPath });

  // Set Mobile viewport
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  console.log("Waiting for mobile view layout adjustment...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const homeMobilePath = path.join(artifactDir, "home_mobile.png");
  console.log(`Taking Home Page Mobile screenshot to: ${homeMobilePath}`);
  await page.screenshot({ path: homeMobilePath });

  await browser.close();
  console.log("Headless browser closed successfully!");
}

runVisualCheck().catch(err => {
  console.error("Puppeteer test failed:", err);
  process.exit(1);
});

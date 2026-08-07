/** Export engine - renders HTML to PNG/PDF/SVG/HTML via Puppeteer. */

import puppeteer, { type Browser } from "puppeteer";
import type { RenderResult } from "../core/types";

let browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (browser && browser.connected) return browser;
  const launchOptions = {
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--font-render-hinting=none",
    ],
    headless: true,
  };
  browser = await puppeteer.launch(launchOptions);
  return browser;
}

export async function shutdownBrowser(): Promise<void> {
  if (browser) {
    try {
      await browser.close();
    } catch {
      /* ignore */
    }
    browser = null;
  }
}

async function newPage(b: Browser) {
  const page = await b.newPage();
  // deterministic rendering: disable animations, consistent color profile
  await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
  return page;
}

export interface RenderOutputOptions {
  format: "png" | "svg" | "pdf" | "html";
  width: number;
  height: number;
  scale: number;
}

export async function renderHtml(html: string, opts: RenderOutputOptions): Promise<RenderResult> {
  const b = await getBrowser();
  const page = await newPage(b);
  try {
    await page.setViewport({ width: opts.width, height: opts.height, deviceScaleFactor: opts.scale });
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });

    switch (opts.format) {
      case "png": {
        const buffer = await page.screenshot({ type: "png", fullPage: false });
        return { format: "png", mimeType: "image/png", buffer: Buffer.from(buffer), width: opts.width, height: opts.height };
      }
      case "pdf": {
        const buffer = await page.pdf({
          width: opts.width,
          height: opts.height,
          printBackground: true,
          preferCSSPageSize: true,
          pageRanges: "1",
        });
        return { format: "pdf", mimeType: "application/pdf", buffer: Buffer.from(buffer), width: opts.width, height: opts.height };
      }
      case "html":
        return { format: "html", mimeType: "text/html; charset=utf-8", buffer: Buffer.from(html, "utf-8"), width: opts.width, height: opts.height };
      case "svg": {
        // extract the first <svg>...</svg> block; fall back to wrapping whole html
        const m = html.match(/<svg[\s\S]*?<\/svg>/);
        const svg = m ? m[0] : html;
        return { format: "svg", mimeType: "image/svg+xml", buffer: Buffer.from(svg, "utf-8"), width: opts.width, height: opts.height };
      }
    }
  } finally {
    await page.close().catch(() => {});
  }
}

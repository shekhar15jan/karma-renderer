/* Copies non-TypeScript assets that tsc does not emit into dist/.
 *  - src/styles            -> dist/styles          (SCENE_CSS lives in TS, but global.css is a runtime import)
 *  - src/video/mock_specs  -> dist/video/mock_specs (JSON specs imported by remotion-root)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const from = path.join(srcDir, entry.name);
    const to = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

copyDir(path.join(SRC, "styles"), path.join(DIST, "styles"));
copyDir(path.join(SRC, "video", "mock_specs"), path.join(DIST, "video", "mock_specs"));

console.log("[copy-assets] copied styles and video/mock_specs into dist/");
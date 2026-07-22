#!/usr/bin/env node

/**
 * Post-processes `expo export --platform web` output so Cloudflare Pages can
 * serve dependency-shipped assets. Runs as part of `npm run build:web`.
 *
 * Expo exports every asset under its source path, so anything a dependency ships
 * lands in `dist/assets/node_modules/…` — the @expo/vector-icons glyph TTFs and
 * the expo-router PNGs. `wrangler pages deploy` skips all `node_modules` paths
 * when uploading and offers no opt-out, so those files never reach the CDN;
 * their URLs then fall through to the SPA rewrite in `public/_redirects` and
 * return `index.html`. The browser fails to decode that HTML as a font and every
 * icon renders as a tofu box (□) — on the deployed site only, since a local
 * `dist/` still has the real files.
 *
 * Fix: rename the directory out of `node_modules/` and rewrite the matching
 * URLs in the exported JS.
 */

const fs = require('fs');
const path = require('path');

const FROM_REF = '/assets/node_modules/';
const TO_REF = '/assets/vendor/';
// Exported text files live outside dist/assets; that directory is binary assets only.
const REWRITABLE = new Set(['.js', '.html', '.json', '.css', '.map']);

const distDir = path.resolve(process.cwd(), process.argv[2] || 'dist');
const fromDir = path.join(distDir, 'assets', 'node_modules');
const toDir = path.join(distDir, 'assets', 'vendor');

if (!fs.existsSync(distDir)) {
  console.error(`fix-web-asset-paths: ${distDir} does not exist — run the web export first.`);
  process.exit(1);
}

let movedFiles = 0;
if (fs.existsSync(fromDir)) {
  countFiles(fromDir);
  // `expo export` regenerates assets/node_modules, so any assets/vendor left over
  // from a previous run is this script's own stale output.
  fs.rmSync(toDir, { recursive: true, force: true });
  fs.renameSync(fromDir, toDir);
}

function countFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) countFiles(path.join(dir, entry.name));
    else movedFiles += 1;
  }
}

function textFiles(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full !== path.join(distDir, 'assets')) found.push(...textFiles(full));
    } else if (REWRITABLE.has(path.extname(entry.name))) {
      found.push(full);
    }
  }
  return found;
}

let rewrittenFiles = 0;
let rewrittenRefs = 0;
const leftover = [];

for (const file of textFiles(distDir)) {
  const before = fs.readFileSync(file, 'utf8');
  const hits = before.split(FROM_REF).length - 1;
  if (hits > 0) {
    fs.writeFileSync(file, before.split(FROM_REF).join(TO_REF));
    rewrittenFiles += 1;
    rewrittenRefs += hits;
  }
  // Anything still pointing into node_modules would 404 on Cloudflare, so fail
  // the build rather than shipping silently broken icons again.
  if (fs.readFileSync(file, 'utf8').includes('/assets/node_modules/')) {
    leftover.push(path.relative(distDir, file));
  }
}

console.log(
  `fix-web-asset-paths: moved ${movedFiles} asset(s) to assets/vendor, ` +
    `rewrote ${rewrittenRefs} reference(s) across ${rewrittenFiles} file(s).`
);

if (leftover.length > 0) {
  console.error(
    `fix-web-asset-paths: ${FROM_REF} references remain in: ${leftover.join(', ')}`
  );
  process.exit(1);
}

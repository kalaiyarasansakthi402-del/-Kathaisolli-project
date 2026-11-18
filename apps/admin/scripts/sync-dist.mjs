import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminDir = path.resolve(__dirname, '..');
const distDir = path.join(adminDir, 'dist');
const distAdminDir = path.join(distDir, 'admin');

console.log('[SYNC-DIST] Synchronizing apps/admin/dist for standalone and subpath Vercel deployments...');

if (!fs.existsSync(distDir)) {
  console.error('[SYNC-DIST] Error: dist directory does not exist. Run vite build first.');
  process.exit(1);
}

// 1. Ensure dist/admin directory exists
fs.mkdirSync(distAdminDir, { recursive: true });

// 2. Copy dist/assets to dist/admin/assets
const assetsDir = path.join(distDir, 'assets');
const adminAssetsDir = path.join(distAdminDir, 'assets');
if (fs.existsSync(assetsDir)) {
  fs.mkdirSync(adminAssetsDir, { recursive: true });
  fs.cpSync(assetsDir, adminAssetsDir, { recursive: true });
  console.log('  -> Mirrored dist/assets/ into dist/admin/assets/');
}

// 3. Copy all files from dist into dist/admin (excluding the admin folder itself)
const entries = fs.readdirSync(distDir);
for (const entry of entries) {
  if (entry === 'admin') continue;
  const src = path.join(distDir, entry);
  const dst = path.join(distAdminDir, entry);
  fs.cpSync(src, dst, { recursive: true });
}
console.log('  -> Mirrored root dist files into dist/admin/');

console.log('[SYNC-DIST] Standalone & subpath distribution sync complete.\n');

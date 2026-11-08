import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

console.log('====================================================');
console.log('  KATHAISOLLI UNIFIED SINGLE VERCEL BUILD');
console.log('====================================================\n');

function run(cmd, desc) {
  console.log(`[BUILD] ${desc}...`);
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: rootDir });
  console.log(`[PASS] ${desc} completed successfully.\n`);
}

// 1. Build Backend API
run('pnpm --filter @kathaisolli/api build', 'API Build (Prisma + NestJS)');

// 2. Build User Web App
run('pnpm --filter @kathaisolli/web build', 'Web App Build (React + Vite)');

// 3. Build Admin App
run('pnpm --filter @kathaisolli/admin build', 'Admin App Build (React + Vite, base: /admin/)');

// 4. Assemble Unified Deployment Directory (dist)
console.log('[ASSEMBLE] Assembling unified deployment structure in dist/...');
const distDir = path.join(rootDir, 'dist');
const webDistDir = path.join(rootDir, 'apps/web/dist');
const adminDistDir = path.join(rootDir, 'apps/admin/dist');

if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Copy Web build into root of dist
fs.cpSync(webDistDir, distDir, { recursive: true });
console.log('  -> Copied apps/web/dist to dist/');

// Copy Admin build into dist/admin
const distAdminDir = path.join(distDir, 'admin');
fs.cpSync(adminDistDir, distAdminDir, { recursive: true });
console.log('  -> Copied apps/admin/dist to dist/admin/');

// Verify critical artifacts
const requiredArtifacts = [
  path.join(distDir, 'index.html'),
  path.join(distDir, 'admin/index.html'),
  path.join(rootDir, 'apps/api/dist/app.module.js'),
];

for (const artifact of requiredArtifacts) {
  if (!fs.existsSync(artifact)) {
    throw new Error(`[ERROR] Missing required build artifact: ${artifact}`);
  }
}

console.log('\n====================================================');
console.log('  UNIFIED VERCEL BUILD VERIFICATION PASSED');
console.log('  - Web SPA:    dist/index.html');
console.log('  - Admin SPA:  dist/admin/index.html');
console.log('  - API Module: apps/api/dist/app.module.js');
console.log('====================================================\n');

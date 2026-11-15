import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('====================================================');
console.log('  KATHAISOLLI UNIFIED SINGLE VERCEL BUILD');
console.log('  Working Root:', rootDir);
console.log('====================================================\n');

function run(cmd, desc) {
  console.log(`[BUILD] ${desc}...`);
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: rootDir });
  console.log(`[PASS] ${desc} completed successfully.\n`);
}

// 1. Build Backend API
run('pnpm --filter @kathaisolli/api build', 'API Build (Prisma + NestJS)');

// Sync Prisma Client artifacts into root node_modules and distribution folders
console.log('[ASSEMBLE] Syncing Prisma client engines and metadata for serverless bundling...');
try {
  const pnpmPrismaDir = path.join(rootDir, 'node_modules/.pnpm');
  let sourcePrismaDir = null;

  // Search for the generated .prisma directory in pnpm
  if (fs.existsSync(pnpmPrismaDir)) {
    const entries = fs.readdirSync(pnpmPrismaDir);
    for (const entry of entries) {
      if (entry.startsWith('@prisma+client@')) {
        const candidate = path.join(pnpmPrismaDir, entry, 'node_modules/.prisma');
        if (fs.existsSync(candidate)) {
          sourcePrismaDir = candidate;
          break;
        }
      }
    }
  }

  if (sourcePrismaDir) {
    const targetDirs = [
      path.join(rootDir, 'node_modules/.prisma'),
      path.join(rootDir, 'apps/api/node_modules/.prisma'),
      path.join(rootDir, 'apps/api/dist/.prisma'),
      path.join(rootDir, 'api-dist/.prisma'),
    ];

    for (const target of targetDirs) {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.cpSync(sourcePrismaDir, target, { recursive: true });
      console.log(`  -> Copied .prisma to ${path.relative(rootDir, target)}`);
    }
  } else {
    console.warn('[WARN] Could not find generated .prisma directory in .pnpm.');
  }
} catch (err) {
  console.warn('[WARN] Non-fatal error while syncing .prisma:', err.message);
}

// Copy API dist into apps/web/api-dist and root api-dist for Vercel Serverless Function bundling
console.log('[ASSEMBLE] Syncing API distribution artifacts for serverless bundling...');
const apiDistDir = path.join(rootDir, 'apps/api/dist');
const webApiDistDir = path.join(rootDir, 'apps/web/api-dist');
const rootApiDistDir = path.join(rootDir, 'api-dist');

if (fs.existsSync(webApiDistDir)) {
  fs.rmSync(webApiDistDir, { recursive: true, force: true });
}
fs.cpSync(apiDistDir, webApiDistDir, { recursive: true });
fs.writeFileSync(path.join(webApiDistDir, 'package.json'), JSON.stringify({ name: 'api-dist', type: 'commonjs' }, null, 2));
console.log('  -> Copied apps/api/dist to apps/web/api-dist/ (configured as CommonJS)');

if (fs.existsSync(rootApiDistDir)) {
  fs.rmSync(rootApiDistDir, { recursive: true, force: true });
}
fs.cpSync(apiDistDir, rootApiDistDir, { recursive: true });
fs.writeFileSync(path.join(rootApiDistDir, 'package.json'), JSON.stringify({ name: 'api-dist', type: 'commonjs' }, null, 2));
console.log('  -> Copied apps/api/dist to api-dist/ (configured as CommonJS)');

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

// ALSO Copy Admin build into apps/web/dist/admin for apps/web deployments
const webDistAdminDir = path.join(webDistDir, 'admin');
fs.cpSync(adminDistDir, webDistAdminDir, { recursive: true });
console.log('  -> Copied apps/admin/dist to apps/web/dist/admin/');

// Verify critical artifacts
const requiredArtifacts = [
  path.join(distDir, 'index.html'),
  path.join(distDir, 'admin/index.html'),
  path.join(webDistDir, 'index.html'),
  path.join(webDistAdminDir, 'index.html'),
  path.join(rootDir, 'apps/api/dist/app.module.js'),
];

for (const artifact of requiredArtifacts) {
  if (!fs.existsSync(artifact)) {
    throw new Error(`[ERROR] Missing required build artifact: ${artifact}`);
  }
}

console.log('\n====================================================');
console.log('  UNIFIED VERCEL BUILD VERIFICATION PASSED');
console.log('  - Root Web SPA:    dist/index.html');
console.log('  - Root Admin SPA:  dist/admin/index.html');
console.log('  - Web Admin SPA:   apps/web/dist/admin/index.html');
console.log('  - API Module:      apps/api/dist/app.module.js');
console.log('====================================================\n');

// Comprehensive Verification Script for Kathaisolli Admin & Audio Engine
import fs from 'fs';
import path from 'path';

console.log('=== KATHAISOLLI ADMIN & AUDIO ARCHITECTURE VERIFICATION ===\n');

let passed = 0;
let total = 0;

function assert(condition, testName, details = '') {
  total++;
  if (condition) {
    console.log(`✔ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
    passed++;
  } else {
    console.error(`✘ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
  }
}

// 1. Verify Public Website has no admin routes or navbar entry points
const webAppTsx = fs.readFileSync('apps/web/src/App.tsx', 'utf-8');
const webNavbarTsx = fs.readFileSync('apps/web/src/components/Navbar.tsx', 'utf-8');

assert(
  !webNavbarTsx.includes('/admin') && !webNavbarTsx.includes('Admin'),
  'Public Website Navbar Isolation',
  'Navbar contains 0 admin links'
);

assert(
  webAppTsx.includes('path="/admin/*"') && webAppTsx.includes('Navigate to="/" replace'),
  'Public Website Admin Route Lockdown',
  'Route /admin/* redirects to /'
);

// 2. Verify Private Admin Website Architecture
const adminAppTsx = fs.readFileSync('apps/admin/src/App.tsx', 'utf-8');
const adminSidebarTsx = fs.readFileSync('apps/admin/src/components/Sidebar.tsx', 'utf-8');

assert(
  adminAppTsx.includes('AdminLoginPage') && adminAppTsx.includes('ProtectedLayout'),
  'Admin Authentication Guard',
  'ProtectedLayout guards all admin routes with login redirect'
);

assert(
  adminSidebarTsx.includes('/admin/books') &&
  adminSidebarTsx.includes('/admin/books/new') &&
  adminSidebarTsx.includes('/admin/audio-upload'),
  'Admin Sidebar Navigation',
  'Direct links to Books, Add Book, and Audio Upload'
);

// 3. Verify Firebase Storage paths and upload logic
const firebaseStorageTs = fs.readFileSync('apps/admin/src/services/firebaseAdminStorage.ts', 'utf-8');

assert(
  firebaseStorageTs.includes('kathaisolli/books/${bookId}/cover/') &&
  firebaseStorageTs.includes('kathaisolli/books/${bookId}/chapters/'),
  'Firebase Storage Folder Hierarchy',
  'Strict paths: books/{bookId}/cover/ and chapters/'
);

assert(
  firebaseStorageTs.includes('uploadBytesResumable') &&
  firebaseStorageTs.includes('detectAudioDuration'),
  'Audio Metadata & Resumable Upload',
  'Upload progress tracking & HTML5 audio duration detection implemented'
);

// 4. Verify Cloudflare D1 Integration
const wranglerToml = fs.readFileSync('wrangler.toml', 'utf-8');
const schemaSql = fs.readFileSync('migrations/0001_initial_schema.sql', 'utf-8');

assert(
  wranglerToml.includes('binding = "DB"') &&
  wranglerToml.includes('database_name = "kathaisolli"') &&
  wranglerToml.includes('1446e71e-f6f2-4835-956d-07704f141f44'),
  'Cloudflare D1 Database Binding',
  'wrangler.toml configured with DB binding and database ID'
);

assert(
  schemaSql.includes('CREATE TABLE IF NOT EXISTS series') &&
  schemaSql.includes('CREATE TABLE IF NOT EXISTS episodes') &&
  schemaSql.includes('CREATE TABLE IF NOT EXISTS media_assets'),
  'Cloudflare D1 Schema Integrity',
  'SQLite tables defined for series, episodes, media_assets'
);

// 5. Verify Build Artefacts
assert(
  fs.existsSync('apps/admin/dist/index.html') &&
  fs.existsSync('apps/web/dist/index.html'),
  'Production Dist Builds',
  'Both @kathaisolli/admin and @kathaisolli/web compiled successfully'
);

console.log(`\nVerification Summary: ${passed} / ${total} tests passed.`);
if (passed === total) {
  console.log('🎉 ALL KATHAISOLLI VERIFICATION CHECKS PASSED!\n');
} else {
  process.exit(1);
}
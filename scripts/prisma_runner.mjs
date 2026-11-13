import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const envVars = {};
  if (!fs.existsSync(envPath)) return envVars;

  const content = fs.readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
  return envVars;
}

const env = { ...process.env, ...loadEnv() };

const binPath1 = path.join(rootDir, 'apps/api/node_modules/.bin');
const binPath2 = path.join(rootDir, 'node_modules/.bin');
const pathDelimiter = path.delimiter;
const currentPath = env.PATH || env.Path || process.env.PATH || process.env.Path || '';
const augmentedPath = `${binPath1}${pathDelimiter}${binPath2}${pathDelimiter}${currentPath}`;
env.PATH = augmentedPath;
env.Path = augmentedPath;

const args = process.argv.slice(2);
const defaultArgs = args.length ? args : ['migrate', 'status'];
const isMigrationCmd =
  defaultArgs[0] === 'migrate' ||
  defaultArgs[0] === 'db';

// Use unpooled direct connection for Prisma migrations/DDL when available
if (isMigrationCmd && (env.DATABASE_URL_UNPOOLED || env.DIRECT_URL)) {
  env.DATABASE_URL = env.DATABASE_URL_UNPOOLED || env.DIRECT_URL;
}

if (env.DATABASE_URL) {
  try {
    const u = new URL(env.DATABASE_URL);
    if (!u.searchParams.has('connect_timeout')) u.searchParams.set('connect_timeout', '60');
    if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '60');
    env.DATABASE_URL = u.toString();
  } catch {}
}

const prismaBin = path.join(
  rootDir,
  'apps/api/node_modules/prisma/build/index.js',
);
const schemaPath = path.join(rootDir, 'apps/api/prisma/schema.prisma');

const skipSchemaFlag =
  (defaultArgs[0] === 'migrate' && defaultArgs[1] === 'diff') ||
  defaultArgs.includes('--schema') ||
  defaultArgs.includes('--help') ||
  defaultArgs.includes('-h') ||
  defaultArgs.includes('--version') ||
  defaultArgs.includes('-v');

const fullArgs = [
  prismaBin,
  ...defaultArgs,
  ...(skipSchemaFlag ? [] : ['--schema', schemaPath]),
];

try {
  const hostInfo = env.DATABASE_URL ? new URL(env.DATABASE_URL).hostname : 'unset';
  console.log('[PrismaRunner] Target host:', hostInfo, isMigrationCmd ? '(unpooled migration mode)' : '(pooled mode)');
} catch {
  // Ignore URL parse error for logging
}
console.log('[PrismaRunner] Running prisma with schema:', schemaPath);
console.log('[PrismaRunner] Subcommand:', defaultArgs.join(' '));

const execCwd =
  defaultArgs[0] === 'db' && defaultArgs[1] === 'seed'
    ? path.join(rootDir, 'apps/api')
    : rootDir;

const res = spawnSync(process.execPath, fullArgs, {
  cwd: execCwd,
  env,
  stdio: 'inherit',
});

process.exit(res.status ?? 0);

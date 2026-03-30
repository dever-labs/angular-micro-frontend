/**
 * Workaround for npm v11 bug: packages with libc:[null] cause a crash during install.
 * @oxc-parser/binding-win32-x64-msvc is an optional native binding needed on Windows.
 * We download and extract it manually via `npm pack`.
 *
 * This script is safe to run multiple times - it exits early if the binding is already present.
 * It is run automatically via the root and workspace postinstall hooks.
 */
const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const isWindows = process.platform === 'win32';
const isX64 = process.arch === 'x64';

if (!isWindows || !isX64) {
  process.exit(0);
}

// Resolve the root of the monorepo (this script lives in scripts/)
const root = path.join(__dirname, '..');

// oxc-parser may be hoisted to root node_modules or in a local node_modules
const localOxc = path.join(root, 'node_modules', 'oxc-parser', 'package.json');
if (!fs.existsSync(localOxc)) {
  process.exit(0);
}

const version = require(localOxc).optionalDependencies['@oxc-parser/binding-win32-x64-msvc'];
if (!version) process.exit(0);

const dest = path.join(root, 'node_modules', '@oxc-parser', 'binding-win32-x64-msvc');
const bindingFile = path.join(dest, 'parser.win32-x64-msvc.node');

if (fs.existsSync(bindingFile)) {
  process.exit(0);
}

// Try to use the cached tarball first, then fall back to npm pack
const cachedTarball = path.join(__dirname, `oxc-parser-binding-win32-x64-msvc-${version}.tgz`);
const hasCached = fs.existsSync(cachedTarball);

console.log(`Installing @oxc-parser/binding-win32-x64-msvc@${version} (Windows native binding)...`);

try {
  let tarball;
  if (hasCached) {
    tarball = cachedTarball;
  } else {
    const pkgName = `@oxc-parser/binding-win32-x64-msvc@${version}`;
    const packed = execSync(`npm pack ${pkgName} --silent`, { cwd: root, encoding: 'utf8' }).trim().split('\n').pop();
    tarball = path.join(root, packed);
  }

  fs.mkdirSync(dest, { recursive: true });

  const tar = spawnSync('tar', ['-xzf', tarball, '-C', dest, '--strip-components=1'], { cwd: root, stdio: 'inherit' });

  if (!hasCached && fs.existsSync(tarball)) {
    fs.unlinkSync(tarball);
  }

  if (tar.status === 0) {
    console.log('  ✓ @oxc-parser/binding-win32-x64-msvc installed');
  } else {
    console.error('  ✗ Failed to extract tarball');
    process.exit(1);
  }
} catch (e) {
  console.error('  ✗ Failed to install @oxc-parser/binding-win32-x64-msvc:', e.message);
  process.exit(1);
}

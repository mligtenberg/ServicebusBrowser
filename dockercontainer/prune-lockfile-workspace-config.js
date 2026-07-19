// Nx's `generatePackageJson` prunes the workspace pnpm-lock.yaml down to a
// single app's dependencies, but copies the lockfile's top-level `overrides`
// and `patchedDependencies` headers verbatim from the workspace root - even
// for entries whose target package isn't in this app's resolved dependency
// tree at all. Those dead entries still trip `pnpm install --frozen-lockfile`'s
// config-match check, because the app's standalone package.json (shipped
// without the rest of the workspace) has no equivalent config to match them.
//
// Rather than dropping the headers wholesale (which would also silently
// discard an override/patch that DOES affect this app), this keeps only the
// entries whose target package is actually resolved here, and writes a
// pnpm-workspace.yaml alongside the app so pnpm's computed config matches
// what's left in the lockfile. Anything kept - now or after a future change
// upstream - is genuinely applied; anything dropped was always inert here.
const fs = require('fs');
const path = require('path');

const [, , appDir, workspaceRoot] = process.argv;
if (!appDir || !workspaceRoot) {
  console.error('Usage: prune-lockfile-workspace-config.js <appDir> <workspaceRoot>');
  process.exit(1);
}

const lockfilePath = path.join(appDir, 'pnpm-lock.yaml');
const lockfileText = fs.readFileSync(lockfilePath, 'utf8');
const lines = lockfileText.split('\n');

// Returns the indented lines directly under a top-level `<key>:` line.
function findBlock(key) {
  const startIdx = lines.findIndex((line) => line === `${key}:`);
  if (startIdx === -1) return [];
  const body = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') continue;
    if (!line.startsWith(' ')) break;
    body.push(line);
  }
  return body;
}

function parseFlatMap(blockLines) {
  const entries = [];
  for (const line of blockLines) {
    const match = line.match(/^  (.+?):\s*(.+)$/);
    if (!match) continue;
    entries.push([match[1].replace(/^'(.*)'$/, '$1'), match[2].trim()]);
  }
  return entries;
}

// Package names actually resolved for this app, e.g. "express" from "express@4.22.2(...)".
const resolvedNames = new Set();
for (const line of findBlock('packages')) {
  const match = line.match(/^  '?([^'\n]+?)'?:\s*$/);
  if (!match) continue;
  const withoutPeers = match[1].replace(/\(.*$/, '');
  const at = withoutPeers.lastIndexOf('@');
  resolvedNames.add(at > 0 ? withoutPeers.slice(0, at) : withoutPeers);
}

const overrides = parseFlatMap(findBlock('overrides'));
const patches = parseFlatMap(findBlock('patchedDependencies'));

const keptOverrides = overrides.filter(([key]) => resolvedNames.has(key.split('>').pop()));
const keptPatches = patches.filter(([key]) => resolvedNames.has(key.replace(/@[^@]+$/, '')));

function quoteKeyIfNeeded(key) {
  return /[>@]/.test(key) ? `'${key}'` : key;
}

function replaceTopLevelBlock(text, key, entries) {
  const withoutBlock = text.replace(new RegExp(`^${key}:\\n(?:  [^\\n]*\\n)*\\n?`, 'm'), '');
  if (entries.length === 0) return withoutBlock;
  const body = entries.map(([k, v]) => `  ${quoteKeyIfNeeded(k)}: ${v}`).join('\n');
  return withoutBlock.replace(/^(settings:\n(?:  [^\n]*\n)*)/m, `$1\n${key}:\n${body}\n`);
}

let newLockfile = lockfileText;
newLockfile = replaceTopLevelBlock(newLockfile, 'overrides', keptOverrides);
newLockfile = replaceTopLevelBlock(newLockfile, 'patchedDependencies', keptPatches);
fs.writeFileSync(lockfilePath, newLockfile);

const workspaceLines = [];
if (keptOverrides.length) {
  workspaceLines.push('overrides:');
  for (const [k, v] of keptOverrides) workspaceLines.push(`  ${quoteKeyIfNeeded(k)}: ${v}`);
}
if (keptPatches.length) {
  workspaceLines.push('patchedDependencies:');
  for (const [k, v] of keptPatches) workspaceLines.push(`  ${k}: ${v}`);
}

if (workspaceLines.length) {
  fs.writeFileSync(path.join(appDir, 'pnpm-workspace.yaml'), workspaceLines.join('\n') + '\n');

  for (const [, relPath] of keptPatches) {
    const dest = path.join(appDir, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(workspaceRoot, relPath), dest);
  }
}

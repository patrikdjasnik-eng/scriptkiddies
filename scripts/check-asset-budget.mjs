#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.argv[2] ?? 'dist');
const configPath = path.resolve('game.config.json');
const config = JSON.parse(await readFile(configPath, 'utf8'));
const limit = config.distribution.maxInstallBytes;
const warningAt = Math.floor(limit * config.distribution.warningThreshold);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile()) {
      const info = await stat(fullPath);
      files.push({ path: path.relative(root, fullPath), bytes: info.size });
    }
  }
  return files;
}

let files;
try {
  files = await walk(root);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`Asset budget check failed: "${root}" does not exist. Run the production build first.`);
    process.exit(2);
  }
  throw error;
}

const total = files.reduce((sum, file) => sum + file.bytes, 0);
const gib = value => (value / 1024 ** 3).toFixed(2);
console.log(`\nBOUNTY HUNTER — PACKAGE SIZE\nDirectory: ${root}\nFiles: ${files.length}\nTotal: ${gib(total)} GiB / ${gib(limit)} GiB`);

if (total > warningAt) console.warn(`WARNING: package exceeds ${Math.round(config.distribution.warningThreshold * 100)}% of the 10 GiB budget.`);
if (total > limit) {
  console.error('FAILED: packaged game exceeds the 10 GiB maximum.');
  process.exitCode = 1;
} else {
  console.log('PASS: packaged game is within the size budget.');
}

if (files.length) {
  console.log('\nLargest files:');
  for (const file of files.sort((a, b) => b.bytes - a.bytes).slice(0, 10)) {
    console.log(`  ${gib(file.bytes)} GiB  ${file.path}`);
  }
}

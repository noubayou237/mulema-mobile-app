const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = process.cwd();
const ASSETS_DIR = path.join(WORKSPACE_ROOT, 'frontend/assets');
const FRONTEND_DIR = path.join(WORKSPACE_ROOT, 'frontend');

function toSnakeCase(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function convertAndNormalize(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const oldPath = path.join(dir, item);
    const stats = fs.statSync(oldPath);

    if (stats.isDirectory()) {
      const newDirName = toSnakeCase(item);
      const newDirPath = path.join(dir, newDirName);
      if (oldPath !== newDirPath) {
        fs.renameSync(oldPath, newDirPath);
        convertAndNormalize(newDirPath);
      } else {
        convertAndNormalize(oldPath);
      }
      continue;
    }

    let ext = path.extname(item).toLowerCase();
    let base = path.basename(item, path.extname(item));
    let normalizedBase = toSnakeCase(base);

    let currentPath = oldPath;

    // 1. Convert .wav to .mp3
    if (ext === '.wav') {
      const mp3Path = path.join(dir, normalizedBase + '.mp3');
      try {
        execSync(`ffmpeg -y -i "${currentPath}" -codec:a libmp3lame -qscale:a 2 "${mp3Path}"`, { stdio: 'inherit' });
        fs.unlinkSync(currentPath); // Delete .wav
        currentPath = mp3Path;
        ext = '.mp3';
      } catch (err) {
      }
    } else {
      // Just normalize name
      const newName = normalizedBase + ext;
      const newPath = path.join(dir, newName);
      if (currentPath !== newPath) {
        fs.renameSync(currentPath, newPath);
        currentPath = newPath;
      }
    }
  }
}

convertAndNormalize(ASSETS_DIR);

// Now update all .js/jsx files to change .wav to .mp3 and normalize paths in requires
function updateRefs(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (['node_modules', '.expo', '.git'].includes(item)) continue;

    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      updateRefs(fullPath);
    } else if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(path.extname(item))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // 1. Change .wav" to .mp3" and .wav' to .mp3'
      content = content.replace(/\.wav(["'])/g, '.mp3$1');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

updateRefs(FRONTEND_DIR);

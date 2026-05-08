const fs = require('fs');
const path = require('path');

const ASSETS_MAP_PATH = path.join(process.cwd(), 'frontend/src/utils/AssetsMap.js');
const ASSETS_DIR = path.join(process.cwd(), 'frontend/assets');

function toSnakeCase(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function auditAndFix() {
  let content = fs.readFileSync(ASSETS_MAP_PATH, 'utf8');
  const requireRegex = /"([^"]+)":\s*require\("([^"]+)"\)/g;
  let match;
  let updatedContent = content;

  const replacements = [];

  while ((match = requireRegex.exec(content)) !== null) {
    const key = match[1];
    const relPath = match[2];

    // Resolve absolute path
    // paths are relative to frontend/src/utils/
    const absPath = path.resolve(process.cwd(), 'frontend/src/utils', relPath);

    if (!fs.existsSync(absPath)) {

      // Try to find the file
      let found = false;
      const fileName = path.basename(relPath);
      const fileNameNoExt = path.basename(relPath, path.extname(relPath));

      // Search recursively in assets
      const potentialFiles = findFileInDir(ASSETS_DIR, fileNameNoExt);

      if (potentialFiles.length > 0) {
        // Pick the best match (closest path segments?)
        // For now just pick the first one and convert to relative path
        const newAbsPath = potentialFiles[0];
        const newRelPath = "../../assets/" + path.relative(ASSETS_DIR, newAbsPath);

        replacements.push({ old: relPath, new: newRelPath });
        found = true;
      } else {
      }
    }
  }

  // Apply replacements
  for (const rep of replacements) {
    // Escape dots and slashes for regex
    const escapedOld = rep.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`require\\("${escapedOld}"\\)`, 'g');
    updatedContent = updatedContent.replace(regex, `require("${rep.new}")`);
  }

  // Also global replace .wav to .mp3 just in case
  updatedContent = updatedContent.replace(/\.wav"/g, '.mp3"');

  if (updatedContent !== content) {
    fs.writeFileSync(ASSETS_MAP_PATH, updatedContent, 'utf8');
  }
}

function findFileInDir(dir, nameNoExt) {
  const results = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      results.push(...findFileInDir(fullPath, nameNoExt));
    } else {
      const ext = path.extname(item).toLowerCase();
      const base = path.basename(item, ext);
      if (toSnakeCase(base) === toSnakeCase(nameNoExt)) {
        if (['.mp3', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.mp4'].includes(ext)) {
          results.push(fullPath);
        }
      }
    }
  }
  return results;
}

auditAndFix();

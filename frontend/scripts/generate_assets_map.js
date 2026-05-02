const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');
const outputFilePath = path.join(projectRoot, 'src', 'utils', 'AssetsMap.js');

const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.bmp'];
const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg'];
const videoExtensions = ['.mp4', '.mov', '.wmv', '.avi', '.mkv'];

function toSnakeCase(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function getFiles(dir, allFiles = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, allFiles);
    } else {
      allFiles.push(name);
    }
  }
  return allFiles;
}

const allAssetFiles = getFiles(assetsDir);

const imagesMap = {};
const audiosMap = {};
const videosMap = {};

function addToMap(map, filePath, ext) {
  const fileBase = path.basename(filePath, ext);
  let key = toSnakeCase(fileBase);
  
  // Handle collisions
  let finalKey = key;
  let counter = 1;
  while (map[finalKey] && map[finalKey] !== filePath) {
    finalKey = `${key}_${counter}`;
    counter++;
  }
  
  const relativePath = path.relative(path.dirname(outputFilePath), filePath);
  // Ensure we use forward slashes for require
  const normalizedPath = relativePath.split(path.sep).join('/');
  
  map[finalKey] = normalizedPath;
}

allAssetFiles.forEach(file => {
  const ext = path.extname(file).toLowerCase();
  if (imageExtensions.includes(ext)) {
    addToMap(imagesMap, file, ext);
  } else if (audioExtensions.includes(ext)) {
    addToMap(audiosMap, file, ext);
  } else if (videoExtensions.includes(ext)) {
    addToMap(videosMap, file, ext);
  }
});

function generateMapString(map) {
  const entries = Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `  "${key}": require("${value}"),`)
    .join('\n');
  return `{\n${entries}\n}`;
}

const content = `// AUTO-GENERATED MAP FOR LOCAL ASSETS
export const IMAGES_MAP = ${generateMapString(imagesMap)};

export const AUDIOS_MAP = ${generateMapString(audiosMap)};

export const VIDEOS_MAP = ${generateMapString(videosMap)};

// Helper functions for easy access
export const getAsset = (type, key) => {
  switch (type) {
    case 'image': return IMAGES_MAP[key];
    case 'audio': return AUDIOS_MAP[key];
    case 'video': return VIDEOS_MAP[key];
    default: return null;
  }
};
`;

fs.writeFileSync(outputFilePath, content);
console.log(`Assets map generated at ${outputFilePath}`);

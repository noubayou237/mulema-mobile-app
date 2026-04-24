const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'frontend/assets');
const OUTPUT_FILE = path.join(__dirname, 'frontend/src/utils/AssetsMap.js');

function findFiles(dir, exts, isRecursive = true) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (isRecursive) {
        results = results.concat(findFiles(filePath, exts, isRecursive));
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      if (exts.includes(ext)) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const images = findFiles(ASSETS_DIR, ['.png', '.jpg', '.jpeg', '.webp', '.avif']);
const audios = findFiles(ASSETS_DIR, ['.mp3', '.wav', '.m4a']);

let output = `// AUTO-GENERATED MAP FOR LOCAL ASSETS
export const IMAGES_MAP = {
`;

images.forEach(img => {
  const relative = img.replace(__dirname + '/frontend/src/utils/', '../../').replace(__dirname + '/frontend/', '../../');
  const key = path.basename(img, path.extname(img)).toLowerCase().replace(/[^a-z0-9]/g, '_');
  output += `  "${key}": require("${relative}"),\n`;
});

output += `};\n\nexport const AUDIOS_MAP = {\n`;

audios.forEach(aud => {
  const relative = aud.replace(__dirname + '/frontend/src/utils/', '../../').replace(__dirname + '/frontend/', '../../');
  const key = path.basename(aud, path.extname(aud)).toLowerCase().replace(/[^a-z0-9]/g, '_');
  output += `  "${key}": require("${relative}"),\n`;
});

output += `};\n`;

fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
console.log("AssetsMap.js generated successfully with " + images.length + " images and " + audios.length + " audios.");

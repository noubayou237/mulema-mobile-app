const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, 'frontend/assets');
const FRONTEND_DIR = path.join(__dirname, 'frontend');

const IGNORE_DIRS = ['node_modules', '.expo', '.git'];

function toSnakeCase(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

const pathMapping = {};

function renameRecursive(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const oldPath = path.join(dir, item);
    const stats = fs.statSync(oldPath);
    
    // Normalize name
    const ext = path.extname(item);
    const base = path.basename(item, ext);
    const newName = toSnakeCase(base) + ext.toLowerCase();
    const newPath = path.join(dir, newName);
    
    if (oldPath !== newPath) {
      console.log(`Renaming: ${oldPath} -> ${newPath}`);
      // Handle naming collisions
      let finalPath = newPath;
      if (fs.existsSync(newPath) && oldPath.toLowerCase() !== newPath.toLowerCase()) {
         const timestamp = Date.now();
         finalPath = path.join(dir, toSnakeCase(base) + '_' + timestamp + ext.toLowerCase());
      }
      fs.renameSync(oldPath, finalPath);
      
      const relOld = path.relative(FRONTEND_DIR, oldPath);
      const relNew = path.relative(FRONTEND_DIR, finalPath);
      pathMapping[relOld] = relNew;
      
      // Update dir variable if renamed
      if (stats.isDirectory()) {
        renameRecursive(finalPath);
      }
    } else {
       if (stats.isDirectory()) {
        renameRecursive(oldPath);
      }
    }
  }
}

console.log("Normalizing assets...");
renameRecursive(ASSETS_DIR);

// Save mapping for reference
fs.writeFileSync('path_mapping.json', JSON.stringify(pathMapping, null, 2));

console.log("Updating references in codebase...");

function updateRefs(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
            if (!IGNORE_DIRS.includes(item)) {
                updateRefs(fullPath);
            }
        } else if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(path.extname(item))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // Sort keys by length descending to avoid partial matches
            const sortedOldPaths = Object.keys(pathMapping).sort((a, b) => b.length - a.length);
            
            for (const oldRel of sortedOldPaths) {
                const newRel = pathMapping[oldRel];
                // Match both relative and partial paths (e.g. assets/...)
                const escapedOld = oldRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escapedOld, 'g');
                if (content.includes(oldRel)) {
                    content = content.replace(regex, newRel);
                    modified = true;
                }
            }
            
            if (modified) {
                console.log(`Updated: ${fullPath}`);
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

updateRefs(FRONTEND_DIR);
console.log("Done!");

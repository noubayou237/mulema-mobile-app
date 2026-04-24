const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend/src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
    if (filePath.includes('logger.js')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    if (content.includes('console.error(') || content.includes('console.warn(') || content.includes('console.log(')) {
      content = content.replace(/console\.log/g, 'Logger.info');
      content = content.replace(/console\.error/g, 'Logger.error');
      content = content.replace(/console\.warn/g, 'Logger.warn');
      
      if (!content.includes('import Logger from ')) {
        const importLevel = filePath.split(srcDir)[1].split('/').length - 2;
        const prefix = importLevel === 0 ? './' : '../'.repeat(importLevel);
        content = `import Logger from "${prefix}utils/logger";\n` + content;
      }
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});

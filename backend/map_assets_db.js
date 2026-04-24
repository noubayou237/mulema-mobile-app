const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const ASSETS_DIR = path.join(__dirname, '../frontend/assets');

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

const images = findFiles(ASSETS_DIR, ['.png', '.jpg', '.jpeg', '.webp', '.avif']).map(img => path.basename(img, path.extname(img)).toLowerCase().replace(/[^a-z0-9]/g, '_'));
const audios = findFiles(ASSETS_DIR, ['.mp3', '.wav', '.m4a']).map(aud => path.basename(aud, path.extname(aud)).toLowerCase().replace(/[^a-z0-9]/g, '_'));

async function main() {
  const words = await prisma.mulemWord.findMany({ include: { theme: { include: { patrimonialLanguage: true } } } });
  
  for (const w of words) {
    const frPart = w.word_fr.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const localPart = w.word_local.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
    const langName = w.theme.patrimonialLanguage ? w.theme.patrimonialLanguage.name : "";
    const lang = langName ? langName.toLowerCase() : "";
    
    // Find matching audio
    let bestAudio = null;
    let matchScoreAudio = 0;
    for (const a of audios) {
      if (a.includes(frPart) || a.includes(localPart)) {
        if (a.includes(lang)) {
          bestAudio = a;
          break; // Perfect match
        } else if (!bestAudio) {
          bestAudio = a;
        }
      }
    }
    
    // Find matching image
    let bestImage = null;
    for (const i of images) {
      if (i.includes(frPart) || i.includes("avatar") && frPart.includes("famille") || i.includes("colla")) {
        // Just fuzzy heuristic
        if (i.includes(frPart) || frPart.includes(i) || i === frPart) {
            bestImage = i;
            break;
        }
      }
    }
    
    // Hardcoded fallbacks
    if (!bestImage) {
        if (w.word_fr.includes("eau")) bestImage = "ocean";
        if (w.word_fr.includes("feu")) bestImage = "leonardo_phoenix_10_a_vibrant_dynamic_image_of_fire_depicting_0"; // we saw fire
        if (w.word_fr.includes("anim")) bestImage = "camel";
        if (w.word_fr.includes("papa")) bestImage = "avatar_paul";
        if (w.word_fr.includes("mama")) bestImage = "avatar_sophie";
        if (w.word_fr.includes("pantalon")) bestImage = "ce_pentalon"; // it's in the list
    }
    
    let toUpdate = {};
    if (bestAudio) toUpdate.audio_url = bestAudio;
    if (bestImage) toUpdate.image_url = bestImage;
    
    if (Object.keys(toUpdate).length > 0) {
      await prisma.mulemWord.update({
        where: { id: w.id },
        data: toUpdate
      });
      console.log(`Updated word ${w.word_fr} -> Image: ${bestImage}, Audio: ${bestAudio}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

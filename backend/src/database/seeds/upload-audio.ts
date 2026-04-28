/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — Upload Audio vers Cloudflare R2                    ║
 * ║  📁 backend/src/database/seeds/upload-audio.ts               ║
 * ║  REMPLACE le fichier upload-audio.ts précédent               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 *  AVANT de lancer :
 *  1. Extraire les zips audio dans backend/assets/audio/
 *     backend/assets/audio/
 *       ├── jours/        ← contenu de "Les sept jour de la semaine.zip"
 *       ├── pronoms/      ← contenu de "Les pronoms personnel.zip"
 *       ├── verbe_etre/   ← contenu de "Le verbe etre.zip"
 *       ├── verbe_avoir/  ← contenu de "Le verbe avoir.zip"
 *       ├── chiffres/     ← contenu de "Les chiffres 1-9 en duala.zip"
 *       └── couleurs/     ← contenu de "Les couleur.zip"
 *
 *  2. Lancer :
 *     npx ts-node -r tsconfig-paths/register src/database/seeds/upload-audio.ts
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// ── Client R2 (compatible API S3) ────────────────────────────────────
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT, 
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET    = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;
const AUDIO_DIR  = path.join(__dirname, '../../../assets/audio');

const prisma = new PrismaClient();

// ── Mapping local → R2 ───────────────────────────────────────────────
// structure : { dossier_local: { theme_code, fichiers: { nom_local: nom_r2 } } }
const AUDIO_MAP: Record<string, {
  theme: string;
  files: Record<string, string>;
}> = {
  'jours': {
    theme: 'jours',
    files: {
      'Lundi.wav':    'Lundi.wav',
      'Mardi .wav':   'Mardi.wav',
      'Mercredi.wav': 'Mercredi.wav',
      'Jeudi.wav':    'Jeudi.wav',
      'Vendredi.wav': 'Vendredi.wav',
      'Samedi.wav':   'Samedi.wav',
      'Dimanche.wav': 'Dimanche.wav',
    },
  },
  'pronoms': {
    theme: 'pronoms',
    files: {
      'Moi.wav':  'Moi.wav',
      'Toi.wav':  'Toi.wav',
      'Lui.wav':  'Lui.wav',
      'Nous.wav': 'Nous.wav',
      'Vous.wav': 'Vous.wav',
      'Eux.wav':  'Eux.wav',
    },
  },
  'verbe_etre': {
    theme: 'verbe_etre',
    files: {
      'je suis.wav':        'je_suis.wav',
      'TU ES.wav':          'TU_ES.wav',
      'IL ELLE EST.wav':    'IL_ELLE_EST.wav',
      'NOUS SOMMES.wav':    'NOUS_SOMMES.wav',
      'VOUS ÊTES.wav':      'VOUS_ETES.wav',
      'ILS ELLES SONT.wav': 'ILS_ELLES_SONT.wav',
    },
  },
  'verbe_avoir': {
    theme: 'verbe_avoir',
    files: {
      "j'ai.wav":            'j_ai.wav',
      'tu as.wav':           'tu_as.wav',
      'il elle  on a.wav':   'il_elle_a.wav',
      'nous avons.wav':      'nous_avons.wav',
      'vous avez.wav':       'vous_avez.wav',
      'ils elles ont.wav':   'ils_elles_ont.wav',
    },
  },
  'chiffres': {
    theme: 'chiffres',
    files: {
      'zéro.wav':   'zero.wav',
      'un.wav':     'un.wav',
      'deux.wav':   'deux.wav',
      'trois.wav':  'trois.wav',
      'quatre.wav': 'quatre.wav',
      'cinq.wav':   'cinq.wav',
      'six.wav':    'six.wav',
      'sept.wav':   'sept.wav',
      'huit.wav':   'huit.wav',
      'neuf.wav':   'neuf.wav',
    },
  },
  'couleurs': {
    theme: 'couleurs',
    files: {
      'blanc.wav':  'blanc.wav',
      'bleu .wav':  'bleu.wav',
      'jaune.wav':  'jaune.wav',
      'noir.wav':   'noir.wav',
      'rouge .wav': 'rouge.wav',
      'vert.wav':   'vert.wav',
    },
  },
};

// ── Upload un fichier vers R2 ─────────────────────────────────────────
async function uploadToR2(localPath: string, r2Key: string): Promise<string> {
  // Vérifier si le fichier existe déjà sur R2 (évite les uploads doubles)
  try {
    await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: r2Key }));
    return `${PUBLIC_URL}/${r2Key}`;
  } catch {
    // n'existe pas encore → on upload
  }

  const body = fs.readFileSync(localPath);
  await r2.send(new PutObjectCommand({
    Bucket:       BUCKET,
    Key:          r2Key,
    Body:         body,
    ContentType:  'audio/wav',
  }));

  return `${PUBLIC_URL}/${r2Key}`;
}

// ── Met à jour audio_url dans la BDD après upload ────────────────────
async function updateWordAudioUrl(audioKey: string, audioUrl: string) {
  await prisma.mulemWord.updateMany({
    where: { audio_key: audioKey },
    data:  { audio_url: audioUrl },
  });
}

// ── Script principal ─────────────────────────────────────────────────
async function main() {
  console.log('🎵 Upload des fichiers audio vers Cloudflare R2...\n');
  console.log(`   Bucket   : ${BUCKET}`);
  console.log(`   Endpoint : ${process.env.R2_ENDPOINT}`);
  console.log(`   Public   : ${PUBLIC_URL}\n`);

  let totalUploaded = 0;
  let totalSkipped  = 0;
  let totalMissing  = 0;

  for (const [localFolder, config] of Object.entries(AUDIO_MAP)) {
    const folderPath = path.join(AUDIO_DIR, localFolder);

    if (!fs.existsSync(folderPath)) {
      console.warn(`    Dossier introuvable : ${folderPath}`);
      console.warn(`       → Crée le dossier et extrais le zip correspondant\n`);
      continue;
    }

    console.log(`  📁 ${localFolder}/`);

    for (const [localFile, r2File] of Object.entries(config.files)) {
      const localPath = path.join(folderPath, localFile);

      if (!fs.existsSync(localPath)) {
        console.warn(`      Fichier manquant : ${localFile}`);
        totalMissing++;
        continue;
      }

      const r2Key = `duala/audio/${config.theme}/${r2File}`;

      try {
        const url = await uploadToR2(localPath, r2Key);

        // Mettre à jour la BDD
        await updateWordAudioUrl(r2Key, url);

        const wasSkipped = url && !url.includes('uploaded');
        console.log(`    ✅ ${localFile.padEnd(28)} → ${r2Key}`);
        totalUploaded++;
      } catch (e: any) {
        console.error(`    ❌ Erreur ${localFile} : ${e.message}`);
      }
    }
    console.log('');
  }

  console.log('══════════════════════════════════════════════════');
  console.log(` Upload terminé !`);
  console.log(`   Uploadés  : ${totalUploaded}`);
  console.log(`   Manquants : ${totalMissing}`);
  console.log(`\n   Les audio_url sont mis à jour dans la BDD Neon.`);
  console.log('══════════════════════════════════════════════════');
}

main()
  .catch((e) => { console.error('❌ Erreur :', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
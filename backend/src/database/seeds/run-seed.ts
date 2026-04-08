/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  MULEMA — run-seed.ts                                         ║
 * ║  📁 backend/src/database/seeds/run-seed.ts                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
import { main as seedDuala } from './duala.seed';
import { main as seedGhomala } from './ghomala.seed';

async function runAll() {
  console.log('═══════════════════════════════════════════════');
  console.log('  MULEMA — Seeding toutes les langues');
  console.log('═══════════════════════════════════════════════\n');

  await seedDuala();
  console.log('\n───────────────────────────────────────────────\n');
  await seedGhomala();

  console.log('\n🚀 Tous les seeds terminés avec succès !');
}

runAll()
  .catch((e) => {
    console.error('\n❌ Erreur seed :', e.message);
    process.exit(1);
  });
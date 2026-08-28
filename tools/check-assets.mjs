/*
 * Vérifie que chaque sprite référencé par le jeu a bien une entrée dans
 * tools/assets.tsv.
 *
 * Deux passes complémentaires, parce qu'une seule ne suffit pas :
 *   1. les chemins littéraux écrits dans les sources (js, css, html) ;
 *   2. les chemins réellement produits par les modules de données, qui sont
 *      souvent construits à l'exécution ('assets/upgrades/' + nom + '.png').
 *      C'est cette seconde passe qui attrape les icônes d'améliorations.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

const manifest = new Map(
  readFileSync(join(root, 'tools/assets.tsv'), 'utf8')
    .split('\n').filter(l => l && !l.startsWith('#'))
    .map(l => { const [job, dest] = l.split('\t'); return [dest, job]; })
);

const referenced = new Map();   // chemin -> d'où il vient
const note = (path, source) => {
  if (!referenced.has(path)) referenced.set(path, source);
};

/* --- passe 1 : chemins littéraux dans les sources ---------------------- */
const scan = dir => {
  for (const e of readdirSync(join(root, dir), { withFileTypes: true })) {
    if (e.isDirectory()) { scan(join(dir, e.name)); continue; }
    if (!/\.(js|css|html)$/.test(e.name)) continue;
    if (join(dir, e.name).endsWith('js/assets.js')) continue;   // fichier généré
    const txt = readFileSync(join(root, dir, e.name), 'utf8');
    for (const m of txt.matchAll(/assets\/[A-Za-z0-9_\-/]+\.png/g)) note(m[0], join(dir, e.name));
  }
};
for (const d of ['js', 'css', '.']) { try { scan(d); } catch { /* dossier absent */ } }

/* --- passe 2 : chemins calculés par les modules de données ------------- */
globalThis.window = globalThis;
for (const m of ['util', 'data-generators', 'data-rares', 'data-features',
                 'data-upgrades', 'data-challenges', 'data-relics']) {
  require(join(root, 'js', `${m}.js`));
}
const collect = (list, label) => (list || []).forEach(x => { if (x.icon) note(x.icon, label); });
collect(globalThis.GENERATORS, 'data-generators');
collect(globalThis.RARES, 'data-rares');
collect(globalThis.FEATURES, 'data-features');
collect(globalThis.UPGRADES, 'data-upgrades');
collect(globalThis.RELICS, 'data-relics');

/* --- rapport ----------------------------------------------------------- */
const missing = [...referenced.keys()].filter(p => !manifest.has(p)).sort();
const unused = [...manifest.keys()].filter(p => !referenced.has(p)).sort();

console.log(`référencés: ${referenced.size} | manifeste: ${manifest.size}`);
if (missing.length) {
  console.log(`SANS SPRITE (${missing.length}) :`);
  missing.forEach(m => console.log(`  ${m}   ← ${referenced.get(m)}`));
} else {
  console.log('sans sprite : aucun');
}
if (unused.length) {
  console.log(`entrées inutilisées (${unused.length}) :`);
  unused.forEach(u => console.log(`  ${u}`));
}
process.exit(missing.length ? 1 : 0);

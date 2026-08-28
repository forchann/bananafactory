/* Génère js/assets.js à partir de tools/assets.tsv (source de vérité). */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rows = readFileSync(join(root, 'tools/assets.tsv'), 'utf8')
  .split('\n').filter(l => l && !l.startsWith('#'))
  .map(l => l.split('\t'))
  .sort((a, b) => a[1].localeCompare(b[1]));

const entries = rows.map(([job, dest]) => `    '${dest}': '${job}'`).join(',\n');

writeFileSync(join(root, 'js/assets.js'), `/* Banana Factory - résolution des sprites
 *
 * Fichier généré par tools/gen-assets-js.mjs — ne pas éditer à la main.
 *
 * Les sprites sont générés avec PixelLab. Deux situations :
 *   - les PNG sont présents dans assets/ (voir tools/download-assets.sh) : on les
 *     utilise directement, le jeu fonctionne hors-ligne dès le premier lancement ;
 *   - ils sont absents : on les charge depuis PixelLab, puis on les met en cache
 *     dans IndexedDB pour que les lancements suivants n'aient plus besoin du réseau.
 * Si les deux échouent, l'interface bascule sur un repli graphique.
 */
(function (global) {
  'use strict';

  var BASE = 'https://api.pixellab.ai/mcp/images/';
  var DB_NAME = 'bananafactory-assets';
  var STORE = 'sprites';
  var PROBE = 'assets/misc/banana_hero.png';

  /* chemin logique -> identifiant du job PixelLab */
  var JOBS = {
${entries}
  };

  var mode = 'local';   // 'local' tant qu'on n'a pas prouvé le contraire
  var cache = {};       // chemin -> URL d'objet issue d'IndexedDB
  var db = null;

  function remoteUrl(path) {
    var job = JOBS[path];
    return job ? BASE + job + '/download' : path;
  }

  /* URL à utiliser maintenant pour ce sprite */
  function resolve(path) {
    if (cache[path]) return cache[path];
    return mode === 'local' ? path : remoteUrl(path);
  }

  /* ------------------------------------------------------------ IndexedDB */

  function openDb(cb) {
    if (!global.indexedDB) { cb(null); return; }
    var req, settled = false;
    function done(v) { if (!settled) { settled = true; cb(v); } }
    try { req = global.indexedDB.open(DB_NAME, 1); } catch (e) { done(null); return; }
    req.onupgradeneeded = function () {
      var d = req.result;
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
    };
    req.onsuccess = function () { done(req.result); };
    req.onerror = function () { done(null); };
    /* Une suppression de base en attente laisse l'ouverture bloquée sans jamais
       déclencher d'événement : on n'attend pas indéfiniment. */
    req.onblocked = function () { done(null); };
    setTimeout(function () { done(null); }, 2500);
  }

  function readAll(cb) {
    if (!db) { cb(0); return; }
    var tx, store, req;
    try {
      tx = db.transaction(STORE, 'readonly');
      store = tx.objectStore(STORE);
      req = store.openCursor();
    } catch (e) { cb(0); return; }
    var n = 0, settled = false;
    function done() { if (!settled) { settled = true; cb(n); } }
    req.onsuccess = function () {
      var cur = req.result;
      if (!cur) { done(); return; }
      if (cur.value instanceof Blob) {
        try { cache[cur.key] = URL.createObjectURL(cur.value); n++; } catch (e) { /* ignoré */ }
      }
      cur.continue();
    };
    req.onerror = function () { done(); };
    setTimeout(done, 2500);
  }

  function put(path, blob) {
    if (!db) return;
    try {
      db.transaction(STORE, 'readwrite').objectStore(STORE).put(blob, path);
    } catch (e) { /* quota atteint ou base fermée : sans conséquence */ }
  }

  /* ------------------------------------------------- détection du mode */

  function probe(cb) {
    var img = new Image();
    var done = false;
    function finish(m) {
      if (done) return;
      done = true;
      mode = m;
      cb(m);
    }
    img.onload = function () { finish('local'); };
    img.onerror = function () { finish('remote'); };
    setTimeout(function () { finish('remote'); }, 4000);
    img.src = PROBE + '?probe=' + Date.now();
  }

  /* Récupère en tâche de fond tout ce qui n'est pas encore en cache. */
  function prefetch(onProgress) {
    if (mode !== 'remote' || !db || !global.fetch) return;
    var paths = Object.keys(JOBS).filter(function (p) { return !cache[p]; });
    var i = 0, active = 0, done = 0, total = paths.length;
    if (!total) return;

    function next() {
      while (active < 5 && i < paths.length) {
        (function (path) {
          active++;
          i++;
          global.fetch(remoteUrl(path), { mode: 'cors', cache: 'force-cache' })
            .then(function (r) { return r.ok ? r.blob() : null; })
            .then(function (blob) {
              if (blob && blob.size > 0) {
                put(path, blob);
                try { cache[path] = URL.createObjectURL(blob); } catch (e) { /* ignoré */ }
              }
            })
            .catch(function () { /* hors-ligne ou CORS : on garde l'URL distante */ })
            .then(function () {
              active--;
              done++;
              if (onProgress) onProgress(done, total);
              next();
            });
        })(paths[i]);
      }
    }
    next();
  }

  /* Prépare le cache puis rend la main. Le jeu démarre quoi qu'il arrive :
     un IndexedDB indisponible ou bloqué ne doit jamais empêcher le lancement. */
  function init(cb) {
    var settled = false;
    function finish(info) {
      if (settled) return;
      settled = true;
      cb(info);
    }
    setTimeout(function () { finish({ mode: mode, cached: 0, timedOut: true }); }, 7000);

    openDb(function (d) {
      db = d;
      readAll(function (cached) {
        if (cached >= Object.keys(JOBS).length) {
          /* tout est déjà en cache : inutile de sonder le disque */
          mode = 'remote';
          finish({ mode: mode, cached: cached });
          return;
        }
        probe(function (m) { finish({ mode: m, cached: cached }); });
      });
    });
  }

  global.ASSETS = {
    init: init,
    prefetch: prefetch,
    resolve: resolve,
    remoteUrl: remoteUrl,
    jobs: JOBS,
    get mode() { return mode; },
    get cachedCount() { return Object.keys(cache).length; },
    get total() { return Object.keys(JOBS).length; }
  };
})(window);
`, 'utf8');

console.log(`js/assets.js généré — ${rows.length} sprites`);

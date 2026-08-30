/* Banana Factory - moteur de jeu : état, économie, sauvegarde */
(function (global) {
  'use strict';

  var SAVE_KEY = 'bananafactory.save';
  var SAVE_VERSION = 3;
  var TICK_MS = 50;

  /* ====================================================== ÉTAT INITIAL === */

  function freshState() {
    var s = {
      version: SAVE_VERSION,
      bananas: 0,
      totalBananas: 0,      // gagnées durant la partie en cours (base du prestige)
      allTime: 0,           // gagnées depuis toujours
      tokens: 0,
      seeds: 0,
      totalSeeds: 0,
      prestigeCount: 0,
      gens: {},
      upgrades: {},
      features: {},
      rares: {},            // id -> nombre d'exemplaires
      challenges: {},       // id -> true si récompense encaissée
      relics: {},           // id -> niveau
      smoothies: {},        // type -> stock
      boosts: [],           // { type, mult, until, name }
      combo: 0,
      comboUntil: 0,
      lastRareAt: 0,
      nextGoldenAt: 0,
      market: { price: 1, phase: Math.random() * 6.28, offerAt: 0, offer: null },
      contract: null,          // commande en cours
      contractStreak: 0,       // commandes honorées d'affilée
      contractNextAt: 0,
      settings: { autobuy: false, sfx: true, volume: 0.45, reduceFx: false, bulk: 1 },

      /* --- extensions « Grand Patch » --- */
      skins: { owned: { classique: true }, active: 'classique' },
      pets: {
        owned: [],          // { uid, id, born }
        nextUid: 1,
        team: [],           // uid des animaux actifs
        nest: null,         // fusion en cours { a, b, result, until }
        eggs: 0,
        discovered: {},     // id d'espèce -> true (album de la Nurserie)
        /* Automatisation : la Nurserie peut tourner sans intervention. */
        auto: { eggs: false, hatch: false, breed: false, collect: false, team: false }
      },

      stats: {
        clicks: 0, crits: 0, maxCombo: 0, goldenClicked: 0,
        miniPlayed: 0, miniByGame: {}, best: {},
        raresTotal: 0, upgradesBought: 0, gensBought: 0,
        contractsDone: 0, contractsFailed: 0, bestStreak: 0,
        playTime: 0, startedAt: Date.now(), handClicked: 0,
        casinoPlays: 0, casinoWins: 0, casinoBest: 0,
        racesPlayed: 0, racesWon: 0,
        petsHatched: 0, petsBred: 0
      },
      lastTick: Date.now(),
      lastSave: Date.now()
    };
    global.GENERATORS.forEach(function (g) { s.gens[g.id] = 0; });
    return s;
  }

  var S = freshState();

  /* Valeurs dérivées, recalculées à chaque tick */
  var D = {
    bps: 0, perClick: 0, clickBase: 0, clickFromBps: 0,
    globalMult: 1, clickMult: 1, prestigeMult: 1,
    critChance: 0.05, critMult: 12,
    luckMult: 1, tokenMult: 1, miniMult: 1, boostMult: 1,
    goldenMult: 1, offlineMult: 1, seedMult: 1,
    comboMult: 1, raresFound: 0, genBps: {},
    seedPower: 0, casinoLuck: 0
  };

  /* ======================================================= ÉVÉNEMENTS === */

  var listeners = {};
  function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); }
  function emit(evt, data) {
    var l = listeners[evt];
    if (!l) return;
    for (var i = 0; i < l.length; i++) l[i](data);
  }

  /* ========================================================== BONUS ===== */

  /* Somme des bonus (%) apportés par les bananes rares possédées */
  function rareBonus(type) {
    var total = 0;
    for (var id in S.rares) {
      if (!S.rares[id]) continue;
      var r = global.RARE_BY_ID[id];
      if (!r) continue;
      for (var i = 0; i < r.effects.length; i++) {
        if (r.effects[i].type === type) total += r.effects[i].value;
      }
    }
    return total;
  }

  /* Bonus (%) apporté par les reliques pour un effet donné */
  function relicBonus(effect) {
    var total = 0;
    for (var id in S.relics) {
      var lvl = S.relics[id] || 0;
      if (!lvl) continue;
      var rel = global.RELIC_BY_ID[id];
      if (rel && rel.effect === effect) total += lvl * rel.per;
    }
    return total;
  }

  function boostMultFor(type) {
    var m = 1, now = Date.now();
    for (var i = 0; i < S.boosts.length; i++) {
      if (S.boosts[i].type === type && S.boosts[i].until > now) m *= S.boosts[i].mult;
    }
    return m;
  }

  function countRares() {
    var n = 0;
    for (var id in S.rares) if (S.rares[id] > 0) n++;
    return n;
  }

  function upgradeValue(type, target) {
    var m = 1;
    for (var i = 0; i < global.UPGRADES.length; i++) {
      var u = global.UPGRADES[i];
      if (!S.upgrades[u.id] || u.type !== type) continue;
      if (target && u.target !== target) continue;
      m *= u.value;
    }
    return m;
  }

  function upgradeSum(type) {
    var v = 0;
    for (var i = 0; i < global.UPGRADES.length; i++) {
      var u = global.UPGRADES[i];
      if (S.upgrades[u.id] && u.type === type) v += u.value;
    }
    return v;
  }

  /* Bonus (%) venus des systèmes annexes : animaux de compagnie, etc. */
  function extraBonus(type) {
    var t = 0;
    if (global.PETS && global.PETS.bonus) t += global.PETS.bonus(type);
    return t;
  }

  /* ================================================ GRAINES D'OR ======== */

  /*
   * Rendements décroissants par tranches.
   *
   * Auparavant chaque graine donnait +2 % sans limite : passé quelques
   * milliers de graines la production explosait et le reste du jeu n'avait
   * plus d'intérêt. Les graines gardent tout leur poids au début (+2 % pièce
   * sur les 25 premières) puis pèsent de moins en moins, ce qui étale la
   * progression sur toute la partie au lieu de la faire basculer d'un coup.
   */
  var SEED_BANDS = [
    { upTo: 25, per: 0.0200 },
    { upTo: 100, per: 0.0120 },
    { upTo: 300, per: 0.0070 },
    { upTo: 1000, per: 0.0035 },
    { upTo: Infinity, per: 0.0015 }
  ];

  function seedPower(seeds) {
    var total = 0, done = 0;
    for (var i = 0; i < SEED_BANDS.length && done < seeds; i++) {
      var band = SEED_BANDS[i];
      var take = Math.min(seeds, band.upTo) - done;
      if (take > 0) { total += take * band.per; done += take; }
    }
    return total;
  }

  /* Ce que rapporterait la prochaine graine — sert à l'affichage. */
  function seedMarginal(seeds) { return seedPower(seeds + 1) - seedPower(seeds); }

  function recompute() {
    var now = Date.now();
    D.raresFound = countRares();

    /* Combo : +2% par palier, plafonné à ×5 */
    if (S.features.combo && S.comboUntil > now) {
      D.comboMult = 1 + Math.min(S.combo, 200) * 0.02;
    } else {
      D.comboMult = 1;
      if (S.comboUntil <= now) S.combo = 0;
    }

    D.seedPower = seedPower(S.seeds);
    D.prestigeMult = 1 + D.seedPower;

    /* Synergie collection : +x% de production par rare possédée */
    var synPerRare = upgradeSum('raresyn');

    D.globalMult =
      upgradeValue('global') *
      (1 + rareBonus('prod') / 100) *
      (1 + relicBonus('prod') / 100) *
      (1 + extraBonus('prod') / 100) *
      (1 + (synPerRare * D.raresFound) / 100) *
      D.prestigeMult *
      boostMultFor('prod');

    D.clickMult =
      upgradeValue('click') *
      (1 + rareBonus('click') / 100) *
      (1 + relicBonus('click') / 100) *
      (1 + extraBonus('click') / 100) *
      D.prestigeMult *
      boostMultFor('click') *
      D.comboMult;

    D.luckMult = (1 + (upgradeSum('luck') + rareBonus('luck') + relicBonus('luck') + extraBonus('luck')) / 100) * boostMultFor('luck');
    D.tokenMult = (1 + (upgradeSum('token') + rareBonus('token') + relicBonus('token') + extraBonus('token')) / 100) * boostMultFor('token');
    D.miniMult = (1 + (upgradeSum('mini') + rareBonus('mini') + relicBonus('mini') + extraBonus('mini')) / 100) * boostMultFor('mini');
    D.boostMult = 1 + (rareBonus('boost') + relicBonus('boost') + extraBonus('boost')) / 100;
    D.goldenMult = 1 + (upgradeSum('golden') + rareBonus('golden') + relicBonus('golden') + extraBonus('golden')) / 100;
    D.offlineMult = 1 + (upgradeSum('offline') + rareBonus('offline') + relicBonus('offline') + extraBonus('offline')) / 100;
    D.seedMult = 1 + (rareBonus('seed') + relicBonus('seed') + extraBonus('seed')) / 100;
    D.critChance = Math.min(0.75, 0.05 + (rareBonus('crit') + relicBonus('crit') + extraBonus('crit')) / 100);
    /* Chance au casino : réduit (un peu) l'avantage de la maison, jamais plus. */
    D.casinoLuck = (upgradeSum('casino') + rareBonus('casino') +
                    relicBonus('casino') + extraBonus('casino')) / 100;

    /* Production par seconde */
    var raw = 0;
    for (var i = 0; i < global.GENERATORS.length; i++) {
      var g = global.GENERATORS[i];
      var n = S.gens[g.id] || 0;
      var p = n * g.rate * global.genTierMultiplier(n) * upgradeValue('gen', g.id);
      D.genBps[g.id] = p * D.globalMult;
      raw += p;
    }
    D.bps = raw * D.globalMult;

    /* Puissance de clic */
    D.clickBase = 1 * D.clickMult * D.globalMult;
    D.clickFromBps = D.bps * upgradeSum('clickbps');
    D.perClick = D.clickBase + D.clickFromBps;
  }

  /* ========================================================= REVENUS ==== */

  function earn(amount, source) {
    if (!(amount > 0)) return 0;
    S.bananas += amount;
    S.totalBananas += amount;
    S.allTime += amount;
    if (source !== 'offline') emit('earn', { amount: amount, source: source });
    return amount;
  }

  function spend(amount) {
    if (S.bananas < amount) return false;
    S.bananas -= amount;
    return true;
  }

  /*
   * Gains qui ne comptent PAS dans le total de la partie.
   *
   * Les mises du casino sont retirées par spend(), qui ne touche pas à
   * totalBananas : si les gains passaient par earn(), miser en boucle ferait
   * grimper le total — et donc les Graines d'Or — sans rien produire.
   */
  function payout(amount) {
    if (!(amount > 0)) return 0;
    S.bananas += amount;
    S.allTime += amount;
    emit('earn', { amount: amount, source: 'casino' });
    return amount;
  }

  function addTokens(n, silent) {
    n = Math.max(0, Math.floor(n));
    if (!n) return 0;
    S.tokens += n;
    if (!silent) emit('tokens', n);
    return n;
  }

  /* =========================================================== CLIC ===== */

  function clickBanana(manual) {
    recompute();
    var now = Date.now();

    if (S.features.combo) {
      if (S.comboUntil > now) S.combo++; else S.combo = 1;
      S.comboUntil = now + 2000;
      if (S.combo > S.stats.maxCombo) S.stats.maxCombo = S.combo;
      recompute();
    }

    var gain = D.perClick;
    var crit = false;
    if (S.features.crit && Math.random() < D.critChance) {
      crit = true;
      gain *= D.critMult;
      S.stats.crits++;
    }

    S.stats.clicks++;
    if (manual) S.stats.handClicked++;
    earn(gain, 'click');

    var rare = maybeRare('click');
    emit('click', { gain: gain, crit: crit, combo: S.combo, rare: rare });
    return { gain: gain, crit: crit, rare: rare };
  }

  /* ==================================================== BANANES RARES === */

  var RARE_COOLDOWN = 18000;   // 18 s minimum entre deux trouvailles

  function drawableRares(minRarity) {
    var order = global.RARITY_ORDER;
    var minIdx = minRarity ? order.indexOf(minRarity) : 0;
    var pool = [];
    for (var i = 0; i < global.RARES.length; i++) {
      var r = global.RARES[i];
      if (r.source !== 'drop' && r.source !== 'mini' && r.source !== 'marche') continue;
      if (order.indexOf(r.rarity) < minIdx) continue;
      pool.push({ rare: r, weight: global.RARITY[r.rarity].weight * (S.rares[r.id] ? 0.35 : 1) });
    }
    return pool;
  }

  /* Tirage d'une rare, éventuellement contraint à une rareté minimale */
  function drawRare(minRarity) {
    var pool = drawableRares(minRarity);
    if (!pool.length) return null;
    var choice = global.U.weightedPick(pool);
    return choice ? choice.rare : null;
  }

  function grantRare(id, source) {
    var r = global.RARE_BY_ID[id];
    if (!r) return null;
    var isNew = !S.rares[id];
    S.rares[id] = (S.rares[id] || 0) + 1;
    S.stats.raresTotal++;
    S.lastRareAt = Date.now();
    var tokens = 0;
    if (!isNew) {
      /* Doublon : converti en jetons */
      tokens = addTokens(global.RARITY[r.rarity].tokens * D.tokenMult, true);
    }
    recompute();
    emit('rare', { rare: r, isNew: isNew, tokens: tokens, source: source || 'drop' });
    return { rare: r, isNew: isNew, tokens: tokens };
  }

  /* Tente une trouvaille aléatoire. `kind` = click | tick */
  function maybeRare(kind) {
    if (!S.features.rares) return null;
    var now = Date.now();
    if (now - S.lastRareAt < RARE_COOLDOWN) return null;
    var base = kind === 'click' ? 0.0035 : 0.0015;
    if (Math.random() >= base * D.luckMult) return null;
    var r = drawRare(null);
    return r ? grantRare(r.id, kind) : null;
  }

  /* Chambre de mutation : force une trouvaille contre des jetons */
  var MUTATIONS = [
    { id: 'mut1', cost: 30, min: null, label: 'Mutation aléatoire' },
    { id: 'mut2', cost: 110, min: 'rare', label: 'Rare ou mieux garanti' },
    { id: 'mut3', cost: 350, min: 'epique', label: 'Épique ou mieux garanti' },
    { id: 'mut4', cost: 1100, min: 'legendaire', label: 'Légendaire ou mieux garanti' },
    { id: 'mut5', cost: 4200, min: 'mythique', label: 'Mythique ou mieux garanti' },
    { id: 'mut6', cost: 16000, min: 'cosmique', label: 'Cosmique garantie' }
  ];

  function mutate(id) {
    if (!S.features.mutation) return null;
    var m = null;
    for (var i = 0; i < MUTATIONS.length; i++) if (MUTATIONS[i].id === id) m = MUTATIONS[i];
    if (!m || S.tokens < m.cost) return null;
    S.tokens -= m.cost;
    var r = drawRare(m.min);
    if (!r) { S.tokens += m.cost; return null; }
    return grantRare(r.id, 'mutation');
  }

  /* ========================================================= ACHATS ===== */

  function genCost(g, count) {
    return global.U.bulkCost(g.cost, g.growth, S.gens[g.id] || 0, count || 1);
  }

  function genMaxBuy(g) {
    return global.U.maxAffordable(g.cost, g.growth, S.gens[g.id] || 0, S.bananas);
  }

  function buyGen(id, amount) {
    var g = global.GEN_BY_ID[id];
    if (!g) return 0;
    var n = amount === 'max' ? genMaxBuy(g) : (amount || 1);
    if (n <= 0) return 0;
    var cost = genCost(g, n);
    if (!spend(cost)) return 0;
    S.gens[id] = (S.gens[id] || 0) + n;
    S.stats.gensBought += n;
    recompute();
    emit('buy', { kind: 'gen', id: id, count: n, cost: cost });
    return n;
  }

  function upgradeVisible(u) {
    if (S.upgrades[u.id]) return false;
    if (u.cat === 'producteur' && !S.gens[u.gen]) return false;
    try { return u.req ? u.req(snapshot()) : true; } catch (e) { return false; }
  }

  function buyUpgrade(id) {
    var u = global.UPGRADE_BY_ID[id];
    if (!u || S.upgrades[id]) return false;
    if (!spend(u.cost)) return false;
    S.upgrades[id] = true;
    S.stats.upgradesBought++;
    recompute();
    emit('buy', { kind: 'upgrade', id: id, cost: u.cost });
    return true;
  }

  function featureVisible(f) {
    if (S.features[f.id]) return false;
    try { return f.req ? f.req(snapshot()) : true; } catch (e) { return false; }
  }

  function buyFeature(id) {
    var f = global.FEATURE_BY_ID[id];
    if (!f || S.features[id]) return false;
    if (f.costSeeds && S.seeds < f.costSeeds) return false;
    if (f.cost && S.bananas < f.cost) return false;
    if (f.cost) S.bananas -= f.cost;
    if (f.costSeeds) S.seeds -= f.costSeeds;
    S.features[id] = true;
    if (id === 'golden') S.nextGoldenAt = Date.now() + 20000;
    recompute();
    emit('feature', f);
    return true;
  }

  function relicCost(id) {
    var rel = global.RELIC_BY_ID[id];
    return rel ? rel.cost(S.relics[id] || 0) : Infinity;
  }

  function buyRelic(id) {
    var rel = global.RELIC_BY_ID[id];
    if (!rel) return false;
    var lvl = S.relics[id] || 0;
    if (lvl >= rel.max) return false;
    var cost = rel.cost(lvl);
    if (S.seeds < cost) return false;
    S.seeds -= cost;
    S.relics[id] = lvl + 1;
    recompute();
    emit('buy', { kind: 'relic', id: id, cost: cost });
    return true;
  }

  function relicLevels() {
    var n = 0;
    for (var id in S.relics) n += S.relics[id] || 0;
    return n;
  }

  /* ======================================================= SMOOTHIES ==== */

  var SMOOTHIES = [
    { id: 'prod', name: 'Smoothie Énergisant', type: 'prod', mult: 7, secs: 60,
      icon: 'assets/upgrades/mixeur.png', desc: "Production globale ×7", ratio: 380 },
    { id: 'click', name: 'Smoothie Explosif', type: 'click', mult: 15, secs: 40,
      icon: 'assets/upgrades/mixeur.png', desc: "Puissance de clic ×15", ratio: 300 },
    { id: 'token', name: 'Smoothie Doré', type: 'token', mult: 2, secs: 120,
      icon: 'assets/upgrades/mixeur.png', desc: "Jetons gagnés ×2", ratio: 600 },
    { id: 'luck', name: 'Smoothie Chanceux', type: 'luck', mult: 4, secs: 90,
      icon: 'assets/upgrades/mixeur.png', desc: "Chance de trouver une rare ×4", ratio: 900 },

    /* --- recettes débloquées par la Cave à Smoothies (Grand Patch) --- */
    { id: 'mega', name: 'Smoothie Titanesque', type: 'prod', mult: 25, secs: 45,
      icon: 'assets/upgrades/mixeur.png', desc: "Production globale ×25", ratio: 2600, deluxe: true },
    { id: 'fureur', name: 'Smoothie Fureur', type: 'click', mult: 45, secs: 25,
      icon: 'assets/upgrades/mixeur.png', desc: "Puissance de clic ×45", ratio: 2000, deluxe: true },
    { id: 'arcade', name: 'Smoothie Arcade', type: 'mini', mult: 3, secs: 150,
      icon: 'assets/upgrades/mixeur.png', desc: "Récompenses de minijeu ×3", ratio: 1500, deluxe: true },
    { id: 'fortune', name: 'Smoothie Fortune', type: 'luck', mult: 9, secs: 70,
      icon: 'assets/upgrades/mixeur.png', desc: "Chance de trouver une rare ×9", ratio: 3400, deluxe: true }
  ];

  /* Les recettes « deluxe » demandent la découverte Cave à Smoothies. */
  function smoothieAvailable(sm) { return !sm.deluxe || !!S.features.smoothies2; }

  function smoothieCost(sm) {
    return Math.max(25000, D.bps * sm.ratio);
  }

  function craftSmoothie(id) {
    var sm = null;
    for (var i = 0; i < SMOOTHIES.length; i++) if (SMOOTHIES[i].id === id) sm = SMOOTHIES[i];
    if (!sm || !S.features.boosts || !smoothieAvailable(sm)) return false;
    if ((S.smoothies[id] || 0) >= 9) return false;
    if (!spend(smoothieCost(sm))) return false;
    S.smoothies[id] = (S.smoothies[id] || 0) + 1;
    emit('smoothie', { id: id, stock: S.smoothies[id] });
    return true;
  }

  function drinkSmoothie(id) {
    var sm = null;
    for (var i = 0; i < SMOOTHIES.length; i++) if (SMOOTHIES[i].id === id) sm = SMOOTHIES[i];
    if (!sm || !(S.smoothies[id] > 0)) return false;
    S.smoothies[id]--;
    addBoost(sm.type, sm.mult, sm.secs, sm.name);
    return true;
  }

  function addBoost(type, mult, secs, name) {
    recompute();
    var dur = secs * 1000 * D.boostMult;
    S.boosts.push({ type: type, mult: mult, until: Date.now() + dur, name: name, total: dur });
    recompute();
    emit('boost', { type: type, mult: mult, name: name, secs: dur / 1000 });
  }

  /* ==================================================== BANANE DORÉE ==== */

  var GOLDEN_KINDS = [
    { id: 'frenzy', name: 'Frénésie', weight: 30, text: "Production ×7 pendant 77 s" },
    { id: 'fingers', name: "Doigts d'Or", weight: 22, text: "Puissance de clic ×15 pendant 30 s" },
    { id: 'rain', name: "Pluie d'Or", weight: 22, text: "Un gros paquet de bananes, tout de suite" },
    { id: 'jackpot', name: 'Jackpot', weight: 14, text: "Une poignée de jetons" },
    { id: 'clover', name: 'Trèfle Doré', weight: 9, text: "Chance ×3 pendant 60 s" },
    { id: 'treasure', name: 'Trésor Doré', weight: 3, text: "Une banane rare, offerte" },
    { id: 'storm', name: 'Tempête Dorée', weight: 8, text: "Production ×20 pendant 40 s" },
    { id: 'egg', name: 'Œuf Doré', weight: 6, text: "Un œuf pour la Nurserie" },
    { id: 'muse', name: 'Muse Dorée', weight: 5, text: "Récompenses de minijeu ×4 pendant 2 min" }
  ];

  function goldenDelay() {
    var base = global.U.randRange(95000, 260000);
    return base / D.goldenMult;
  }

  function collectGolden() {
    recompute();
    S.stats.goldenClicked++;
    var kind = global.U.weightedPick(GOLDEN_KINDS);
    var result = { kind: kind, amount: 0, rare: null };
    switch (kind.id) {
      case 'frenzy': addBoost('prod', 7, 77, 'Frénésie'); break;
      case 'fingers': addBoost('click', 15, 30, "Doigts d'Or"); break;
      case 'clover': addBoost('luck', 3, 60, 'Trèfle Doré'); break;
      case 'rain':
        result.amount = Math.max(D.bps * 900, S.bananas * 0.15, D.perClick * 100);
        earn(result.amount, 'golden');
        break;
      case 'jackpot':
        result.amount = addTokens(global.U.randInt(6, 30) * D.tokenMult);
        break;
      case 'treasure':
        var r = drawRare('rare');
        if (r) result.rare = grantRare(r.id, 'golden');
        break;
      case 'storm': addBoost('prod', 20, 40, 'Tempête Dorée'); break;
      case 'muse': addBoost('mini', 4, 120, 'Muse Dorée'); break;
      case 'egg':
        S.pets.eggs = (S.pets.eggs || 0) + 1;
        result.amount = 1;
        break;
    }
    S.nextGoldenAt = Date.now() + goldenDelay();
    emit('golden', result);
    return result;
  }

  /* ========================================================= MARCHÉ ===== */

  function marketTokenRate() { return Math.max(120000, D.bps * 45); }

  function marketSell(fraction) {
    if (!S.features.market) return 0;
    var amount = S.bananas * fraction;
    if (amount <= 0) return 0;
    var tokens = Math.floor((amount / marketTokenRate()) * S.market.price * D.tokenMult);
    if (tokens <= 0) return 0;
    S.bananas -= amount;
    addTokens(tokens, true);
    emit('market', { sold: amount, tokens: tokens });
    return tokens;
  }

  function marketBuyOffer() {
    var o = S.market.offer;
    if (!o || S.tokens < o.price) return null;
    S.tokens -= o.price;
    S.market.offer = null;
    S.market.offerAt = Date.now() + global.U.randRange(150000, 260000);
    return grantRare(o.rareId, 'marche');
  }

  function updateMarket(dt) {
    var m = S.market;
    m.phase += dt * 0.16;
    var wave = Math.sin(m.phase) * 0.42 + Math.sin(m.phase * 2.37 + 1.1) * 0.22 + Math.sin(m.phase * 0.53) * 0.18;
    m.price = global.U.clamp(1 + wave + (Math.random() - 0.5) * 0.02, 0.35, 2.4);

    var now = Date.now();
    if (!m.offerAt) m.offerAt = now + 60000;
    if (!m.offer && now >= m.offerAt) {
      var pool = [];
      for (var i = 0; i < global.RARES.length; i++) {
        var r = global.RARES[i];
        if (r.source === 'defi' || r.source === 'prestige' ||
            r.source === 'pet' || r.source === 'casino') continue;
        pool.push({ rare: r, weight: global.RARITY[r.rarity].weight * (S.rares[r.id] ? 0.3 : 1.4) });
      }
      var pick = global.U.weightedPick(pool);
      if (pick) {
        var price = Math.ceil(global.RARITY[pick.rare.rarity].tokens * global.U.randRange(5, 9));
        m.offer = { rareId: pick.rare.id, price: price, until: now + 180000 };
      }
    }
    if (m.offer && now > m.offer.until) {
      m.offer = null;
      m.offerAt = now + global.U.randRange(90000, 200000);
    }
  }

  /* ======================================================== PRESTIGE ==== */

  /*
   * Le seuil et l'exposant ont été relevés en même temps que les rendements
   * décroissants de seedPower() : une Grande Récolte reste gratifiante, mais
   * elle ne double plus la partie à elle seule.
   */
  var SEED_THRESHOLD = 1e11;

  function seedsOnPrestige() {
    if (S.totalBananas < SEED_THRESHOLD) return 0;
    return Math.floor(Math.pow(S.totalBananas / SEED_THRESHOLD, 0.42) * D.seedMult);
  }

  /* Total de bananes nécessaire pour obtenir `n` graines d'un coup. */
  function bananasForSeeds(n) {
    if (n <= 0) return SEED_THRESHOLD;
    return Math.pow(n / Math.max(0.0001, D.seedMult), 1 / 0.42) * SEED_THRESHOLD;
  }

  function canPrestige() { return S.features.prestige && seedsOnPrestige() >= 1; }

  function doPrestige() {
    if (!canPrestige()) return 0;
    var gain = seedsOnPrestige();
    var keep = {
      allTime: S.allTime, tokens: S.tokens,
      seeds: S.seeds + gain, totalSeeds: S.totalSeeds + gain,
      prestigeCount: S.prestigeCount + 1,
      rares: S.rares, challenges: S.challenges, relics: S.relics,
      settings: S.settings, stats: S.stats, contractStreak: S.contractStreak,
      /* La ménagerie et la garde-robe traversent les Grandes Récoltes. */
      pets: S.pets, skins: S.skins,
      features: {}
    };
    /* Les découvertes « méta » et les minijeux restent débloqués */
    ['prestige', 'relics', 'automation', 'mg_roue', 'mg_tri', 'mg_peel', 'mg_memoire',
     'mg_match', 'mg_tresor', 'mg_course', 'rares', 'challenges', 'market', 'mutation',
     'combo', 'crit', 'golden', 'boosts', 'contracts',
     'mg_ninja', 'mg_serpent', 'mg_pile', 'mg_cocktail', 'mg_taupe',
     'skins', 'pets', 'breeding', 'casino', 'race',
     'petteam2', 'petteam3', 'petteam4'].forEach(function (id) {
      if (S.features[id]) keep.features[id] = true;
    });

    var fresh = freshState();
    for (var k in keep) fresh[k] = keep[k];
    fresh.bananas = global.relicStartBananas(S.relics.primordiale || 0);
    fresh.totalBananas = 0;
    fresh.nextGoldenAt = fresh.features.golden ? Date.now() + 30000 : 0;
    fresh.lastTick = Date.now();
    S = fresh;

    /* Récompenses de collection liées au prestige */
    if (S.prestigeCount >= 1 && !S.rares.leviathan) grantRare('leviathan', 'prestige');
    if (S.prestigeCount >= 8 && !S.rares.vide) grantRare('vide', 'prestige');

    recompute();
    emit('prestige', { seeds: gain, total: S.seeds });
    save();
    return gain;
  }

  /* ========================================================== DÉFIS ===== */

  function challengeProgress(c) {
    var snap = snapshot();
    var v = 0;
    try { v = c.value(snap) || 0; } catch (e) { v = 0; }
    return { value: v, target: c.target, done: v >= c.target, claimed: !!S.challenges[c.id] };
  }

  function claimChallenge(id) {
    var c = global.CHALLENGE_BY_ID[id];
    if (!c || S.challenges[id]) return null;
    var p = challengeProgress(c);
    if (!p.done) return null;
    S.challenges[id] = true;
    var res = { challenge: c, tokens: 0, rare: null, seeds: 0 };
    if (c.reward.tokens) res.tokens = addTokens(c.reward.tokens * D.tokenMult, true);
    if (c.reward.seeds) { S.seeds += c.reward.seeds; S.totalSeeds += c.reward.seeds; res.seeds = c.reward.seeds; }
    if (c.reward.rare) res.rare = grantRare(c.reward.rare, 'defi');
    recompute();
    emit('challenge', res);
    return res;
  }

  function pendingChallenges() {
    var n = 0;
    for (var i = 0; i < global.CHALLENGES.length; i++) {
      var c = global.CHALLENGES[i];
      if (S.challenges[c.id]) continue;
      if (challengeProgress(c).done) n++;
    }
    return n;
  }

  /* ==================================================== MINIJEUX API ==== */

  /* Récompense standardisée : `weight` est le score normalisé (1 = partie moyenne) */
  function minigameReward(gameId, weight, score) {
    recompute();
    S.stats.miniPlayed++;
    S.stats.miniByGame[gameId] = (S.stats.miniByGame[gameId] || 0) + 1;
    if (score !== undefined && score > (S.stats.best[gameId] || 0)) S.stats.best[gameId] = score;

    var bananas = Math.max(D.bps * 90, D.perClick * 60, 500) * weight * D.miniMult;
    var tokens = Math.max(0, Math.round(weight * 4 * D.miniMult * D.tokenMult));
    earn(bananas, 'mini');
    addTokens(tokens, true);

    var rare = null;
    var chance = global.U.clamp(0.04 + weight * 0.05, 0, 0.45) * D.luckMult;
    if (S.features.rares && Math.random() < chance) {
      var r = drawRare(weight > 2.2 ? 'rare' : null);
      if (r) rare = grantRare(r.id, 'mini');
    }
    var res = { bananas: bananas, tokens: tokens, rare: rare, score: score, game: gameId };
    emit('miniresult', res);
    return res;
  }


  /* ======================================================== CONTRATS ==== */

  /*
   * Une commande à la fois, chronométrée. La progression est mesurée par
   * différence avec un instantané pris au moment où la commande est émise,
   * ce qui évite d'avoir à instrumenter chaque action du jeu.
   */
  var CONTRACT_TYPES = [
    {
      id: 'produce', weight: 30,
      label: function (n) { return 'Livrer ' + global.U.fmtFr(n) + ' bananes'; },
      available: function () { return D.bps > 0 || D.perClick > 0; },
      target: function (limit) { return Math.max(D.bps * limit * 1.15, D.perClick * 45, 200); },
      read: function () { return S.totalBananas; }
    },
    {
      id: 'click', weight: 18,
      label: function (n) { return 'Récolter ' + n + ' bananes à la main'; },
      available: function () { return true; },
      target: function () { return global.U.randInt(60, 170); },
      read: function () { return S.stats.handClicked; }
    },
    {
      id: 'buy', weight: 16,
      label: function (n) { return 'Installer ' + n + ' nouveaux producteurs'; },
      available: function () { return true; },
      target: function () { return global.U.randInt(8, 26); },
      read: function () { return S.stats.gensBought; }
    },
    {
      id: 'mini', weight: 16,
      label: function (n) { return 'Terminer ' + n + ' parties à l\'Arcade'; },
      available: function () { return anyMinigameUnlocked(); },
      target: function () { return global.U.randInt(2, 4); },
      read: function () { return S.stats.miniPlayed; }
    },
    {
      id: 'rare', weight: 12,
      label: function (n) { return 'Dénicher ' + n + ' banane(s) rare(s)'; },
      available: function () { return !!S.features.rares; },
      target: function () { return global.U.randInt(1, 2); },
      read: function () { return S.stats.raresTotal; }
    },
    {
      id: 'golden', weight: 10,
      label: function (n) { return 'Attraper ' + n + ' banane(s) dorée(s)'; },
      available: function () { return !!S.features.golden; },
      target: function () { return global.U.randInt(1, 2); },
      read: function () { return S.stats.goldenClicked; }
    }
  ];

  var CONTRACT_BY_ID = {};
  CONTRACT_TYPES.forEach(function (c) { CONTRACT_BY_ID[c.id] = c; });

  var MINIGAME_FEATURES = ['mg_tri', 'mg_peel', 'mg_memoire', 'mg_match', 'mg_tresor', 'mg_course', 'mg_roue'];
  function anyMinigameUnlocked() {
    for (var i = 0; i < MINIGAME_FEATURES.length; i++) if (S.features[MINIGAME_FEATURES[i]]) return true;
    return false;
  }

  function newContract() {
    recompute();
    var pool = CONTRACT_TYPES.filter(function (c) { return c.available(); });
    if (!pool.length) return null;
    var type = global.U.weightedPick(pool);
    var limit = global.U.randInt(180, 420);
    var target = Math.ceil(type.target(limit));
    S.contract = {
      type: type.id,
      target: target,
      base: type.read(),
      label: type.label(target),
      until: Date.now() + limit * 1000,
      limit: limit
    };
    emit('contract', { kind: 'new', contract: S.contract });
    return S.contract;
  }

  function contractProgress() {
    var c = S.contract;
    if (!c) return null;
    var type = CONTRACT_BY_ID[c.type];
    var done = Math.max(0, type.read() - c.base);
    return {
      contract: c,
      value: done,
      target: c.target,
      ratio: global.U.clamp(done / c.target, 0, 1),
      secondsLeft: Math.max(0, (c.until - Date.now()) / 1000),
      complete: done >= c.target
    };
  }

  function contractRewards() {
    var streak = S.contractStreak;
    return {
      tokens: Math.round((10 + streak * 4) * D.tokenMult),
      bananas: Math.max(D.bps * 200 * (1 + streak * 0.15), D.perClick * 150, 1500),
      rareChance: global.U.clamp(0.12 + streak * 0.03, 0, 0.5),
      seeds: (S.features.prestige && streak > 0 && streak % 5 === 4) ? 3 + streak : 0
    };
  }

  function claimContract() {
    var p = contractProgress();
    if (!p || !p.complete) return null;
    recompute();
    var r = contractRewards();
    var res = { tokens: 0, bananas: 0, rare: null, seeds: 0, streak: S.contractStreak + 1 };

    res.tokens = addTokens(r.tokens, true);
    res.bananas = r.bananas;
    earn(r.bananas, 'contract');
    if (r.seeds) { S.seeds += r.seeds; S.totalSeeds += r.seeds; res.seeds = r.seeds; }
    if (S.features.rares && Math.random() < r.rareChance) {
      var rare = drawRare(S.contractStreak >= 4 ? 'rare' : null);
      if (rare) res.rare = grantRare(rare.id, 'contract');
    }

    S.contractStreak++;
    S.stats.contractsDone++;
    if (S.contractStreak > S.stats.bestStreak) S.stats.bestStreak = S.contractStreak;
    S.contract = null;
    S.contractNextAt = Date.now() + 15000;
    recompute();
    emit('contract', { kind: 'done', result: res });
    return res;
  }

  function rerollContract() {
    if (!S.contract || S.tokens < 5) return false;
    S.tokens -= 5;
    S.contract = null;
    newContract();
    return true;
  }

  function updateContracts() {
    if (!S.features.contracts) return;
    var now = Date.now();
    if (S.contract) {
      if (now > S.contract.until) {
        var p = contractProgress();
        if (p && p.complete) return;          // laissé au joueur : il peut encaisser
        S.contract = null;
        S.contractStreak = 0;
        S.stats.contractsFailed++;
        S.contractNextAt = now + 20000;
        emit('contract', { kind: 'failed' });
      }
      return;
    }
    if (!S.contractNextAt) S.contractNextAt = now;
    if (now >= S.contractNextAt) newContract();
  }

  /* ======================================================= AUTO-ACHAT === */

  function autobuyStep() {
    if (!S.features.automation || !S.settings.autobuy) return;
    var bestGen = null, bestRatio = Infinity;
    for (var i = 0; i < global.GENERATORS.length; i++) {
      var g = global.GENERATORS[i];
      var n = S.gens[g.id] || 0;
      var cost = genCost(g, 1);
      var gain = g.rate * global.genTierMultiplier(n + 1) * upgradeValue('gen', g.id);
      if (gain <= 0) continue;
      var ratio = cost / gain;
      if (ratio < bestRatio) { bestRatio = ratio; bestGen = g; }
    }
    if (bestGen && S.bananas >= genCost(bestGen, 1) * 1.5) buyGen(bestGen.id, 1);
  }

  /* ============================================================ TICK ==== */

  var acc = 0;

  function tick(dtMs) {
    var dt = dtMs / 1000;
    recompute();

    earn(D.bps * dt, 'tick');
    S.stats.playTime += dt;

    /* Boosts expirés */
    var now = Date.now(), changed = false;
    for (var i = S.boosts.length - 1; i >= 0; i--) {
      if (S.boosts[i].until <= now) { S.boosts.splice(i, 1); changed = true; }
    }
    if (changed) recompute();

    if (S.features.market) updateMarket(dt);

    acc += dt;
    if (acc >= 1) {
      acc = 0;
      maybeRare('tick');
      autobuyStep();
      if (global.PETS && global.PETS.autoStep) global.PETS.autoStep();
      updateContracts();
    }

    emit('tick', dt);
  }

  /* ================================================== HORS-LIGNE ======== */

  function maxOfflineHours() {
    if (S.upgrades.syn_offline3) return 48;
    if (S.upgrades.syn_offline2) return 24;
    return S.upgrades.syn_offline1 ? 12 : 8;
  }

  function applyOffline(elapsedMs) {
    recompute();
    var capped = Math.min(elapsedMs, maxOfflineHours() * 3600000);
    if (capped < 60000 || D.bps <= 0) return null;
    var seconds = capped / 1000;
    var efficiency = 0.5 * D.offlineMult;
    var gain = D.bps * seconds * efficiency;
    earn(gain, 'offline');
    return { seconds: seconds, gain: gain, efficiency: efficiency, capped: elapsedMs > capped };
  }

  /* ================================================== INSTANTANÉ (défis) */

  function snapshot() {
    return {
      bananas: S.bananas, totalBananas: S.totalBananas, allTime: S.allTime,
      tokens: S.tokens, seeds: S.seeds, totalSeeds: S.totalSeeds,
      prestigeCount: S.prestigeCount, gens: S.gens, upgrades: S.upgrades,
      features: S.features, rares: S.rares, relics: S.relics,
      raresFound: D.raresFound, bps: D.bps, stats: S.stats,
      upgradesBought: S.stats.upgradesBought, relicLevels: relicLevels(),
      /* --- extensions « Grand Patch » --- */
      pets: S.pets, skins: S.skins,
      petsOwned: S.pets.owned.length,
      petSpecies: countKeys(S.pets.discovered),
      petBestTier: bestPetTier(),
      skinsOwned: countKeys(S.skins.owned)
    };
  }

  function countKeys(obj) {
    var n = 0;
    for (var k in obj) if (obj[k]) n++;
    return n;
  }

  /* Rang (0 = commun) du plus rare animal jamais découvert. */
  function bestPetTier() {
    var best = -1;
    for (var id in S.pets.discovered) {
      if (!S.pets.discovered[id]) continue;
      var sp = global.PET_BY_ID[id];
      if (sp) best = Math.max(best, global.petTierIndex(sp.tier));
    }
    return best + 1;
  }

  /* ===================================================== SAUVEGARDE ===== */

  function save() {
    try {
      S.lastSave = Date.now();
      S.lastTick = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(S));
      emit('save');
      return true;
    } catch (e) {
      emit('saveerror', e);
      return false;
    }
  }

  function migrate(raw) {
    var fresh = freshState();
    for (var k in fresh) {
      if (raw[k] === undefined) raw[k] = fresh[k];
    }
    for (var sk in fresh.stats) {
      if (raw.stats[sk] === undefined) raw.stats[sk] = fresh.stats[sk];
    }
    for (var mk in fresh.market) {
      if (raw.market[mk] === undefined) raw.market[mk] = fresh.market[mk];
    }
    for (var gk in fresh.settings) {
      if (raw.settings[gk] === undefined) raw.settings[gk] = fresh.settings[gk];
    }
    global.GENERATORS.forEach(function (g) {
      if (typeof raw.gens[g.id] !== 'number') raw.gens[g.id] = 0;
    });
    if (!Array.isArray(raw.boosts)) raw.boosts = [];

    /* Les blocs ajoutés par le Grand Patch peuvent manquer, ou n'être que
       partiellement remplis si la sauvegarde date d'une version intermédiaire. */
    ['pets', 'skins'].forEach(function (k) {
      if (!raw[k] || typeof raw[k] !== 'object') raw[k] = fresh[k];
      for (var sub in fresh[k]) {
        if (raw[k][sub] === undefined) raw[k][sub] = fresh[k][sub];
      }
    });
    if (!Array.isArray(raw.pets.owned)) raw.pets.owned = [];
    if (!Array.isArray(raw.pets.team)) raw.pets.team = [];
    if (!raw.pets.auto || typeof raw.pets.auto !== 'object') raw.pets.auto = fresh.pets.auto;
    for (var ak in fresh.pets.auto) {
      if (raw.pets.auto[ak] === undefined) raw.pets.auto[ak] = fresh.pets.auto[ak];
    }
    if (!raw.skins.owned.classique) raw.skins.owned.classique = true;
    if (!global.SKIN_BY_ID[raw.skins.active]) raw.skins.active = 'classique';

    /*
     * Correctif v3 — six défis du patch réutilisaient un identifiant déjà pris
     * (prod9, prod10, coll6 à coll9). CHALLENGE_BY_ID n'en gardait qu'un et le
     * drapeau « encaissé » était commun aux deux : l'un devenait inclicable et
     * la récompense de l'autre — dont la Banane Éternelle de « Chasseur de
     * Légendes » — était perdue.
     *
     * Les identifiants du patch ont été renommés. On remet ici les six drapeaux
     * ambigus à zéro : le joueur peut réclamer ce qu'il n'a pas pu obtenir. Un
     * défi déjà légitimement accompli se ré-encaisse en un clic, ce qui est
     * préférable à une récompense définitivement perdue.
     */
    if ((raw.version || 1) < 3 && raw.challenges) {
      ['prod9', 'prod10', 'coll6', 'coll7', 'coll8', 'coll9'].forEach(function (id) {
        delete raw.challenges[id];
      });
    }

    raw.version = SAVE_VERSION;
    return raw;
  }

  function load() {
    var txt;
    try { txt = localStorage.getItem(SAVE_KEY); } catch (e) { return null; }
    if (!txt) return null;
    var raw;
    try { raw = JSON.parse(txt); } catch (e) { return null; }
    if (!raw || typeof raw !== 'object') return null;
    S = migrate(raw);
    recompute();
    var elapsed = Date.now() - (S.lastTick || Date.now());
    var offline = elapsed > 0 ? applyOffline(elapsed) : null;
    S.lastTick = Date.now();
    return { offline: offline };
  }

  function exportSave() {
    save();
    try { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { return ''; }
  }

  function importSave(code) {
    try {
      var raw = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
      if (!raw || typeof raw !== 'object' || typeof raw.bananas !== 'number') return false;
      S = migrate(raw);
      S.lastTick = Date.now();
      recompute();
      save();
      return true;
    } catch (e) { return false; }
  }

  function hardReset() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignoré */ }
    S = freshState();
    recompute();
  }

  /* ============================================================ API ===== */

  global.G = {
    TICK_MS: TICK_MS,
    get S() { return S; },
    get D() { return D; },
    on: on, emit: emit,
    recompute: recompute, tick: tick,
    clickBanana: clickBanana,
    earn: earn, spend: spend, payout: payout, addTokens: addTokens,
    genCost: genCost, genMaxBuy: genMaxBuy, buyGen: buyGen,
    upgradeVisible: upgradeVisible, buyUpgrade: buyUpgrade,
    featureVisible: featureVisible, buyFeature: buyFeature,
    relicCost: relicCost, buyRelic: buyRelic, relicLevels: relicLevels,
    SMOOTHIES: SMOOTHIES, smoothieCost: smoothieCost, smoothieAvailable: smoothieAvailable,
    craftSmoothie: craftSmoothie, drinkSmoothie: drinkSmoothie, addBoost: addBoost,
    seedPower: seedPower, seedMarginal: seedMarginal, bananasForSeeds: bananasForSeeds,
    SEED_THRESHOLD: SEED_THRESHOLD,
    boostMultFor: boostMultFor,
    collectGolden: collectGolden, goldenDelay: goldenDelay, GOLDEN_KINDS: GOLDEN_KINDS,
    marketSell: marketSell, marketBuyOffer: marketBuyOffer, marketTokenRate: marketTokenRate,
    MUTATIONS: MUTATIONS, mutate: mutate, grantRare: grantRare, drawRare: drawRare,
    seedsOnPrestige: seedsOnPrestige, canPrestige: canPrestige, doPrestige: doPrestige,
    challengeProgress: challengeProgress, claimChallenge: claimChallenge,
    pendingChallenges: pendingChallenges,
    minigameReward: minigameReward,
    contractProgress: contractProgress, claimContract: claimContract,
    rerollContract: rerollContract, newContract: newContract, contractRewards: contractRewards,
    maxOfflineHours: maxOfflineHours,
    snapshot: snapshot,
    save: save, load: load, exportSave: exportSave, importSave: importSave, hardReset: hardReset,
    rareBonus: rareBonus, relicBonus: relicBonus, countRares: countRares
  };
})(window);

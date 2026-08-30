/* Banana Factory - défis à collectionner */
(function (global) {
  'use strict';

  function countRarity(S, rarity) {
    var n = 0;
    global.RARES.forEach(function (r) { if (r.rarity === rarity && S.rares[r.id]) n++; });
    return n;
  }
  function genTotal(S, ids) {
    var min = Infinity;
    ids.forEach(function (id) { min = Math.min(min, S.gens[id] || 0); });
    return min === Infinity ? 0 : min;
  }
  function distinctGens(S) {
    var n = 0;
    global.GENERATORS.forEach(function (g) { if ((S.gens[g.id] || 0) > 0) n++; });
    return n;
  }
  function distinctMinis(S) {
    var n = 0;
    for (var k in S.stats.miniByGame) { if (S.stats.miniByGame[k] > 0) n++; }
    return n;
  }
  function best(S, key) { return S.stats.best[key] || 0; }

  /*
   * value  : fonction qui renvoit la progression actuelle
   * target : valeur à atteindre
   * reward : { tokens, rare, seeds }
   */
  var CHALLENGES = [
    // ------------------------------------------------------------- RÉCOLTE
    { id: 'harv1', cat: 'Récolte', name: 'Premiers Pas', desc: "Récolter 100 bananes en tout.",
      target: 100, value: function (S) { return S.totalBananas; }, reward: { tokens: 1 } },
    { id: 'harv2', cat: 'Récolte', name: 'Petite Récolte', desc: "Récolter 10 000 bananes en tout.",
      target: 1e4, value: function (S) { return S.totalBananas; }, reward: { tokens: 2 } },
    { id: 'harv3', cat: 'Récolte', name: 'Grosse Récolte', desc: "Récolter 1 million de bananes.",
      target: 1e6, value: function (S) { return S.totalBananas; }, reward: { tokens: 5 } },
    { id: 'harv4', cat: 'Récolte', name: 'Récolte Industrielle', desc: "Récolter 1 milliard de bananes.",
      target: 1e9, value: function (S) { return S.totalBananas; }, reward: { tokens: 15 } },
    { id: 'harv5', cat: 'Récolte', name: 'Récolte Astronomique', desc: "Récolter 1 000 milliards de bananes.",
      target: 1e12, value: function (S) { return S.totalBananas; }, reward: { tokens: 40 } },
    { id: 'harv6', cat: 'Récolte', name: 'Récolte Absurde', desc: "Récolter un quintillion de bananes.",
      target: 1e18, value: function (S) { return S.totalBananas; }, reward: { tokens: 120 } },

    // ---------------------------------------------------------------- CLICS
    { id: 'clic1', cat: 'Clics', name: 'Doigt Chaud', desc: "Cliquer 100 fois sur la banane.",
      target: 100, value: function (S) { return S.stats.clicks; }, reward: { tokens: 1 } },
    { id: 'clic2', cat: 'Clics', name: 'Tendinite Légère', desc: "Cliquer 1 000 fois.",
      target: 1000, value: function (S) { return S.stats.clicks; }, reward: { tokens: 3 } },
    { id: 'clic3', cat: 'Clics', name: 'Tendinite Confirmée', desc: "Cliquer 10 000 fois.",
      target: 10000, value: function (S) { return S.stats.clicks; }, reward: { tokens: 10, rare: 'carree' } },
    { id: 'clic4', cat: 'Clics', name: 'Tendinite Chronique', desc: "Cliquer 50 000 fois. Consultez un médecin.",
      target: 50000, value: function (S) { return S.stats.clicks; }, reward: { tokens: 30 } },
    { id: 'clic5', cat: 'Clics', name: 'Enchaîné', desc: "Atteindre un combo de ×25.",
      target: 25, value: function (S) { return S.stats.maxCombo; }, reward: { tokens: 5 } },
    { id: 'clic6', cat: 'Clics', name: 'Transe Bananière', desc: "Atteindre un combo de ×100.",
      target: 100, value: function (S) { return S.stats.maxCombo; }, reward: { tokens: 20, rare: 'chaos' } },
    { id: 'clic7', cat: 'Clics', name: 'Lame Vive', desc: "Déclencher 500 coups critiques.",
      target: 500, value: function (S) { return S.stats.crits; }, reward: { tokens: 12 } },
    { id: 'clic8', cat: 'Clics', name: 'Chasseur Doré', desc: "Attraper 50 bananes dorées.",
      target: 50, value: function (S) { return S.stats.goldenClicked; }, reward: { tokens: 25 } },

    // --------------------------------------------------------- PRODUCTEURS
    { id: 'prod1', cat: 'Production', name: 'Première Embauche', desc: "Recruter un Singe Cueilleur.",
      target: 1, value: function (S) { return S.gens.singe; }, reward: { tokens: 1 } },
    { id: 'prod2', cat: 'Production', name: 'Une Vraie Équipe', desc: "Posséder 50 Singes Cueilleurs.",
      target: 50, value: function (S) { return S.gens.singe; }, reward: { tokens: 4 } },
    { id: 'prod3', cat: 'Production', name: 'Armée de Singes', desc: "Posséder 200 Singes Cueilleurs.",
      target: 200, value: function (S) { return S.gens.singe; }, reward: { tokens: 20, rare: 'champignon' } },
    { id: 'prod4', cat: 'Production', name: 'Portefeuille Diversifié', desc: "Posséder au moins un exemplaire de chaque producteur.",
      target: 12, value: function (S) { return distinctGens(S); }, reward: { tokens: 25 } },
    { id: 'prod5', cat: 'Production', name: 'Cent Partout', desc: "Posséder 100 exemplaires des six premiers producteurs.",
      target: 100, value: function (S) { return genTotal(S, ['singe', 'plantation', 'tapis', 'presse', 'robot', 'serre']); },
      reward: { tokens: 50, rare: 'chevalier' } },
    { id: 'prod6', cat: 'Production', name: 'Million par Seconde', desc: "Atteindre 1 million de bananes par seconde.",
      target: 1e6, value: function (S) { return S.bps; }, reward: { tokens: 20 } },
    { id: 'prod7', cat: 'Production', name: 'Milliard par Seconde', desc: "Atteindre 1 milliard de bananes par seconde.",
      target: 1e9, value: function (S) { return S.bps; }, reward: { tokens: 60, rare: 'zombie' } },
    { id: 'prod8', cat: 'Production', name: 'Tout Améliorer', desc: "Acheter 40 améliorations.",
      target: 40, value: function (S) { return S.upgradesBought; }, reward: { tokens: 35 } },

    { id: 'prod9', cat: 'Production', name: 'Fournisseur Fiable', desc: "Honorer 25 contrats de la Coopérative.",
      target: 25, value: function (S) { return S.stats.contractsDone || 0; }, reward: { tokens: 30 } },
    { id: 'prod10', cat: 'Production', name: 'Série Impeccable', desc: "Enchaîner 10 contrats sans en manquer un seul.",
      target: 10, value: function (S) { return S.stats.bestStreak || 0; }, reward: { tokens: 70 } },

    // ---------------------------------------------------------- COLLECTION
    { id: 'coll1', cat: 'Collection', name: 'Premier Spécimen', desc: "Trouver votre première banane rare.",
      target: 1, value: function (S) { return S.raresFound; }, reward: { tokens: 2 } },
    { id: 'coll2', cat: 'Collection', name: 'Étagère Remplie', desc: "Trouver 10 bananes rares différentes.",
      target: 10, value: function (S) { return S.raresFound; }, reward: { tokens: 8 } },
    { id: 'coll3', cat: 'Collection', name: 'Collectionneur', desc: "Trouver 25 bananes rares différentes.",
      target: 25, value: function (S) { return S.raresFound; }, reward: { tokens: 25, rare: 'momie' } },
    { id: 'coll4', cat: 'Collection', name: 'Conservateur du Musée', desc: "Trouver 40 bananes rares différentes.",
      target: 40, value: function (S) { return S.raresFound; }, reward: { tokens: 60, rare: 'temporelle' } },
    { id: 'coll5', cat: 'Collection', name: 'Premier Album', desc: "Trouver 54 bananes rares différentes. La moitié du chemin.",
      target: 54, value: function (S) { return S.raresFound; }, reward: { tokens: 300, seeds: 250 } },
    { id: 'coll6', cat: 'Collection', name: "Chasseur d'Épiques", desc: "Posséder 8 bananes épiques.",
      target: 8, value: function (S) { return countRarity(S, 'epique'); }, reward: { tokens: 20 } },
    { id: 'coll7', cat: 'Collection', name: 'Chasseur de Légendes', desc: "Posséder 5 bananes légendaires.",
      target: 5, value: function (S) { return countRarity(S, 'legendaire'); }, reward: { tokens: 50, rare: 'eternelle' } },
    { id: 'coll8', cat: 'Collection', name: 'Mythe Vivant', desc: "Posséder 3 bananes mythiques.",
      target: 3, value: function (S) { return countRarity(S, 'mythique'); }, reward: { tokens: 100 } },
    { id: 'coll9', cat: 'Collection', name: 'Doublons', desc: "Trouver 200 bananes rares au total, doublons compris.",
      target: 200, value: function (S) { return S.stats.raresTotal; }, reward: { tokens: 45 } },

    // ------------------------------------------------------------ MINIJEUX
    { id: 'mini1', cat: 'Minijeux', name: 'Première Partie', desc: "Jouer à un minijeu.",
      target: 1, value: function (S) { return S.stats.miniPlayed; }, reward: { tokens: 1 } },
    { id: 'mini2', cat: 'Minijeux', name: "Habitué de l'Arcade", desc: "Jouer 25 parties de minijeu.",
      target: 25, value: function (S) { return S.stats.miniPlayed; }, reward: { tokens: 10 } },
    { id: 'mini3', cat: 'Minijeux', name: "Accro à l'Arcade", desc: "Jouer 100 parties de minijeu.",
      target: 100, value: function (S) { return S.stats.miniPlayed; }, reward: { tokens: 40, rare: 'ratatinee' } },
    { id: 'mini4', cat: 'Minijeux', name: 'Trieur Émérite', desc: "Trier 40 bananes dans une partie de Tri Express.",
      target: 40, value: function (S) { return best(S, 'tri'); }, reward: { tokens: 8 } },
    { id: 'mini5', cat: 'Minijeux', name: 'Éplucheur Fou', desc: "Éplucher 45 bananes dans une partie de Peel Rush.",
      target: 45, value: function (S) { return best(S, 'peel'); }, reward: { tokens: 10 } },
    { id: 'mini6', cat: 'Minijeux', name: "Mémoire d'Éléphant", desc: "Atteindre la manche 12 à Mémoire du Singe.",
      target: 12, value: function (S) { return best(S, 'memoire'); }, reward: { tokens: 15 } },
    { id: 'mini7', cat: 'Minijeux', name: 'Alignement Parfait', desc: "Marquer 3 000 points à Banana Match.",
      target: 3000, value: function (S) { return best(S, 'match'); }, reward: { tokens: 15 } },
    { id: 'mini8', cat: 'Minijeux', name: 'Sprinteur de Canopée', desc: "Parcourir 2 000 m à la Course de la Jungle.",
      target: 2000, value: function (S) { return best(S, 'course'); }, reward: { tokens: 15 } },
    { id: 'mini9', cat: 'Minijeux', name: 'Fin Limier', desc: "Déterrer 5 coffres dans une Chasse au Trésor.",
      target: 5, value: function (S) { return best(S, 'tresor'); }, reward: { tokens: 12 } },
    { id: 'mini10', cat: 'Minijeux', name: 'Salle Complète', desc: "Jouer au moins une fois aux 7 minijeux.",
      target: 7, value: function (S) { return distinctMinis(S); }, reward: { tokens: 30, rare: 'infinie' } },
    { id: 'mini11', cat: 'Minijeux', name: 'Roue Généreuse', desc: "Faire tourner la Roue de la Fortune 50 fois.",
      target: 50, value: function (S) { return S.stats.miniByGame.roue || 0; }, reward: { tokens: 25 } },

    // ------------------------------------------------------------ PRESTIGE
    { id: 'pres1', cat: 'Prestige', name: 'Grande Récolte', desc: "Effectuer votre première Grande Récolte.",
      target: 1, value: function (S) { return S.prestigeCount; }, reward: { tokens: 10 } },
    { id: 'pres2', cat: 'Prestige', name: 'Cycle Éternel', desc: "Effectuer 5 Grandes Récoltes.",
      target: 5, value: function (S) { return S.prestigeCount; }, reward: { tokens: 40 } },
    { id: 'pres3', cat: 'Prestige', name: 'Jardinier Divin', desc: "Effectuer 15 Grandes Récoltes.",
      target: 15, value: function (S) { return S.prestigeCount; }, reward: { tokens: 150, rare: 'divine' } },
    { id: 'pres4', cat: 'Prestige', name: 'Mille Graines', desc: "Accumuler 1 000 Graines d'Or au total.",
      target: 1000, value: function (S) { return S.totalSeeds; }, reward: { tokens: 80 } },
    { id: 'pres5', cat: 'Prestige', name: 'Reliquaire', desc: "Acheter 10 niveaux de reliques.",
      target: 10, value: function (S) { return S.relicLevels; }, reward: { tokens: 60 } },
    { id: 'pres6', cat: 'Prestige', name: 'Alpha & Oméga', desc: "53 bananes rares et 15 Grandes Récoltes. La consécration.",
      target: 2, value: function (S) { return (S.raresFound >= 53 ? 1 : 0) + (S.prestigeCount >= 15 ? 1 : 0); },
      reward: { tokens: 500, rare: 'alphaomega' } }
  ];

  var BY_ID = {};
  CHALLENGES.forEach(function (c, i) { c.index = i; BY_ID[c.id] = c; });

  var CATEGORIES = [];
  CHALLENGES.forEach(function (c) { if (CATEGORIES.indexOf(c.cat) < 0) CATEGORIES.push(c.cat); });

  global.CHALLENGES = CHALLENGES;
  global.CHALLENGE_BY_ID = BY_ID;
  global.CHALLENGE_CATEGORIES = CATEGORIES;
})(window);

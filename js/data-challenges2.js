/* Banana Factory - défis ajoutés par le Grand Patch
 *
 * Trente-cinq objectifs de plus, dont trois nouvelles catégories (Élevage,
 * Casino, Apparences). Ce sont eux qui distribuent les bananes Cosmiques et
 * Absolues : elles ne tombent jamais au hasard.
 *
 * À charger APRÈS data-challenges.js.
 */
(function (global) {
  'use strict';

  function best(S, key) { return S.stats.best[key] || 0; }

  function distinctMinis(S) {
    var n = 0;
    for (var k in S.stats.miniByGame) { if (S.stats.miniByGame[k] > 0) n++; }
    return n;
  }

  function distinctGens(S) {
    var n = 0;
    global.GENERATORS.forEach(function (g) { if ((S.gens[g.id] || 0) > 0) n++; });
    return n;
  }

  var EXTRA = [
    // ------------------------------------------------------------- RÉCOLTE
    { id: 'harv7', cat: 'Récolte', name: 'Récolte Cosmique', desc: "Récolter un septillion de bananes (1e24).",
      target: 1e24, value: function (S) { return S.totalBananas; }, reward: { tokens: 400, rare: 'singularite' } },
    { id: 'harv8', cat: 'Récolte', name: 'Récolte Absolue', desc: "Récolter 1e30 bananes. Il n'y a plus de mot pour ça.",
      target: 1e30, value: function (S) { return S.totalBananas; }, reward: { tokens: 1200, rare: 'neant' } },

    // ---------------------------------------------------------- PRODUCTION
    { id: 'prod9', cat: 'Production', name: 'Jusqu\'au Bout', desc: "Posséder au moins un exemplaire des 21 producteurs.",
      target: 21, value: distinctGens, reward: { tokens: 120 } },
    { id: 'prod10', cat: 'Production', name: 'Démesure', desc: "Posséder 200 exemplaires d'un même producteur.",
      target: 200, value: function (S) {
        var m = 0;
        global.GENERATORS.forEach(function (g) { m = Math.max(m, S.gens[g.id] || 0); });
        return m;
      }, reward: { tokens: 90 } },
    { id: 'prod11', cat: 'Production', name: 'Arbre Originel', desc: "Planter le tout premier bananier de l'univers.",
      target: 1, value: function (S) { return S.gens.origine || 0; }, reward: { tokens: 300 } },

    // -------------------------------------------------------- COLLECTION
    { id: 'coll6', cat: 'Collection', name: 'Second Souffle', desc: "Trouver 75 bananes rares différentes.",
      target: 75, value: function (S) { return S.raresFound; }, reward: { tokens: 220 } },
    { id: 'coll7', cat: 'Collection', name: 'Presque Tout', desc: "Trouver 95 bananes rares différentes.",
      target: 95, value: function (S) { return S.raresFound; }, reward: { tokens: 400, rare: 'souveraine' } },
    { id: 'coll8', cat: 'Collection', name: 'Album Intégral', desc: "Trouver les 108 bananes rares. Le vrai Graal.",
      target: 108, value: function (S) { return S.raresFound; }, reward: { tokens: 900, seeds: 400 } },
    { id: 'coll9', cat: 'Collection', name: 'Au-delà du Mythe', desc: "Posséder une banane Cosmique.",
      target: 1, value: function (S) {
        var n = 0;
        global.RARES.forEach(function (r) { if (r.rarity === 'cosmique' && S.rares[r.id]) n++; });
        return n;
      }, reward: { tokens: 250 } },
    { id: 'coll10', cat: 'Collection', name: 'Chambre Forte', desc: "Trouver 600 exemplaires rares, doublons compris.",
      target: 600, value: function (S) { return S.stats.raresTotal; }, reward: { tokens: 300 } },

    // ------------------------------------------------------------ ÉLEVAGE
    { id: 'pet1', cat: 'Élevage', name: 'Premier Compagnon', desc: "Faire éclore votre premier œuf.",
      target: 1, value: function (S) { return S.stats.petsHatched || 0; }, reward: { tokens: 8 } },
    { id: 'pet2', cat: 'Élevage', name: 'Première Fusion', desc: "Réussir une fusion à la Chambre de Fusion.",
      target: 1, value: function (S) { return S.stats.petsBred || 0; }, reward: { tokens: 20 } },
    { id: 'pet3', cat: 'Élevage', name: 'Éleveur Confirmé', desc: "Réussir 25 fusions.",
      target: 25, value: function (S) { return S.stats.petsBred || 0; }, reward: { tokens: 60 } },
    { id: 'pet4', cat: 'Élevage', name: 'Généticien', desc: "Réussir 100 fusions.",
      target: 100, value: function (S) { return S.stats.petsBred || 0; }, reward: { tokens: 200 } },
    { id: 'pet5', cat: 'Élevage', name: 'Petit Zoo', desc: "Découvrir 15 espèces différentes.",
      target: 15, value: function (S) { return S.petSpecies; }, reward: { tokens: 35 } },
    { id: 'pet6', cat: 'Élevage', name: 'Grand Zoo', desc: "Découvrir 35 espèces différentes.",
      target: 35, value: function (S) { return S.petSpecies; }, reward: { tokens: 120 } },
    { id: 'pet7', cat: 'Élevage', name: 'Arche Complète', desc: "Découvrir les 56 espèces. Aucune n'a été oubliée.",
      target: 56, value: function (S) { return S.petSpecies; }, reward: { tokens: 600, seeds: 200 } },
    { id: 'pet8', cat: 'Élevage', name: 'Sang Légendaire', desc: "Obtenir un animal Légendaire.",
      target: 4, value: function (S) { return S.petBestTier; }, reward: { tokens: 80 } },
    { id: 'pet9', cat: 'Élevage', name: 'Souffle Divin', desc: "Obtenir un animal Divin.",
      target: 6, value: function (S) { return S.petBestTier; }, reward: { tokens: 250 } },
    { id: 'pet10', cat: 'Élevage', name: 'Au Commencement', desc: "Obtenir un animal Primordial.",
      target: 7, value: function (S) { return S.petBestTier; }, reward: { tokens: 500, seeds: 150 } },

    // ------------------------------------------------------------- CASINO
    { id: 'cas1', cat: 'Casino', name: 'Première Mise', desc: "Jouer une fois au Casino.",
      target: 1, value: function (S) { return S.stats.casinoPlays || 0; }, reward: { tokens: 5 } },
    { id: 'cas2', cat: 'Casino', name: 'Habitué', desc: "Jouer 100 fois au Casino.",
      target: 100, value: function (S) { return S.stats.casinoPlays || 0; }, reward: { tokens: 40 } },
    { id: 'cas3', cat: 'Casino', name: 'Main Chaude', desc: "Gagner 50 fois au Casino.",
      target: 50, value: function (S) { return S.stats.casinoWins || 0; }, reward: { tokens: 70 } },
    { id: 'cas4', cat: 'Casino', name: 'Flambeur', desc: "Gagner 250 fois au Casino.",
      target: 250, value: function (S) { return S.stats.casinoWins || 0; }, reward: { tokens: 220, rare: 'neon' } },
    { id: 'cas5', cat: 'Casino', name: 'Premier Pari', desc: "Assister à une course de cochons.",
      target: 1, value: function (S) { return S.stats.racesPlayed || 0; }, reward: { tokens: 10 } },
    { id: 'cas6', cat: 'Casino', name: 'Fin Parieur', desc: "Gagner 30 courses de cochons.",
      target: 30, value: function (S) { return S.stats.racesWon || 0; }, reward: { tokens: 150 } },
    { id: 'cas7', cat: 'Casino', name: 'Roi de la Piste', desc: "Gagner 120 courses de cochons.",
      target: 120, value: function (S) { return S.stats.racesWon || 0; }, reward: { tokens: 400, seeds: 100 } },

    // --------------------------------------------------------- APPARENCES
    { id: 'skin1', cat: 'Apparences', name: 'Changement de Peau', desc: "Débloquer une seconde apparence de banane.",
      target: 2, value: function (S) { return S.skinsOwned; }, reward: { tokens: 10 } },
    { id: 'skin2', cat: 'Apparences', name: 'Dressing Bien Rempli', desc: "Débloquer 10 apparences.",
      target: 10, value: function (S) { return S.skinsOwned; }, reward: { tokens: 90 } },
    { id: 'skin3', cat: 'Apparences', name: 'Garde-Robe Complète', desc: "Débloquer les 19 apparences.",
      target: 19, value: function (S) { return S.skinsOwned; }, reward: { tokens: 350, seeds: 120 } },

    // ------------------------------------------------------------ ARCADE
    { id: 'mini12', cat: 'Minijeux', name: 'Salle Agrandie', desc: "Jouer au moins une fois aux 12 minijeux.",
      target: 12, value: distinctMinis, reward: { tokens: 120, rare: 'paradoxe' } },
    { id: 'mini13', cat: 'Minijeux', name: 'Lame Affûtée', desc: "Trancher 120 fruits en une partie de Ninja Bananier.",
      target: 120, value: function (S) { return best(S, 'ninja'); }, reward: { tokens: 45 } },
    { id: 'mini14', cat: 'Minijeux', name: 'Longue Queue', desc: "Atteindre une longueur de 40 au Serpent de la Canopée.",
      target: 40, value: function (S) { return best(S, 'serpent'); }, reward: { tokens: 40 } },
    { id: 'mini15', cat: 'Minijeux', name: 'Docker Émérite', desc: "Compléter 25 lignes à Pile de Cageots.",
      target: 25, value: function (S) { return best(S, 'pile'); }, reward: { tokens: 50 } },
    { id: 'mini16', cat: 'Minijeux', name: 'Barman Étoilé', desc: "Servir 30 clients au Bar à Smoothies.",
      target: 30, value: function (S) { return best(S, 'cocktail'); }, reward: { tokens: 55 } },
    { id: 'mini17', cat: 'Minijeux', name: 'Garde Vigilant', desc: "Assommer 80 chapardeurs en une partie.",
      target: 80, value: function (S) { return best(S, 'taupe'); }, reward: { tokens: 45 } },

    // ----------------------------------------------------------- PRESTIGE
    { id: 'pres7', cat: 'Prestige', name: 'Cycle Sans Fin', desc: "Effectuer 30 Grandes Récoltes.",
      target: 30, value: function (S) { return S.prestigeCount; }, reward: { tokens: 400 } },
    { id: 'pres8', cat: 'Prestige', name: 'Reliquaire Complet', desc: "Acheter 60 niveaux de reliques.",
      target: 60, value: function (S) { return S.relicLevels; }, reward: { tokens: 300 } },
    { id: 'pres9', cat: 'Prestige', name: 'Semeur Patient', desc: "Accumuler 25 000 Graines d'Or au total.",
      target: 25000, value: function (S) { return S.totalSeeds; }, reward: { tokens: 700, seeds: 250 } }
  ];

  EXTRA.forEach(function (c) {
    c.index = global.CHALLENGES.length;
    global.CHALLENGES.push(c);
    global.CHALLENGE_BY_ID[c.id] = c;
    if (global.CHALLENGE_CATEGORIES.indexOf(c.cat) < 0) global.CHALLENGE_CATEGORIES.push(c.cat);
  });
})(window);

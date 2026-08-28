/* Banana Factory - producteurs automatiques */
(function (global) {
  'use strict';

  /*
   * cost   : prix du premier exemplaire
   * growth : facteur multiplicatif du prix a chaque achat
   * rate   : bananes par seconde et par exemplaire (avant multiplicateurs)
   */
  var GENERATORS = [
    {
      id: 'singe', name: 'Singe Cueilleur', icon: 'assets/generators/singe.png',
      cost: 15, growth: 1.15, rate: 0.1,
      desc: "Un primate motivé qui grimpe et lance des bananes.",
      flavor: "Il travaille pour des cacahuètes. Ironique."
    },
    {
      id: 'plantation', name: 'Plantation', icon: 'assets/generators/plantation.png',
      cost: 110, growth: 1.15, rate: 1,
      desc: "Une parcelle de bananiers qui pousse toute seule.",
      flavor: "La patience est une vertu tropicale."
    },
    {
      id: 'tapis', name: 'Tapis Roulant', icon: 'assets/generators/tapis.png',
      cost: 1200, growth: 1.15, rate: 8,
      desc: "Achemine les régimes jusqu'à l'entrepôt sans effort.",
      flavor: "Ne jamais s'asseoir dessus. Jamais."
    },
    {
      id: 'presse', name: 'Presse à Bananes', icon: 'assets/generators/presse.png',
      cost: 13000, growth: 1.15, rate: 47,
      desc: "Comprime la matière première en bananes plus denses.",
      flavor: "Bruit de machine à vapeur, odeur de banana bread."
    },
    {
      id: 'robot', name: 'Robot Cueilleur', icon: 'assets/generators/robot.png',
      cost: 140000, growth: 1.15, rate: 260,
      desc: "Bras articulé infatigable, précision au millimètre.",
      flavor: "BIP. RÉCOLTE. BIP. RÉCOLTE. BIP."
    },
    {
      id: 'serre', name: 'Serre Tropicale', icon: 'assets/generators/serre.png',
      cost: 2000000, growth: 1.15, rate: 1400,
      desc: "Climat parfait 24 h/24 sous un dôme de verre.",
      flavor: "32 degrés et 90 % d'humidité, le paradis du bananier."
    },
    {
      id: 'usine', name: 'Usine Automatisée', icon: 'assets/generators/usine.png',
      cost: 33000000, growth: 1.15, rate: 7800,
      desc: "Chaîne de production industrielle à plein régime.",
      flavor: "Trois équipes, zéro pause, beaucoup de bananes."
    },
    {
      id: 'labo', name: 'Labo Génétique', icon: 'assets/generators/labo.png',
      cost: 510000000, growth: 1.15, rate: 44000,
      desc: "Optimise l'ADN du fruit pour un rendement absurde.",
      flavor: "On a croisé une banane et un cactus. On regrette."
    },
    {
      id: 'temple', name: 'Temple de la Banane', icon: 'assets/generators/temple.png',
      cost: 7500000000, growth: 1.15, rate: 260000,
      desc: "Les fidèles prient, les bananes apparaissent.",
      flavor: "La foi déplace les montagnes. Et les régimes."
    },
    {
      id: 'portail', name: 'Portail Dimensionnel', icon: 'assets/generators/portail.png',
      cost: 100000000000, growth: 1.15, rate: 1600000,
      desc: "Importe des bananes d'univers où elles sont infinies.",
      flavor: "Ne pas y mettre la main. Serge n'est jamais revenu."
    },
    {
      id: 'orbitale', name: 'Station Orbitale', icon: 'assets/generators/orbitale.png',
      cost: 1400000000000, growth: 1.15, rate: 10000000,
      desc: "Culture en apesanteur : les bananes poussent droites.",
      flavor: "Une banane droite. Le monde n'était pas prêt."
    },
    {
      id: 'trounoir', name: 'Trou Noir à Bananes', icon: 'assets/generators/trounoir.png',
      cost: 20000000000000, growth: 1.15, rate: 65000000,
      desc: "Condense la matière de galaxies entières en potassium.",
      flavor: "L'horizon des événements sent la banane trop mûre."
    }
  ];

  var BY_ID = {};
  GENERATORS.forEach(function (g, i) { g.index = i; BY_ID[g.id] = g; });

  /* Paliers d'amelioration automatiques : x2 de production a chaque palier atteint */
  var GEN_TIERS = [10, 25, 50, 100, 150, 200, 250, 300, 400, 500];

  /* Multiplicateur de production d'un generateur selon le nombre possede */
  function tierMultiplier(count) {
    var m = 1;
    for (var i = 0; i < GEN_TIERS.length; i++) {
      if (count >= GEN_TIERS[i]) m *= 2;
    }
    return m;
  }

  function nextTier(count) {
    for (var i = 0; i < GEN_TIERS.length; i++) {
      if (count < GEN_TIERS[i]) return GEN_TIERS[i];
    }
    return null;
  }

  global.GENERATORS = GENERATORS;
  global.GEN_BY_ID = BY_ID;
  global.genTierMultiplier = tierMultiplier;
  global.genNextTier = nextTier;
})(window);

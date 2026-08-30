/* Banana Factory - découvertes ajoutées par le Grand Patch
 *
 * Même principe que data-features.js : chaque entrée coûte des bananes (ou des
 * Graines d'Or) et ouvre une véritable mécanique. Elles s'intercalent dans la
 * progression existante sans en déplacer aucune.
 *
 * À charger APRÈS data-features.js.
 */
(function (global) {
  'use strict';

  var EXTRA = [
    {
      id: 'skins', name: 'Garde-Robe', icon: 'assets/skins/doree.png',
      cost: 3e6, kind: 'collection',
      short: 'Apparences de la banane',
      desc: "Dix-neuf apparences pour votre banane principale, à débloquer en jouant. " +
            "Purement décoratives : aucune ne donne le moindre bonus, elles se méritent.",
      req: function (S) { return S.stats.clicks >= 500; }
    },
    {
      id: 'mg_serpent', name: 'Terrarium', icon: 'assets/minigames/mg_serpent.png',
      cost: 1.8e7, kind: 'minijeu',
      short: 'Minijeu : Serpent de la Canopée',
      desc: "Guidez un serpent affamé dans la canopée. Chaque banane avalée l'allonge, " +
            "et la moindre morsure sur sa propre queue met fin à la partie.",
      req: function (S) { return S.gens.presse >= 10; }
    },
    {
      id: 'mg_taupe', name: 'Pièges à Chapardeurs', icon: 'assets/minigames/mg_taupe.png',
      cost: 8e7, kind: 'minijeu',
      short: 'Minijeu : Chasse aux Chapardeurs',
      desc: "Des ratons laveurs sortent de terre pour voler vos bananes. Tapez dessus " +
            "avant qu'ils ne replongent — mais épargnez les singes du domaine.",
      req: function (S) { return S.gens.robot >= 20; }
    },
    {
      id: 'pets', name: 'Nurserie', icon: 'assets/upgrades/nurserie.png',
      cost: 5e8, kind: 'élevage',
      short: 'Animaux de compagnie',
      desc: "Un abri, des œufs, et 56 espèces à découvrir. L'animal placé dans votre " +
            "équipe travaille pour vous et offre un bonus permanent.",
      req: function (S) { return S.gens.serre >= 3; }
    },
    {
      id: 'mg_pile', name: 'Quai de Chargement', icon: 'assets/minigames/mg_pile.png',
      cost: 2e9, kind: 'minijeu',
      short: 'Minijeu : Pile de Cageots',
      desc: "Empilez les cageots qui tombent. Une ligne complète disparaît et rapporte ; " +
            "une pile qui touche le plafond termine la partie.",
      req: function (S) { return S.gens.usine >= 3; }
    },
    {
      id: 'casino', name: 'Casino de la Canopée', icon: 'assets/casino/slot.png',
      cost: 1e10, kind: 'mécanique',
      short: 'Casino : machine, roulette, 21 Bananes',
      desc: "Misez vos bananes à la machine à sous, à la roulette tropicale ou au " +
            "21 Bananes. La mise est plafonnée par votre production, et la maison " +
            "garde toujours un léger avantage.",
      req: function (S) { return S.features.market && S.gens.labo >= 1; }
    },
    {
      id: 'breeding', name: 'Chambre de Fusion', icon: 'assets/upgrades/fusion.png',
      cost: 3e10, kind: 'élevage',
      short: 'Fusion et reproduction',
      desc: "Fusionnez deux animaux : les parents disparaissent, le petit hérite d'une " +
            "espèce souvent plus rare. 42 recettes mènent des communs aux Primordiaux.",
      req: function (S) { return S.features.pets && S.petsOwned >= 2; }
    },
    {
      id: 'mg_ninja', name: 'Dojo de la Lame', icon: 'assets/minigames/mg_ninja.png',
      cost: 1.2e11, kind: 'minijeu',
      short: 'Minijeu : Ninja Bananier',
      desc: "Tranchez au vol tout ce qui monte du bas de l'écran. Les fruits rapportent, " +
            "les bombes coûtent une vie, et la cadence ne cesse d'accélérer.",
      req: function (S) { return S.gens.temple >= 3; }
    },
    {
      id: 'race', name: 'Piste des Cochons', icon: 'assets/casino/cochon.png',
      cost: 6e11, kind: 'mécanique',
      short: 'Course de cochons & paris',
      desc: "Six cochons, six cotes, une ligne droite. Plus la cote est haute, moins le " +
            "cochon a de chances — mais quel triomphe quand l'outsider passe en tête.",
      req: function (S) { return S.features.casino && S.prestigeCount >= 1; }
    },
    {
      id: 'mg_cocktail', name: 'Bar à Smoothies', icon: 'assets/minigames/mg_cocktail.png',
      cost: 2e12, kind: 'minijeu',
      short: 'Minijeu : Service au Bar',
      desc: "Les clients commandent, vous servez. Reproduisez chaque recette dans le bon " +
            "ordre avant la fin du chrono, sans faire attendre la file.",
      req: function (S) { return S.features.boosts && S.prestigeCount >= 1; }
    },
    {
      id: 'smoothies2', name: 'Cave à Smoothies', icon: 'assets/upgrades/mixeur.png',
      cost: 8e14, kind: 'mécanique',
      short: 'Quatre recettes de smoothies',
      desc: "Des recettes bien plus concentrées : production ×25, clic ×45, arcade ×3, " +
            "chance ×9. Chères à préparer, dévastatrices une fois bues.",
      req: function (S) { return S.features.boosts && S.gens.trounoir >= 5; }
    },

    /* --- agrandissements de l'équipe, payés en Graines d'Or --- */
    {
      id: 'petteam2', name: 'Second Enclos', icon: 'assets/upgrades/nurserie.png',
      cost: 0, costSeeds: 6, kind: 'élevage',
      short: 'Un second animal actif',
      desc: "Un deuxième emplacement dans l'équipe : deux animaux donnent désormais " +
            "leur bonus en même temps.",
      req: function (S) { return S.features.pets && S.prestigeCount >= 1; }
    },
    {
      id: 'petteam3', name: 'Troisième Enclos', icon: 'assets/upgrades/nurserie.png',
      cost: 0, costSeeds: 30, kind: 'élevage',
      short: 'Un troisième animal actif',
      desc: "Encore un enclos. La ménagerie commence à ressembler à quelque chose.",
      req: function (S) { return S.features.petteam2 && S.prestigeCount >= 3; }
    },
    {
      id: 'petteam4', name: 'Grande Ménagerie', icon: 'assets/upgrades/nurserie.png',
      cost: 0, costSeeds: 120, kind: 'élevage',
      short: 'Un quatrième animal actif',
      desc: "Quatre animaux de front. Au-delà, le vétérinaire a refusé de signer.",
      req: function (S) { return S.features.petteam3 && S.prestigeCount >= 6; }
    }
  ];

  EXTRA.forEach(function (f) {
    f.index = global.FEATURES.length;
    global.FEATURES.push(f);
    global.FEATURE_BY_ID[f.id] = f;
  });
})(window);

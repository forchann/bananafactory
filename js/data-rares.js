/* Banana Factory - collection de bananes rares */
(function (global) {
  'use strict';

  /*
   * rarity  : peu-commune | rare | epique | legendaire | mythique
   * effect  : { type, value } ou tableau d'effets
   *   prod    +% production globale        click   +% puissance de clic
   *   luck    +% chance de trouver         crit    +% chance de critique
   *   token   +% jetons gagnés             mini    +% récompenses de minijeu
   *   boost   +% durée des boosts          seed    +% graines d'or au prestige
   *   offline +% efficacité hors-ligne     golden  +% fréquence des bananes dorées
   * source  : drop (aléatoire) | defi | mini | marche | prestige
   */
  var RARES = [
    // ---------------------------------------------------------- PEU COMMUNES
    { id: 'verte', name: 'Banane Verte', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'prod', value: 2 }, desc: "Pas tout à fait mûre, mais pleine de promesses." },
    { id: 'tachetee', name: 'Banane Tachetée', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'prod', value: 3 }, desc: "Ses taches dessinent une carte au trésor. Peut-être." },
    { id: 'naine', name: 'Banane Naine', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'click', value: 3 }, desc: "Petite mais increvable. Tient dans la poche." },
    { id: 'rouge', name: 'Banane Rouge', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'prod', value: 3 }, desc: "Goût de framboise. Personne ne sait pourquoi." },
    { id: 'plantain', name: 'Banane Plantain', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'prod', value: 4 }, desc: "Se mange cuite. Refuse catégoriquement le dessert." },
    { id: 'jumelle', name: 'Banane Jumelle', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'luck', value: 3 }, desc: "Deux bananes dans une seule peau. Deux fois la chance." },
    { id: 'carree', name: 'Banane Carrée', rarity: 'peu-commune', source: 'defi',
      effect: { type: 'click', value: 4 }, desc: "S'empile parfaitement. Un cauchemar ergonomique." },
    { id: 'boomerang', name: 'Banane Boomerang', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'crit', value: 2 }, desc: "Revient toujours. Même quand on ne veut pas." },
    { id: 'poilue', name: 'Banane Poilue', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'prod', value: 3 }, desc: "Le duvet la protège du froid. Et des regards." },
    { id: 'givree', name: 'Banane Givrée', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'boost', value: 5 }, desc: "Conservée à -18°C depuis l'ère glaciaire." },
    { id: 'pixel', name: 'Banane Pixel', rarity: 'peu-commune', source: 'mini',
      effect: { type: 'mini', value: 5 }, desc: "16 couleurs, zéro compromis." },
    { id: 'salee', name: 'Banane Salée', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'token', value: 5 }, desc: "Tombée dans la mer. Devenue rentable." },
    { id: 'bleue', name: 'Banane Bleue de Java', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'prod', value: 4 }, desc: "Un goût de glace à la vanille. Sans le froid." },
    { id: 'ratatinee', name: 'Banane Ratatinée', rarity: 'peu-commune', source: 'defi',
      effect: { type: 'offline', value: 5 }, desc: "Oubliée trois semaines. Toujours vaillante." },

    // ----------------------------------------------------------------- RARES
    { id: 'cristal', name: 'Banane de Cristal', rarity: 'rare', source: 'drop',
      effect: { type: 'prod', value: 6 }, desc: "Translucide. On voit les graines à travers." },
    { id: 'volcanique', name: 'Banane Volcanique', rarity: 'rare', source: 'drop',
      effect: { type: 'click', value: 8 }, desc: "Récoltée sur les pentes du Kilauea. Encore tiède." },
    { id: 'fantome', name: 'Banane Fantôme', rarity: 'rare', source: 'drop',
      effect: { type: 'luck', value: 6 }, desc: "Elle traverse les paniers. Difficile à stocker." },
    { id: 'electrique', name: 'Banane Électrique', rarity: 'rare', source: 'drop',
      effect: { type: 'crit', value: 4 }, desc: "Ne jamais l'éplucher pieds nus." },
    { id: 'robotique', name: 'Banane Robotique', rarity: 'rare', source: 'drop',
      effect: { type: 'prod', value: 7 }, desc: "Chrome et servomoteurs. Toujours comestible." },
    { id: 'pirate', name: 'Banane Pirate', rarity: 'rare', source: 'marche',
      effect: { type: 'token', value: 10 }, desc: "Cache-œil, perroquet, et un sacré sens des affaires." },
    { id: 'ninja', name: 'Banane Ninja', rarity: 'rare', source: 'drop',
      effect: { type: 'click', value: 8 }, desc: "Vous l'avez déjà mangée. Vous ne l'avez pas vue." },
    { id: 'radioactive', name: 'Banane Radioactive', rarity: 'rare', source: 'drop',
      effect: { type: 'prod', value: 8 }, desc: "Toutes les bananes le sont un peu. Celle-ci beaucoup." },
    { id: 'arcenciel', name: 'Banane Arc-en-ciel', rarity: 'rare', source: 'drop',
      effect: { type: 'golden', value: 10 }, desc: "Sept couleurs, sept saveurs, une seule peau." },
    { id: 'bonbon', name: 'Banane Bonbon', rarity: 'rare', source: 'mini',
      effect: { type: 'boost', value: 10 }, desc: "Goût chimique assumé. Nostalgie garantie." },
    { id: 'cactus', name: 'Banane Cactus', rarity: 'rare', source: 'drop',
      effect: { type: 'prod', value: 6 }, desc: "L'expérience du labo n°14. On ne recommencera pas." },
    { id: 'meduse', name: 'Banane Méduse', rarity: 'rare', source: 'mini',
      effect: { type: 'mini', value: 10 }, desc: "Bioluminescente et légèrement urticante." },
    { id: 'champignon', name: 'Banane Champignon', rarity: 'rare', source: 'defi',
      effect: { type: 'luck', value: 7 }, desc: "Pousse dans le noir. Multiplie la chance." },
    { id: 'momie', name: 'Banane Momie', rarity: 'rare', source: 'defi',
      effect: { type: 'offline', value: 10 }, desc: "Bandelettes d'origine. 3000 ans au compteur." },

    // --------------------------------------------------------------- ÉPIQUES
    { id: 'doree', name: "Banane d'Or", rarity: 'epique', source: 'drop',
      effect: { type: 'prod', value: 12 }, desc: "24 carats de potassium pur." },
    { id: 'diamant', name: 'Banane de Diamant', rarity: 'epique', source: 'drop',
      effect: { type: 'prod', value: 15 }, desc: "Indestructible. Immangeable. Magnifique." },
    { id: 'dragon', name: 'Banane Dragon', rarity: 'epique', source: 'drop',
      effect: { type: 'click', value: 15 }, desc: "Écailleuse, fumante, et de très mauvaise humeur." },
    { id: 'royale', name: 'Banane Royale', rarity: 'epique', source: 'marche',
      effect: { type: 'token', value: 20 }, desc: "Couronnée à la naissance. Ne se courbe devant personne." },
    { id: 'celeste', name: 'Banane Céleste', rarity: 'epique', source: 'drop',
      effect: { type: 'golden', value: 20 }, desc: "Tombée du ciel un soir de pluie d'étoiles." },
    { id: 'zombie', name: 'Banane Zombie', rarity: 'epique', source: 'defi',
      effect: { type: 'offline', value: 20 }, desc: "Pourrie depuis des mois. Toujours en activité." },
    { id: 'samourai', name: 'Banane Samouraï', rarity: 'epique', source: 'drop',
      effect: { type: 'crit', value: 8 }, desc: "Une seule coupe. Toujours parfaite." },
    { id: 'vampire', name: 'Banane Vampire', rarity: 'epique', source: 'drop',
      effect: { type: 'click', value: 14 }, desc: "Se nourrit du jus des autres bananes." },
    { id: 'sirene', name: 'Banane Sirène', rarity: 'epique', source: 'mini',
      effect: { type: 'mini', value: 18 }, desc: "Son chant attire les singes vers les récifs." },
    { id: 'astronaute', name: 'Banane Astronaute', rarity: 'epique', source: 'drop',
      effect: { type: 'prod', value: 13 }, desc: "A fait 412 fois le tour de la Terre." },
    { id: 'chevalier', name: 'Banane Chevalier', rarity: 'epique', source: 'defi',
      effect: { type: 'prod', value: 14 }, desc: "Armure complète. Peau incluse." },
    { id: 'sorciere', name: 'Banane Sorcière', rarity: 'epique', source: 'drop',
      effect: { type: 'luck', value: 14 }, desc: "Transforme les mauvaises récoltes en bonnes." },

    // ----------------------------------------------------------- LÉGENDAIRES
    { id: 'phenix', name: 'Banane Phénix', rarity: 'legendaire', source: 'drop',
      effect: { type: 'prod', value: 25 }, desc: "Brûle, meurt, renaît, et se fait manger. En boucle." },
    { id: 'galactique', name: 'Banane Galactique', rarity: 'legendaire', source: 'drop',
      effect: { type: 'prod', value: 30 }, desc: "Contient une galaxie naine dans sa pulpe." },
    { id: 'chaos', name: 'Banane du Chaos', rarity: 'legendaire', source: 'defi',
      effect: { type: 'crit', value: 15 }, desc: "Ses lois physiques changent toutes les heures." },
    { id: 'temporelle', name: 'Banane Temporelle', rarity: 'legendaire', source: 'defi',
      effect: { type: 'boost', value: 30 }, desc: "Mûrit avant d'avoir poussé." },
    { id: 'quantique', name: 'Banane Quantique', rarity: 'legendaire', source: 'drop',
      effect: { type: 'luck', value: 25 }, desc: "Mûre et verte tant que personne ne regarde." },
    { id: 'prismatique', name: 'Banane Prismatique', rarity: 'legendaire', source: 'mini',
      effect: { type: 'golden', value: 35 }, desc: "Décompose la lumière en pur potassium." },
    { id: 'eternelle', name: 'Banane Éternelle', rarity: 'legendaire', source: 'defi',
      effect: { type: 'offline', value: 40 }, desc: "Ne mûrit jamais. Ne pourrit jamais. Attend." },
    { id: 'titan', name: 'Banane Titan', rarity: 'legendaire', source: 'drop',
      effect: { type: 'click', value: 30 }, desc: "Quarante mètres de long. Deux tonnes de bonne humeur." },
    { id: 'leviathan', name: 'Banane Léviathan', rarity: 'legendaire', source: 'prestige',
      effect: { type: 'seed', value: 25 }, desc: "Dort au fond des fosses. Rêve de plantations." },

    // -------------------------------------------------------------- MYTHIQUES
    { id: 'originelle', name: 'Banane Originelle', rarity: 'mythique', source: 'drop',
      effect: { type: 'prod', value: 50 }, desc: "La toute première. Celle dont descendent les autres." },
    { id: 'infinie', name: 'Banane Infinie', rarity: 'mythique', source: 'defi',
      effect: { type: 'prod', value: 75 }, desc: "On l'épluche indéfiniment. Il y a toujours une peau." },
    { id: 'vide', name: 'Banane du Vide', rarity: 'mythique', source: 'prestige',
      effect: { type: 'seed', value: 50 }, desc: "Une absence de banane si intense qu'elle en devient une." },
    { id: 'divine', name: 'Banane Divine', rarity: 'mythique', source: 'defi',
      effect: { type: 'prod', value: 100 }, desc: "Le fruit défendu était une banane. C'est confirmé." },
    { id: 'alphaomega', name: 'Banane Alpha & Oméga', rarity: 'mythique', source: 'defi',
      effect: [ { type: 'prod', value: 25 }, { type: 'click', value: 25 }, { type: 'luck', value: 25 } ],
      desc: "Le début et la fin de toute chose fruitière." }
  ];

  var RARITY = {
    'peu-commune': { label: 'Peu commune', weight: 50, color: '#7ec850', tokens: 1 },
    'rare':        { label: 'Rare',        weight: 26, color: '#4aa3ff', tokens: 3 },
    'epique':      { label: 'Épique',      weight: 14, color: '#b866ff', tokens: 8 },
    'legendaire':  { label: 'Légendaire',  weight: 6,  color: '#ffa32e', tokens: 20 },
    'mythique':    { label: 'Mythique',    weight: 2,  color: '#ff4d6d', tokens: 60 }
  };

  var RARITY_ORDER = ['peu-commune', 'rare', 'epique', 'legendaire', 'mythique'];

  var BY_ID = {};
  RARES.forEach(function (r, i) {
    r.index = i;
    r.icon = 'assets/rares/' + r.id + '.png';
    r.effects = Array.isArray(r.effect) ? r.effect : [r.effect];
    BY_ID[r.id] = r;
  });

  /* Libellé lisible d'un effet, ex : "+12% production globale" */
  var EFFECT_LABEL = {
    prod: 'production globale',
    click: 'puissance de clic',
    luck: 'chance de trouver une rare',
    crit: 'chance de critique',
    token: 'jetons gagnés',
    mini: 'récompenses de minijeu',
    boost: 'durée des boosts',
    seed: "graines d'or au prestige",
    offline: 'efficacité hors-ligne',
    golden: 'fréquence des bananes dorées'
  };

  function describeEffects(rare) {
    return rare.effects.map(function (e) {
      return '+' + e.value + '% ' + (EFFECT_LABEL[e.type] || e.type);
    }).join(', ');
  }

  global.RARES = RARES;
  global.RARE_BY_ID = BY_ID;
  global.RARITY = RARITY;
  global.RARITY_ORDER = RARITY_ORDER;
  global.EFFECT_LABEL = EFFECT_LABEL;
  global.describeRareEffects = describeEffects;
})(window);

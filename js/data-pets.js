/* Banana Factory - la Nurserie : 56 espèces d'animaux de compagnie
 *
 * Chaque animal apporte un bonus permanent tant qu'il est placé dans l'équipe.
 * Deux animaux peuvent être FUSIONNÉS : les deux parents disparaissent et
 * donnent naissance à un seul petit, souvent d'une espèce supérieure.
 *
 * Sept paliers de rareté, du Commun au Primordial. Les 42 recettes ci-dessous
 * dessinent un arbre complet : on part de deux singes trouvés dans un œuf et
 * on remonte, fusion après fusion, jusqu'à l'Ouroboros.
 */
(function (global) {
  'use strict';

  /*
   * breedMs : durée de couvaison pour obtenir CE palier
   * costMult: multiplicateur du prix de fusion (× la production par seconde)
   */
  var TIERS = {
    commun:     { label: 'Commun',     color: '#9fb8a2', weight: 100,  breedMs: 90000,   costMult: 60 },
    rare:       { label: 'Rare',       color: '#6ec6ff', weight: 44,   breedMs: 180000,  costMult: 220 },
    epique:     { label: 'Épique',     color: '#b866ff', weight: 18,   breedMs: 360000,  costMult: 700 },
    legendaire: { label: 'Légendaire', color: '#ffa32e', weight: 7,    breedMs: 720000,  costMult: 2200 },
    mythique:   { label: 'Mythique',   color: '#ff4d6d', weight: 2.4,  breedMs: 1200000, costMult: 7000 },
    divin:      { label: 'Divin',      color: '#4de2d0', weight: 0.8,  breedMs: 1800000, costMult: 22000 },
    primordial: { label: 'Primordial', color: '#fff1a8', weight: 0.25, breedMs: 2700000, costMult: 70000 }
  };

  var TIER_ORDER = ['commun', 'rare', 'epique', 'legendaire', 'mythique', 'divin', 'primordial'];

  var PETS = [
    // ------------------------------------------------------------- COMMUNS
    { id: 'singe', name: 'Ouistiti Cueilleur', tier: 'commun',
      effect: { type: 'prod', value: 5 }, desc: "Le premier compagnon de toute plantation." },
    { id: 'toucan', name: 'Toucan Bavard', tier: 'commun',
      effect: { type: 'luck', value: 4 }, desc: "Il repère les fruits mûrs et le crie à tout le monde." },
    { id: 'grenouille', name: 'Grenouille Bondissante', tier: 'commun',
      effect: { type: 'click', value: 5 }, desc: "Elle saute sur les régimes. Ça compte comme un clic." },
    { id: 'tortue', name: 'Tortue Patiente', tier: 'commun',
      effect: { type: 'offline', value: 6 }, desc: "Elle continue pendant que vous dormez. Lentement." },
    { id: 'ecureuil', name: 'Écureuil Prévoyant', tier: 'commun',
      effect: { type: 'token', value: 5 }, desc: "Il cache des jetons partout. Il en oublie la moitié." },
    { id: 'chauvesouris', name: 'Chauve-Souris Nocturne', tier: 'commun',
      effect: { type: 'golden', value: 5 }, desc: "Elle voit les bananes dorées dans le noir." },
    { id: 'lezard', name: 'Lézard Vif', tier: 'commun',
      effect: { type: 'crit', value: 2 }, desc: "Immobile, puis soudain plus là du tout." },
    { id: 'papillon', name: 'Papillon Bleu', tier: 'commun',
      effect: { type: 'boost', value: 5 }, desc: "Il fait durer les bonnes choses un peu plus longtemps." },
    { id: 'crabe', name: 'Crabe Pinceur', tier: 'commun',
      effect: { type: 'click', value: 4 }, desc: "Deux pinces, zéro finesse, beaucoup d'efficacité." },
    { id: 'poussin', name: 'Poussin Curieux', tier: 'commun',
      effect: { type: 'prod', value: 4 }, desc: "Il picore les graines tombées. Il en replante." },
    { id: 'herisson', name: 'Hérisson Piquant', tier: 'commun',
      effect: { type: 'crit', value: 2 }, desc: "Il perce les peaux les plus épaisses." },
    { id: 'escargot', name: 'Escargot Tenace', tier: 'commun',
      effect: { type: 'offline', value: 7 }, desc: "Il traverse la plantation. Ça lui prend la nuit." },
    { id: 'rat', name: 'Rat Négociant', tier: 'commun',
      effect: { type: 'token', value: 6 }, desc: "Il connaît quelqu'un qui connaît quelqu'un." },
    { id: 'poisson', name: 'Poisson Tropical', tier: 'commun',
      effect: { type: 'mini', value: 6 }, desc: "Il porte chance dans les salles d'arcade. Allez savoir." },

    // ---------------------------------------------------------------- RARES
    { id: 'paresseux', name: 'Paresseux Zen', tier: 'rare',
      effect: { type: 'offline', value: 14 }, desc: "Il n'a jamais rien fait vite. Il a toujours fini à temps." },
    { id: 'perroquet', name: 'Ara Flamboyant', tier: 'rare',
      effect: { type: 'token', value: 12 }, desc: "Il répète les cours du marché. Souvent avec un jour d'avance." },
    { id: 'capybara', name: 'Capybara Serein', tier: 'rare',
      effect: { type: 'prod', value: 10 }, desc: "Rien ne l'atteint. La plantation s'en trouve apaisée." },
    { id: 'cameleon', name: 'Caméléon Prismatique', tier: 'rare',
      effect: { type: 'luck', value: 11 }, desc: "Il prend la couleur des spécimens rares pour les approcher." },
    { id: 'lemurien', name: 'Lémurien Acrobate', tier: 'rare',
      effect: { type: 'click', value: 12 }, desc: "Huit régimes par branche, sans jamais poser les pieds." },
    { id: 'tatou', name: 'Tatou Blindé', tier: 'rare',
      effect: { type: 'crit', value: 5 }, desc: "Il se roule en boule et démolit les troncs récalcitrants." },
    { id: 'fourmilier', name: 'Fourmilier Aspirateur', tier: 'rare',
      effect: { type: 'mini', value: 13 }, desc: "Il nettoie les tables d'arcade entre deux parties." },
    { id: 'pangolin', name: 'Pangolin Doré', tier: 'rare',
      effect: { type: 'prod', value: 11 }, desc: "Ses écailles valent une fortune. Il refuse de les vendre." },
    { id: 'axolotl', name: 'Axolotl Éternel', tier: 'rare',
      effect: { type: 'boost', value: 13 }, desc: "Il repousse tout ce qu'il perd. Y compris sa bonne humeur." },
    { id: 'ouistiti', name: 'Ouistiti Pygmée', tier: 'rare',
      effect: { type: 'click', value: 11 }, desc: "Minuscule, rapide, et légèrement insupportable." },
    { id: 'colibri', name: 'Colibri Éclair', tier: 'rare',
      effect: { type: 'golden', value: 13 }, desc: "Quatre-vingts battements d'ailes par seconde de pure efficacité." },
    { id: 'piranha', name: 'Piranha Vorace', tier: 'rare',
      effect: { type: 'crit', value: 5 }, desc: "Il épluche un régime en onze secondes chrono." },

    // -------------------------------------------------------------- ÉPIQUES
    { id: 'jaguar', name: 'Jaguar Tacheté', tier: 'epique',
      effect: { type: 'click', value: 24 }, desc: "Le seigneur de la canopée. Il tolère votre présence." },
    { id: 'gorille', name: 'Gorille Contremaître', tier: 'epique',
      effect: { type: 'prod', value: 22 }, desc: "Il ne travaille pas : il organise. C'est pire." },
    { id: 'python', name: 'Python Émeraude', tier: 'epique',
      effect: { type: 'luck', value: 21 }, desc: "Il connaît chaque cachette de la plantation." },
    { id: 'aigle', name: 'Aigle Solaire', tier: 'epique',
      effect: { type: 'golden', value: 26 }, desc: "Il repère une banane dorée à quatre kilomètres." },
    { id: 'panthere', name: 'Panthère d\'Ombre', tier: 'epique',
      effect: { type: 'crit', value: 9 }, desc: "Vous ne la voyez jamais. Le travail est fait quand même." },
    { id: 'crocodile', name: 'Crocodile Ancestral', tier: 'epique',
      effect: { type: 'click', value: 25 }, desc: "Il n'a pas changé depuis cent millions d'années. Inutile." },
    { id: 'okapi', name: 'Okapi Discret', tier: 'epique',
      effect: { type: 'seed', value: 18 }, desc: "On l'a longtemps cru légendaire. Il préférait ça." },
    { id: 'casoar', name: 'Casoar Casqué', tier: 'epique',
      effect: { type: 'mini', value: 27 }, desc: "Champion incontesté de tous les minijeux. Ne pas contester." },
    { id: 'scorpion', name: 'Scorpion Obsidienne', tier: 'epique',
      effect: { type: 'crit', value: 10 }, desc: "Une seule frappe, toujours au bon endroit." },
    { id: 'raie', name: 'Raie Manta Céleste', tier: 'epique',
      effect: { type: 'offline', value: 28 }, desc: "Elle plane au-dessus de la plantation, toute la nuit." },

    // ----------------------------------------------------------- LÉGENDAIRES
    { id: 'tigreblanc', name: 'Tigre Blanc Sacré', tier: 'legendaire',
      effect: { type: 'prod', value: 48 }, desc: "Un seul rugissement, et toute la vallée fructifie." },
    { id: 'phenix', name: 'Phénix Écarlate', tier: 'legendaire',
      effect: { type: 'golden', value: 55 }, desc: "Il brûle la plantation et la fait repousser, plus dense." },
    { id: 'griffon', name: 'Griffon Vigilant', tier: 'legendaire',
      effect: { type: 'click', value: 52 }, desc: "Serres d'aigle, force de lion, appétit des deux." },
    { id: 'licorne', name: 'Licorne des Brumes', tier: 'legendaire',
      effect: { type: 'luck', value: 45 }, desc: "Sa corne détecte les spécimens que nul n'a jamais vus." },
    { id: 'kirin', name: 'Kirin Bienveillant', tier: 'legendaire',
      effect: { type: 'seed', value: 38 }, desc: "Il n'écrase pas un brin d'herbe. Les graines l'adorent." },
    { id: 'basilic', name: 'Basilic Couronné', tier: 'legendaire',
      effect: { type: 'crit', value: 18 }, desc: "Un regard suffit à faire tomber les régimes." },
    { id: 'sphinx', name: 'Sphinx Énigmatique', tier: 'legendaire',
      effect: { type: 'mini', value: 55 }, desc: "Il pose une devinette avant chaque partie. Il triche." },
    { id: 'cerbere', name: 'Cerbère Trois-Têtes', tier: 'legendaire',
      effect: { type: 'boost', value: 50 }, desc: "Trois gueules, trois smoothies, aucun partage." },

    // -------------------------------------------------------------- MYTHIQUES
    { id: 'dragon', name: 'Dragon de la Canopée', tier: 'mythique',
      effect: { type: 'prod', value: 110 }, desc: "Il dort sur un trésor de bananes. Il compte chaque soir." },
    { id: 'hydre', name: 'Hydre Bananière', tier: 'mythique',
      effect: { type: 'click', value: 120 }, desc: "Coupez un régime, il en repousse deux. Enfin une bonne nouvelle." },
    { id: 'chimere', name: 'Chimère Composite', tier: 'mythique',
      effect: { type: 'luck', value: 95 }, desc: "Trois animaux, une seule obsession fruitière." },
    { id: 'leviathan', name: 'Léviathan des Fonds', tier: 'mythique',
      effect: { type: 'offline', value: 130 }, desc: "Il remonte une fois par nuit. La récolte est colossale." },
    { id: 'behemoth', name: 'Béhémoth de Pierre', tier: 'mythique',
      effect: { type: 'prod', value: 115 }, desc: "Chacun de ses pas laboure un hectare." },
    { id: 'ziz', name: 'Ziz des Tempêtes', tier: 'mythique',
      effect: { type: 'golden', value: 125 }, desc: "Ses ailes déployées cachent le soleil. Et font pleuvoir de l'or." },

    // ----------------------------------------------------------------- DIVINS
    { id: 'quetzalcoatl', name: 'Quetzalcóatl', tier: 'divin',
      effect: [ { type: 'prod', value: 200 }, { type: 'luck', value: 120 } ],
      desc: "Le serpent à plumes a enseigné la culture de la banane aux hommes." },
    { id: 'amaterasu', name: 'Renard Solaire', tier: 'divin',
      effect: [ { type: 'golden', value: 220 }, { type: 'boost', value: 150 } ],
      desc: "Là où il passe, il fait toujours l'heure dorée." },
    { id: 'ganesha', name: 'Éléphant Prospère', tier: 'divin',
      effect: [ { type: 'token', value: 240 }, { type: 'seed', value: 90 } ],
      desc: "Il écarte les obstacles. Surtout les obstacles comptables." },
    { id: 'fenrir', name: 'Fenrir Enchaîné', tier: 'divin',
      effect: [ { type: 'click', value: 260 }, { type: 'crit', value: 30 } ],
      desc: "Les chaînes ont cédé. La récolte aussi." },

    // ------------------------------------------------------------ PRIMORDIAUX
    { id: 'yggdrasil', name: 'Esprit d\'Yggdrasil', tier: 'primordial',
      effect: [ { type: 'prod', value: 420 }, { type: 'seed', value: 200 }, { type: 'offline', value: 250 } ],
      desc: "L'arbre-monde tient neuf royaumes. Il en cultive un dixième, en secret." },
    { id: 'ouroboros', name: 'Ouroboros Doré', tier: 'primordial',
      effect: [ { type: 'prod', value: 400 }, { type: 'click', value: 400 }, { type: 'luck', value: 300 } ],
      desc: "Fin et commencement de toute lignée. Il est son propre ancêtre." }
  ];

  /*
   * Recettes de fusion : deux parents donnent à coup sûr l'espèce indiquée.
   * La clé est le couple d'identifiants triés alphabétiquement.
   */
  var RECIPE_PAIRS = [
    // communs -> rares
    ['singe', 'tortue', 'paresseux'],
    ['toucan', 'poussin', 'perroquet'],
    ['rat', 'tortue', 'capybara'],
    ['lezard', 'papillon', 'cameleon'],
    ['chauvesouris', 'singe', 'lemurien'],
    ['herisson', 'tortue', 'tatou'],
    ['escargot', 'rat', 'fourmilier'],
    ['herisson', 'lezard', 'pangolin'],
    ['grenouille', 'poisson', 'axolotl'],
    ['ecureuil', 'singe', 'ouistiti'],
    ['papillon', 'toucan', 'colibri'],
    ['crabe', 'poisson', 'piranha'],

    // rares -> épiques
    ['cameleon', 'piranha', 'jaguar'],
    ['capybara', 'ouistiti', 'gorille'],
    ['axolotl', 'pangolin', 'python'],
    ['colibri', 'perroquet', 'aigle'],
    ['lemurien', 'tatou', 'panthere'],
    ['fourmilier', 'piranha', 'crocodile'],
    ['capybara', 'paresseux', 'okapi'],
    ['colibri', 'tatou', 'casoar'],
    ['fourmilier', 'pangolin', 'scorpion'],
    ['axolotl', 'piranha', 'raie'],

    // épiques -> légendaires
    ['jaguar', 'panthere', 'tigreblanc'],
    ['aigle', 'scorpion', 'phenix'],
    ['aigle', 'jaguar', 'griffon'],
    ['colibri', 'okapi', 'licorne'],
    ['okapi', 'python', 'kirin'],
    ['casoar', 'python', 'basilic'],
    ['casoar', 'panthere', 'sphinx'],
    ['crocodile', 'scorpion', 'cerbere'],

    // légendaires -> mythiques
    ['basilic', 'kirin', 'dragon'],
    ['basilic', 'cerbere', 'hydre'],
    ['cerbere', 'griffon', 'chimere'],
    ['basilic', 'raie', 'leviathan'],
    ['gorille', 'tigreblanc', 'behemoth'],
    ['griffon', 'licorne', 'ziz'],

    // mythiques -> divins
    ['dragon', 'hydre', 'quetzalcoatl'],
    ['chimere', 'phenix', 'amaterasu'],
    ['behemoth', 'sphinx', 'ganesha'],
    ['behemoth', 'ziz', 'fenrir'],

    // divins -> primordiaux
    ['ganesha', 'quetzalcoatl', 'yggdrasil'],
    ['amaterasu', 'fenrir', 'ouroboros']
  ];

  var RECIPES = {};
  function key(a, b) { return a < b ? a + '+' + b : b + '+' + a; }
  RECIPE_PAIRS.forEach(function (r) { RECIPES[key(r[0], r[1])] = r[2]; });

  var BY_ID = {};
  var BY_TIER = {};
  TIER_ORDER.forEach(function (t) { BY_TIER[t] = []; });

  PETS.forEach(function (p, i) {
    p.index = i;
    p.icon = 'assets/pets/' + p.id + '.png';
    p.effects = Array.isArray(p.effect) ? p.effect : [p.effect];
    BY_ID[p.id] = p;
    BY_TIER[p.tier].push(p);
  });

  function describeEffects(pet) {
    return pet.effects.map(function (e) {
      return '+' + e.value + '% ' + (global.EFFECT_LABEL[e.type] || e.type);
    }).join(', ');
  }

  /* Espèce obtenue par une recette, ou null s'il n'y en a pas. */
  function recipeFor(a, b) { return RECIPES[key(a, b)] || null; }

  /* Toutes les recettes dont `id` est le résultat — sert à l'affichage. */
  function recipesFor(id) {
    return RECIPE_PAIRS.filter(function (r) { return r[2] === id; })
      .map(function (r) { return { a: r[0], b: r[1] }; });
  }

  function tierIndex(tier) { return TIER_ORDER.indexOf(tier); }
  function tierAt(i) { return TIER_ORDER[global.U.clamp(i, 0, TIER_ORDER.length - 1)]; }

  global.PET_SPECIES = PETS;
  global.PET_BY_ID = BY_ID;
  global.PET_BY_TIER = BY_TIER;
  global.PET_TIERS = TIERS;
  global.PET_TIER_ORDER = TIER_ORDER;
  global.PET_RECIPES = RECIPES;
  global.petRecipeFor = recipeFor;
  global.petRecipesFor = recipesFor;
  global.petTierIndex = tierIndex;
  global.petTierAt = tierAt;
  global.describePetEffects = describeEffects;
})(window);

/* Banana Factory - améliorations chiffrées (hors découvertes) */
(function (global) {
  'use strict';

  var UPGRADES = [];

  function add(u) { UPGRADES.push(u); return u; }

  /* ------------------------------------------------------------ CLIC */
  var CLICK_NAMES = [
    ['Doigt Agile',        "Un entraînement quotidien. Le pouce prend du muscle.",            'gant'],
    ['Double Prise',       "Deux mains valent mieux qu'une, surtout pour un régime.",         'gant'],
    ['Machette Aiguisée',  "Une lame bien affûtée coupe deux fois plus de bananes.",          'machette'],
    ['Échelle Télescopique',"On atteint enfin les régimes du haut, les plus généreux.",        'echelle'],
    ['Gantelet du Cueilleur',"Forgé par un singe forgeron. Oui, ça existe.",                  'gant'],
    ['Bras Bionique',      "Servomoteurs titane, 900 récoltes par minute.",                   'robot'],
    ['Poigne Sismique',    "Chaque clic fait trembler la plantation entière.",                'machette'],
    ['Main de Midas',      "Tout ce qu'elle touche devient banane.",                          'cristal'],
    ['Doigt Cosmique',     "Il traverse les dimensions pour cueillir ailleurs.",              'fusee'],
    ['Clic Absolu',        "La notion même de clic atteint sa forme parfaite.",               'cristal']
  ];
  var CLICK_COSTS = [200, 2500, 30000, 400000, 8e6, 2e8, 6e9, 2e11, 8e12, 4e14];
  CLICK_NAMES.forEach(function (n, i) {
    add({
      id: 'click' + (i + 1), name: n[0], desc: n[1], icon: 'assets/upgrades/' + n[2] + '.png',
      cat: 'clic', cost: CLICK_COSTS[i], type: 'click', value: 2,
      effectText: "Puissance de clic ×2",
      req: function (S) { return S.stats.clicks >= 30; }
    });
  });

  add({
    id: 'clickbps1', name: 'Cueillette Assistée', desc: "Vos ouvriers vous prêtent main-forte à chaque clic.",
    icon: 'assets/upgrades/panier.png', cat: 'clic', cost: 1e6, type: 'clickbps', value: 0.02,
    effectText: "Chaque clic rapporte en plus 2% de votre production par seconde",
    req: function (S) { return S.upgrades.click4; }
  });
  add({
    id: 'clickbps2', name: 'Cueillette Coordonnée', desc: "Toute la plantation clique avec vous.",
    icon: 'assets/upgrades/panier.png', cat: 'clic', cost: 5e9, type: 'clickbps', value: 0.06,
    effectText: "Chaque clic rapporte en plus 6% de votre production par seconde",
    req: function (S) { return S.upgrades.clickbps1; }
  });
  add({
    id: 'clickbps3', name: 'Cueillette Totale', desc: "Un clic, et l'usine entière se vide dans votre panier.",
    icon: 'assets/upgrades/panier.png', cat: 'clic', cost: 2e13, type: 'clickbps', value: 0.15,
    effectText: "Chaque clic rapporte en plus 15% de votre production par seconde",
    req: function (S) { return S.upgrades.clickbps2; }
  });

  /* ---------------------------------------------------------- GLOBAL */
  var GLOBAL_DEFS = [
    ['Engrais Maison',      "Recette secrète à base de peaux compostées.",                'engrais',    8000,  1.5],
    ['Irrigation Goutte',   "Chaque plant reçoit exactement ce qu'il lui faut.",          'arrosoir',   90000, 1.5],
    ['Ruches Pollinisatrices',"Des abeilles motivées triplent la fructification.",         'ruche',      1.2e6, 1.6],
    ['Camion Réfrigéré',    "Zéro perte entre le champ et l'entrepôt.",                   'camion',     2e7,   1.6],
    ['Café pour Tous',      "La productivité grimpe. Le sommeil disparaît.",              'cafe',       4e8,   1.7],
    ['Sélection Génétique', "On ne garde que les meilleures lignées.",                    'dna',        9e9,   1.7],
    ['Aimant à Potassium',  "Attire le potassium de toute la région.",                    'aimant',     2e11,  1.8],
    ['Batterie Solaire',    "Le soleil travaille aussi la nuit maintenant.",              'batterie',   6e12,  1.8],
    ['Rouages Éternels',    "Plus une seule pièce ne s'use, jamais.",                     'engrenage',  2e14,  2.0],
    ['Terraformation',      "On repeint la planète en jaune. C'est plus pratique.",       'fusee',      8e15,  2.2],
    ['Physique Assouplie',  "On a négocié avec les lois de la nature.",                   'cristal',    4e17,  2.5],
    ['Décret Bananier',     "Le potassium est déclaré force fondamentale.",               'parchemin',  2e19,  3.0]
  ];
  GLOBAL_DEFS.forEach(function (d, i) {
    add({
      id: 'glob' + (i + 1), name: d[0], desc: d[1], icon: 'assets/upgrades/' + d[2] + '.png',
      cat: 'globale', cost: d[3], type: 'global', value: d[4],
      effectText: "Production globale ×" + d[4],
      req: function (S) { return S.totalBananas >= d[3] / 4; }
    });
  });

  /* -------------------------------------------------- PAR PRODUCTEUR */
  /* Quatre paliers par producteur : possédé 10 / 25 / 50 / 100 */
  var GEN_TIER_REQ = [10, 25, 50, 100];
  var GEN_TIER_COST = [12, 140, 2600, 60000];
  var GEN_TIER_NAME = ['Outillage', 'Optimisation', 'Surrégime', 'Perfection'];
  var GEN_TIER_FLAVOR = [
    "Du matériel neuf change tout.",
    "Chaque geste inutile a été supprimé.",
    "On a retiré les limiteurs de sécurité.",
    "Il n'y a plus rien à améliorer. Et pourtant si."
  ];

  global.GENERATORS.forEach(function (g) {
    GEN_TIER_REQ.forEach(function (need, t) {
      add({
        id: 'gen_' + g.id + '_' + t, name: GEN_TIER_NAME[t] + ' — ' + g.name,
        desc: GEN_TIER_FLAVOR[t], icon: g.icon,
        cat: 'producteur', gen: g.id,
        cost: g.cost * GEN_TIER_COST[t], type: 'gen', target: g.id, value: 2,
        effectText: g.name + " ×2",
        req: (function (gid, n) {
          return function (S) { return S.gens[gid] >= n; };
        })(g.id, need)
      });
    });
  });

  /* ------------------------------------------------------- SYNERGIES */
  add({
    id: 'syn_rares1', name: 'Vitrine de Collection', desc: "Exposer sa collection, c'est déjà la faire fructifier.",
    icon: 'assets/upgrades/vitrine.png', cat: 'spéciale', cost: 5e7, type: 'raresyn', value: 0.5,
    effectText: "+0,5% de production globale par banane rare possédée",
    req: function (S) { return S.raresFound >= 8; }
  });
  add({
    id: 'syn_rares2', name: 'Musée du Potassium', desc: "Les visiteurs paient. En bananes.",
    icon: 'assets/upgrades/vitrine.png', cat: 'spéciale', cost: 3e11, type: 'raresyn', value: 1,
    effectText: "+1% supplémentaire de production globale par banane rare possédée",
    req: function (S) { return S.raresFound >= 25; }
  });
  add({
    id: 'syn_luck1', name: 'Œil de Lynx', desc: "Vous repérez un spécimen rare à trente mètres.",
    icon: 'assets/upgrades/loupe.png', cat: 'spéciale', cost: 2e8, type: 'luck', value: 60,
    effectText: "+60% de chance de trouver une banane rare",
    req: function (S) { return S.raresFound >= 12; }
  });
  add({
    id: 'syn_luck2', name: 'Sixième Sens Fruitier', desc: "Vous les sentez avant de les voir.",
    icon: 'assets/upgrades/loupe.png', cat: 'spéciale', cost: 5e12, type: 'luck', value: 120,
    effectText: "+120% de chance de trouver une banane rare",
    req: function (S) { return S.raresFound >= 30; }
  });
  add({
    id: 'syn_token1', name: 'Monnaie Locale', desc: "Le jeton de la plantation vaut de l'or.",
    icon: 'assets/upgrades/comptoir.png', cat: 'spéciale', cost: 8e8, type: 'token', value: 50,
    effectText: "+50% de jetons gagnés partout",
    req: function (S) { return S.stats.miniPlayed >= 5; }
  });
  add({
    id: 'syn_mini1', name: 'Entraînement Intensif', desc: "Les minijeux, ça se travaille.",
    icon: 'assets/upgrades/trophee.png', cat: 'spéciale', cost: 4e9, type: 'mini', value: 75,
    effectText: "+75% de récompenses dans tous les minijeux",
    req: function (S) { return S.stats.miniPlayed >= 15; }
  });
  add({
    id: 'syn_golden1', name: 'Appât Sucré', desc: "Les bananes dorées ne résistent pas à l'odeur.",
    icon: 'assets/upgrades/filet.png', cat: 'spéciale', cost: 1.5e9, type: 'golden', value: 60,
    effectText: "Bananes dorées 60% plus fréquentes, et elles restent plus longtemps",
    req: function (S) { return S.stats.goldenClicked >= 10; }
  });
  add({
    id: 'syn_offline1', name: 'Veilleur de Nuit', desc: "Quelqu'un continue pendant que vous dormez.",
    icon: 'assets/upgrades/horloge.png', cat: 'spéciale', cost: 6e10, type: 'offline', value: 50,
    effectText: "+50% d'efficacité hors-ligne, et la durée maximale passe à 12h",
    req: function (S) { return S.totalBananas >= 1e10; }
  });

  var BY_ID = {};
  UPGRADES.forEach(function (u, i) { u.index = i; BY_ID[u.id] = u; });

  global.UPGRADES = UPGRADES;
  global.UPGRADE_BY_ID = BY_ID;
})(window);

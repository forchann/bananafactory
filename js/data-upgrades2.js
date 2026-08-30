/* Banana Factory - améliorations ajoutées par le Grand Patch
 *
 * Prolonge data-upgrades.js sans y toucher :
 *   - six paliers de clic et huit paliers globaux au-delà de l'ancien plafond ;
 *   - deux paliers de producteur supplémentaires (200 et 350 exemplaires) pour
 *     les vingt-et-un producteurs, anciens comme nouveaux ;
 *   - les synergies des systèmes inédits (élevage, casino, hors-ligne étendu).
 *
 * À charger APRÈS data-upgrades.js (et donc après data-generators2.js).
 */
(function (global) {
  'use strict';

  var UPGRADES = global.UPGRADES;
  function add(u) {
    u.index = UPGRADES.length;
    UPGRADES.push(u);
    global.UPGRADE_BY_ID[u.id] = u;
    return u;
  }

  /* ------------------------------------------------------------ CLIC === */

  var CLICK_NAMES = [
    ['Phalange Quantique',  "Elle cueille dans plusieurs réalités à la fois.",        'cristal',  2e16],
    ['Index Stellaire',     "Un doigt de la taille d'une naine blanche.",             'fusee',    1e18],
    ['Paume Galactique',    "Elle referme sur un bras spiral entier.",                'cristal',  5e19],
    ['Geste Primordial',    "Le mouvement d'où découlent tous les autres.",           'relique',  3e21],
    ['Volonté Pure',        "Plus besoin de doigt. L'intention suffit.",              'couronne', 2e23],
    ['Clic Souverain',      "Un seul clic, et la notion de récolte est close.",       'couronne', 1e25]
  ];
  CLICK_NAMES.forEach(function (n, i) {
    add({
      id: 'click' + (i + 11), name: n[0], desc: n[1],
      icon: 'assets/upgrades/' + n[2] + '.png',
      cat: 'clic', cost: n[3], type: 'click', value: 2,
      effectText: "Puissance de clic ×2",
      req: function (S) { return S.upgrades.click10; }
    });
  });

  add({
    id: 'clickbps4', name: 'Cueillette Absolue', desc: "Chaque clic vide la plantation entière dans votre panier.",
    icon: 'assets/upgrades/panier.png', cat: 'clic', cost: 6e16, type: 'clickbps', value: 0.35,
    effectText: "Chaque clic rapporte en plus 35% de votre production par seconde",
    req: function (S) { return S.upgrades.clickbps3; }
  });

  /* ---------------------------------------------------------- GLOBAL === */

  var GLOBAL_DEFS = [
    ['Photosynthèse Forcée', "On a convaincu les feuilles de faire des heures.",      'engrais',   1e21, 3.0],
    ['Gravité Assistée',     "Les régimes tombent vers le hangar. Directement.",      'aimant',    5e22, 3.0],
    ['Moisson Quantique',    "Récoltée et non récoltée : on encaisse les deux.",      'cristal',   3e24, 3.5],
    ['Bail Interstellaire',  "Douze planètes louées à des conditions correctes.",     'fusee',     2e26, 3.5],
    ['Charte du Potassium',  "Les lois physiques ont signé. Sous la contrainte.",     'parchemin', 1e28, 4.0],
    ['Économie Circulaire',  "Les peaux redeviennent des bananes. Personne ne demande comment.", 'engrenage', 8e29, 4.0],
    ['Rendement Absolu',     "Il n'existe plus de perte, nulle part, jamais.",        'couronne',  6e31, 5.0],
    ['Décret Originel',      "Il était écrit que la plantation ne connaîtrait pas de fin.", 'banniere', 5e33, 6.0]
  ];
  GLOBAL_DEFS.forEach(function (d, i) {
    add({
      id: 'glob' + (i + 13), name: d[0], desc: d[1],
      icon: 'assets/upgrades/' + d[2] + '.png',
      cat: 'globale', cost: d[3], type: 'global', value: d[4],
      effectText: "Production globale ×" + d[4],
      req: (function (cost) {
        return function (S) { return S.totalBananas >= cost / 4; };
      })(d[3])
    });
  });

  /* ------------------------------------------- PRODUCTEURS : PALIERS 5-6 */

  var DEEP_TIERS = [
    { need: 200, mult: 3e6,  name: 'Démesure',  flavor: "Deux cents exemplaires. Le sol s'affaisse un peu." },
    { need: 350, mult: 9e7,  name: 'Apothéose', flavor: "On ne les compte plus, on les pèse." }
  ];

  global.GENERATORS.forEach(function (g) {
    DEEP_TIERS.forEach(function (t, i) {
      add({
        id: 'gen_' + g.id + '_deep' + i, name: t.name + ' — ' + g.name,
        desc: t.flavor, icon: g.icon,
        cat: 'producteur', gen: g.id,
        cost: g.cost * t.mult, type: 'gen', target: g.id, value: 3,
        effectText: g.name + " ×3",
        req: (function (gid, need) {
          return function (S) { return (S.gens[gid] || 0) >= need; };
        })(g.id, t.need)
      });
    });
  });

  /* -------------------------------------------------------- SYNERGIES == */

  add({
    id: 'syn_rares3', name: 'Galerie Nationale', desc: "L'album est devenu une institution culturelle.",
    icon: 'assets/upgrades/vitrine.png', cat: 'spéciale', cost: 5e14, type: 'raresyn', value: 2,
    effectText: "+2% supplémentaires de production globale par banane rare possédée",
    req: function (S) { return S.raresFound >= 55; }
  });
  add({
    id: 'syn_rares4', name: 'Patrimoine Mondial', desc: "Cent bananes rares sous vitrine blindée.",
    icon: 'assets/upgrades/vitrine.png', cat: 'spéciale', cost: 2e18, type: 'raresyn', value: 3,
    effectText: "+3% supplémentaires de production globale par banane rare possédée",
    req: function (S) { return S.raresFound >= 85; }
  });
  add({
    id: 'syn_luck3', name: 'Instinct du Botaniste', desc: "Vous ne cherchez plus : vous savez.",
    icon: 'assets/upgrades/loupe.png', cat: 'spéciale', cost: 8e15, type: 'luck', value: 250,
    effectText: "+250% de chance de trouver une banane rare",
    req: function (S) { return S.raresFound >= 70; }
  });
  add({
    id: 'syn_token2', name: 'Banque de la Canopée', desc: "Elle frappe sa propre monnaie. Personne n'a rien dit.",
    icon: 'assets/upgrades/comptoir.png', cat: 'spéciale', cost: 4e13, type: 'token', value: 120,
    effectText: "+120% de jetons gagnés partout",
    req: function (S) { return S.upgrades.syn_token1; }
  });
  add({
    id: 'syn_mini2', name: 'Salle de Sport Arcade', desc: "Vous vous entraînez à des jeux d'arcade. Assumez.",
    icon: 'assets/upgrades/trophee.png', cat: 'spéciale', cost: 6e13, type: 'mini', value: 150,
    effectText: "+150% de récompenses dans tous les minijeux",
    req: function (S) { return S.stats.miniPlayed >= 60; }
  });
  add({
    id: 'syn_golden2', name: 'Phéromone Dorée', desc: "Les bananes dorées viennent d'elles-mêmes. C'est presque gênant.",
    icon: 'assets/upgrades/filet.png', cat: 'spéciale', cost: 2e14, type: 'golden', value: 120,
    effectText: "Bananes dorées 120% plus fréquentes",
    req: function (S) { return S.stats.goldenClicked >= 60; }
  });
  add({
    id: 'syn_offline2', name: 'Équipe de Nuit', desc: "Trois-huit intégral. Les singes ont négocié les primes.",
    icon: 'assets/upgrades/horloge.png', cat: 'spéciale', cost: 3e14, type: 'offline', value: 100,
    effectText: "+100% d'efficacité hors-ligne, et la durée maximale passe à 24h",
    req: function (S) { return S.upgrades.syn_offline1; }
  });
  add({
    id: 'syn_offline3', name: 'Plantation Autonome', desc: "Elle n'a plus vraiment besoin de vous. Elle est polie.",
    icon: 'assets/upgrades/clepsydre.png', cat: 'spéciale', cost: 5e18, type: 'offline', value: 200,
    effectText: "+200% d'efficacité hors-ligne, et la durée maximale passe à 48h",
    req: function (S) { return S.upgrades.syn_offline2; }
  });

  /* ---------------------------------------------------------- ÉLEVAGE == */

  add({
    id: 'petsyn1', name: 'Dressage Attentif', desc: "Un animal bien traité travaille beaucoup mieux.",
    icon: 'assets/upgrades/nurserie.png', cat: 'élevage', cost: 2e11, type: 'petsyn', value: 50,
    effectText: "+50% à tous les bonus des animaux de compagnie",
    req: function (S) { return S.features.pets && S.petsOwned >= 3; }
  });
  add({
    id: 'petsyn2', name: 'Complicité Totale', desc: "Ils anticipent vos gestes. C'est un peu inquiétant.",
    icon: 'assets/upgrades/nurserie.png', cat: 'élevage', cost: 9e14, type: 'petsyn', value: 120,
    effectText: "+120% à tous les bonus des animaux de compagnie",
    req: function (S) { return S.upgrades.petsyn1; }
  });
  add({
    id: 'petsyn3', name: 'Lien Ancestral', desc: "Vous et la ménagerie ne faites plus qu'une seule récolte.",
    icon: 'assets/upgrades/banniere.png', cat: 'élevage', cost: 4e19, type: 'petsyn', value: 250,
    effectText: "+250% à tous les bonus des animaux de compagnie",
    req: function (S) { return S.upgrades.petsyn2; }
  });
  add({
    id: 'breed1', name: 'Couveuse Chauffante', desc: "Les œufs éclosent nettement plus vite au chaud.",
    icon: 'assets/upgrades/oeuf.png', cat: 'élevage', cost: 5e11, type: 'breed', value: 60,
    effectText: "Fusions 60% plus rapides",
    req: function (S) { return S.features.breeding; }
  });
  add({
    id: 'breed2', name: 'Accélérateur Génétique', desc: "Neuf générations en une après-midi.",
    icon: 'assets/upgrades/fusion.png', cat: 'élevage', cost: 2e16, type: 'breed', value: 150,
    effectText: "Fusions 150% plus rapides",
    req: function (S) { return S.upgrades.breed1; }
  });

  /* ----------------------------------------------------------- CASINO == */

  add({
    id: 'casino1', name: 'Compteur de Cartes', desc: "Le croupier vous regarde de travers. Il a raison.",
    icon: 'assets/casino/cartes.png', cat: 'casino', cost: 8e12, type: 'casino', value: 1.5,
    effectText: "+1,5% sur tous les gains du Casino",
    req: function (S) { return S.features.casino && S.stats.casinoPlays >= 20; }
  });
  add({
    id: 'casino2', name: 'Dés Pipés', desc: "Personne n'a rien vu. Surtout pas vous.",
    icon: 'assets/upgrades/des.png', cat: 'casino', cost: 6e15, type: 'casino', value: 1.5,
    effectText: "+1,5% supplémentaires sur tous les gains du Casino",
    req: function (S) { return S.upgrades.casino1 && S.stats.casinoPlays >= 100; }
  });
  add({
    id: 'casino3', name: 'Part du Patron', desc: "Vous avez racheté le casino. Le casino ne le sait pas encore.",
    icon: 'assets/upgrades/couronne.png', cat: 'casino', cost: 3e19, type: 'casino', value: 1,
    effectText: "+1% supplémentaire sur tous les gains du Casino",
    req: function (S) { return S.upgrades.casino2 && S.stats.casinoWins >= 200; }
  });
})(window);

/* Banana Factory - découvertes : chaque achat débloque une mécanique ou un minijeu */
(function (global) {
  'use strict';

  /*
   * Les "Découvertes" sont le cœur de la progression : chacune coûte des bananes
   * et ajoute un véritable élément de gameplay (ou un minijeu complet).
   * req : condition d'apparition dans la liste (sinon on ne la voit même pas)
   */
  var FEATURES = [
    {
      id: 'combo', name: 'Gants Antidérapants', icon: 'assets/upgrades/gant.png',
      cost: 120, kind: 'mécanique',
      short: 'Combo de clics',
      desc: "Cliquer sans relâche fait monter un combo qui multiplie chaque récolte. " +
            "Le combo retombe si vous vous arrêtez plus de 2 secondes.",
      req: function (S) { return S.stats.clicks >= 25; }
    },
    {
      id: 'crit', name: 'Machette Affûtée', icon: 'assets/upgrades/machette.png',
      cost: 900, kind: 'mécanique',
      short: 'Coups critiques',
      desc: "Vos clics ont une chance de trancher un régime entier : ×12 bananes " +
            "sur le clic, avec une gerbe de pixels dorés.",
      req: function (S) { return S.gens.singe >= 5; }
    },
    {
      id: 'rares', name: 'Loupe du Botaniste', icon: 'assets/upgrades/loupe.png',
      cost: 4000, kind: 'collection',
      short: 'Bananes rares & Album',
      desc: "Vous savez enfin reconnaître les spécimens rares. 54 bananes uniques " +
            "à dénicher, chacune offrant un bonus permanent. L'Album s'ouvre.",
      req: function (S) { return S.gens.plantation >= 3; }
    },
    {
      id: 'golden', name: 'Filet à Papillons', icon: 'assets/upgrades/filet.png',
      cost: 25000, kind: 'mécanique',
      short: 'Bananes dorées',
      desc: "Des bananes dorées traversent l'écran de temps en temps. Attrapez-les " +
            "pour déclencher une Frénésie, une Pluie d'or ou un jackpot.",
      req: function (S) { return S.gens.plantation >= 10; }
    },
    {
      id: 'mg_tri', name: 'Table de Tri', icon: 'assets/minigames/mg_tri.png',
      cost: 120000, kind: 'minijeu',
      short: 'Minijeu : Tri Express',
      desc: "Un tapis roulant défile. Gardez les bananes mûres, jetez les pourries. " +
            "Trois erreurs et la partie s'arrête.",
      req: function (S) { return S.gens.tapis >= 1; }
    },
    {
      id: 'challenges', name: 'Carnet de Défis', icon: 'assets/upgrades/parchemin.png',
      cost: 400000, kind: 'collection',
      short: 'Défis à collectionner',
      desc: "Une longue liste d'objectifs. Chaque défi accompli offre des jetons, " +
            "et les plus durs débloquent des bananes rares introuvables autrement.",
      req: function (S) { return S.features.rares && S.raresFound >= 3; }
    },
    {
      id: 'boosts', name: 'Mixeur à Smoothies', icon: 'assets/upgrades/mixeur.png',
      cost: 1500000, kind: 'mécanique',
      short: 'Smoothies (boosts actifs)',
      desc: "Transformez des bananes en smoothies : des boosts temporaires que vous " +
            "déclenchez quand vous voulez (production ×7, clics ×15, jetons doublés).",
      req: function (S) { return S.gens.presse >= 5; }
    },
    {
      id: 'mg_peel', name: 'Éplucheuse Turbo', icon: 'assets/minigames/mg_peel.png',
      cost: 6000000, kind: 'minijeu',
      short: 'Minijeu : Peel Rush',
      desc: "20 secondes pour éplucher un maximum de bananes. Chaque banane demande " +
            "la bonne direction de balayage : haut, bas, gauche, droite.",
      req: function (S) { return S.gens.presse >= 15; }
    },
    {
      id: 'mg_memoire', name: 'Tambours du Chef', icon: 'assets/minigames/mg_memoire.png',
      cost: 40000000, kind: 'minijeu',
      short: 'Minijeu : Mémoire du Singe',
      desc: "Le grand singe tape une séquence sur ses tambours. Reproduisez-la. " +
            "Elle s'allonge à chaque manche, et le gain double.",
      req: function (S) { return S.gens.robot >= 10; }
    },
    {
      id: 'market', name: 'Comptoir du Marché', icon: 'assets/upgrades/comptoir.png',
      cost: 250000000, kind: 'mécanique',
      short: 'Marché aux bananes',
      desc: "Le cours de la banane fluctue en continu. Vendez au sommet pour empocher " +
            "des jetons, et gardez un œil sur les lots rares mis aux enchères.",
      req: function (S) { return S.gens.serre >= 5; }
    },
    {
      id: 'mg_match', name: 'Trieuse Optique', icon: 'assets/minigames/mg_match.png',
      cost: 1500000000, kind: 'minijeu',
      short: 'Minijeu : Banana Match',
      desc: "Une grille de fruits. Échangez deux cases voisines pour aligner trois " +
            "bananes ou plus. 45 secondes pour faire exploser le score.",
      req: function (S) { return S.gens.usine >= 10; }
    },
    {
      id: 'mutation', name: 'Chambre de Mutation', icon: 'assets/upgrades/dna.png',
      cost: 12000000000, kind: 'mécanique',
      short: 'Mutation dirigée',
      desc: "Dépensez des jetons pour forcer l'apparition d'une banane rare, ou " +
            "cibler une rareté précise. Le hasard n'a plus son mot à dire.",
      req: function (S) { return S.gens.labo >= 5; }
    },
    {
      id: 'mg_tresor', name: 'Carte au Trésor', icon: 'assets/minigames/mg_tresor.png',
      cost: 90000000000, kind: 'minijeu',
      short: 'Minijeu : Chasse au Trésor',
      desc: "Une grille de terre à creuser. Les chiffres indiquent les pièges voisins. " +
            "Déterrez les coffres sans réveiller les singes hurleurs.",
      req: function (S) { return S.gens.temple >= 5; }
    },
    {
      id: 'contracts', name: 'Registre de la Coopérative', icon: 'assets/upgrades/parchemin.png',
      cost: 25000000000, kind: 'mécanique',
      short: 'Contrats à durée limitée',
      desc: "La coopérative vous confie des commandes chronométrées : produire tant de bananes, " +
            "gagner tant de parties, dénicher tant de rares. Les honorer d'affilée fait monter " +
            "une série qui gonfle les récompenses.",
      req: function (S) { return S.gens.temple >= 1; }
    },
    {
      id: 'prestige', name: 'Autel de la Grande Récolte', icon: 'assets/upgrades/autel.png',
      cost: 150000000000, kind: 'méta',
      short: 'Prestige : la Grande Récolte',
      desc: "Rendez toute votre plantation à la terre pour récolter des Graines d'Or. " +
            "Chaque graine augmente définitivement toute votre production.",
      req: function (S) { return S.totalBananas >= 8e10; }
    },
    {
      id: 'mg_roue', name: 'Roue de la Fortune', icon: 'assets/minigames/mg_roue.png',
      cost: 5000000000, kind: 'minijeu',
      short: 'Minijeu : Roue de la Fortune',
      desc: "Une roue, douze cases, un jeton par tour. Bananes, boosts, jetons, " +
            "et une case qui offre directement une banane rare.",
      req: function (S) { return S.prestigeCount >= 1; }
    },
    {
      id: 'mg_course', name: 'Piste de la Jungle', icon: 'assets/minigames/mg_course.png',
      cost: 400000000000, kind: 'minijeu',
      short: 'Minijeu : Course de la Jungle',
      desc: "Votre singe court dans la canopée. Sautez les rochers, glissez sous les " +
            "lianes, ramassez tout ce qui brille. La vitesse augmente sans arrêt.",
      req: function (S) { return S.prestigeCount >= 1 && S.gens.portail >= 1; }
    },
    {
      id: 'relics', name: 'Sanctuaire des Reliques', icon: 'assets/upgrades/relique.png',
      cost: 0, costSeeds: 3, kind: 'méta',
      short: 'Arbre de reliques',
      desc: "Investissez vos Graines d'Or dans des reliques permanentes : elles " +
            "survivent à toutes les Grandes Récoltes et se cumulent sans limite.",
      req: function (S) { return S.prestigeCount >= 2; }
    },
    {
      id: 'automation', name: 'Contremaître Robot', icon: 'assets/upgrades/contremaitre.png',
      cost: 0, costSeeds: 25, kind: 'mécanique',
      short: 'Achat automatique',
      desc: "Un contremaître achète pour vous le producteur le plus rentable dès que " +
            "vous en avez les moyens. Réglable, désactivable, infatigable.",
      req: function (S) { return S.prestigeCount >= 3; }
    }
  ];

  var BY_ID = {};
  FEATURES.forEach(function (f, i) { f.index = i; BY_ID[f.id] = f; });

  global.FEATURES = FEATURES;
  global.FEATURE_BY_ID = BY_ID;
})(window);

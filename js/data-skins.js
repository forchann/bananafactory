/* Banana Factory - la Garde-Robe : apparences de la banane principale
 *
 * Les skins sont purement cosmétiques : ils ne donnent aucun bonus chiffré.
 * C'est volontaire — la progression reste lisible, et débloquer une apparence
 * reste une récompense de fierté plutôt qu'un palier de puissance.
 *
 * req(S) reçoit l'instantané de G.snapshot().
 */
(function (global) {
  'use strict';

  var SKINS = [
    {
      id: 'classique', name: 'Banane Classique', icon: 'assets/misc/banana_hero.png',
      desc: "L'originale, celle de la toute première récolte.",
      how: "Disponible dès le départ.",
      req: function () { return true; }
    },
    {
      id: 'doree', name: 'Banane Dorée', icon: 'assets/skins/doree.png', aura: 'or',
      desc: "Massive, brillante, absolument pas comestible.",
      how: "Cliquer 5 000 fois.",
      req: function (S) { return S.stats.clicks >= 5000; }
    },
    {
      id: 'tigre', name: 'Banane Tigrée', icon: 'assets/skins/tigre.png',
      desc: "Rayée comme un fauve, douce comme un dessert.",
      how: "Posséder 20 bananes rares différentes.",
      req: function (S) { return S.raresFound >= 20; }
    },
    {
      id: 'pixel', name: 'Banane 8 Bits', icon: 'assets/skins/pixel.png',
      desc: "Seize couleurs, une nostalgie infinie.",
      how: "Acheter 60 améliorations.",
      req: function (S) { return S.stats.upgradesBought >= 60; }
    },
    {
      id: 'glacee', name: 'Banane Glacée', icon: 'assets/skins/glacee.png', aura: 'givre',
      desc: "Sortie du congélateur de l'ère glaciaire.",
      how: "Terminer 25 parties à l'Arcade.",
      req: function (S) { return S.stats.miniPlayed >= 25; }
    },
    {
      id: 'lave', name: 'Banane de Lave', icon: 'assets/skins/lave.png', aura: 'feu',
      desc: "Elle fond son propre présentoir.",
      how: "Déclencher 2 000 coups critiques.",
      req: function (S) { return S.stats.crits >= 2000; }
    },
    {
      id: 'robot', name: 'Banane Robotisée', icon: 'assets/skins/robot.png',
      desc: "Garantie sans conservateur. Garantie sans fruit non plus.",
      how: "Posséder 100 Robots Cueilleurs.",
      req: function (S) { return (S.gens.robot || 0) >= 100; }
    },
    {
      id: 'ninja', name: 'Banane Ninja', icon: 'assets/skins/ninja.png',
      desc: "Elle était déjà épluchée avant que vous ne cliquiez.",
      how: "Atteindre un combo de ×150.",
      req: function (S) { return S.stats.maxCombo >= 150; }
    },
    {
      id: 'zombie', name: 'Banane Zombie', icon: 'assets/skins/zombie.png',
      desc: "Elle a dépassé la date. De beaucoup.",
      how: "Jouer 2 heures en tout.",
      req: function (S) { return S.stats.playTime >= 7200; }
    },
    {
      id: 'momie', name: 'Banane Momifiée', icon: 'assets/skins/momie.png',
      desc: "Bandelettes d'époque, sérieux garanti.",
      how: "Honorer 50 contrats de la Coopérative.",
      req: function (S) { return (S.stats.contractsDone || 0) >= 50; }
    },
    {
      id: 'bonbon', name: 'Banane Bonbon', icon: 'assets/skins/bonbon.png',
      desc: "Arôme banane artificiel. Bien meilleur que la vraie.",
      how: "Attraper 100 bananes dorées.",
      req: function (S) { return S.stats.goldenClicked >= 100; }
    },
    {
      id: 'arlequin', name: 'Banane Arlequin', icon: 'assets/skins/arlequin.png',
      desc: "Elle rit à chaque mise. Surtout aux perdantes.",
      how: "Gagner 25 fois au Casino.",
      req: function (S) { return (S.stats.casinoWins || 0) >= 25; }
    },
    {
      id: 'cristal', name: 'Banane de Cristal', icon: 'assets/skins/cristal.png', aura: 'givre',
      desc: "Taillée dans une seule pièce. On voit les pépins.",
      how: "Accumuler 500 Graines d'Or au total.",
      req: function (S) { return S.totalSeeds >= 500; }
    },
    {
      id: 'fantome', name: 'Banane Fantôme', icon: 'assets/skins/fantome.png', aura: 'spectre',
      desc: "Elle traverse le panier. On s'y habitue.",
      how: "Trouver 200 exemplaires rares (doublons compris).",
      req: function (S) { return S.stats.raresTotal >= 200; }
    },
    {
      id: 'arcenciel', name: 'Banane Arc-en-ciel', icon: 'assets/skins/arcenciel.png', aura: 'prisme',
      desc: "Sept couleurs, sept saveurs, une seule peau.",
      how: "Posséder 60 bananes rares différentes.",
      req: function (S) { return S.raresFound >= 60; }
    },
    {
      id: 'dragon', name: 'Banane Draconique', icon: 'assets/skins/dragon.png', aura: 'feu',
      desc: "Elle couve la plantation comme un trésor.",
      how: "Réussir 30 fusions à la Nurserie.",
      req: function (S) { return (S.stats.petsBred || 0) >= 30; }
    },
    {
      id: 'neon', name: 'Banane Néon', icon: 'assets/skins/neon.png', aura: 'neon',
      desc: "L'enseigne lumineuse du casino, en version comestible.",
      how: "Gagner 100 fois au Casino.",
      req: function (S) { return (S.stats.casinoWins || 0) >= 100; }
    },
    {
      id: 'royale', name: 'Banane Royale', icon: 'assets/skins/royale.png', aura: 'or',
      desc: "Couronnée après la troisième Grande Récolte.",
      how: "Effectuer 3 Grandes Récoltes.",
      req: function (S) { return S.prestigeCount >= 3; }
    },
    {
      id: 'galactique', name: 'Banane Galactique', icon: 'assets/skins/galactique.png', aura: 'prisme',
      desc: "Une galaxie naine tourne dans sa pulpe.",
      how: "Effectuer 10 Grandes Récoltes.",
      req: function (S) { return S.prestigeCount >= 10; }
    }
  ];

  var BY_ID = {};
  SKINS.forEach(function (s, i) { s.index = i; BY_ID[s.id] = s; });

  global.SKINS = SKINS;
  global.SKIN_BY_ID = BY_ID;
})(window);

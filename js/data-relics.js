/* Banana Factory - reliques permanentes achetées avec les Graines d'Or */
(function (global) {
  'use strict';

  /*
   * Les reliques survivent aux Grandes Récoltes.
   * cost(level) = base * growth^level  (en Graines d'Or)
   */
  var RELICS = [
    { id: 'racine', name: 'Racine Ancestrale', icon: 'assets/upgrades/relique.png',
      desc: "Les racines de la première plantation, jamais arrachées.",
      effect: 'prod', per: 5, base: 1, growth: 1.55, max: 60,
      text: function (n) { return '+' + (n * 5) + '% de production globale'; } },
    { id: 'griffe', name: 'Griffe du Singe Ancien', icon: 'assets/upgrades/relique.png',
      desc: "Elle a cueilli plus de bananes que vous n'en verrez jamais.",
      effect: 'click', per: 10, base: 1, growth: 1.55, max: 60,
      text: function (n) { return '+' + (n * 10) + '% de puissance de clic'; } },
    { id: 'jade', name: 'Œil de Jade', icon: 'assets/upgrades/relique.png',
      desc: "Il voit les spécimens rares à travers le feuillage.",
      effect: 'luck', per: 4, base: 2, growth: 1.7, max: 40,
      text: function (n) { return '+' + (n * 4) + '% de chance de trouver une rare'; } },
    { id: 'sablier', name: 'Sablier de Pierre', icon: 'assets/upgrades/relique.png',
      desc: "Le sable y tombe deux fois moins vite. Personne ne sait pourquoi.",
      effect: 'boost', per: 6, base: 2, growth: 1.65, max: 40,
      text: function (n) { return '+' + (n * 6) + '% de durée pour tous les boosts'; } },
    { id: 'totem', name: 'Totem Doré', icon: 'assets/upgrades/relique.png',
      desc: "Sculpté par un peuple qui vénérait déjà la banane dorée.",
      effect: 'golden', per: 6, base: 3, growth: 1.7, max: 35,
      text: function (n) { return '+' + (n * 6) + '% de fréquence des bananes dorées'; } },
    { id: 'coffre', name: 'Coffre du Contremaître', icon: 'assets/upgrades/relique.png',
      desc: "Toujours plein. Personne n'a jamais trouvé la clé.",
      effect: 'token', per: 8, base: 2, growth: 1.68, max: 40,
      text: function (n) { return '+' + (n * 8) + '% de jetons gagnés'; } },
    { id: 'idole', name: 'Idole de Fertilité', icon: 'assets/upgrades/relique.png',
      desc: "Elle sourit quand la récolte est bonne. Elle sourit toujours.",
      effect: 'seed', per: 5, base: 5, growth: 1.9, max: 30,
      text: function (n) { return '+' + (n * 5) + " % de Graines d'Or à chaque Grande Récolte"; } },
    { id: 'lune', name: 'Lune de Potassium', icon: 'assets/upgrades/relique.png',
      desc: "Elle éclaire la plantation pendant votre sommeil.",
      effect: 'offline', per: 10, base: 3, growth: 1.75, max: 30,
      text: function (n) { return '+' + (n * 10) + "% d'efficacité hors-ligne"; } },
    { id: 'volcan', name: 'Cœur du Volcan', icon: 'assets/upgrades/relique.png',
      desc: "Encore chaud. Il bat, très lentement.",
      effect: 'mini', per: 7, base: 3, growth: 1.72, max: 35,
      text: function (n) { return '+' + (n * 7) + '% de récompenses dans les minijeux'; } },
    { id: 'primordiale', name: 'Graine Primordiale', icon: 'assets/upgrades/relique.png',
      desc: "Après chaque Grande Récolte, elle a déjà germé.",
      effect: 'headstart', per: 1, base: 6, growth: 2.1, max: 25,
      text: function (n) {
        return "Après une Grande Récolte, démarrez avec " + global.U.fmtFr(startBananas(n)) + ' bananes';
      } }
  ];

  function startBananas(level) { return level <= 0 ? 0 : 1000 * Math.pow(6, level); }

  var BY_ID = {};
  RELICS.forEach(function (r, i) {
    r.index = i;
    r.cost = (function (rel) {
      return function (level) { return Math.ceil(rel.base * Math.pow(rel.growth, level)); };
    })(r);
    BY_ID[r.id] = r;
  });

  global.RELICS = RELICS;
  global.RELIC_BY_ID = BY_ID;
  global.relicStartBananas = startBananas;
})(window);

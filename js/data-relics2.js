/* Banana Factory - reliques ajoutées par le Grand Patch
 *
 * Six reliques de plus, tournées vers les systèmes inédits (élevage, casino,
 * contrats) et vers la fin de partie. Comme les autres, elles survivent aux
 * Grandes Récoltes et se paient en Graines d'Or.
 *
 * À charger APRÈS data-relics.js.
 */
(function (global) {
  'use strict';

  var EXTRA = [
    { id: 'banniere', name: 'Bannière du Domaine', icon: 'assets/upgrades/banniere.png',
      desc: "Sous ses couleurs, toute la ménagerie travaille de meilleure grâce.",
      effect: 'pet', per: 8, base: 3, growth: 1.7, max: 40,
      text: function (n) { return '+' + (n * 8) + '% à tous les bonus des animaux'; } },

    { id: 'oeufpierre', name: 'Œuf de Pierre', icon: 'assets/upgrades/oeuf.png',
      desc: "Il n'éclora jamais. Mais il presse les autres de le faire.",
      effect: 'breed', per: 12, base: 4, growth: 1.8, max: 30,
      text: function (n) { return 'Fusions ' + (n * 12) + '% plus rapides'; } },

    { id: 'desivoire', name: "Dés d'Ivoire", icon: 'assets/upgrades/des.png',
      desc: "Taillés dans une défense de béhémoth. Ils tombent rarement mal.",
      effect: 'casino', per: 0.5, base: 6, growth: 2.0, max: 8,
      text: function (n) { return '+' + String(n * 0.5).replace('.', ',') + '% sur les gains du Casino'; } },

    { id: 'boussole', name: 'Boussole du Contremaître', icon: 'assets/upgrades/boussole.png',
      desc: "Elle indique le nord, et accessoirement le prochain contrat rentable.",
      effect: 'token', per: 6, base: 3, growth: 1.66, max: 40,
      text: function (n) { return '+' + (n * 6) + '% de jetons gagnés'; } },

    { id: 'clepsydre', name: 'Clepsydre Sans Fond', icon: 'assets/upgrades/clepsydre.png',
      desc: "Elle mesure le temps que vous ne passez pas ici. Généreusement.",
      effect: 'offline', per: 9, base: 5, growth: 1.8, max: 30,
      text: function (n) { return '+' + (n * 9) + "% d'efficacité hors-ligne"; } },

    { id: 'couronne', name: 'Couronne du Premier Régime', icon: 'assets/upgrades/couronne.png',
      desc: "Portée par la toute première banane. Elle n'a jamais été retirée.",
      effect: 'prod', per: 12, base: 12, growth: 2.05, max: 40,
      text: function (n) { return '+' + (n * 12) + '% de production globale'; } }
  ];

  EXTRA.forEach(function (r) {
    r.index = global.RELICS.length;
    r.cost = (function (rel) {
      return function (level) { return Math.ceil(rel.base * Math.pow(rel.growth, level)); };
    })(r);
    global.RELICS.push(r);
    global.RELIC_BY_ID[r.id] = r;
  });
})(window);

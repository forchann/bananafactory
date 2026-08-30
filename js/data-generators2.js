/* Banana Factory - producteurs de fin de partie (extension « Grand Patch »)
 *
 * Ce fichier prolonge la liste de js/data-generators.js sans y toucher : il se
 * contente d'ajouter neuf paliers au-delà du Trou Noir. Il doit être chargé
 * APRÈS data-generators.js (pour la suite) et AVANT data-upgrades.js, qui
 * fabrique automatiquement quatre améliorations par producteur.
 *
 * La courbe reprend exactement le rythme des douze premiers : le prix est
 * multiplié par ~15 et le rendement par ~6,5 à chaque palier.
 */
(function (global) {
  'use strict';

  var EXTRA = [
    {
      id: 'reacteur', name: 'Réacteur Quantique', icon: 'assets/generators/reacteur.png',
      cost: 3e14, growth: 1.15, rate: 4.2e8,
      desc: "Fait entrer la banane en superposition : elle est récoltée et pas récoltée.",
      flavor: "Ne pas observer le réacteur. Il devient timide."
    },
    {
      id: 'nebuleuse', name: 'Nébuleuse Bananière', icon: 'assets/generators/nebuleuse.png',
      cost: 4.5e15, growth: 1.15, rate: 2.7e9,
      desc: "Un nuage de gaz interstellaire qui condense des régimes entiers.",
      flavor: "La poussière d'étoile a un petit goût de banane mûre."
    },
    {
      id: 'quasar', name: 'Quasar Doré', icon: 'assets/generators/quasar.png',
      cost: 7e16, growth: 1.15, rate: 1.8e10,
      desc: "Le jet le plus lumineux de l'univers, entièrement composé de potassium.",
      flavor: "Visible depuis douze galaxies. Ça se voit, une bonne récolte."
    },
    {
      id: 'dyson', name: 'Sphère de Dyson', icon: 'assets/generators/dyson.png',
      cost: 1.1e18, growth: 1.15, rate: 1.2e11,
      desc: "Capte l'intégralité d'une étoile pour mûrir des bananes en gros.",
      flavor: "On a demandé au soleil. Il a dit oui."
    },
    {
      id: 'simulation', name: "Simulateur d'Univers", icon: 'assets/generators/simulation.png',
      cost: 1.8e19, growth: 1.15, rate: 8e11,
      desc: "Simule un cosmos entier dont la seule vocation est la bananiculture.",
      flavor: "Les habitants simulés se doutent de quelque chose."
    },
    {
      id: 'multivers', name: 'Forge du Multivers', icon: 'assets/generators/multivers.png',
      cost: 3e20, growth: 1.15, rate: 5.2e12,
      desc: "Martèle des univers parallèles jusqu'à ce qu'il en tombe des bananes.",
      flavor: "Chaque coup d'enclume crée une réalité. Puis un dessert."
    },
    {
      id: 'chronos', name: 'Moteur Chronos', icon: 'assets/generators/chronos.png',
      cost: 5e21, growth: 1.15, rate: 3.4e13,
      desc: "Récolte aujourd'hui les bananes de la semaine prochaine.",
      flavor: "Le service comptable a renoncé à suivre."
    },
    {
      id: 'conscience', name: 'Conscience Bananière', icon: 'assets/generators/conscience.png',
      cost: 8.5e22, growth: 1.15, rate: 2.2e14,
      desc: "Une intelligence née de la plantation, qui ne pense qu'à une chose.",
      flavor: "Elle a lu tous les livres. Elle veut toujours des bananes."
    },
    {
      id: 'origine', name: 'Arbre Originel', icon: 'assets/generators/origine.png',
      cost: 1.5e24, growth: 1.15, rate: 1.5e15,
      desc: "Le bananier dont descendent tous les autres. Il n'a jamais cessé de porter.",
      flavor: "Ses racines tiennent l'univers. Ses fruits le nourrissent."
    }
  ];

  EXTRA.forEach(function (g) {
    g.index = global.GENERATORS.length;
    global.GENERATORS.push(g);
    global.GEN_BY_ID[g.id] = g;
  });
})(window);

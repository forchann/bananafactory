/* Banana Factory - second album (extension « Grand Patch »)
 *
 * Double la collection : 54 nouveaux spécimens viennent s'ajouter aux 54
 * d'origine, sans en modifier un seul. Deux raretés inédites apparaissent
 * au-dessus de Mythique — Cosmique et Absolue — ainsi que deux nouveaux
 * types d'effet (pet, casino) et deux nouvelles provenances.
 *
 * À charger APRÈS data-rares.js.
 */
(function (global) {
  'use strict';

  /* ------------------------------------------------ NOUVELLES RARETÉS === */

  global.RARITY.cosmique = { label: 'Cosmique', weight: 0.7, color: '#4de2d0', tokens: 180 };
  global.RARITY.absolue  = { label: 'Absolue',  weight: 0.2, color: '#fff1a8', tokens: 500 };
  global.RARITY_ORDER.push('cosmique', 'absolue');

  /* Deux effets supplémentaires, exploités par l'élevage et le casino. */
  global.EFFECT_LABEL.pet = "bonus des animaux de compagnie";
  global.EFFECT_LABEL.casino = "chance au casino";

  /* ------------------------------------------------------- SPÉCIMENS ==== */

  var NEW_RARES = [
    // ---------------------------------------------------------- PEU COMMUNES
    { id: 'lunettes', name: 'Banane à Lunettes', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'mini', value: 5 }, desc: "Elle a lu la notice. Elle est la seule." },
    { id: 'moustache', name: 'Banane à Moustache', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'token', value: 6 }, desc: "Impossible de savoir si elle est déguisée." },
    { id: 'chapeau', name: 'Banane Chapeautée', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'luck', value: 4 }, desc: "Protégée du soleil qui l'a pourtant fait mûrir." },
    { id: 'sportive', name: 'Banane Sportive', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'click', value: 5 }, desc: "Trois marathons. Toujours pas d'ampoules." },
    { id: 'endormie', name: 'Banane Endormie', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'offline', value: 7 }, desc: "Elle travaille en rêve. Le rendement est correct." },
    { id: 'confite', name: 'Banane Confite', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'prod', value: 5 }, desc: "Conservée dans le sucre depuis 1911." },
    { id: 'grillee', name: 'Banane Grillée', rarity: 'peu-commune', source: 'mini',
      effect: { type: 'prod', value: 4 }, desc: "Quinze secondes de trop. Un classique." },
    { id: 'tricotee', name: 'Banane Tricotée', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'boost', value: 6 }, desc: "Sa grand-mère insiste : « il fait frais le soir »." },
    { id: 'bulle', name: 'Banane à Bulles', rarity: 'peu-commune', source: 'drop',
      effect: { type: 'luck', value: 4 }, desc: "Ne pas toucher. Vraiment ne pas toucher." },
    { id: 'ressort', name: 'Banane Ressort', rarity: 'peu-commune', source: 'defi',
      effect: { type: 'crit', value: 3 }, desc: "Elle rebondit jusqu'au plafond. Puis recommence." },

    // ----------------------------------------------------------------- RARES
    { id: 'cyber', name: 'Banane Cybernétique', rarity: 'rare', source: 'drop',
      effect: { type: 'prod', value: 9 }, desc: "Mise à jour disponible. Redémarrer plus tard." },
    { id: 'mage', name: 'Banane Mage', rarity: 'rare', source: 'drop',
      effect: { type: 'luck', value: 8 }, desc: "Elle transforme le plomb en potassium. Presque." },
    { id: 'viking', name: 'Banane Viking', rarity: 'rare', source: 'drop',
      effect: { type: 'click', value: 9 }, desc: "Elle a traversé la mer du Nord dans un drakkar." },
    { id: 'detective', name: 'Banane Détective', rarity: 'rare', source: 'drop',
      effect: { type: 'luck', value: 8 }, desc: "Élémentaire : le coupable était le régime." },
    { id: 'chef', name: 'Banane Chef', rarity: 'rare', source: 'mini',
      effect: { type: 'mini', value: 11 }, desc: "Trois étoiles. Un seul ingrédient." },
    { id: 'surfeuse', name: 'Banane Surfeuse', rarity: 'rare', source: 'drop',
      effect: { type: 'boost', value: 11 }, desc: "Elle attend la vague parfaite depuis six ans." },
    { id: 'pompier', name: 'Banane Pompier', rarity: 'rare', source: 'drop',
      effect: { type: 'prod', value: 8 }, desc: "Elle a sauvé douze bananiers. Et un chat." },
    { id: 'docteur', name: 'Banane Docteur', rarity: 'rare', source: 'drop',
      effect: { type: 'offline', value: 11 }, desc: "Elle prescrit du potassium. Pour tout." },
    { id: 'rockeuse', name: 'Banane Rockeuse', rarity: 'rare', source: 'mini',
      effect: { type: 'click', value: 9 }, desc: "Trois accords, une peau, zéro regret." },
    { id: 'cowboy', name: 'Banane Cowboy', rarity: 'rare', source: 'marche',
      effect: { type: 'token', value: 11 }, desc: "Elle dégaine plus vite que son ombre. Et l'épluche." },
    { id: 'geisha', name: 'Banane Geisha', rarity: 'rare', source: 'marche',
      effect: { type: 'luck', value: 7 }, desc: "Chaque geste est une cérémonie. Même l'épluchage." },
    { id: 'alchimique', name: 'Banane Alchimique', rarity: 'rare', source: 'drop',
      effect: { type: 'prod', value: 8 }, desc: "Le laboratoire n'a jamais retrouvé la formule." },

    // --------------------------------------------------------------- ÉPIQUES
    { id: 'mecha', name: 'Banane Mécha', rarity: 'epique', source: 'drop',
      effect: { type: 'prod', value: 14 }, desc: "Quarante mètres d'acier. Un pilote très motivé." },
    { id: 'pharaon', name: 'Banane Pharaon', rarity: 'epique', source: 'marche',
      effect: { type: 'token', value: 22 }, desc: "Enterrée avec ses trésors. Elle les a gardés." },
    { id: 'yeti', name: 'Banane Yéti', rarity: 'epique', source: 'drop',
      effect: { type: 'prod', value: 14 }, desc: "Aperçue trois fois. Photographiée jamais." },
    { id: 'kraken', name: 'Banane Kraken', rarity: 'epique', source: 'drop',
      effect: { type: 'click', value: 16 }, desc: "Huit bras pour cueillir. C'est de la triche." },
    { id: 'dinosaure', name: 'Banane Dinosaure', rarity: 'epique', source: 'drop',
      effect: { type: 'prod', value: 15 }, desc: "Elle a survécu à la météorite. Par entêtement." },
    { id: 'neon', name: 'Banane Néon', rarity: 'epique', source: 'casino',
      effect: { type: 'golden', value: 22 }, desc: "Elle éclaire toute la salle de jeu." },
    { id: 'magma', name: 'Banane Magma', rarity: 'epique', source: 'drop',
      effect: { type: 'click', value: 15 }, desc: "À consommer avec des gants. Ou jamais." },
    { id: 'sable', name: 'Banane des Sables', rarity: 'epique', source: 'drop',
      effect: { type: 'luck', value: 15 }, desc: "Elle s'écoule entre les doigts et se reforme plus loin." },
    { id: 'porcelaine', name: 'Banane de Porcelaine', rarity: 'epique', source: 'mini',
      effect: { type: 'mini', value: 19 }, desc: "Réparée à l'or fin. Les fêlures sont sa fierté." },
    { id: 'papillon', name: 'Banane Papillon', rarity: 'epique', source: 'drop',
      effect: { type: 'boost', value: 18 }, desc: "Un battement d'aile, et la récolte double ailleurs." },
    { id: 'orage', name: "Banane d'Orage", rarity: 'epique', source: 'drop',
      effect: { type: 'crit', value: 9 }, desc: "Elle attire la foudre. C'est son passe-temps." },
    { id: 'grimoire', name: 'Banane Grimoire', rarity: 'epique', source: 'defi',
      effect: { type: 'offline', value: 21 }, desc: "Elle contient toutes les recettes. Y compris les interdites." },

    // ----------------------------------------------------------- LÉGENDAIRES
    { id: 'seraphin', name: 'Banane Séraphin', rarity: 'legendaire', source: 'drop',
      effect: { type: 'prod', value: 28 }, desc: "Six ailes, aucune main. Elle délègue la cueillette." },
    { id: 'demon', name: 'Banane Démon', rarity: 'legendaire', source: 'drop',
      effect: { type: 'click', value: 32 }, desc: "Elle propose un pacte. Le taux est correct." },
    { id: 'kitsune', name: 'Banane Kitsune', rarity: 'legendaire', source: 'drop',
      effect: { type: 'luck', value: 27 }, desc: "Neuf queues, neuf mensonges, une seule banane." },
    { id: 'aurore', name: 'Banane Aurore', rarity: 'legendaire', source: 'drop',
      effect: { type: 'golden', value: 37 }, desc: "Elle ne se montre qu'aux latitudes extrêmes." },
    { id: 'obsidienne', name: "Banane d'Obsidienne", rarity: 'legendaire', source: 'defi',
      effect: { type: 'crit', value: 16 }, desc: "Tranchante à l'échelle atomique. Éplucher avec prudence." },
    { id: 'horloger', name: 'Banane Horlogère', rarity: 'legendaire', source: 'drop',
      effect: { type: 'boost', value: 32 }, desc: "Elle retarde de trois secondes par siècle. Inacceptable." },
    { id: 'abysse', name: 'Banane Abyssale', rarity: 'legendaire', source: 'mini',
      effect: { type: 'offline', value: 42 }, desc: "Onze mille mètres de fond. Toujours pas épluchée." },
    { id: 'karma', name: 'Banane Karmique', rarity: 'legendaire', source: 'pet',
      effect: { type: 'seed', value: 28 }, desc: "Ce que vous plantez vous revient. Avec les intérêts." },
    { id: 'tornade', name: 'Banane Tornade', rarity: 'legendaire', source: 'mini',
      effect: { type: 'mini', value: 30 }, desc: "Au centre, un calme absolu. Autour, la plantation vole." },
    { id: 'sylvestre', name: 'Banane Sylvestre', rarity: 'legendaire', source: 'drop',
      effect: { type: 'prod', value: 26 }, desc: "Elle est devenue la forêt. La forêt est devenue elle." },

    // -------------------------------------------------------------- MYTHIQUES
    { id: 'bigbang', name: 'Banane Big Bang', rarity: 'mythique', source: 'drop',
      effect: { type: 'prod', value: 90 }, desc: "Au commencement était la banane. Puis tout le reste." },
    { id: 'ouroboros', name: 'Banane Ouroboros', rarity: 'mythique', source: 'drop',
      effect: { type: 'luck', value: 60 }, desc: "Elle se mange elle-même et n'a jamais diminué." },
    { id: 'paradoxe', name: 'Banane Paradoxe', rarity: 'mythique', source: 'defi',
      effect: { type: 'boost', value: 65 }, desc: "Regardée trop longtemps, elle cesse d'exister." },
    { id: 'singularite', name: 'Banane Singularité', rarity: 'mythique', source: 'defi',
      effect: { type: 'click', value: 85 }, desc: "Densité infinie de potassium en un point." },
    { id: 'genese', name: 'Banane Genèse', rarity: 'mythique', source: 'pet',
      effect: { type: 'seed', value: 70 }, desc: "Plantée, elle fait pousser un monde entier." },

    // --------------------------------------------------------------- COSMIQUES
    { id: 'multiversel', name: 'Banane Multiverselle', rarity: 'cosmique', source: 'drop',
      effect: [ { type: 'prod', value: 60 }, { type: 'luck', value: 40 } ],
      desc: "Elle existe dans toutes les réalités. Vous n'en tenez qu'une." },
    { id: 'entropie', name: "Banane d'Entropie", rarity: 'cosmique', source: 'drop',
      effect: [ { type: 'prod', value: 70 }, { type: 'crit', value: 25 } ],
      desc: "Elle se désagrège depuis toujours et n'a jamais fini." },
    { id: 'archetype', name: 'Banane Archétype', rarity: 'cosmique', source: 'pet',
      effect: [ { type: 'click', value: 80 }, { type: 'mini', value: 50 } ],
      desc: "La banane idéale, dont toutes les autres sont de pâles copies." },

    // ---------------------------------------------------------------- ABSOLUES
    { id: 'souveraine', name: 'Banane Souveraine', rarity: 'absolue', source: 'defi',
      effect: [ { type: 'prod', value: 120 }, { type: 'click', value: 120 } ],
      desc: "Elle règne sur les cent-sept autres. Aucune ne conteste." },
    { id: 'neant', name: 'Banane du Néant Absolu', rarity: 'absolue', source: 'defi',
      effect: [ { type: 'prod', value: 150 }, { type: 'seed', value: 100 } ],
      desc: "Il n'y a rien ici. C'est précisément ce qui la rend inestimable." }
  ];

  NEW_RARES.forEach(function (r) {
    r.index = global.RARES.length;
    r.icon = 'assets/rares/' + r.id + '.png';
    r.effects = Array.isArray(r.effect) ? r.effect : [r.effect];
    global.RARES.push(r);
    global.RARE_BY_ID[r.id] = r;
  });
})(window);

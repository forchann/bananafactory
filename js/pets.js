/* Banana Factory - moteur d'élevage : œufs, équipe, fusion
 *
 * Trois idées seulement :
 *   - un œuf donne un animal commun (rarement mieux) ;
 *   - seuls les animaux placés dans l'ÉQUIPE donnent leur bonus ;
 *   - fusionner deux animaux les consomme tous les deux et rend un petit,
 *     souvent d'un palier supérieur. C'est la seule façon d'obtenir les
 *     espèces légendaires et au-delà.
 *
 * La couvaison prend du temps réel : c'est ce qui étale l'élevage sur toute
 * la partie plutôt que de le vider en cinq minutes.
 */
(function (global) {
  'use strict';

  var U = global.U;

  function G() { return global.G; }
  function S() { return global.G.S; }

  /* ============================================================ ÉQUIPE == */

  /* Nombre d'emplacements actifs, agrandi par les découvertes. */
  function teamSize() {
    var f = S().features;
    return 1 + (f.petteam2 ? 1 : 0) + (f.petteam3 ? 1 : 0) + (f.petteam4 ? 1 : 0);
  }

  function team() {
    var st = S().pets;
    return st.team
      .slice(0, teamSize())
      .map(byUid)
      .filter(Boolean);
  }

  function byUid(uid) {
    var owned = S().pets.owned;
    for (var i = 0; i < owned.length; i++) if (owned[i].uid === uid) return owned[i];
    return null;
  }

  function inTeam(uid) { return S().pets.team.indexOf(uid) >= 0; }

  function toggleTeam(uid) {
    var st = S().pets;
    var at = st.team.indexOf(uid);
    if (at >= 0) { st.team.splice(at, 1); }
    else {
      if (st.team.length >= teamSize()) return false;
      if (!byUid(uid)) return false;
      st.team.push(uid);
    }
    G().recompute();
    G().emit('pets', { kind: 'team' });
    return true;
  }

  /* Somme des bonus (%) de l'équipe, amplifiée par les améliorations dédiées. */
  function bonus(type) {
    var total = 0;
    var list = team();
    for (var i = 0; i < list.length; i++) {
      var sp = global.PET_BY_ID[list[i].id];
      if (!sp) continue;
      for (var j = 0; j < sp.effects.length; j++) {
        if (sp.effects[j].type === type) total += sp.effects[j].value;
      }
    }
    if (!total) return 0;
    return total * (1 + amplifier() / 100);
  }

  /* +% appliqué à tous les bonus d'animaux (améliorations et reliques). */
  function amplifier() {
    var v = 0, i;
    for (i = 0; i < global.UPGRADES.length; i++) {
      var u = global.UPGRADES[i];
      if (S().upgrades[u.id] && u.type === 'petsyn') v += u.value;
    }
    v += G().relicBonus('pet');
    return v;
  }

  /* ============================================================== ŒUFS == */

  function speciesCount() {
    var n = 0;
    for (var k in S().pets.discovered) if (S().pets.discovered[k]) n++;
    return n;
  }

  /* Le prix grimpe doucement avec la taille de la collection. */
  function eggCost() { return 30 + 4 * speciesCount(); }

  function buyEgg() {
    if (!S().features.pets) return false;
    var cost = eggCost();
    if (S().tokens < cost) return false;
    S().tokens -= cost;
    S().pets.eggs++;
    G().emit('pets', { kind: 'egg' });
    return true;
  }

  /*
   * Un œuf ne donne jamais mieux qu'une espèce épique : tout le reste de
   * l'arbre passe obligatoirement par la fusion.
   */
  var EGG_TABLE = [
    { tier: 'commun', weight: 84 },
    { tier: 'rare', weight: 14 },
    { tier: 'epique', weight: 2 }
  ];

  function hatch() {
    if (!(S().pets.eggs > 0)) return null;
    S().pets.eggs--;
    var pick = U.weightedPick(EGG_TABLE);
    var pool = global.PET_BY_TIER[pick.tier];
    var sp = U.pick(pool);
    S().stats.petsHatched++;
    var pet = give(sp.id, 'egg');
    G().emit('pets', { kind: 'hatch', pet: pet, species: sp });
    return { pet: pet, species: sp };
  }

  /* Ajoute un animal à la ménagerie. */
  function give(speciesId, source) {
    var sp = global.PET_BY_ID[speciesId];
    if (!sp) return null;
    var st = S().pets;
    var isNew = !st.discovered[speciesId];
    var pet = { uid: st.nextUid++, id: speciesId, born: Date.now() };
    st.owned.push(pet);
    st.discovered[speciesId] = true;
    pet.isNew = isNew;
    /* Le tout premier animal rejoint l'équipe automatiquement. */
    if (st.team.length === 0) st.team.push(pet.uid);
    G().recompute();
    G().emit('pets', { kind: 'gain', pet: pet, species: sp, isNew: isNew, source: source });
    return pet;
  }

  function release(uid) {
    var st = S().pets;
    for (var i = 0; i < st.owned.length; i++) {
      if (st.owned[i].uid !== uid) continue;
      st.owned.splice(i, 1);
      var t = st.team.indexOf(uid);
      if (t >= 0) st.team.splice(t, 1);
      G().recompute();
      G().emit('pets', { kind: 'release' });
      return true;
    }
    return false;
  }

  /* ============================================================ FUSION == */

  /*
   * Palier visé par un croisement. Une recette explicite l'emporte toujours ;
   * sinon on part du plus rare des deux parents.
   */
  function plannedTier(a, b) {
    var recipe = global.petRecipeFor(a.id, b.id);
    if (recipe) return global.PET_BY_ID[recipe].tier;
    var ia = global.petTierIndex(global.PET_BY_ID[a.id].tier);
    var ib = global.petTierIndex(global.PET_BY_ID[b.id].tier);
    return global.petTierAt(Math.max(ia, ib) + (a.id === b.id ? 1 : 0));
  }

  function breedCost(a, b) {
    var tier = global.PET_TIERS[plannedTier(a, b)];
    return Math.max(25000, G().D.bps * tier.costMult);
  }

  function breedMs(a, b) {
    var tier = global.PET_TIERS[plannedTier(a, b)];
    var speed = 1 + (G().relicBonus('breed') + upgradeBreed()) / 100;
    return Math.max(15000, tier.breedMs / speed);
  }

  function upgradeBreed() {
    var v = 0;
    for (var i = 0; i < global.UPGRADES.length; i++) {
      var u = global.UPGRADES[i];
      if (S().upgrades[u.id] && u.type === 'breed') v += u.value;
    }
    return v;
  }

  /* Texte affiché avant de lancer une fusion. */
  function preview(a, b) {
    var recipe = global.petRecipeFor(a.id, b.id);
    if (recipe) {
      return { sure: true, species: global.PET_BY_ID[recipe],
               text: 'Recette connue → ' + global.PET_BY_ID[recipe].name };
    }
    var tier = plannedTier(a, b);
    var label = global.PET_TIERS[tier].label;
    if (a.id === b.id) {
      return { sure: false, tier: tier,
               text: 'Même espèce : 40 % de chance de monter en ' + label };
    }
    return { sure: false, tier: tier,
             text: 'Croisement libre : espèce ' + label + ' au hasard, 12 % de chance de mieux' };
  }

  /* Tirage effectif du petit. */
  function roll(aId, bId) {
    var recipe = global.petRecipeFor(aId, bId);
    if (recipe) return recipe;

    var ia = global.petTierIndex(global.PET_BY_ID[aId].tier);
    var ib = global.petTierIndex(global.PET_BY_ID[bId].tier);
    var target = Math.max(ia, ib);

    if (aId === bId) {
      if (Math.random() < 0.40) target += 1;
    } else if (Math.random() < 0.12) {
      target += 1;
    }

    var pool = global.PET_BY_TIER[global.petTierAt(target)];
    if (!pool || !pool.length) pool = global.PET_BY_TIER[global.petTierAt(Math.max(ia, ib))];
    return U.pick(pool).id;
  }

  function startBreed(uidA, uidB) {
    var st = S().pets;
    if (!S().features.breeding || st.nest) return null;
    if (uidA === uidB) return null;
    var a = byUid(uidA), b = byUid(uidB);
    if (!a || !b) return null;

    var cost = breedCost(a, b);
    if (!G().spend(cost)) return null;

    var resultId = roll(a.id, b.id);
    var ms = breedMs(a, b);

    /* Les deux parents sont consommés immédiatement. */
    release(uidA);
    release(uidB);

    st.nest = {
      a: a.id, b: b.id, result: resultId,
      until: Date.now() + ms, total: ms
    };
    G().emit('pets', { kind: 'breed', nest: st.nest });
    return st.nest;
  }

  function nestProgress() {
    var nest = S().pets.nest;
    if (!nest) return null;
    var left = Math.max(0, nest.until - Date.now());
    return {
      nest: nest,
      secondsLeft: left / 1000,
      ratio: U.clamp(1 - left / nest.total, 0, 1),
      ready: left <= 0
    };
  }

  /* Accélère la couvaison contre des jetons. */
  function rushCost() {
    var p = nestProgress();
    if (!p) return 0;
    return Math.max(1, Math.ceil(p.secondsLeft / 20));
  }

  function rushNest() {
    var p = nestProgress();
    if (!p || p.ready) return false;
    var cost = rushCost();
    if (S().tokens < cost) return false;
    S().tokens -= cost;
    S().pets.nest.until = Date.now();
    G().emit('pets', { kind: 'rush' });
    return true;
  }

  function collectNest() {
    var p = nestProgress();
    if (!p || !p.ready) return null;
    var nest = S().pets.nest;
    S().pets.nest = null;
    S().stats.petsBred++;
    var pet = give(nest.result, 'breed');
    var species = global.PET_BY_ID[nest.result];
    var res = { pet: pet, species: species, isNew: pet && pet.isNew };

    /* Deux bananes rares ne s'obtiennent que par l'élevage. */
    if (species.tier === 'divin' && !S().rares.karma) G().grantRare('karma', 'pet');
    if (species.tier === 'primordial' && !S().rares.genese) G().grantRare('genese', 'pet');
    if (S().stats.petsBred >= 50 && !S().rares.archetype) G().grantRare('archetype', 'pet');

    G().emit('pets', { kind: 'born', result: res });
    return res;
  }

  /* ============================================================== API === */

  global.PETS = {
    bonus: bonus,
    amplifier: amplifier,
    team: team, teamSize: teamSize, inTeam: inTeam, toggleTeam: toggleTeam,
    byUid: byUid, give: give, release: release,
    eggCost: eggCost, buyEgg: buyEgg, hatch: hatch,
    speciesCount: speciesCount,
    breedCost: breedCost, breedMs: breedMs, preview: preview,
    startBreed: startBreed, nestProgress: nestProgress,
    rushCost: rushCost, rushNest: rushNest, collectNest: collectNest
  };
})(window);

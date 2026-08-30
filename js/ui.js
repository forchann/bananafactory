/* Banana Factory - interface : onglets, listes, effets, modales */
(function (global) {
  'use strict';

  var U = global.U, G = global.G, MG = global.MG;
  function sfx(name, params) { if (global.SFX) global.SFX.play(name, params); }

  var TABS = [
    { id: 'usine',        label: 'Usine',        icon: 'assets/generators/usine.png' },
    { id: 'ameliorations',label: 'Améliorations',icon: 'assets/upgrades/engrenage.png' },
    { id: 'decouvertes',  label: 'Découvertes',  icon: 'assets/upgrades/parchemin.png' },
    { id: 'arcade',       label: 'Arcade',       icon: 'assets/misc/token.png',
      need: function (S) { return anyMinigame(S); } },
    { id: 'album',        label: 'Album',        icon: 'assets/misc/book.png',
      need: function (S) { return S.features.rares; } },
    { id: 'defis',        label: 'Défis',        icon: 'assets/misc/trophy.png',
      need: function (S) { return S.features.challenges; } },
    { id: 'contrats',     label: 'Contrats',     icon: 'assets/upgrades/parchemin.png',
      need: function (S) { return S.features.contracts; } },
    { id: 'marche',       label: 'Marché',       icon: 'assets/upgrades/comptoir.png',
      need: function (S) { return S.features.market; } },
    { id: 'reliques',     label: 'Reliques',     icon: 'assets/upgrades/relique.png',
      need: function (S) { return S.features.relics; } },
    { id: 'recolte',      label: 'Grande Récolte', icon: 'assets/misc/seed_gold.png',
      need: function (S) { return S.features.prestige; } },
    { id: 'options',      label: 'Options',      icon: 'assets/upgrades/engrenage.png' }
  ];

  var MINIGAME_FEATURE = {
    tri: 'mg_tri', peel: 'mg_peel', memoire: 'mg_memoire',
    match: 'mg_match', tresor: 'mg_tresor', course: 'mg_course', roue: 'mg_roue',
    /* --- Grand Patch --- */
    ninja: 'mg_ninja', serpent: 'mg_serpent', pile: 'mg_pile',
    cocktail: 'mg_cocktail', taupe: 'mg_taupe'
  };

  function anyMinigame(S) {
    for (var k in MINIGAME_FEATURE) if (S.features[MINIGAME_FEATURE[k]]) return true;
    return false;
  }

  var active = 'usine';
  var views = {};
  var dom = {};
  var lastTabSig = '';

  /* ==================================================== OUTILS DE RENDU == */

  function costRow(text, iconSrc, affordable) {
    var d = U.el('div', 'card-cost' + (affordable ? '' : ' too-expensive'));
    if (iconSrc) d.appendChild(U.icon(iconSrc));
    d.appendChild(document.createTextNode(text));
    return d;
  }

  function sectionHead(title, sub) {
    var h = U.el('div', 'section-head');
    h.appendChild(U.el('h2', null, title));
    if (sub) h.appendChild(U.el('p', null, sub));
    return h;
  }

  /* ========================================================= ONGLETS ==== */

  function visibleTabs() {
    var S = G.S;
    return TABS.filter(function (t) { return !t.need || t.need(S); });
  }

  function tabBadge(id) {
    if (id === 'defis' && G.S.features.challenges) return G.pendingChallenges();
    if (id === 'contrats' && G.S.features.contracts) {
      var p = G.contractProgress();
      return p && p.complete ? 1 : 0;
    }
    if (id === 'decouvertes') {
      return global.FEATURES.filter(function (f) {
        return G.featureVisible(f) && canAffordFeature(f);
      }).length;
    }
    if (id === 'ameliorations') {
      return global.UPGRADES.filter(function (u) {
        return G.upgradeVisible(u) && G.S.bananas >= u.cost;
      }).length;
    }
    return 0;
  }

  function canAffordFeature(f) {
    return (!f.cost || G.S.bananas >= f.cost) && (!f.costSeeds || G.S.seeds >= f.costSeeds);
  }

  function buildTabs() {
    var tabs = visibleTabs();
    var sig = tabs.map(function (t) { return t.id; }).join(',');
    if (sig !== lastTabSig) {
      lastTabSig = sig;
      dom.tabs.innerHTML = '';
      tabs.forEach(function (t) {
        var b = U.el('button', 'tab');
        b.dataset.tab = t.id;
        b.setAttribute('role', 'tab');
        b.appendChild(U.icon(t.icon));
        b.appendChild(U.el('span', null, t.label));
        var badge = U.el('span', 'badge hidden');
        b.appendChild(badge);
        b._badge = badge;
        U.on(b, 'click', function () { switchTab(t.id); });
        dom.tabs.appendChild(b);
      });
      if (!tabs.some(function (t) { return t.id === active; })) active = 'usine';
      renderTab();
    }
    U.qsa('.tab', dom.tabs).forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === active);
      var n = tabBadge(b.dataset.tab);
      b._badge.textContent = n > 99 ? '99+' : n;
      b._badge.classList.toggle('hidden', n <= 0);
    });
  }

  function switchTab(id) {
    if (MG.current) MG.close();
    active = id;
    renderTab();
    buildTabs();
  }

  /*
   * Point d'extension utilisé par js/ui-extra.js : les onglets du Grand Patch
   * s'enregistrent ici plutôt que d'être codés en dur dans TABS.
   * `before` indique devant quel onglet existant s'insérer.
   */
  function registerTab(tab, builder, before) {
    var at = TABS.length;
    if (before) {
      for (var i = 0; i < TABS.length; i++) {
        if (TABS[i].id === before) { at = i; break; }
      }
    }
    TABS.splice(at, 0, tab);
    BUILDERS[tab.id] = builder;
    lastTabSig = '';
  }

  function renderTab() {
    dom.body.innerHTML = '';
    var v = BUILDERS[active] ? BUILDERS[active]() : null;
    views[active] = v;
    if (v && v.node) dom.body.appendChild(v.node);
    if (v && v.update) v.update();
  }

  /* ================================================= ONGLET : USINE ===== */

  function generatorVisible(g, i) {
    if (G.S.gens[g.id] > 0) return true;
    if (i === 0) return true;
    var prev = global.GENERATORS[i - 1];
    return G.S.gens[prev.id] > 0 || G.S.allTime >= g.cost * 0.3;
  }

  var BUILDERS = {};

  BUILDERS.usine = function () {
    var node = U.el('div');
    var head = sectionHead('Producteurs', 'Ils travaillent même quand vous ne cliquez pas.');

    var picker = U.el('div', 'bulk-picker');
    [1, 10, 100, 'max'].forEach(function (n) {
      var b = U.el('button', null, n === 'max' ? 'MAX' : '×' + n);
      U.on(b, 'click', function () {
        G.S.settings.bulk = n;
        U.qsa('button', picker).forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        view.update();
      });
      if (G.S.settings.bulk === n) b.classList.add('active');
      picker.appendChild(b);
    });
    head.appendChild(picker);
    node.appendChild(head);

    var list = U.el('div', 'cards');
    node.appendChild(list);

    var rows = [], sig = '';

    var view = {
      node: node,
      update: function () {
        var visible = global.GENERATORS.filter(generatorVisible);
        var newSig = visible.map(function (g) { return g.id; }).join(',');
        if (newSig !== sig) {
          sig = newSig;
          list.innerHTML = '';
          rows = visible.map(makeRow);
        }
        rows.forEach(function (r) { r.update(); });
      }
    };

    function makeRow(g) {
      var card = U.el('button', 'card');
      card.appendChild(U.icon(g.icon, 'card-icon'));
      var main = U.el('div', 'card-main');
      var title = U.el('div', 'card-title');
      title.appendChild(U.el('b', null, g.name));
      var count = U.el('span', 'card-count', '0');
      title.appendChild(count);
      main.appendChild(title);
      main.appendChild(U.el('p', 'card-desc', g.desc));
      var cost = U.el('div', 'card-cost');
      main.appendChild(cost);
      var sub = U.el('div', 'card-sub');
      main.appendChild(sub);
      card.appendChild(main);
      U.on(card, 'click', function () {
        var n = G.buyGen(g.id, G.S.settings.bulk);
        if (n) { refreshAll(); }
      });
      list.appendChild(card);

      return {
        update: function () {
          var owned = G.S.gens[g.id] || 0;
          var bulk = G.S.settings.bulk;
          var n = bulk === 'max' ? Math.max(1, G.genMaxBuy(g)) : bulk;
          var price = G.genCost(g, n);
          var afford = G.S.bananas >= price;
          count.textContent = owned;
          cost.className = 'card-cost' + (afford ? '' : ' too-expensive');
          cost.textContent = (bulk === 'max' ? 'MAX (' + n + ') · ' : (n > 1 ? '×' + n + ' · ' : '')) +
                             U.fmtFr(price) + ' bananes';
          var each = g.rate * global.genTierMultiplier(owned);
          var mine = G.D.genBps[g.id] || 0;
          var share = G.D.bps > 0 ? ' · ' + U.pct(mine / G.D.bps) + ' du total' : '';
          var next = global.genNextTier(owned);
          sub.textContent = U.fmtFr(each) + ' /s l\'unité · ' + U.fmtFr(mine) + ' /s au total' + share +
            (next ? ' · ×2 à ' + next : '');
          card.classList.toggle('affordable', afford);
          card.classList.toggle('owned', owned > 0);
        }
      };
    }

    return view;
  };

  /* ======================================= ONGLET : AMÉLIORATIONS ======= */

  BUILDERS.ameliorations = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Améliorations',
      'Achats définitifs. Elles ne disparaissent pas à la Grande Récolte… sauf mention contraire.'));
    var list = U.el('div', 'cards two');
    node.appendChild(list);
    var empty = U.el('div', 'empty',
      "Aucune amélioration disponible pour l'instant. Continuez à produire et à recruter : elles apparaîtront d'elles-mêmes.");
    node.appendChild(empty);

    var sig = '', rows = [];

    function makeRow(u) {
      var card = U.el('button', 'card');
      card.appendChild(U.icon(u.icon, 'card-icon'));
      var main = U.el('div', 'card-main');
      var t = U.el('div', 'card-title');
      t.appendChild(U.el('b', null, u.name));
      main.appendChild(t);
      main.appendChild(U.el('p', 'card-desc', u.desc));
      main.appendChild(U.el('div', 'card-effect', u.effectText));
      var cost = U.el('div', 'card-cost');
      main.appendChild(cost);
      card.appendChild(main);
      U.on(card, 'click', function () {
        if (G.buyUpgrade(u.id)) {
          toast('Amélioration achetée', u.name, u.icon);
          refreshAll();
        }
      });
      list.appendChild(card);
      return {
        update: function () {
          var afford = G.S.bananas >= u.cost;
          cost.className = 'card-cost' + (afford ? '' : ' too-expensive');
          cost.textContent = U.fmtFr(u.cost) + ' bananes';
          card.classList.toggle('affordable', afford);
        }
      };
    }

    return {
      node: node,
      update: function () {
        var avail = global.UPGRADES.filter(G.upgradeVisible).sort(function (a, b) { return a.cost - b.cost; });
        var newSig = avail.map(function (u) { return u.id; }).join(',');
        if (newSig !== sig) {
          sig = newSig;
          list.innerHTML = '';
          rows = avail.map(makeRow);
          empty.classList.toggle('hidden', avail.length > 0);
        }
        rows.forEach(function (r) { r.update(); });
      }
    };
  };

  /* ========================================= ONGLET : DÉCOUVERTES ======= */

  BUILDERS.decouvertes = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Découvertes',
      'Chaque découverte ajoute une mécanique ou un minijeu entier.'));

    var note = U.el('div', 'note');
    note.innerHTML = "Les découvertes sont le fil rouge du jeu : elles ne donnent pas de bonus chiffré, " +
                     "elles ouvrent de <b>nouvelles façons de jouer</b>.";
    node.appendChild(note);

    var list = U.el('div', 'cards two');
    node.appendChild(list);
    var empty = U.el('div', 'empty', "Rien de neuf à découvrir pour le moment. Progressez encore un peu.");
    node.appendChild(empty);

    var ownedHead = U.el('div', 'section-head');
    ownedHead.appendChild(U.el('h2', null, 'Déjà découvert'));
    node.appendChild(ownedHead);
    var ownedList = U.el('div', 'cards three');
    node.appendChild(ownedList);

    var sig = '', rows = [];

    function makeRow(f) {
      var card = U.el('button', 'card');
      card.appendChild(U.icon(f.icon, 'card-icon'));
      var main = U.el('div', 'card-main');
      var t = U.el('div', 'card-title');
      t.appendChild(U.el('b', null, f.name));
      t.appendChild(U.el('span', 'rarity-tag t-rare', f.kind));
      main.appendChild(t);
      main.appendChild(U.el('div', 'card-effect', f.short));
      main.appendChild(U.el('p', 'card-desc', f.desc));
      var cost = U.el('div', 'card-cost');
      main.appendChild(cost);
      card.appendChild(main);
      U.on(card, 'click', function () {
        if (G.buyFeature(f.id)) { showFeatureModal(f); refreshAll(); }
      });
      list.appendChild(card);
      return {
        update: function () {
          var afford = canAffordFeature(f);
          cost.className = 'card-cost' + (afford ? '' : ' too-expensive');
          cost.innerHTML = '';
          if (f.cost) cost.appendChild(document.createTextNode(U.fmtFr(f.cost) + ' bananes'));
          if (f.costSeeds) {
            if (f.cost) cost.appendChild(document.createTextNode(' + '));
            cost.appendChild(document.createTextNode(f.costSeeds + " Graines d'Or"));
          }
          card.classList.toggle('affordable', afford);
        }
      };
    }

    return {
      node: node,
      update: function () {
        var avail = global.FEATURES.filter(G.featureVisible);
        var owned = global.FEATURES.filter(function (f) { return G.S.features[f.id]; });
        var newSig = avail.map(function (f) { return f.id; }).join(',') + '|' + owned.length;
        if (newSig !== sig) {
          sig = newSig;
          list.innerHTML = '';
          rows = avail.map(makeRow);
          empty.classList.toggle('hidden', avail.length > 0);

          ownedList.innerHTML = '';
          ownedHead.classList.toggle('hidden', owned.length === 0);
          owned.forEach(function (f) {
            var c = U.el('div', 'card owned');
            c.appendChild(U.icon(f.icon, 'card-icon'));
            var m = U.el('div', 'card-main');
            m.appendChild(U.el('b', null, f.name));
            m.appendChild(U.el('div', 'card-effect', f.short));
            c.appendChild(m);
            ownedList.appendChild(c);
          });
        }
        rows.forEach(function (r) { r.update(); });
      }
    };
  };

  /* ============================================== ONGLET : ARCADE ====== */

  BUILDERS.arcade = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Arcade', 'Chaque partie rapporte des bananes, des jetons, et parfois une rare.'));
    var grid = U.el('div', 'arcade-grid');
    node.appendChild(grid);
    var stage = U.el('div');
    node.appendChild(stage);

    function showList() {
      grid.classList.remove('hidden');
      stage.innerHTML = '';
      grid.innerHTML = '';
      MG.games.forEach(function (g) {
        if (!G.S.features[MINIGAME_FEATURE[g.id]]) return;
        var card = U.el('button', 'card arcade-card');
        var top = U.el('div', 'mg-top');
        top.appendChild(U.icon(g.icon));
        var titles = U.el('div');
        titles.appendChild(U.el('b', null, g.name));
        titles.appendChild(U.el('p', 'card-desc', g.desc));
        top.appendChild(titles);
        card.appendChild(top);
        var best = G.S.stats.best[g.id] || 0;
        card.appendChild(U.el('div', 'mg-best',
          'Record : ' + best + (g.cost ? ' · ' + g.cost + ' jeton par partie' : '')));
        U.on(card, 'click', function () {
          grid.classList.add('hidden');
          MG.open(g.id, stage, showList);
        });
        grid.appendChild(card);
      });
      if (!grid.children.length) {
        grid.appendChild(U.el('div', 'empty', "Aucun minijeu débloqué. Rendez-vous dans les Découvertes."));
      }
    }

    showList();
    return { node: node, update: function () { if (!MG.current) { /* liste statique */ } } };
  };

  /* =============================================== ONGLET : ALBUM ====== */

  BUILDERS.album = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Album des bananes rares',
      'Chaque spécimen possédé accorde un bonus permanent, même après une Grande Récolte.'));

    var pills = U.el('div', 'album-stats');
    node.appendChild(pills);

    var mutBox = U.el('div');
    node.appendChild(mutBox);

    var grid = U.el('div', 'album-grid');
    node.appendChild(grid);

    var cells = global.RARES.map(function (r) {
      var cell = U.el('button', 'rare-cell r-' + r.rarity);
      cell.appendChild(U.icon(r.icon));
      cell.appendChild(U.el('span', 'rare-name', r.name));
      var dup = U.el('span', 'rare-dupes hidden');
      cell.appendChild(dup);
      U.on(cell, 'click', function () { showRareModal(r); });
      grid.appendChild(cell);
      return { rare: r, node: cell, dup: dup };
    });

    function buildMutation() {
      mutBox.innerHTML = '';
      if (!G.S.features.mutation) return;
      var head = sectionHead('Chambre de mutation', 'Forcez le hasard, contre des jetons.');
      mutBox.appendChild(head);
      var row = U.el('div', 'cards two');
      G.MUTATIONS.forEach(function (m) {
        var b = U.el('button', 'card');
        b.appendChild(U.icon('assets/upgrades/dna.png', 'card-icon'));
        var main = U.el('div', 'card-main');
        main.appendChild(U.el('b', null, m.label));
        var c = U.el('div', 'card-cost');
        main.appendChild(c);
        b.appendChild(main);
        U.on(b, 'click', function () {
          var res = G.mutate(m.id);
          if (res) { announceRare(res, 'mutation'); refreshAll(); }
        });
        b._cost = c;
        b._m = m;
        row.appendChild(b);
      });
      mutBox.appendChild(row);
      mutBox._buttons = U.qsa('.card', row);
    }

    buildMutation();
    var mutSig = !!G.S.features.mutation;

    return {
      node: node,
      update: function () {
        if (mutSig !== !!G.S.features.mutation) { mutSig = !!G.S.features.mutation; buildMutation(); }
        if (mutBox._buttons) {
          mutBox._buttons.forEach(function (b) {
            var afford = G.S.tokens >= b._m.cost;
            b._cost.className = 'card-cost' + (afford ? '' : ' too-expensive');
            b._cost.textContent = b._m.cost + ' jetons';
            b.classList.toggle('affordable', afford);
          });
        }

        pills.innerHTML = '';
        var totalFound = 0;
        global.RARITY_ORDER.forEach(function (rar) {
          var all = global.RARES.filter(function (r) { return r.rarity === rar; });
          var got = all.filter(function (r) { return G.S.rares[r.id]; }).length;
          totalFound += got;
          var p = U.el('span', 'album-pill t-' + rar, global.RARITY[rar].label + ' ' + got + '/' + all.length);
          pills.appendChild(p);
        });
        var tot = U.el('span', 'album-pill', 'Total ' + totalFound + '/' + global.RARES.length);
        tot.style.color = 'var(--banana)';
        pills.appendChild(tot);

        cells.forEach(function (c) {
          var n = G.S.rares[c.rare.id] || 0;
          c.node.classList.toggle('unknown', n === 0);
          c.dup.classList.toggle('hidden', n < 2);
          c.dup.textContent = '×' + n;
        });
      }
    };
  };

  function showRareModal(r) {
    var n = G.S.rares[r.id] || 0;
    var body = U.el('div');
    var head = U.el('div', 'modal-head');
    head.appendChild(U.icon(r.icon));
    var t = U.el('div');
    t.appendChild(U.el('h2', null, n ? r.name : '???'));
    var tag = U.el('span', 'rarity-tag t-' + r.rarity, global.RARITY[r.rarity].label);
    t.appendChild(tag);
    head.appendChild(t);
    body.appendChild(head);

    if (n) {
      body.appendChild(U.el('p', null, r.desc));
      body.appendChild(U.el('h3', null, 'Bonus permanent'));
      body.appendChild(U.el('p', null, global.describeRareEffects(r)));
      body.appendChild(U.el('p', 'muted', 'Exemplaires trouvés : ' + n));
    } else {
      body.appendChild(U.el('p', 'muted', "Spécimen jamais observé. Continuez à chercher."));
      var src = {
        drop: "Se trouve au hasard, en récoltant.",
        defi: "S'obtient en accomplissant un défi précis.",
        mini: "S'obtient principalement dans les minijeux.",
        marche: "Apparaît de temps en temps au Marché.",
        prestige: "Récompense liée aux Grandes Récoltes.",
        pet: "Se mérite à la Nurserie, en élevant les espèces les plus rares.",
        casino: "Se gagne au Casino de la Canopée."
      }[r.source];
      body.appendChild(U.el('p', null, 'Piste : ' + src));
    }
    modal(body);
  }

  /* =============================================== ONGLET : DÉFIS ===== */

  BUILDERS.defis = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Défis', 'Les plus exigeants débloquent des bananes rares introuvables ailleurs.'));
    var rows = [];

    global.CHALLENGE_CATEGORIES.forEach(function (cat) {
      var h = U.el('div', 'section-head');
      h.appendChild(U.el('h2', null, cat));
      node.appendChild(h);
      var list = U.el('div', 'cards');
      node.appendChild(list);

      global.CHALLENGES.filter(function (c) { return c.cat === cat; }).forEach(function (c) {
        var card = U.el('div', 'card chal');
        var main = U.el('div', 'card-main');
        var t = U.el('div', 'card-title');
        t.appendChild(U.el('b', null, c.name));
        main.appendChild(t);
        main.appendChild(U.el('p', 'card-desc', c.desc));

        var rewardBits = [];
        if (c.reward.tokens) rewardBits.push(c.reward.tokens + ' jetons');
        if (c.reward.seeds) rewardBits.push(c.reward.seeds + " Graines d'Or");
        if (c.reward.rare) rewardBits.push('Banane rare : ' + global.RARE_BY_ID[c.reward.rare].name);
        main.appendChild(U.el('div', 'card-effect', 'Récompense — ' + rewardBits.join(', ')));

        var bar = U.el('div', 'bar');
        var fill = U.el('i');
        bar.appendChild(fill);
        main.appendChild(bar);
        var prog = U.el('div', 'chal-prog');
        main.appendChild(prog);
        card.appendChild(main);

        var btn = U.el('button', 'claim-btn hidden', 'Encaisser');
        U.on(btn, 'click', function () {
          var res = G.claimChallenge(c.id);
          if (res) {
            var parts = [];
            if (res.tokens) parts.push(res.tokens + ' jetons');
            if (res.seeds) parts.push(res.seeds + " Graines d'Or");
            toast('Défi accompli', c.name + (parts.length ? ' · ' + parts.join(', ') : ''), 'assets/misc/trophy.png', 'gold');
            if (res.rare) announceRare(res.rare, 'defi');
            refreshAll();
          }
        });
        card.appendChild(btn);
        list.appendChild(card);

        rows.push({
          c: c, card: card, fill: fill, prog: prog, btn: btn,
          update: function () {
            var p = G.challengeProgress(c);
            var ratio = U.clamp(p.value / p.target, 0, 1);
            fill.style.width = (ratio * 100) + '%';
            prog.textContent = U.fmtFr(Math.min(p.value, p.target)) + ' / ' + U.fmtFr(p.target);
            card.classList.toggle('done', p.done);
            card.classList.toggle('claimed', p.claimed);
            btn.classList.toggle('hidden', !p.done || p.claimed);
          }
        });
      });
    });

    return { node: node, update: function () { rows.forEach(function (r) { r.update(); }); } };
  };


  /* ============================================ ONGLET : CONTRATS ===== */

  BUILDERS.contrats = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Contrats de la Coopérative',
      'Une commande à la fois, chronométrée. Les honorer d\'affilée fait grimper la série.'));

    var card = U.el('div', 'card');
    card.style.alignItems = 'stretch';
    card.appendChild(U.icon('assets/upgrades/parchemin.png', 'card-icon'));
    var main = U.el('div', 'card-main');
    var title = U.el('div', 'card-title');
    var label = U.el('b', null, '—');
    title.appendChild(label);
    var timer = U.el('span', 'card-count', '');
    title.appendChild(timer);
    main.appendChild(title);
    var bar = U.el('div', 'bar');
    var fill = U.el('i');
    bar.appendChild(fill);
    main.appendChild(bar);
    var prog = U.el('div', 'chal-prog');
    main.appendChild(prog);
    var reward = U.el('div', 'card-effect');
    main.appendChild(reward);
    card.appendChild(main);
    node.appendChild(card);

    var row = U.el('div', 'mg-controls');
    var claimBtn = U.el('button', 'claim-btn hidden', 'Livrer la commande');
    U.on(claimBtn, 'click', function () {
      var res = G.claimContract();
      if (res) {
        var bits = [U.fmtFr(res.bananas) + ' bananes', res.tokens + ' jetons'];
        if (res.seeds) bits.push(res.seeds + " Graines d'Or");
        toast('Commande livrée · série ×' + res.streak, bits.join(', '),
              'assets/upgrades/parchemin.png', 'gold');
        if (res.rare) announceRare(res.rare, 'contract');
        refreshAll();
      }
    });
    var rerollBtn = U.el('button', 'btn ghost small', 'Changer de commande (5 jetons)');
    U.on(rerollBtn, 'click', function () { if (G.rerollContract()) refreshAll(); });
    row.appendChild(claimBtn);
    row.appendChild(rerollBtn);
    node.appendChild(row);

    node.appendChild(sectionHead('Série en cours'));
    var stats = U.el('div', 'stat-grid');
    node.appendChild(stats);

    var note = U.el('div', 'note');
    note.innerHTML = "Chaque commande honorée fait monter la <b>série</b> : plus elle est longue, " +
      "plus les jetons, les bananes et les chances de banane rare augmentent. " +
      "Une commande expirée remet la série à zéro.";
    node.appendChild(note);

    return {
      node: node,
      update: function () {
        var p = G.contractProgress();
        if (!p) {
          label.textContent = 'Aucune commande en cours';
          timer.textContent = '';
          fill.style.width = '0%';
          prog.textContent = 'La coopérative prépare la suivante…';
          reward.textContent = '';
          claimBtn.classList.add('hidden');
          rerollBtn.classList.add('hidden');
          card.classList.remove('affordable', 'owned');
        } else {
          var r = G.contractRewards();
          label.textContent = p.contract.label;
          timer.textContent = U.fmtTime(p.secondsLeft);
          timer.style.color = p.secondsLeft < 30 ? 'var(--danger)' : '';
          fill.style.width = (p.ratio * 100) + '%';
          prog.textContent = U.fmtFr(Math.min(p.value, p.target)) + ' / ' + U.fmtFr(p.target);
          reward.textContent = 'Récompense — ' + U.fmtFr(r.bananas) + ' bananes, ' + r.tokens + ' jetons, ' +
            Math.round(r.rareChance * 100) + ' % de banane rare' +
            (r.seeds ? ', ' + r.seeds + " Graines d'Or" : '');
          claimBtn.classList.toggle('hidden', !p.complete);
          rerollBtn.classList.remove('hidden');
          rerollBtn.disabled = G.S.tokens < 5;
          card.classList.toggle('owned', p.complete);
        }

        stats.innerHTML = '';
        [
          ['Série en cours', '×' + G.S.contractStreak],
          ['Meilleure série', '×' + (G.S.stats.bestStreak || 0)],
          ['Commandes honorées', G.S.stats.contractsDone || 0],
          ['Commandes manquées', G.S.stats.contractsFailed || 0]
        ].forEach(function (pair) {
          var d = U.el('div');
          d.appendChild(U.el('b', null, String(pair[1])));
          d.appendChild(document.createTextNode(pair[0]));
          stats.appendChild(d);
        });
      }
    };
  };

  /* ============================================== ONGLET : MARCHÉ ===== */

  BUILDERS.marche = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Marché aux bananes', 'Vendez au bon moment, achetez les lots rares.'));

    var box = U.el('div', 'market-price');
    var price = U.el('div', 'price', '1,00');
    box.appendChild(price);
    var info = U.el('div');
    info.appendChild(U.el('div', null, 'Cours actuel de la banane'));
    var rate = U.el('div', 'muted');
    info.appendChild(rate);
    box.appendChild(info);
    node.appendChild(box);

    var chart = U.el('canvas');
    chart.id = 'market-chart';
    chart.width = 600; chart.height = 90;
    node.appendChild(chart);
    var ctx = chart.getContext('2d');
    var history = [];

    var sellRow = U.el('div', 'mg-controls');
    [['Vendre 10 %', 0.1], ['Vendre 50 %', 0.5], ['Vendre tout', 1]].forEach(function (pair) {
      var b = U.el('button', 'btn', pair[0]);
      U.on(b, 'click', function () {
        var t = G.marketSell(pair[1]);
        if (t) toast('Vente conclue', t + ' jetons empochés', 'assets/misc/token.png', 'gold');
        else { sfx('error'); toast('Vente refusée', 'Pas assez de bananes pour ce cours', 'assets/upgrades/comptoir.png'); }
        refreshAll();
      });
      sellRow.appendChild(b);
    });
    node.appendChild(sellRow);

    var offerHead = sectionHead('Lot du jour', 'Un spécimen rare mis en vente, contre des jetons.');
    node.appendChild(offerHead);
    var offerBox = U.el('div');
    node.appendChild(offerBox);

    var lastOffer = null;

    return {
      node: node,
      update: function () {
        var m = G.S.market;
        price.textContent = m.price.toFixed(2).replace('.', ',');
        price.className = 'price ' + (m.price >= 1 ? 'up' : 'down');
        rate.textContent = U.fmtFr(G.marketTokenRate()) + ' bananes = 1 jeton au cours de 1,00';

        history.push(m.price);
        if (history.length > 150) history.shift();
        ctx.clearRect(0, 0, 600, 90);
        ctx.fillStyle = 'rgba(0,0,0,.3)';
        ctx.fillRect(0, 0, 600, 90);
        ctx.strokeStyle = 'rgba(255,255,255,.12)';
        ctx.beginPath(); ctx.moveTo(0, 45); ctx.lineTo(600, 45); ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = '#ffd23f';
        ctx.lineWidth = 2;
        history.forEach(function (p, i) {
          var x = (i / 149) * 600;
          var y = 90 - U.clamp((p - 0.3) / 2.2, 0, 1) * 86 - 2;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();

        var o = m.offer;
        var sig = o ? o.rareId + o.price : 'none';
        if (sig !== lastOffer) {
          lastOffer = sig;
          offerBox.innerHTML = '';
          if (!o) {
            offerBox.appendChild(U.el('div', 'empty', "Aucun lot en vente. Le prochain arrive bientôt."));
          } else {
            var r = global.RARE_BY_ID[o.rareId];
            var card = U.el('div', 'offer');
            card.appendChild(U.icon(r.icon));
            var main = U.el('div');
            main.style.flex = '1';
            main.appendChild(U.el('b', null, r.name));
            var tag = U.el('span', 'rarity-tag t-' + r.rarity, global.RARITY[r.rarity].label);
            main.appendChild(document.createTextNode(' '));
            main.appendChild(tag);
            main.appendChild(U.el('p', 'card-desc', G.S.rares[r.id] ? 'Vous en possédez déjà — ce sera un doublon.' : r.desc));
            card.appendChild(main);
            var buy = U.el('button', 'btn', o.price + ' jetons');
            U.on(buy, 'click', function () {
              var res = G.marketBuyOffer();
              if (res) { announceRare(res, 'marche'); refreshAll(); }
            });
            card.appendChild(buy);
            offerBox.appendChild(card);
            card._buy = buy;
            offerBox._buy = buy;
            offerBox._price = o.price;
          }
        }
        if (offerBox._buy) offerBox._buy.disabled = G.S.tokens < offerBox._price;
      }
    };
  };

  /* ============================================ ONGLET : RELIQUES ===== */

  BUILDERS.reliques = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Sanctuaire des reliques',
      "Achetées avec des Graines d'Or, elles ne disparaissent jamais."));
    var list = U.el('div', 'cards two');
    node.appendChild(list);

    var rows = global.RELICS.map(function (rel) {
      var card = U.el('button', 'card');
      card.appendChild(U.icon(rel.icon, 'card-icon'));
      var main = U.el('div', 'card-main');
      var t = U.el('div', 'card-title');
      t.appendChild(U.el('b', null, rel.name));
      var lvl = U.el('span', 'card-count', '0');
      t.appendChild(lvl);
      main.appendChild(t);
      main.appendChild(U.el('p', 'card-desc', rel.desc));
      var eff = U.el('div', 'card-effect');
      main.appendChild(eff);
      var cost = U.el('div', 'card-cost');
      main.appendChild(cost);
      card.appendChild(main);
      U.on(card, 'click', function () {
        if (G.buyRelic(rel.id)) { toast('Relique renforcée', rel.name, rel.icon, 'gold'); refreshAll(); }
      });
      list.appendChild(card);

      return {
        update: function () {
          var n = G.S.relics[rel.id] || 0;
          var maxed = n >= rel.max;
          var c = rel.cost(n);
          lvl.textContent = n + '/' + rel.max;
          eff.textContent = n > 0 ? rel.text(n) : 'Aucun effet pour l\'instant';
          cost.className = 'card-cost' + (!maxed && G.S.seeds >= c ? '' : ' too-expensive');
          cost.innerHTML = '';
          cost.appendChild(U.icon('assets/misc/seed_gold.png'));
          cost.appendChild(document.createTextNode(maxed ? 'Niveau maximal' :
            c + " Graines d'Or → " + rel.text(n + 1)));
          card.classList.toggle('affordable', !maxed && G.S.seeds >= c);
          card.classList.toggle('locked', maxed);
        }
      };
    });

    return { node: node, update: function () { rows.forEach(function (r) { r.update(); }); } };
  };

  /* ========================================= ONGLET : GRANDE RÉCOLTE == */

  BUILDERS.recolte = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('La Grande Récolte',
      "Tout rendre à la terre pour repartir plus fort."));

    var note = U.el('div', 'note');
    note.innerHTML =
      "Vous perdez : vos bananes, vos producteurs, vos améliorations et vos smoothies.<br>" +
      "Vous gardez : <b>vos bananes rares</b>, vos défis, vos reliques, vos jetons, " +
      "vos minijeux et toutes les mécaniques débloquées.<br>" +
      "Chaque <b>Graine d'Or</b> ajoute <b>+2 %</b> de production, définitivement.";
    node.appendChild(note);

    var box = U.el('div', 'market-price');
    var big = U.el('div', 'big-num', '0');
    box.appendChild(big);
    var info = U.el('div');
    info.appendChild(U.el('div', null, "Graines d'Or à la prochaine Grande Récolte"));
    var sub = U.el('div', 'muted');
    info.appendChild(sub);
    box.appendChild(info);
    node.appendChild(box);

    var stats = U.el('div', 'stat-grid');
    node.appendChild(stats);

    var row = U.el('div', 'mg-controls');
    var btn = U.el('button', 'btn', 'Lancer la Grande Récolte');
    U.on(btn, 'click', function () { confirmPrestige(); });
    row.appendChild(btn);
    node.appendChild(row);

    return {
      node: node,
      update: function () {
        var gain = G.seedsOnPrestige();
        big.textContent = U.fmtFr(gain);
        sub.textContent = "Vous en possédez " + U.fmtFr(G.S.seeds) +
          " (×" + G.D.prestigeMult.toFixed(2).replace('.', ',') + " de production)";
        stats.innerHTML = '';
        [
          ['Grandes Récoltes', G.S.prestigeCount],
          ['Bananes de cette partie', U.fmtFr(G.S.totalBananas)],
          ["Graines d'Or totales", U.fmtFr(G.S.totalSeeds)],
          ['Seuil de la prochaine graine', U.fmtFr(G.bananasForSeeds(gain + 1))],
          ['Apport de la prochaine graine', '+' + (G.seedMarginal(G.S.seeds) * 100).toFixed(2).replace('.', ',') + ' %']
        ].forEach(function (p) {
          var d = U.el('div');
          d.appendChild(U.el('b', null, String(p[1])));
          d.appendChild(document.createTextNode(p[0]));
          stats.appendChild(d);
        });
        btn.disabled = gain < 1;
      }
    };
  };

  function confirmPrestige() {
    var gain = G.seedsOnPrestige();
    var body = U.el('div');
    body.appendChild(U.el('h2', null, 'Confirmer la Grande Récolte ?'));
    body.appendChild(U.el('p', null,
      "Vous allez récolter " + U.fmtFr(gain) + " Graines d'Or et repartir d'une plantation vierge. " +
      "Votre album, vos défis et vos reliques restent intacts."));
    var actions = U.el('div', 'modal-actions');
    var no = U.el('button', 'btn ghost', 'Annuler');
    U.on(no, 'click', closeModal);
    var yes = U.el('button', 'btn', 'Tout récolter');
    U.on(yes, 'click', function () {
      var g = G.doPrestige();
      closeModal();
      if (g) {
        toast('Grande Récolte', g + " Graines d'Or récoltées", 'assets/misc/seed_gold.png', 'gold');
        switchTab('usine');
        refreshAll();
      }
    });
    actions.appendChild(no);
    actions.appendChild(yes);
    body.appendChild(actions);
    modal(body);
  }

  /* ============================================= ONGLET : OPTIONS ===== */

  BUILDERS.options = function () {
    var node = U.el('div');
    node.appendChild(sectionHead('Options & statistiques', 'La partie est sauvegardée dans ce navigateur.'));

    var stats = U.el('div', 'stat-grid');
    node.appendChild(stats);

    var toggles = U.el('div');
    node.appendChild(sectionHead('Réglages'));
    node.appendChild(toggles);

    function toggle(label, key, onChange) {
      var l = U.el('label', 'toggle');
      var input = U.el('input');
      input.type = 'checkbox';
      input.checked = !!G.S.settings[key];
      U.on(input, 'change', function () {
        G.S.settings[key] = input.checked;
        if (onChange) onChange(input.checked);
      });
      l.appendChild(input);
      l.appendChild(document.createTextNode(label));
      toggles.appendChild(l);
      return l;
    }

    var autoLine = toggle("Contremaître : achat automatique du meilleur producteur", 'autobuy');
    toggle("Réduire les effets visuels", 'reduceFx');
    toggle("Bruitages", 'sfx', function (on) {
      if (global.SFX) { global.SFX.setEnabled(on); if (on) global.SFX.play('upgrade'); }
    });

    var volRow = U.el('label', 'toggle');
    volRow.appendChild(document.createTextNode('Volume'));
    var vol = U.el('input');
    vol.type = 'range'; vol.min = '0'; vol.max = '100'; vol.step = '5';
    vol.value = String(Math.round((G.S.settings.volume === undefined ? 0.45 : G.S.settings.volume) * 100));
    vol.style.flex = '1';
    var volLabel = U.el('b', null, vol.value + ' %');
    U.on(vol, 'input', function () {
      var v = Number(vol.value) / 100;
      G.S.settings.volume = v;
      volLabel.textContent = vol.value + ' %';
      if (global.SFX) global.SFX.setVolume(v);
    });
    U.on(vol, 'change', function () { if (global.SFX) global.SFX.play('click', { combo: 12 }); });
    volRow.appendChild(vol);
    volRow.appendChild(volLabel);
    toggles.appendChild(volRow);

    if (global.SFX && !global.SFX.available) {
      var noAudio = U.el('div', 'note warn', "Ce navigateur n'expose pas l'API Web Audio : le jeu restera muet.");
      toggles.appendChild(noAudio);
    }

    node.appendChild(sectionHead('Sauvegarde'));
    var row = U.el('div', 'mg-controls');
    var saveBtn = U.el('button', 'btn', 'Sauvegarder maintenant');
    U.on(saveBtn, 'click', function () { G.save(); toast('Sauvegardé', 'Progression enregistrée localement', 'assets/misc/book.png'); });
    var expBtn = U.el('button', 'btn ghost', 'Exporter');
    U.on(expBtn, 'click', exportModal);
    var impBtn = U.el('button', 'btn ghost', 'Importer');
    U.on(impBtn, 'click', importModal);
    var resetBtn = U.el('button', 'btn danger', 'Tout effacer');
    U.on(resetBtn, 'click', resetModal);
    [saveBtn, expBtn, impBtn, resetBtn].forEach(function (b) { row.appendChild(b); });
    node.appendChild(row);

    return {
      node: node,
      update: function () {
        autoLine.classList.toggle('hidden', !G.S.features.automation);
        stats.innerHTML = '';
        var S = G.S, D = G.D;
        [
          ['Bananes en stock', U.fmtFr(S.bananas)],
          ['Production', U.fmtFr(D.bps) + ' /s'],
          ['Par clic', U.fmtFr(D.perClick)],
          ['Clics effectués', U.fmtInt(S.stats.clicks)],
          ['Coups critiques', U.fmtInt(S.stats.crits)],
          ['Meilleur combo', '×' + S.stats.maxCombo],
          ['Bananes dorées attrapées', U.fmtInt(S.stats.goldenClicked)],
          ['Parties de minijeu', U.fmtInt(S.stats.miniPlayed)],
          ['Bananes rares trouvées', G.countRares() + '/' + global.RARES.length],
          ['Exemplaires rares (doublons inclus)', U.fmtInt(S.stats.raresTotal)],
          ['Améliorations achetées', U.fmtInt(S.stats.upgradesBought)],
          ['Grandes Récoltes', S.prestigeCount],
          ["Graines d'Or", U.fmtFr(S.seeds)],
          ['Jetons', U.fmtFr(S.tokens)],
          ['Bananes depuis toujours', U.fmtFr(S.allTime)],
          ['Temps de jeu', U.fmtTime(S.stats.playTime)],
          ['Production hors-ligne', 'jusqu\'à ' + G.maxOfflineHours() + ' h']
        ].forEach(function (p) {
          var d = U.el('div');
          d.appendChild(U.el('b', null, String(p[1])));
          d.appendChild(document.createTextNode(p[0]));
          stats.appendChild(d);
        });
      }
    };
  };

  function exportModal() {
    var body = U.el('div');
    body.appendChild(U.el('h2', null, 'Exporter la sauvegarde'));
    body.appendChild(U.el('p', null, "Copiez ce code et gardez-le en lieu sûr."));
    var ta = U.el('textarea');
    ta.value = G.exportSave();
    ta.readOnly = true;
    body.appendChild(ta);
    var actions = U.el('div', 'modal-actions');
    var copy = U.el('button', 'btn', 'Copier');
    U.on(copy, 'click', function () {
      ta.select();
      try { document.execCommand('copy'); copy.textContent = 'Copié !'; } catch (e) { copy.textContent = 'Copiez à la main'; }
    });
    var close = U.el('button', 'btn ghost', 'Fermer');
    U.on(close, 'click', closeModal);
    actions.appendChild(copy);
    actions.appendChild(close);
    body.appendChild(actions);
    modal(body);
  }

  function importModal() {
    var body = U.el('div');
    body.appendChild(U.el('h2', null, 'Importer une sauvegarde'));
    var warn = U.el('div', 'note warn', "Attention : cela remplace définitivement votre partie en cours.");
    body.appendChild(warn);
    var ta = U.el('textarea');
    ta.placeholder = 'Collez ici votre code de sauvegarde…';
    body.appendChild(ta);
    var actions = U.el('div', 'modal-actions');
    var cancel = U.el('button', 'btn ghost', 'Annuler');
    U.on(cancel, 'click', closeModal);
    var go = U.el('button', 'btn', 'Importer');
    U.on(go, 'click', function () {
      if (G.importSave(ta.value)) {
        closeModal();
        toast('Sauvegarde importée', 'Bon retour à la plantation', 'assets/misc/book.png');
        lastTabSig = '';
        switchTab('usine');
        refreshAll();
      } else {
        warn.textContent = "Code invalide. Vérifiez qu'il a été copié en entier.";
      }
    });
    actions.appendChild(cancel);
    actions.appendChild(go);
    body.appendChild(actions);
    modal(body);
  }

  function resetModal() {
    var body = U.el('div');
    body.appendChild(U.el('h2', null, 'Tout effacer ?'));
    body.appendChild(U.el('div', 'note warn',
      "Cette action supprime définitivement votre progression : bananes, album, défis, reliques. " +
      "Elle est irréversible."));
    var actions = U.el('div', 'modal-actions');
    var cancel = U.el('button', 'btn', 'Non, garder ma partie');
    U.on(cancel, 'click', closeModal);
    var go = U.el('button', 'btn danger', 'Oui, tout effacer');
    U.on(go, 'click', function () {
      G.hardReset();
      closeModal();
      lastTabSig = '';
      switchTab('usine');
      refreshAll();
      toast('Partie effacée', 'Une nouvelle plantation vous attend', 'assets/misc/banana_hero.png');
    });
    actions.appendChild(cancel);
    actions.appendChild(go);
    body.appendChild(actions);
    modal(body);
  }

  /* ======================================================== BANDEAU ==== */

  function refreshHeader() {
    var S = G.S, D = G.D;
    dom.bananas.textContent = U.fmtFr(S.bananas);
    dom.bps.textContent = U.fmtFr(D.bps) + ' / s';
    dom.perClick.textContent = U.fmtFr(D.perClick);

    dom.tokensBox.classList.toggle('hidden', S.tokens === 0 && !S.features.challenges && !anyMinigame(S));
    dom.tokens.textContent = U.fmtFr(S.tokens);

    dom.seedsBox.classList.toggle('hidden', !S.features.prestige && S.seeds === 0);
    dom.seeds.textContent = U.fmtFr(S.seeds);
    dom.seedsMult.textContent = '×' + D.prestigeMult.toFixed(2).replace('.', ',');

    /* Combo */
    var comboOn = S.features.combo && S.combo > 1 && S.comboUntil > Date.now();
    dom.comboBox.classList.toggle('hidden', !comboOn);
    if (comboOn) {
      dom.comboMult.textContent = '×' + G.D.comboMult.toFixed(2).replace('.', ',');
      dom.comboBar.style.width = U.clamp((S.comboUntil - Date.now()) / 2000, 0, 1) * 100 + '%';
    }

    /* Boosts actifs */
    var now = Date.now();
    dom.boosts.innerHTML = '';
    S.boosts.forEach(function (b) {
      var left = (b.until - now) / 1000;
      if (left <= 0) return;
      var chip = U.el('div', 'boost-chip');
      chip.appendChild(document.createTextNode(b.name + ' ×' + b.mult));
      var bar = U.el('div', 'bar');
      var i = U.el('i');
      i.style.width = U.clamp((b.until - now) / b.total, 0, 1) * 100 + '%';
      bar.appendChild(i);
      chip.appendChild(bar);
      chip.appendChild(document.createTextNode(Math.ceil(left) + 's'));
      dom.boosts.appendChild(chip);
    });
  }

  function refreshSmoothies() {
    var on = !!G.S.features.boosts;
    dom.smoothies.classList.toggle('hidden', !on);
    if (!on) return;
    var recipes = G.SMOOTHIES.filter(G.smoothieAvailable);
    if (dom.smoothies.children.length !== recipes.length) {
      dom.smoothies.innerHTML = '';
      recipes.forEach(function (sm) {
        var b = U.el('button', 'smoothie');
        b.appendChild(U.icon(sm.icon));
        var main = U.el('div');
        main.style.flex = '1';
        main.appendChild(U.el('span', 's-name', sm.name.replace('Smoothie ', '')));
        var line = U.el('span', 's-stock');
        main.appendChild(line);
        b.appendChild(main);
        U.on(b, 'click', function () {
          if ((G.S.smoothies[sm.id] || 0) > 0) {
            G.drinkSmoothie(sm.id);
            toast('Smoothie bu', sm.desc, sm.icon, 'gold');
          } else if (G.craftSmoothie(sm.id)) {
            toast('Smoothie préparé', sm.name + ' — cliquez à nouveau pour le boire', sm.icon);
          }
          refreshAll();
        });
        b._line = line;
        b._sm = sm;
        dom.smoothies.appendChild(b);
      });
    }
    U.qsa('.smoothie', dom.smoothies).forEach(function (b) {
      var stock = G.S.smoothies[b._sm.id] || 0;
      b._line.textContent = stock > 0 ? 'Boire (' + stock + ' en stock)' : U.fmtFr(G.smoothieCost(b._sm)) + ' 🍌';
      b.disabled = stock === 0 && G.S.bananas < G.smoothieCost(b._sm);
      b.title = b._sm.desc;
    });
  }

  var TIPS = [
    "Astuce : maintenez le clic enfoncé n'est pas utile — c'est le nombre de clics qui compte.",
    "Astuce : les producteurs gagnent ×2 de production tous les 10, 25, 50 puis 100 exemplaires.",
    "Astuce : les bananes rares gardent leur bonus après une Grande Récolte.",
    "Astuce : les doublons de bananes rares sont convertis en jetons.",
    "Astuce : le Marché est plus rentable quand le cours dépasse 1,50.",
    "Astuce : un combo élevé multiplie chaque clic — enchaînez sans pause de plus de deux secondes.",
    "Astuce : les minijeux rapportent d'autant plus que votre production est élevée.",
    "Astuce : gardez quelques jetons pour la Chambre de Mutation, c'est le moyen le plus sûr de compléter l'album."
  ];

  function refreshTip() {
    if (!dom.tip) return;
    var S = G.S;
    var msg;
    if (!S.features.combo && S.stats.clicks < 25) msg = "Cliquez sur la banane — ou appuyez sur la barre d'espace — pour lancer la plantation.";
    else if (!S.gens.singe) msg = "Recrutez un Singe Cueilleur dans l'onglet Usine : il travaillera pour vous.";
    else msg = TIPS[Math.floor(Date.now() / 12000) % TIPS.length];
    dom.tip.innerHTML = msg;
  }

  /* ========================================================== EFFETS === */

  function popText(text, crit) {
    if (G.S.settings.reduceFx) return;
    var n = U.el('div', 'fx-pop' + (crit ? ' crit' : ''), text);
    n.style.left = (35 + Math.random() * 30) + '%';
    n.style.top = (32 + Math.random() * 22) + '%';
    dom.fx.appendChild(n);
    setTimeout(function () { n.remove(); }, 950);
  }

  function particles(count) {
    if (G.S.settings.reduceFx) return;
    for (var i = 0; i < count; i++) {
      var p = U.el('div', 'fx-particle');
      p.style.left = '50%';
      p.style.top = '50%';
      p.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      p.style.setProperty('--dy', (Math.random() * 160 - 110) + 'px');
      dom.fx.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 720); })(p);
    }
  }

  /* ==================================================== BANANE DORÉE === */

  var goldenNode = null;

  function spawnGolden() {
    if (goldenNode) return;
    var btn = U.el('button', 'golden');
    btn.appendChild(U.icon('assets/misc/banana_gold.png', null, 'Banane dorée'));
    btn.title = 'Banane dorée !';
    var fromLeft = Math.random() < 0.5;
    var y = 12 + Math.random() * 62;
    btn.style.top = y + 'vh';
    btn.style.left = (fromLeft ? -12 : 106) + 'vw';
    dom.goldenLayer.appendChild(btn);
    goldenNode = btn;

    var t = 0, dur = 13 + Math.random() * 5;
    var start = performance.now();
    var raf;

    function step(now) {
      t = (now - start) / 1000;
      if (!goldenNode) return;
      var p = t / dur;
      if (p >= 1) { removeGolden(); return; }
      var x = fromLeft ? U.lerp(-12, 106, p) : U.lerp(106, -12, p);
      btn.style.left = x + 'vw';
      btn.style.top = (y + Math.sin(t * 2.1) * 7) + 'vh';
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);

    U.on(btn, 'click', function () {
      cancelAnimationFrame(raf);
      var res = G.collectGolden();
      announceGolden(res);
      removeGolden();
      refreshAll();
    });

    function removeGolden() {
      cancelAnimationFrame(raf);
      if (goldenNode) { goldenNode.remove(); goldenNode = null; }
      if (!G.S.nextGoldenAt || G.S.nextGoldenAt < Date.now()) {
        G.S.nextGoldenAt = Date.now() + G.goldenDelay();
      }
    }
  }

  function announceGolden(res) {
    var msg = res.kind.text;
    if (res.kind.id === 'rain') msg = U.fmtFr(res.amount) + ' bananes tombées du ciel';
    if (res.kind.id === 'jackpot') msg = res.amount + ' jetons';
    toast('Banane dorée : ' + res.kind.name, msg, 'assets/misc/banana_gold.png', 'gold');
    if (res.rare) announceRare(res.rare, 'golden');
  }

  /* ========================================================= TOASTS ==== */

  function toast(title, text, icon, cls) {
    var t = U.el('div', 'toast' + (cls ? ' ' + cls : ''));
    if (icon) t.appendChild(U.icon(icon));
    var box = U.el('div');
    box.appendChild(U.el('b', null, title));
    box.appendChild(U.el('span', null, text));
    t.appendChild(box);
    dom.toasts.appendChild(t);
    while (dom.toasts.children.length > 5) dom.toasts.firstChild.remove();
    setTimeout(function () {
      t.classList.add('out');
      setTimeout(function () { t.remove(); }, 320);
    }, 5200);
  }

  function announceRare(res, source) {
    if (!res) return;
    var r = res.rare;
    if (res.isNew) {
      toast('Nouvelle banane rare !', r.name + ' — ' + global.describeRareEffects(r), r.icon, 'rare');
    } else {
      toast('Banane rare (doublon)', r.name + ' → ' + res.tokens + ' jetons', r.icon, 'rare');
    }
  }

  /* ========================================================= MODALES === */

  function modal(content) {
    dom.modal.innerHTML = '';
    dom.modal.appendChild(content);
    dom.backdrop.classList.remove('hidden');
  }
  function closeModal() { dom.backdrop.classList.add('hidden'); }

  function showFeatureModal(f) {
    var body = U.el('div');
    var head = U.el('div', 'modal-head');
    head.appendChild(U.icon(f.icon, null, f.name));
    var t = U.el('div');
    t.appendChild(U.el('h2', null, f.name));
    t.appendChild(U.el('p', 'muted', 'Nouvelle ' + f.kind + ' débloquée'));
    head.appendChild(t);
    body.appendChild(head);
    body.appendChild(U.el('h3', null, f.short));
    body.appendChild(U.el('p', null, f.desc));
    var actions = U.el('div', 'modal-actions');
    var ok = U.el('button', 'btn', "C'est parti");
    U.on(ok, 'click', function () {
      closeModal();
      var target = { mg_tri: 'arcade', mg_peel: 'arcade', mg_memoire: 'arcade', mg_match: 'arcade',
        mg_tresor: 'arcade', mg_course: 'arcade', mg_roue: 'arcade',
        mg_ninja: 'arcade', mg_serpent: 'arcade', mg_pile: 'arcade',
        mg_cocktail: 'arcade', mg_taupe: 'arcade',
        rares: 'album', challenges: 'defis', market: 'marche', relics: 'reliques',
        prestige: 'recolte', mutation: 'album', contracts: 'contrats',
        skins: 'apparence', pets: 'nurserie', breeding: 'nurserie',
        petteam2: 'nurserie', petteam3: 'nurserie', petteam4: 'nurserie',
        casino: 'casino', race: 'casino' }[f.id];
      lastTabSig = '';
      if (target) switchTab(target);
      refreshAll();
    });
    actions.appendChild(ok);
    body.appendChild(actions);
    modal(body);
  }

  function showOfflineModal(info) {
    var body = U.el('div');
    body.appendChild(U.el('h2', null, 'Pendant votre absence'));
    body.appendChild(U.el('p', null,
      "La plantation a tourné " + U.fmtTime(info.seconds) + " à " +
      Math.round(info.efficiency * 100) + " % de rendement."));
    var box = U.el('div', 'note');
    box.innerHTML = '<b>' + U.fmtFr(info.gain) + ' bananes</b> vous attendaient.' +
      (info.capped ? '<br>La production hors-ligne est plafonnée à ' + G.maxOfflineHours() + ' h.' : '');
    body.appendChild(box);
    var actions = U.el('div', 'modal-actions');
    var ok = U.el('button', 'btn', 'Encaisser');
    U.on(ok, 'click', closeModal);
    actions.appendChild(ok);
    body.appendChild(actions);
    modal(body);
  }

  /* ========================================================== SKINS ===== */

  /* Applique l'apparence active à la grosse banane, et son aura éventuelle. */
  function applySkin() {
    if (!dom.bananaImg) return;
    var skin = global.SKIN_BY_ID[G.S.skins.active] || global.SKIN_BY_ID.classique;
    if (dom.bananaImg.dataset.skin !== skin.id) {
      dom.bananaImg.dataset.skin = skin.id;
      U.setSprite(dom.bananaImg, skin.icon);
    }
    var btn = dom.bananaBtn;
    if (btn._aura !== skin.aura) {
      if (btn._aura) btn.classList.remove('aura-' + btn._aura);
      btn._aura = skin.aura || null;
      if (btn._aura) btn.classList.add('aura-' + btn._aura);
    }
  }

  /* Débloque les apparences dont la condition vient d'être remplie. */
  function checkSkinUnlocks() {
    if (!G.S.features.skins) return;
    var snap = G.snapshot();
    global.SKINS.forEach(function (s) {
      if (G.S.skins.owned[s.id]) return;
      var ok = false;
      try { ok = s.req(snap); } catch (e) { ok = false; }
      if (!ok) return;
      G.S.skins.owned[s.id] = true;
      toast('Nouvelle apparence', s.name + ' — ' + s.how, s.icon, 'gold');
      sfx('feature');
    });
  }

  /* ======================================================== RAFRAÎCHIR = */

  function refreshAll() {
    G.recompute();
    checkSkinUnlocks();
    applySkin();
    refreshHeader();
    refreshSmoothies();
    buildTabs();
    if (views[active] && views[active].update && !MG.current) views[active].update();
  }

  /* ============================================================ INIT === */

  function init() {
    dom.tabs = U.qs('#tabs');
    dom.body = U.qs('#tab-body');
    dom.bananas = U.qs('#res-bananas');
    dom.bps = U.qs('#res-bps');
    dom.tokens = U.qs('#res-tokens');
    dom.tokensBox = U.qs('#res-tokens-box');
    dom.seeds = U.qs('#res-seeds');
    dom.seedsBox = U.qs('#res-seeds-box');
    dom.seedsMult = U.qs('#res-seeds-mult');
    dom.boosts = U.qs('#boosts');
    dom.perClick = U.qs('#per-click');
    dom.comboBox = U.qs('#combo-box');
    dom.comboMult = U.qs('#combo-mult');
    dom.comboBar = U.qs('#combo-bar');
    dom.smoothies = U.qs('#smoothies');
    dom.tip = U.qs('#clicker-tip');
    dom.fx = U.qs('#fx-layer');
    dom.toasts = U.qs('#toasts');
    dom.backdrop = U.qs('#modal-backdrop');
    dom.modal = U.qs('#modal');
    dom.goldenLayer = U.qs('#golden-layer');
    dom.bananaBtn = U.qs('#banana-btn');
    dom.bananaImg = U.qs('#banana-img');

    function harvest() {
      var res = G.clickBanana(true);
      sfx(res.crit ? 'crit' : 'click', { combo: G.S.combo });
      popText('+' + U.fmtFr(res.gain) + (res.crit ? ' CRITIQUE !' : ''), res.crit);
      particles(res.crit ? 12 : 4);
      dom.bananaBtn.classList.add('punch');
      setTimeout(function () { dom.bananaBtn.classList.remove('punch'); }, 70);
      if (res.rare) announceRare(res.rare, 'click');
      refreshHeader();
    }

    U.on(dom.bananaBtn, 'click', harvest);

    /* Barre d'espace : récolte au clavier, sauf si une modale ou un champ a le focus */
    U.on(window, 'keydown', function (e) {
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (!dom.backdrop.classList.contains('hidden')) return;
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
      if (MG.current) return;
      e.preventDefault();
      harvest();
    });

    U.on(dom.backdrop, 'click', function (e) { if (e.target === dom.backdrop) closeModal(); });
    U.on(window, 'keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    G.on('feature', function () { lastTabSig = ''; sfx('feature'); });
    G.on('buy', function (e) { sfx(e.kind === 'gen' ? 'buy' : 'upgrade'); });
    G.on('rare', function (e) { sfx('rare', { rarity: e.rare.rarity }); });
    G.on('challenge', function () { sfx('challenge'); });
    G.on('golden', function () { sfx('golden'); });
    G.on('boost', function () { sfx('boost'); });
    G.on('prestige', function () { sfx('prestige'); });
    G.on('market', function () { sfx('buy'); });
    G.on('smoothie', function () { sfx('buy'); });
    G.on('contract', function (e) {
      if (e.kind === 'new') {
        toast('Nouvelle commande', e.contract.label, 'assets/upgrades/parchemin.png');
      } else if (e.kind === 'done') {
        sfx('contract');
      } else if (e.kind === 'failed') {
        sfx('fail');
        toast('Commande expirée', 'La série repart de zéro.', 'assets/upgrades/parchemin.png');
      }
    });
    G.on('challenge', function () { /* le badge se met à jour tout seul */ });

    if (global.SFX) {
      global.SFX.arm();
      global.SFX.setEnabled(G.S.settings.sfx !== false);
      global.SFX.setVolume(G.S.settings.volume === undefined ? 0.45 : G.S.settings.volume);
    }

    buildTabs();
    renderTab();
    refreshAll();
  }

  global.UI = {
    init: init,
    registerTab: registerTab,
    applySkin: applySkin,
    refreshAll: refreshAll,
    refreshHeader: refreshHeader,
    refreshTip: refreshTip,
    toast: toast,
    modal: modal,
    closeModal: closeModal,
    showOfflineModal: showOfflineModal,
    spawnGolden: spawnGolden,
    switchTab: switchTab,
    announceRare: announceRare,
    get activeTab() { return active; },
    get views() { return views; }
  };
})(window);

/* Banana Factory - onglets ajoutés par le Grand Patch
 *
 *   Nurserie  : œufs, équipe, fusion, album des 56 espèces
 *   Casino    : machine à sous, roulette, 21 Bananes, course de cochons
 *   Apparence : les 19 skins de la banane principale
 *
 * Ces onglets s'enregistrent via UI.registerTab() et suivent la même
 * convention que ceux de js/ui.js : un objet { node, update } dont update()
 * est appelé environ quatre fois par seconde, et qui ne reconstruit le DOM
 * que lorsque sa « signature » change.
 */
(function (global) {
  'use strict';

  var U = global.U, G = global.G, UI = global.UI, MG = global.MG;
  function sfx(n, p) { if (global.SFX) global.SFX.play(n, p); }

  function head(title, sub) {
    var h = U.el('div', 'section-head');
    h.appendChild(U.el('h2', null, title));
    if (sub) h.appendChild(U.el('p', null, sub));
    return h;
  }

  function statGrid(pairs) {
    var g = U.el('div', 'stat-grid');
    pairs.forEach(function (p) {
      var d = U.el('div');
      d.appendChild(U.el('b', null, String(p[1])));
      d.appendChild(document.createTextNode(p[0]));
      g.appendChild(d);
    });
    return g;
  }

  /* ==================================================================== */
  /* ============================== NURSERIE ============================ */
  /* ==================================================================== */

  function petCard(pet, opts) {
    var sp = global.PET_BY_ID[pet.id];
    var card = U.el('div', 'pet-card t-pet-' + sp.tier);
    card.appendChild(U.icon(sp.icon, 'pet-img', sp.name));
    var main = U.el('div', 'pet-main');
    main.appendChild(U.el('b', null, sp.name));
    main.appendChild(U.el('span', 'rarity-tag t-pet-' + sp.tier, global.PET_TIERS[sp.tier].label));
    main.appendChild(U.el('div', 'card-effect', global.describePetEffects(sp)));
    card.appendChild(main);
    if (opts && opts.actions) card.appendChild(opts.actions);
    return card;
  }

  function buildNurserie() {
    var P = global.PETS;
    var node = U.el('div');
    node.appendChild(head('Nurserie',
      "Les animaux placés dans l'équipe travaillent pour la plantation."));

    var stats = U.el('div');
    node.appendChild(stats);

    /* ---------------------------------------------------- automatisation */
    var autoBox = U.el('div', 'auto-box');
    var autoHead = U.el('div', 'auto-head');
    autoHead.appendChild(U.el('b', null, 'Automatisation'));
    var master = U.el('button', 'btn small', 'Tout activer');
    U.on(master, 'click', function () {
      var cfg = P.auto();
      /* Si tout est déjà actif, le bouton fait l'inverse. */
      var tout = AUTOS.every(function (o) { return cfg[o.cle]; });
      AUTOS.forEach(function (o) { cfg[o.cle] = !tout; });
      sfx('upgrade');
      UI.refreshAll();
    });
    autoHead.appendChild(master);
    autoBox.appendChild(autoHead);

    var AUTOS = [
      { cle: 'eggs', label: 'Acheter les œufs', aide: 'garde 60 jetons de côté' },
      { cle: 'hatch', label: 'Faire éclore', aide: 'dès qu\'un œuf arrive' },
      { cle: 'breed', label: 'Fusionner', aide: 'choisit le meilleur couple' },
      { cle: 'collect', label: 'Accueillir les petits', aide: 'dès la fin de la couvaison' },
      { cle: 'team', label: 'Équipe optimale', aide: 'place toujours les plus forts' }
    ];

    var autoGrid = U.el('div', 'auto-grid');
    var autoLignes = AUTOS.map(function (o) {
      var l = U.el('label', 'toggle auto-toggle');
      var input = U.el('input');
      input.type = 'checkbox';
      U.on(input, 'change', function () {
        P.auto()[o.cle] = input.checked;
        if (input.checked) sfx('upgrade');
        UI.refreshAll();
      });
      l.appendChild(input);
      var txt = U.el('div');
      txt.appendChild(U.el('b', null, o.label));
      txt.appendChild(U.el('span', 'auto-aide', o.aide));
      l.appendChild(txt);
      autoGrid.appendChild(l);
      return { o: o, input: input };
    });
    autoBox.appendChild(autoGrid);

    var autoNote = U.el('div', 'auto-note');
    autoBox.appendChild(autoNote);
    node.appendChild(autoBox);

    /* ------------------------------------------------------------ œufs */
    var eggBox = U.el('div', 'card nest-card');
    eggBox.appendChild(U.icon('assets/upgrades/oeuf.png', 'card-icon'));
    var eggMain = U.el('div', 'card-main');
    eggMain.appendChild(U.el('b', null, "Œufs de la jungle"));
    var eggDesc = U.el('p', 'card-desc');
    eggMain.appendChild(eggDesc);
    var eggRow = U.el('div', 'mg-controls');
    eggRow.style.justifyContent = 'flex-start';
    var buyEgg = U.el('button', 'btn small', 'Acheter');
    U.on(buyEgg, 'click', function () {
      if (P.buyEgg()) { sfx('buy'); UI.refreshAll(); }
      else { sfx('error'); UI.toast('Pas assez de jetons', "Un œuf coûte " + P.eggCost() + ' jetons.', 'assets/upgrades/oeuf.png'); }
    });
    var hatchEgg = U.el('button', 'btn small ghost', 'Faire éclore');
    U.on(hatchEgg, 'click', function () {
      var res = P.hatch();
      if (!res) return;
      /* Les nouveautés sont annoncées par l'écouteur d'événements, qui couvre
         aussi les éclosions automatiques : ici on ne signale que les doublons. */
      if (!res.pet.isNew) {
        sfx('good');
        UI.toast('Éclosion', res.species.name + ' — ' + global.describePetEffects(res.species),
          res.species.icon);
      }
      UI.refreshAll();
    });
    eggRow.appendChild(buyEgg);
    eggRow.appendChild(hatchEgg);
    eggMain.appendChild(eggRow);
    eggBox.appendChild(eggMain);
    node.appendChild(eggBox);

    /* ------------------------------------------------------------- nid */
    var nestHead = head('Chambre de fusion', "Deux parents, un petit, et beaucoup de patience.");
    var fastBtn = U.el('button', 'btn small', 'Fusion rapide');
    fastBtn.title = "Lance aussitôt le meilleur couple disponible, sans rien sélectionner.";
    U.on(fastBtn, 'click', function () {
      if (P.breedBest()) { sfx('feature'); UI.refreshAll(); return; }
      sfx('error');
      UI.toast('Fusion impossible',
        "Il faut deux animaux hors équipe, assez de bananes, et aucune couvaison en cours.",
        'assets/upgrades/fusion.png');
    });
    nestHead.appendChild(fastBtn);
    node.appendChild(nestHead);
    var nestBox = U.el('div');
    node.appendChild(nestBox);

    /* -------------------------------------------------------- sélection */
    var selBox = U.el('div', 'fusion-bar hidden');
    node.appendChild(selBox);

    /* ---------------------------------------------------------- équipe */
    node.appendChild(head('Équipe active'));
    var teamBox = U.el('div', 'cards two');
    node.appendChild(teamBox);

    /* ------------------------------------------------------- ménagerie */
    node.appendChild(head('Ménagerie', "Cliquez « Fusionner » sur deux animaux pour les croiser."));
    var zooBox = U.el('div', 'cards two');
    node.appendChild(zooBox);

    /* ---------------------------------------------------------- album */
    node.appendChild(head('Espèces connues', "Les 56 espèces du domaine. Cliquez pour voir les recettes."));
    var albumBox = U.el('div', 'album-grid');
    node.appendChild(albumBox);

    var albumCells = global.PET_SPECIES.map(function (sp) {
      var cell = U.el('button', 'rare-cell r-pet-' + sp.tier);
      cell.appendChild(U.icon(sp.icon));
      cell.appendChild(U.el('span', 'rare-name', sp.name));
      U.on(cell, 'click', function () { showPetModal(sp); });
      albumBox.appendChild(cell);
      return { sp: sp, node: cell };
    });

    var selection = [];
    var zooSig = '', teamSig = '', nestSig = '';

    function toggleSelect(uid) {
      var at = selection.indexOf(uid);
      if (at >= 0) selection.splice(at, 1);
      else {
        if (selection.length >= 2) selection.shift();
        selection.push(uid);
      }
      zooSig = '';
      view.update();
    }

    function renderSelection() {
      selection = selection.filter(function (uid) { return !!P.byUid(uid); });
      var ok = selection.length === 2 && !G.S.pets.nest;
      selBox.classList.toggle('hidden', selection.length === 0);
      selBox.innerHTML = '';
      if (!selection.length) return;

      var a = P.byUid(selection[0]);
      var b = selection[1] ? P.byUid(selection[1]) : null;

      var line = U.el('div', 'fusion-line');
      line.appendChild(U.icon(global.PET_BY_ID[a.id].icon));
      line.appendChild(U.el('span', null, global.PET_BY_ID[a.id].name));
      line.appendChild(U.el('span', 'fusion-plus', '+'));
      if (b) {
        line.appendChild(U.icon(global.PET_BY_ID[b.id].icon));
        line.appendChild(U.el('span', null, global.PET_BY_ID[b.id].name));
      } else {
        line.appendChild(U.el('span', 'muted', 'choisissez un second animal'));
      }
      selBox.appendChild(line);

      if (b) {
        var pv = P.preview(a, b);
        var cost = P.breedCost(a, b);
        var ms = P.breedMs(a, b);
        var info = U.el('div', 'card-effect', pv.text);
        selBox.appendChild(info);
        var costLine = U.el('div', 'card-cost' + (G.S.bananas >= cost ? '' : ' too-expensive'),
          U.fmtFr(cost) + ' bananes · ' + U.fmtTime(ms / 1000) + ' de couvaison');
        selBox.appendChild(costLine);
      }

      var actions = U.el('div', 'mg-controls');
      actions.style.justifyContent = 'flex-start';
      var go = U.el('button', 'btn', 'Fusionner');
      go.disabled = !ok;
      U.on(go, 'click', function () {
        if (!ok) return;
        var res = P.startBreed(selection[0], selection[1]);
        if (!res) { sfx('error'); UI.toast('Fusion impossible', "Pas assez de bananes, ou une fusion est déjà en cours.", 'assets/upgrades/fusion.png'); return; }
        selection = [];
        sfx('feature');
        UI.toast('Fusion lancée', "La couvaison a commencé.", 'assets/upgrades/fusion.png');
        zooSig = ''; nestSig = '';
        UI.refreshAll();
      });
      var clear = U.el('button', 'btn ghost small', 'Annuler');
      U.on(clear, 'click', function () { selection = []; zooSig = ''; view.update(); });
      actions.appendChild(go);
      actions.appendChild(clear);
      selBox.appendChild(actions);
    }

    function renderNest() {
      var p = P.nestProgress();
      var sig = p ? (p.ready ? 'ready' : 'busy') : 'none';
      if (sig !== nestSig) {
        nestSig = sig;
        nestBox.innerHTML = '';
        if (!p) {
          nestBox.appendChild(U.el('div', 'empty',
            G.S.features.breeding
              ? "Aucune fusion en cours. Sélectionnez deux animaux dans la ménagerie."
              : "La Chambre de Fusion n'est pas encore construite (voir Découvertes)."));
        } else {
          var card = U.el('div', 'card nest-card');
          card.appendChild(U.icon('assets/upgrades/fusion.png', 'card-icon'));
          var main = U.el('div', 'card-main');
          main.appendChild(U.el('b', null, 'Couvaison en cours'));
          var parents = U.el('p', 'card-desc',
            global.PET_BY_ID[p.nest.a].name + ' × ' + global.PET_BY_ID[p.nest.b].name);
          main.appendChild(parents);
          var bar = U.el('div', 'bar');
          var fill = U.el('i');
          bar.appendChild(fill);
          main.appendChild(bar);
          var left = U.el('div', 'chal-prog');
          main.appendChild(left);
          var row = U.el('div', 'mg-controls');
          row.style.justifyContent = 'flex-start';
          var collect = U.el('button', 'claim-btn', 'Accueillir le petit');
          U.on(collect, 'click', function () {
            var res = P.collectNest();
            if (!res) return;
            if (!res.isNew) {
              sfx('good');
              UI.toast('Naissance', res.species.name + ' — ' + global.describePetEffects(res.species),
                res.species.icon);
            }
            nestSig = ''; zooSig = '';
            UI.refreshAll();
          });
          var rush = U.el('button', 'btn ghost small', 'Accélérer');
          U.on(rush, 'click', function () {
            if (P.rushNest()) { sfx('boost'); nestSig = ''; UI.refreshAll(); }
            else { sfx('error'); UI.toast('Pas assez de jetons', 'Accélérer coûte ' + P.rushCost() + ' jetons.', 'assets/misc/token.png'); }
          });
          row.appendChild(collect);
          row.appendChild(rush);
          main.appendChild(row);
          card.appendChild(main);
          nestBox.appendChild(card);
          nestBox._fill = fill;
          nestBox._left = left;
          nestBox._collect = collect;
          nestBox._rush = rush;
        }
      }
      if (p && nestBox._fill) {
        nestBox._fill.style.width = (p.ratio * 100) + '%';
        nestBox._left.textContent = p.ready
          ? 'Prêt à éclore !'
          : 'Encore ' + U.fmtTime(p.secondsLeft);
        nestBox._collect.classList.toggle('hidden', !p.ready);
        nestBox._rush.classList.toggle('hidden', p.ready);
        nestBox._rush.textContent = 'Accélérer (' + P.rushCost() + ' jetons)';
        nestBox._rush.disabled = G.S.tokens < P.rushCost();
      }
    }

    var view = {
      node: node,
      update: function () {
        var st = G.S.pets;
        var cfg = P.auto();

        /* --- automatisation --- */
        var fusionPrete = !!G.S.features.breeding;
        var actifs = 0;
        autoLignes.forEach(function (l) {
          /* Fusionner et accueillir n'ont de sens qu'une fois la Chambre bâtie. */
          var dispo = (l.o.cle === 'breed' || l.o.cle === 'collect') ? fusionPrete : true;
          l.input.checked = !!cfg[l.o.cle];
          l.input.disabled = !dispo;
          l.input.parentNode.classList.toggle('indispo', !dispo);
          if (cfg[l.o.cle]) actifs++;
        });
        master.textContent = actifs === AUTOS.length ? 'Tout couper' : 'Tout activer';
        autoNote.textContent = actifs === 0
          ? "Rien d'automatique : vous gardez la main sur chaque étape."
          : actifs + (actifs > 1 ? ' automatismes actifs' : ' automatisme actif') +
            " · les animaux de l'équipe ne sont jamais fusionnés.";

        fastBtn.classList.toggle('hidden', !fusionPrete || !!st.nest);

        stats.innerHTML = '';
        stats.appendChild(statGrid([
          ['Espèces découvertes', P.speciesCount() + '/' + global.PET_SPECIES.length],
          ['Animaux au domaine', st.owned.length],
          ['Emplacements actifs', P.team().length + '/' + P.teamSize()],
          ['Fusions réussies', G.S.stats.petsBred || 0],
          ['Amplification élevage', '+' + Math.round(P.amplifier()) + '%']
        ]));

        eggDesc.textContent = "En stock : " + st.eggs + " · un œuf donne un animal commun, " +
          "parfois mieux. Prix : " + P.eggCost() + " jetons.";
        buyEgg.disabled = G.S.tokens < P.eggCost();
        buyEgg.textContent = 'Acheter (' + P.eggCost() + ' jetons)';
        hatchEgg.disabled = st.eggs <= 0;

        nestHead.classList.toggle('hidden', !G.S.features.breeding);
        renderNest();
        renderSelection();

        /* --- équipe --- */
        var teamList = P.team();
        var tSig = teamList.map(function (p) { return p.uid; }).join(',') + '|' + P.teamSize();
        if (tSig !== teamSig) {
          teamSig = tSig;
          teamBox.innerHTML = '';
          if (!teamList.length) {
            teamBox.appendChild(U.el('div', 'empty', "Aucun animal actif. Placez-en un depuis la ménagerie."));
          }
          teamList.forEach(function (pet) {
            var actions = U.el('div');
            var out = U.el('button', 'btn ghost small', 'Retirer');
            U.on(out, 'click', function () { P.toggleTeam(pet.uid); teamSig = ''; zooSig = ''; UI.refreshAll(); });
            actions.appendChild(out);
            teamBox.appendChild(petCard(pet, { actions: actions }));
          });
        }

        /* --- ménagerie --- */
        var zSig = st.owned.map(function (p) { return p.uid; }).join(',') +
                   '|' + selection.join(',') + '|' + st.team.join(',');
        if (zSig !== zooSig) {
          zooSig = zSig;
          zooBox.innerHTML = '';
          if (!st.owned.length) {
            zooBox.appendChild(U.el('div', 'empty', "La ménagerie est vide. Achetez un œuf et faites-le éclore."));
          }
          st.owned.forEach(function (pet) {
            var actions = U.el('div', 'pet-actions');
            var team = U.el('button', 'btn small' + (P.inTeam(pet.uid) ? '' : ' ghost'),
              P.inTeam(pet.uid) ? 'Actif' : 'Équipe');
            U.on(team, 'click', function () {
              if (!P.toggleTeam(pet.uid)) {
                UI.toast('Équipe complète', "Retirez d'abord un animal, ou agrandissez la ménagerie.", 'assets/upgrades/nurserie.png');
                return;
              }
              teamSig = ''; zooSig = '';
              UI.refreshAll();
            });
            actions.appendChild(team);
            if (G.S.features.breeding) {
              var picked = selection.indexOf(pet.uid) >= 0;
              var fuse = U.el('button', 'btn small' + (picked ? '' : ' ghost'),
                picked ? 'Choisi' : 'Fusionner');
              U.on(fuse, 'click', function () { toggleSelect(pet.uid); });
              actions.appendChild(fuse);
            }
            var card = petCard(pet, { actions: actions });
            if (selection.indexOf(pet.uid) >= 0) card.classList.add('picked');
            zooBox.appendChild(card);
          });
        }

        /* --- album --- */
        albumCells.forEach(function (c) {
          c.node.classList.toggle('unknown', !st.discovered[c.sp.id]);
        });
      }
    };

    return view;
  }

  function showPetModal(sp) {
    var known = !!G.S.pets.discovered[sp.id];
    var body = U.el('div');
    var h = U.el('div', 'modal-head');
    h.appendChild(U.icon(sp.icon));
    var t = U.el('div');
    t.appendChild(U.el('h2', null, known ? sp.name : '???'));
    t.appendChild(U.el('span', 'rarity-tag t-pet-' + sp.tier, global.PET_TIERS[sp.tier].label));
    h.appendChild(t);
    body.appendChild(h);

    if (known) {
      body.appendChild(U.el('p', null, sp.desc));
      body.appendChild(U.el('h3', null, "Bonus lorsqu'il est dans l'équipe"));
      body.appendChild(U.el('p', null, global.describePetEffects(sp)));
    } else {
      body.appendChild(U.el('p', 'muted', "Espèce jamais observée au domaine."));
    }

    var recipes = global.petRecipesFor(sp.id);
    body.appendChild(U.el('h3', null, recipes.length ? 'Recettes de fusion' : 'Origine'));
    if (!recipes.length) {
      body.appendChild(U.el('p', null,
        global.petTierIndex(sp.tier) <= 2
          ? "Peut sortir directement d'un œuf de la jungle."
          : "Aucune recette connue : il faut compter sur la chance d'un croisement libre."));
    } else {
      var list = U.el('div', 'cards');
      recipes.forEach(function (r) {
        var a = global.PET_BY_ID[r.a], b = global.PET_BY_ID[r.b];
        var row = U.el('div', 'fusion-line');
        row.appendChild(U.icon(a.icon));
        row.appendChild(U.el('span', null, a.name));
        row.appendChild(U.el('span', 'fusion-plus', '+'));
        row.appendChild(U.icon(b.icon));
        row.appendChild(U.el('span', null, b.name));
        list.appendChild(row);
      });
      body.appendChild(list);
    }

    var actions = U.el('div', 'modal-actions');
    var ok = U.el('button', 'btn', 'Fermer');
    U.on(ok, 'click', UI.closeModal);
    actions.appendChild(ok);
    body.appendChild(actions);
    UI.modal(body);
  }

  /* ==================================================================== */
  /* =============================== CASINO ============================= */
  /* ==================================================================== */

  function buildCasino() {
    var C = global.CASINO;
    var node = U.el('div');
    node.appendChild(head('Casino de la Canopée',
      "La mise est plafonnée par votre production. La maison garde toujours un léger avantage."));

    var warn = U.el('div', 'note warn');
    warn.innerHTML = "Les gains du casino remplissent votre réserve mais <b>ne comptent pas</b> " +
      "dans le total qui donne les Graines d'Or : impossible de gagner du prestige en misant.";
    node.appendChild(warn);

    /* --- sélecteur de mise --- */
    var betRow = U.el('div', 'bet-row');
    node.appendChild(betRow);
    var bet = 0;
    var betButtons = [];
    ['5 %', '20 %', '50 %', 'MAX'].forEach(function (label, i) {
      var b = U.el('button', 'btn ghost small', label);
      U.on(b, 'click', function () {
        bet = C.betOptions()[i];
        betButtons.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        view.update();
      });
      betButtons.push(b);
      betRow.appendChild(b);
    });
    var betLabel = U.el('span', 'bet-label');
    betRow.appendChild(betLabel);

    /* --- sous-onglets --- */
    var games = [
      { id: 'slot', label: 'Machine', icon: 'assets/casino/slot.png' },
      { id: 'roulette', label: 'Roulette', icon: 'assets/casino/roulette.png' },
      { id: 'bj', label: '21 Bananes', icon: 'assets/casino/cartes.png' },
      { id: 'race', label: 'Course', icon: 'assets/casino/cochon.png', need: 'race' }
    ];
    var sub = U.el('div', 'casino-nav');
    node.appendChild(sub);
    var stage = U.el('div');
    node.appendChild(stage);

    var current = 'slot', navSig = '';

    function buildNav() {
      var visible = games.filter(function (g) { return !g.need || G.S.features[g.need]; });
      var sig = visible.map(function (g) { return g.id; }).join(',') + '|' + current;
      if (sig === navSig) return;
      navSig = sig;
      sub.innerHTML = '';
      visible.forEach(function (g) {
        var b = U.el('button', 'tab' + (g.id === current ? ' active' : ''));
        b.appendChild(U.icon(g.icon));
        b.appendChild(U.el('span', null, g.label));
        U.on(b, 'click', function () {
          if (current === 'bj') C.bjClear();
          current = g.id;
          navSig = '';
          renderGame();
          buildNav();
        });
        sub.appendChild(b);
      });
      if (!visible.some(function (g) { return g.id === current; })) current = 'slot';
    }

    var panel = null;

    function renderGame() {
      stage.innerHTML = '';
      panel = ({ slot: slotPanel, roulette: roulettePanel, bj: bjPanel, race: racePanel })[current]();
      stage.appendChild(panel.node);
      if (panel.update) panel.update();
    }

    function currentBet() { return bet || C.betOptions()[0]; }

    /* -------------------------------------------------- machine à sous */
    function slotPanel() {
      var wrap = U.el('div');
      wrap.appendChild(head('Machine à Bananes', "Trois symboles identiques paient le gros lot."));

      var reels = U.el('div', 'slot-reels');
      var cells = [0, 1, 2].map(function () {
        var c = U.el('div', 'slot-cell');
        var im = U.el('img');
        im.alt = '';
        U.setSprite(im, C.REELS[0].sprite);
        c.appendChild(im);
        reels.appendChild(c);
        return { node: c, img: im };
      });
      wrap.appendChild(reels);

      /* Change le symbole affiché sur un rouleau. */
      function setSymbol(cell, sym) {
        if (cell.sym === sym.id) return;
        cell.sym = sym.id;
        U.setSprite(cell.img, sym.sprite);
      }

      var out = U.el('div', 'casino-out', 'Choisissez une mise et tirez le levier.');
      wrap.appendChild(out);

      var row = U.el('div', 'mg-controls');
      var go = U.el('button', 'btn', 'Tirer le levier');
      row.appendChild(go);
      wrap.appendChild(row);

      var table = U.el('div', 'pay-table');
      C.REELS.forEach(function (r) {
        var d = U.el('div');
        var trio = U.el('div', 'pay-trio');
        for (var k = 0; k < 3; k++) trio.appendChild(U.icon(r.sprite, null, r.name));
        d.appendChild(trio);
        d.appendChild(document.createTextNode('×' + r.three));
        table.appendChild(d);
      });
      var pair = U.el('div');
      pair.appendChild(U.el('b', null, 'Paire'));
      pair.appendChild(document.createTextNode('×1,05'));
      table.appendChild(pair);
      wrap.appendChild(table);

      var spinning = false;

      U.on(go, 'click', function () {
        if (spinning) return;
        var amount = currentBet();
        var res = C.playSlots(amount);
        if (!res) {
          sfx('error');
          out.textContent = "Mise impossible : pas assez de bananes, ou au-dessus du plafond.";
          return;
        }
        spinning = true;
        sfx('spin');
        var ticks = 0;
        var iv = setInterval(function () {
          ticks++;
          cells.forEach(function (c, i) {
            if (ticks > 8 + i * 4) return;
            setSymbol(c, U.pick(C.REELS));
            c.node.classList.add('spin');
          });
          if (ticks >= 20) {
            clearInterval(iv);
            cells.forEach(function (c, i) {
              setSymbol(c, res.reels[i]);
              c.node.classList.remove('spin');
            });
            spinning = false;
            finishSpin(res);
          }
        }, 55);
      });

      function finishSpin(res) {
        var bits = [];
        if (res.result.kind === 'triple') bits.push('TRIPLE ' + res.result.symbol.name + ' ×' + res.result.mult);
        else if (res.result.kind === 'pair') bits.push('Paire de ' + res.result.symbol.name);
        else bits.push('Rien de rien');
        cells.forEach(function (c) {
          c.node.classList.toggle('win', res.result.kind === 'triple');
        });
        bits.push(res.net >= 0 ? '+' + U.fmtFr(res.net) : '−' + U.fmtFr(-res.net));
        out.textContent = bits.join(' · ') + ' bananes';
        out.className = 'casino-out ' + (res.net > 0 ? 'win' : res.net < 0 ? 'lose' : '');
        sfx(res.net > 0 ? (res.result.kind === 'triple' ? 'golden' : 'good') : 'fail');
        if (res.extra.tokens) UI.toast('Bonus machine', res.extra.tokens + ' jetons', 'assets/misc/token.png', 'gold');
        if (res.extra.rare) UI.announceRare(res.extra.rare, 'casino');
        UI.refreshAll();
      }

      return { node: wrap, update: function () { go.disabled = spinning; } };
    }

    /* ------------------------------------------------------- roulette */
    function roulettePanel() {
      var wrap = U.el('div');
      wrap.appendChild(head('Roulette Tropicale', "Vingt-cinq cases : un zéro vert, douze rouges, douze noires."));

      var wheelWrap = U.el('div', 'roulette-wrap');
      var wheel = U.icon('assets/casino/roue.png', 'roulette-wheel', 'Roulette');
      wheelWrap.appendChild(wheel);
      var display = U.el('div', 'roulette-display', '—');
      wheelWrap.appendChild(display);
      wrap.appendChild(wheelWrap);

      var out = U.el('div', 'casino-out', 'Choisissez une mise, puis un pari.');
      wrap.appendChild(out);

      var grid = U.el('div', 'cards two');
      C.ROULETTE_BETS.forEach(function (kind) {
        var b = U.el('button', 'card');
        var main = U.el('div', 'card-main');
        main.appendChild(U.el('b', null, kind.label));
        main.appendChild(U.el('div', 'card-effect', 'Paie ×' + kind.pays));
        b.appendChild(main);
        U.on(b, 'click', function () { play(kind.id); });
        grid.appendChild(b);
      });
      wrap.appendChild(grid);

      function play(id) {
        var res = C.playRoulette(id, currentBet());
        if (!res) {
          sfx('error');
          out.textContent = "Mise impossible : pas assez de bananes, ou au-dessus du plafond.";
          return;
        }
        display.textContent = res.number;
        display.className = 'roulette-display c-' + res.color;
        /* Un tour de roue par coup, pour donner de la vie au tirage. */
        wheel.classList.remove('spinning');
        void wheel.offsetWidth;
        wheel.classList.add('spinning');
        out.textContent = res.bet.label + ' → ' + res.number + ' (' + res.color + ') · ' +
          (res.net >= 0 ? '+' + U.fmtFr(res.net) : '−' + U.fmtFr(-res.net)) + ' bananes';
        out.className = 'casino-out ' + (res.net > 0 ? 'win' : 'lose');
        sfx(res.won ? 'challenge' : 'fail');
        UI.refreshAll();
      }

      return { node: wrap, update: function () {} };
    }

    /* ----------------------------------------------------- 21 Bananes */
    function bjPanel() {
      var wrap = U.el('div');
      wrap.appendChild(head('21 Bananes', "Battre le croupier sans dépasser 21. Le blackjack paie 3 contre 2."));

      var dealerRow = U.el('div', 'bj-row');
      var dealerLabel = U.el('div', 'bj-label', 'Croupier');
      var dealerCards = U.el('div', 'bj-cards');
      dealerRow.appendChild(dealerLabel);
      dealerRow.appendChild(dealerCards);
      wrap.appendChild(dealerRow);

      var playerRow = U.el('div', 'bj-row');
      var playerLabel = U.el('div', 'bj-label', 'Vous');
      var playerCards = U.el('div', 'bj-cards');
      playerRow.appendChild(playerLabel);
      playerRow.appendChild(playerCards);
      wrap.appendChild(playerRow);

      var out = U.el('div', 'casino-out', 'Choisissez une mise et distribuez.');
      wrap.appendChild(out);

      var row = U.el('div', 'mg-controls');
      var deal = U.el('button', 'btn', 'Distribuer');
      var hit = U.el('button', 'btn', 'Carte');
      var stand = U.el('button', 'btn ghost', 'Rester');
      var dbl = U.el('button', 'btn ghost', 'Doubler');
      [deal, hit, stand, dbl].forEach(function (b) { row.appendChild(b); });
      wrap.appendChild(row);

      function cardNode(c, hidden) {
        var n = U.el('div', 'bj-card' + (hidden ? ' dos' : ''));
        var face = U.el('img', 'bj-face');
        face.alt = '';
        U.setSprite(face, hidden ? 'assets/casino/carte_dos.png' : 'assets/casino/carte_face.png');
        n.appendChild(face);
        if (!hidden) {
          n.appendChild(U.el('span', 'bj-rank' + (c.suit.red ? ' red' : ''), c.label));
          n.appendChild(U.icon(c.suit.sprite, 'bj-suit', c.suit.id));
        }
        return n;
      }

      function render(state) {
        dealerCards.innerHTML = '';
        playerCards.innerHTML = '';
        if (!state) {
          dealerLabel.textContent = 'Croupier';
          playerLabel.textContent = 'Vous';
          return;
        }
        state.dealer.forEach(function (c, i) {
          dealerCards.appendChild(cardNode(c, state.hidden && i > 0));
        });
        state.player.forEach(function (c) { playerCards.appendChild(cardNode(c, false)); });
        dealerLabel.textContent = 'Croupier · ' +
          (state.hidden ? C.handValue([state.dealer[0]]) + ' + ?' : state.dealerValue);
        playerLabel.textContent = 'Vous · ' + state.playerValue;
      }

      function after(state) {
        render(state);
        if (state && state.over) {
          out.textContent = state.result.toUpperCase() + ' · ' +
            (state.net >= 0 ? '+' + U.fmtFr(state.net) : '−' + U.fmtFr(-state.net)) + ' bananes';
          out.className = 'casino-out ' + (state.net > 0 ? 'win' : state.net < 0 ? 'lose' : '');
          sfx(state.net > 0 ? 'challenge' : state.net < 0 ? 'fail' : 'good');
          UI.refreshAll();
        }
        view.update();
      }

      U.on(deal, 'click', function () {
        C.bjClear();
        var st = C.bjStart(currentBet());
        if (!st) { sfx('error'); out.textContent = "Mise impossible : pas assez de bananes, ou au-dessus du plafond."; return; }
        out.textContent = 'À vous de jouer.';
        out.className = 'casino-out';
        sfx('buy');
        after(st);
      });
      U.on(hit, 'click', function () { after(C.bjHit()); });
      U.on(stand, 'click', function () { after(C.bjStand()); });
      U.on(dbl, 'click', function () {
        var st = C.bjDouble();
        if (!st) { sfx('error'); return; }
        after(st);
      });

      render(C.bjState());

      return {
        node: wrap,
        update: function () {
          var active = C.bjActive();
          var st = C.bjState();
          deal.disabled = active;
          hit.disabled = !active;
          stand.disabled = !active;
          dbl.disabled = !active || !st || st.player.length !== 2;
        }
      };
    }

    /* ------------------------------------------------ course de cochons */
    function racePanel() {
      var wrap = U.el('div');
      wrap.appendChild(head('Course de Cochons',
        "Six concurrents, six cotes. Misez sur le vôtre et croisez les doigts."));

      var W = 560, H = 240;
      var stageBox = U.el('div', 'mg-stage');
      var cv = U.el('canvas');
      cv.width = W; cv.height = H;
      stageBox.appendChild(cv);
      wrap.appendChild(stageBox);
      var ctx = cv.getContext('2d');
      var piste = MG.img('assets/casino/piste.png');

      var out = U.el('div', 'casino-out', 'Choisissez une mise, puis un cochon.');
      wrap.appendChild(out);

      var list = U.el('div', 'cards two');
      wrap.appendChild(list);

      var row = U.el('div', 'mg-controls');
      var again = U.el('button', 'btn ghost', 'Nouvelle course');
      U.on(again, 'click', function () { C.resetRace(); build(); draw(0); });
      row.appendChild(again);
      wrap.appendChild(row);

      var race = C.currentRace();
      var running = false, elapsed = 0, done = false;

      function build() {
        race = C.currentRace();
        running = false; elapsed = 0; done = false;
        out.textContent = 'Choisissez une mise, puis un cochon.';
        out.className = 'casino-out';
        list.innerHTML = '';
        race.pigs.forEach(function (pig, i) {
          var card = U.el('button', 'card pig-card');
          card.appendChild(U.icon(pig.sprite, 'pig-portrait', pig.name));
          var main = U.el('div', 'card-main');
          main.appendChild(U.el('b', null, pig.name));
          main.appendChild(U.el('div', 'card-effect',
            'Cote ×' + pig.odds.toFixed(2).replace('.', ',') +
            ' · ' + Math.round(pig.chance * 100) + ' % de chances'));
          card.appendChild(main);
          U.on(card, 'click', function () { start(i); });
          list.appendChild(card);
        });
      }

      function start(i) {
        if (running || done) return;
        var r = C.runRace(i, currentBet());
        if (!r) { sfx('error'); out.textContent = "Mise impossible : pas assez de bananes, ou au-dessus du plafond."; return; }
        running = true;
        elapsed = 0;
        out.textContent = 'Et c\'est parti !';
        sfx('spin');
      }

      function draw(dt) {
        if (running) {
          elapsed += dt;
          var slowest = 0;
          race.order.forEach(function (p) { slowest = Math.max(slowest, p.duration); });
          if (elapsed >= slowest + 0.4) {
            running = false;
            done = true;
            C.finishRace();
            var won = race.won;
            out.textContent = race.winner.name + ' l\'emporte ! ' +
              (won ? '+' + U.fmtFr(race.net) : '−' + U.fmtFr(-race.net)) + ' bananes';
            out.className = 'casino-out ' + (won ? 'win' : 'lose');
            sfx(won ? 'challenge' : 'fail');
            UI.refreshAll();
          }
        }

        /* Le décor est une bande représentant UN couloir : on l'étire une fois
           par couloir, ce qui garde la piste régulière sur toute la hauteur. */
        if (piste.ok) {
          var lane = H / race.pigs.length;
          for (var li = 0; li < race.pigs.length; li++) ctx.drawImage(piste, 0, li * lane, W, lane);
        } else {
          ctx.fillStyle = '#3c6b2a';
          ctx.fillRect(0, 0, W, H);
        }
        ctx.fillStyle = 'rgba(6,18,11,.34)';
        ctx.fillRect(0, 0, W, H);

        var laneH = H / race.pigs.length;

        /* ligne d'arrivée en damier */
        for (var y = 0; y < H; y += 10) {
          ctx.fillStyle = (Math.floor(y / 10) % 2) ? '#fff6dc' : '#17110a';
          ctx.fillRect(W - 24, y, 10, 10);
          ctx.fillStyle = (Math.floor(y / 10) % 2) ? '#17110a' : '#fff6dc';
          ctx.fillRect(W - 14, y, 10, 10);
        }

        race.pigs.forEach(function (pig, i) {
          var yy = i * laneH;
          ctx.fillStyle = i % 2 ? 'rgba(0,0,0,.16)' : 'rgba(0,0,0,.06)';
          ctx.fillRect(0, yy, W, laneH);
          ctx.strokeStyle = 'rgba(255,246,220,.12)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();

          var progress = 0;
          if (running || done) {
            progress = U.clamp(elapsed / pig.duration, 0, 1);
            /* petit tangage pour rendre la course vivante */
            progress = U.clamp(progress + Math.sin(elapsed * 3 + pig.wobble * 6) * 0.02 * (1 - progress), 0, 1);
          }
          var x = 10 + progress * (W - 74);
          var size = Math.min(laneH * 0.92, 42);
          /* petit rebond de galop */
          var hop = running ? Math.abs(Math.sin(elapsed * 9 + i)) * 4 : 0;
          MG.drawSprite(ctx, pig.sprite, x, yy + (laneH - size) / 2 - hop, size, size, pig.color);

          ctx.fillStyle = 'rgba(23,17,10,.75)';
          ctx.fillRect(4, yy + 3, ctx.measureText(pig.name).width + 12, 13);
          ctx.fillStyle = '#fff6dc';
          ctx.font = 'bold 11px Trebuchet MS, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(pig.name, 9, yy + 13);
        });
      }

      build();

      var last = performance.now();
      var raf;
      function frame(now) {
        var dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!wrap.isConnected) return;      // l'onglet a changé : on arrête
        draw(dt);
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);

      return {
        node: wrap,
        update: function () {
          again.classList.toggle('hidden', !done);
          U.qsa('.pig-card', list).forEach(function (c) { c.disabled = running || done; });
        }
      };
    }

    var view = {
      node: node,
      update: function () {
        var opts = C.betOptions();
        if (!bet) { bet = opts[0]; betButtons[0].classList.add('active'); }
        betLabel.textContent = 'Mise : ' + U.fmtFr(currentBet()) +
          ' bananes · plafond ' + U.fmtFr(C.maxBet());
        betButtons.forEach(function (b, i) { b.disabled = G.S.bananas < opts[i]; });
        buildNav();
        if (!panel) renderGame();
        if (panel && panel.update) panel.update();
      }
    };

    buildNav();
    renderGame();
    return view;
  }

  /* ==================================================================== */
  /* ============================= APPARENCE ============================ */
  /* ==================================================================== */

  function buildApparence() {
    var node = U.el('div');
    node.appendChild(head('Garde-Robe',
      "Purement décoratif : aucune apparence ne donne le moindre bonus."));

    var pills = U.el('div', 'album-stats');
    node.appendChild(pills);

    var grid = U.el('div', 'skin-grid');
    node.appendChild(grid);

    var cells = global.SKINS.map(function (skin) {
      var cell = U.el('button', 'skin-cell');
      cell.appendChild(U.icon(skin.icon, 'skin-img', skin.name));
      cell.appendChild(U.el('b', null, skin.name));
      var hint = U.el('span', 'skin-how');
      cell.appendChild(hint);
      U.on(cell, 'click', function () {
        if (!G.S.skins.owned[skin.id]) {
          sfx('error');
          UI.toast('Apparence verrouillée', skin.how, skin.icon);
          return;
        }
        G.S.skins.active = skin.id;
        sfx('upgrade');
        UI.applySkin();
        UI.refreshAll();
      });
      grid.appendChild(cell);
      return { skin: skin, node: cell, hint: hint };
    });

    return {
      node: node,
      update: function () {
        var owned = 0;
        cells.forEach(function (c) {
          var has = !!G.S.skins.owned[c.skin.id];
          if (has) owned++;
          c.node.classList.toggle('locked', !has);
          c.node.classList.toggle('active', G.S.skins.active === c.skin.id);
          c.hint.textContent = has
            ? (G.S.skins.active === c.skin.id ? 'Équipée' : c.skin.desc)
            : c.skin.how;
        });
        pills.innerHTML = '';
        var p = U.el('span', 'album-pill', 'Débloquées ' + owned + '/' + global.SKINS.length);
        p.style.color = 'var(--banana)';
        pills.appendChild(p);
      }
    };
  }

  /* ==================================================================== */

  /*
   * Une seule annonce par espèce inédite, quelle que soit son origine : œuf
   * ouvert à la main, éclosion automatique ou naissance en couvaison. Les
   * doublons restent signalés par le bouton qui les a produits, sinon
   * l'automatisation inonderait l'écran.
   */
  G.on('pets', function (e) {
    if (e.kind !== 'gain' || !e.isNew || !e.species) return;
    sfx('rare', { rarity: 'legendaire' });
    UI.toast('Nouvelle espèce !',
      e.species.name + ' — ' + global.describePetEffects(e.species),
      e.species.icon, 'rare');
  });

  UI.registerTab({
    id: 'nurserie', label: 'Nurserie', icon: 'assets/upgrades/nurserie.png',
    need: function (S) { return S.features.pets; }
  }, buildNurserie, 'marche');

  UI.registerTab({
    id: 'casino', label: 'Casino', icon: 'assets/casino/slot.png',
    need: function (S) { return S.features.casino; }
  }, buildCasino, 'reliques');

  UI.registerTab({
    id: 'apparence', label: 'Apparence', icon: 'assets/skins/doree.png',
    need: function (S) { return S.features.skins; }
  }, buildApparence, 'options');
})(window);

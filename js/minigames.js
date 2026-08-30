/* Banana Factory - les sept minijeux de l'Arcade */
(function (global) {
  'use strict';

  var U = global.U;
  function sfx(n, p) { if (global.SFX) global.SFX.play(n, p); }
  var MG = { games: [], byId: {}, current: null, root: null, onExit: null };

  /* Cache d'images avec repli graphique si le sprite manque */
  var imgCache = {};
  function img(src) {
    if (!imgCache[src]) {
      var i = new Image();
      var remote = global.ASSETS ? global.ASSETS.remoteUrl(src) : src;
      i.ok = false;
      i.onload = function () { i.ok = true; };
      i.onerror = function () {
        i.ok = false;
        if (i.src !== remote && remote !== src) { i.src = remote; }
      };
      i.src = global.ASSETS ? global.ASSETS.resolve(src) : src;
      imgCache[src] = i;
    }
    return imgCache[src];
  }
  /* Dessine un sprite, ou un carré de couleur tant qu'il n'est pas chargé */
  function drawSprite(ctx, src, x, y, w, h, fallbackColor) {
    var i = img(src);
    if (i.ok) { ctx.drawImage(i, x, y, w, h); return; }
    ctx.fillStyle = fallbackColor || '#ffd23f';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#17110a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  /* ------------------------------------------------- cycle de vie commun */

  var timers = [], rafs = [], keyHandlers = [];

  function every(fn, ms) { var id = setInterval(fn, ms); timers.push(id); return id; }
  function after(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function loop(fn) {
    var last = performance.now(), stopped = false;
    function step(now) {
      if (stopped) return;
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      fn(dt, now);
      var id = requestAnimationFrame(step);
      rafs[rafs.length - 1] = id;
    }
    rafs.push(requestAnimationFrame(step));
    return function () { stopped = true; };
  }
  function onKey(evt, fn) {
    window.addEventListener(evt, fn);
    keyHandlers.push([evt, fn]);
  }

  function cleanup() {
    timers.forEach(clearInterval);
    timers.forEach(clearTimeout);
    timers = [];
    rafs.forEach(cancelAnimationFrame);
    rafs = [];
    keyHandlers.forEach(function (h) { window.removeEventListener(h[0], h[1]); });
    keyHandlers = [];
  }

  function define(g) { MG.games.push(g); MG.byId[g.id] = g; }

  function open(id, root, onExit) {
    close();
    var g = MG.byId[id];
    if (!g) return;
    MG.current = g;
    MG.root = root;
    MG.onExit = onExit;
    root.innerHTML = '';
    g.mount(root, {
      finish: function (weight, score, detail) { finish(g, weight, score, detail); },
      quit: function () { close(); if (onExit) onExit(); }
    });
  }

  function close() {
    cleanup();
    MG.current = null;
  }

  /* Écran de fin commun à tous les minijeux */
  function finish(g, weight, score, detail) {
    cleanup();
    sfx(weight >= 1 ? 'challenge' : 'good');
    var res = global.G.minigameReward(g.id, Math.max(0, weight), score);
    var root = MG.root;
    root.innerHTML = '';

    var box = U.el('div', 'mg-result');
    var head = U.el('div', 'modal-head');
    var icon = U.el('img');
    icon.alt = '';
    U.setSprite(icon, g.icon);
    head.appendChild(icon);
    var titles = U.el('div');
    titles.appendChild(U.el('h2', null, 'Partie terminée'));
    titles.appendChild(U.el('p', 'muted', detail || (g.scoreLabel + ' : ' + score)));
    head.appendChild(titles);
    box.appendChild(head);

    var grid = U.el('div', 'stat-grid');
    grid.appendChild(statBox('Bananes gagnées', U.fmtFr(res.bananas)));
    grid.appendChild(statBox('Jetons gagnés', res.tokens));
    grid.appendChild(statBox('Meilleur score', global.G.S.stats.best[g.id] || 0));
    box.appendChild(grid);

    if (res.rare) {
      var found = U.el('div', 'note');
      found.innerHTML = '<b>' + (res.rare.isNew ? 'Nouvelle banane rare !' : 'Banane rare (doublon)') +
        '</b> ' + res.rare.rare.name +
        (res.rare.isNew ? '' : ' — convertie en ' + res.rare.tokens + ' jetons');
      box.appendChild(found);
    }

    var actions = U.el('div', 'modal-actions');
    var again = U.el('button', 'btn', 'Rejouer');
    U.on(again, 'click', function () { open(g.id, root, MG.onExit); });
    var back = U.el('button', 'btn ghost', "Retour à l'arcade");
    U.on(back, 'click', function () { close(); if (MG.onExit) MG.onExit(); });
    actions.appendChild(again);
    actions.appendChild(back);
    box.appendChild(actions);

    root.appendChild(box);
  }

  function statBox(label, value) {
    var d = U.el('div');
    d.appendChild(U.el('b', null, String(value)));
    d.appendChild(document.createTextNode(label));
    return d;
  }

  /* En-tête HUD réutilisable */
  function hud(root, fields) {
    var bar = U.el('div', 'mg-hud');
    var refs = {};
    fields.forEach(function (f) {
      var span = U.el('span');
      span.appendChild(document.createTextNode(f.label + ' '));
      var v = U.el('b', 'v', String(f.value));
      span.appendChild(v);
      refs[f.key] = v;
      bar.appendChild(span);
    });
    var quit = U.el('button', 'btn ghost small', 'Abandonner');
    U.on(quit, 'click', function () { close(); if (MG.onExit) MG.onExit(); });
    bar.appendChild(quit);
    root.appendChild(bar);
    return refs;
  }

  function helpText(root, text) {
    var p = U.el('p', 'mg-help', text);
    root.appendChild(p);
    return p;
  }

  /* ==================================================== 1. TRI EXPRESS === */

  var TRI_KINDS = [
    { id: 'mure', keep: true, sprite: 'assets/minigames/b_mure.png', color: '#ffd23f', w: 42 },
    { id: 'pourrie', keep: false, sprite: 'assets/minigames/b_pourrie.png', color: '#6b4b2a', w: 28 },
    { id: 'verte', keep: false, sprite: 'assets/minigames/b_verte.png', color: '#7ec850', w: 22 },
    { id: 'or', keep: true, sprite: 'assets/minigames/b_or.png', color: '#fff29a', w: 8 }
  ];

  define({
    id: 'tri', name: 'Tri Express', icon: 'assets/minigames/mg_tri.png',
    scoreLabel: 'Bananes triées',
    desc: "Gardez les bananes mûres, jetez le reste. Trois erreurs et c'est fini.",
    mount: function (root, api) {
      var refs = hud(root, [
        { key: 'score', label: 'Triées', value: 0 },
        { key: 'lives', label: 'Erreurs', value: '0/3' },
        { key: 'speed', label: 'Vitesse', value: '×1,0' }
      ]);

      var belt = U.el('div', 'mg-stage tri-belt');
      root.appendChild(belt);

      var line = U.el('div');
      line.style.cssText = 'position:absolute;left:96px;top:0;bottom:0;width:3px;background:rgba(255,210,63,.55);z-index:1';
      belt.appendChild(line);

      var buttons = U.el('div', 'tri-buttons');
      var keepBtn = U.el('button', 'btn', '✔ GARDER');
      var tossBtn = U.el('button', 'btn danger', '✘ JETER');
      buttons.appendChild(keepBtn);
      buttons.appendChild(tossBtn);
      root.appendChild(buttons);

      helpText(root, "La banane la plus à gauche est celle à trier. Mûres et dorées : à garder. " +
                     "Pourries et vertes : à jeter. Raccourcis clavier : ← garder, → jeter.");

      var items = [], score = 0, errors = 0, speed = 90, spawnGap = 1.15, sinceSpawn = 0;
      var beltW = 0, finished = false;

      function spawn() {
        var kind = U.weightedPick(TRI_KINDS.map(function (k) { return { k: k, weight: k.w }; })).k;
        var node = U.el('div', 'tri-item');
        var im = U.el('img');
        im.alt = '';
        im.style.cssText = 'width:100%;height:100%';
        U.setSprite(im, kind.sprite);
        var fallback = im.onerror;
        im.onerror = function () {
          var remote = global.ASSETS ? global.ASSETS.remoteUrl(kind.sprite) : kind.sprite;
          if (im.src !== remote && remote !== kind.sprite) { im.src = remote; return; }
          node.style.background = kind.color;
          im.remove();
        };
        node.appendChild(im);
        node.style.top = (40 + Math.random() * 80) + 'px';
        belt.appendChild(node);
        items.push({ node: node, kind: kind, x: beltW + 20 });
      }

      function judge(keep) {
        if (finished || !items.length) return;
        var it = items.shift();
        var ok = (it.kind.keep === keep);
        it.node.remove();
        if (ok) {
          score += it.kind.id === 'or' ? 3 : 1;
          refs.score.textContent = score;
          sfx(it.kind.id === 'or' ? 'pickup' : 'good');
        } else {
          sfx('bad');
          errors++;
          refs.lives.textContent = errors + '/3';
          belt.style.boxShadow = 'inset 0 0 0 4px #ff5a5a';
          after(function () { belt.style.boxShadow = ''; }, 160);
          if (errors >= 3) end();
        }
      }

      function end() {
        if (finished) return;
        finished = true;
        api.finish(score / 22, score);
      }

      U.on(keepBtn, 'click', function () { judge(true); });
      U.on(tossBtn, 'click', function () { judge(false); });
      onKey('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); judge(true); }
        if (e.key === 'ArrowRight') { e.preventDefault(); judge(false); }
      });

      loop(function (dt) {
        if (finished) return;
        beltW = belt.clientWidth;
        speed += dt * 3.4;
        spawnGap = Math.max(0.42, 1.15 - score * 0.012);
        refs.speed.textContent = '×' + (speed / 90).toFixed(1);

        sinceSpawn += dt;
        if (sinceSpawn >= spawnGap) { sinceSpawn = 0; spawn(); }

        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i];
          it.x -= speed * dt;
          it.node.style.left = it.x + 'px';
          if (it.x < 40) {
            /* Non triée à temps : erreur */
            it.node.remove();
            items.splice(i, 1);
            sfx('bad');
            errors++;
            refs.lives.textContent = errors + '/3';
            if (errors >= 3) end();
          }
        }
      });
    }
  });

  /* ================================================= 2. PEEL RUSH ======== */

  var PEEL_DIRS = [
    { id: 'up', label: '▲', keys: ['ArrowUp', 'w', 'z'] },
    { id: 'down', label: '▼', keys: ['ArrowDown', 's'] },
    { id: 'left', label: '◀', keys: ['ArrowLeft', 'a', 'q'] },
    { id: 'right', label: '▶', keys: ['ArrowRight', 'd'] }
  ];

  define({
    id: 'peel', name: 'Peel Rush', icon: 'assets/minigames/mg_peel.png',
    scoreLabel: 'Bananes épluchées',
    desc: "20 secondes pour éplucher un maximum de bananes dans le bon sens.",
    mount: function (root, api) {
      var refs = hud(root, [
        { key: 'score', label: 'Épluchées', value: 0 },
        { key: 'time', label: 'Temps', value: '20,0 s' },
        { key: 'streak', label: 'Série', value: 0 }
      ]);

      var stage = U.el('div', 'mg-stage');
      stage.style.cssText += 'padding:22px 12px;text-align:center';
      var banana = U.el('img');
      banana.alt = '';
      U.setSprite(banana, 'assets/misc/banana_hero.png');
      banana.style.cssText = 'width:120px;height:120px';
      stage.appendChild(banana);
      var arrow = U.el('div', 'peel-arrow', '▲');
      stage.appendChild(arrow);
      root.appendChild(stage);

      var pad = U.el('div', 'peel-pad');
      var layout = [null, 'up', null, 'left', 'down', 'right'];
      var btns = {};
      layout.forEach(function (id) {
        if (!id) { pad.appendChild(U.el('div', 'spacer')); return; }
        var d = PEEL_DIRS.filter(function (x) { return x.id === id; })[0];
        var b = U.el('button', 'btn', d.label);
        U.on(b, 'click', function () { press(id); });
        btns[id] = b;
        pad.appendChild(b);
      });
      root.appendChild(pad);

      helpText(root, "Appuyez sur la flèche affichée — au clavier ou sur les touches ci-dessus. " +
                     "Une erreur coûte une seconde.");

      var score = 0, streak = 0, timeLeft = 20, finished = false, want = null;

      function next() {
        want = U.pick(PEEL_DIRS);
        arrow.textContent = want.label;
        arrow.style.color = '#ffd23f';
      }

      function press(dirId) {
        if (finished || !want) return;
        if (dirId === want.id) {
          score++;
          streak++;
          sfx('peel');
          banana.style.transform = 'scale(1.15) rotate(' + (Math.random() * 20 - 10) + 'deg)';
          after(function () { banana.style.transform = ''; }, 90);
          refs.score.textContent = score;
          refs.streak.textContent = streak;
          next();
        } else {
          sfx('bad');
          streak = 0;
          timeLeft = Math.max(0, timeLeft - 1);
          refs.streak.textContent = 0;
          arrow.style.color = '#ff5a5a';
        }
      }

      onKey('keydown', function (e) {
        var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        for (var i = 0; i < PEEL_DIRS.length; i++) {
          if (PEEL_DIRS[i].keys.indexOf(k) >= 0) { e.preventDefault(); press(PEEL_DIRS[i].id); return; }
        }
      });

      next();
      loop(function (dt) {
        if (finished) return;
        timeLeft -= dt;
        if (timeLeft <= 0) {
          finished = true;
          api.finish(score / 26 + streak / 90, score);
          return;
        }
        refs.time.textContent = timeLeft.toFixed(1).replace('.', ',') + ' s';
      });
    }
  });

  /* ============================================== 3. MÉMOIRE DU SINGE ==== */

  define({
    id: 'memoire', name: 'Mémoire du Singe', icon: 'assets/minigames/mg_memoire.png',
    scoreLabel: 'Manche atteinte',
    desc: "Reproduisez la séquence de tambours. Elle s'allonge à chaque manche.",
    mount: function (root, api) {
      var refs = hud(root, [
        { key: 'round', label: 'Manche', value: 1 },
        { key: 'state', label: 'État', value: 'Observez' }
      ]);

      var drums = U.el('div', 'drums');
      var pads = [];
      for (var i = 0; i < 4; i++) {
        var b = U.el('button', 'drum d' + i);
        (function (idx) { U.on(b, 'click', function () { press(idx); }); })(i);
        drums.appendChild(b);
        pads.push(b);
      }
      root.appendChild(drums);
      helpText(root, "Le singe joue une séquence, à vous de la répéter. Touches 1 à 4 également.");

      var seq = [], step = 0, playing = true, round = 1, finished = false;

      function light(i, ms) {
        sfx('drum', { pad: i });
        pads[i].classList.add('lit');
        after(function () { pads[i].classList.remove('lit'); }, ms || 320);
      }

      function playSequence() {
        playing = true;
        refs.state.textContent = 'Observez';
        var delay = Math.max(220, 620 - round * 26);
        seq.forEach(function (v, idx) {
          after(function () { light(v, delay * 0.6); }, idx * delay + 400);
        });
        after(function () {
          playing = false;
          step = 0;
          refs.state.textContent = 'À vous !';
        }, seq.length * delay + 500);
      }

      function nextRound() {
        seq.push(U.randInt(0, 3));
        refs.round.textContent = round;
        playSequence();
      }

      function press(i) {
        if (playing || finished) return;
        light(i, 180);
        if (seq[step] === i) {
          step++;
          if (step >= seq.length) {
            round++;
            after(nextRound, 620);
          }
        } else {
          finished = true;
          sfx('fail');
          refs.state.textContent = 'Raté !';
          pads.forEach(function (p) { p.style.filter = 'grayscale(1)'; });
          after(function () { api.finish((round - 1) / 7, round - 1); }, 750);
        }
      }

      onKey('keydown', function (e) {
        var n = parseInt(e.key, 10);
        if (n >= 1 && n <= 4) { e.preventDefault(); press(n - 1); }
      });

      nextRound();
    }
  });

  /* ================================================ 4. BANANA MATCH ===== */

  var MATCH_FRUITS = [
    'assets/minigames/f_banane.png', 'assets/minigames/f_cerise.png',
    'assets/minigames/f_ananas.png', 'assets/minigames/f_coco.png',
    'assets/minigames/f_fraise.png', 'assets/minigames/f_kiwi.png'
  ];
  var MATCH_COLORS = ['#ffd23f', '#e0483c', '#f0a02e', '#8a5c33', '#ff5a86', '#7ec850'];

  define({
    id: 'match', name: 'Banana Match', icon: 'assets/minigames/mg_match.png',
    scoreLabel: 'Points',
    desc: "Alignez trois fruits ou plus en échangeant deux cases voisines.",
    mount: function (root, api) {
      var N = 7, TIME = 45;
      var refs = hud(root, [
        { key: 'score', label: 'Score', value: 0 },
        { key: 'time', label: 'Temps', value: TIME + ',0 s' },
        { key: 'combo', label: 'Cascade', value: '×1' }
      ]);

      var grid = U.el('div', 'match-grid');
      grid.style.gridTemplateColumns = 'repeat(' + N + ', 1fr)';
      grid.style.maxWidth = '420px';
      root.appendChild(grid);
      helpText(root, "Cliquez deux cases voisines pour les échanger. Les cascades multiplient les points.");

      var board = [], cells = [], score = 0, timeLeft = TIME, sel = null, busy = false, finished = false;

      function rnd() { return U.randInt(0, MATCH_FRUITS.length - 1); }

      function build() {
        for (var y = 0; y < N; y++) {
          board[y] = [];
          cells[y] = [];
          for (var x = 0; x < N; x++) {
            board[y][x] = rnd();
            var c = U.el('button', 'match-cell');
            var im = U.el('img');
            im.alt = '';
            c.appendChild(im);
            (function (xx, yy) { U.on(c, 'click', function () { tap(xx, yy); }); })(x, y);
            grid.appendChild(c);
            cells[y][x] = c;
          }
        }
        /* On retire les alignements présents au départ */
        var guard = 0;
        while (findMatches().length && guard++ < 60) {
          findMatches().forEach(function (p) { board[p.y][p.x] = rnd(); });
        }
        paint();
      }

      function paint() {
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
          var v = board[y][x];
          var c = cells[y][x];
          var im = c.firstChild;
          if (v < 0) { c.style.visibility = 'hidden'; continue; }
          c.style.visibility = '';
          var src = MATCH_FRUITS[v];
          if (im.dataset.sprite !== src) {
            U.setSprite(im, src);
            var remote = global.ASSETS ? global.ASSETS.remoteUrl(src) : src;
            im.onerror = (function (cell, color, path, rem, node) {
              return function () {
                if (node.src !== rem && rem !== path) { node.src = rem; return; }
                cell.style.background = color; node.style.visibility = 'hidden';
              };
            })(c, MATCH_COLORS[v], src, remote, im);
            im.onload = (function (cell, node) {
              return function () { cell.style.background = ''; node.style.visibility = ''; };
            })(c, im);
          }
        }
      }

      function findMatches() {
        var hits = {}, x, y, run, v;
        for (y = 0; y < N; y++) {
          run = 1;
          for (x = 1; x <= N; x++) {
            v = x < N ? board[y][x] : -99;
            if (v >= 0 && v === board[y][x - 1]) { run++; }
            else {
              if (run >= 3) for (var k = 1; k <= run; k++) hits[(x - k) + ',' + y] = { x: x - k, y: y };
              run = 1;
            }
          }
        }
        for (x = 0; x < N; x++) {
          run = 1;
          for (y = 1; y <= N; y++) {
            v = y < N ? board[y][x] : -99;
            if (v >= 0 && v === board[y - 1][x]) { run++; }
            else {
              if (run >= 3) for (var j = 1; j <= run; j++) hits[x + ',' + (y - j)] = { x: x, y: y - j };
              run = 1;
            }
          }
        }
        return Object.keys(hits).map(function (k) { return hits[k]; });
      }

      function resolve(chain) {
        var m = findMatches();
        if (!m.length) {
          busy = false;
          refs.combo.textContent = '×1';
          return;
        }
        refs.combo.textContent = '×' + chain;
        sfx('pop', { chain: chain });
        score += m.length * 10 * chain;
        refs.score.textContent = score;
        m.forEach(function (p) {
          cells[p.y][p.x].classList.add('pop');
          board[p.y][p.x] = -1;
        });
        after(function () {
          m.forEach(function (p) { cells[p.y][p.x].classList.remove('pop'); });
          collapse();
          paint();
          after(function () { resolve(chain + 1); }, 130);
        }, 190);
      }

      function collapse() {
        for (var x = 0; x < N; x++) {
          var write = N - 1;
          for (var y = N - 1; y >= 0; y--) {
            if (board[y][x] >= 0) { board[write][x] = board[y][x]; write--; }
          }
          for (; write >= 0; write--) board[write][x] = rnd();
        }
      }

      function tap(x, y) {
        if (busy || finished) return;
        if (!sel) {
          sel = { x: x, y: y };
          cells[y][x].classList.add('sel');
          return;
        }
        cells[sel.y][sel.x].classList.remove('sel');
        var dist = Math.abs(sel.x - x) + Math.abs(sel.y - y);
        if (dist !== 1) {
          if (sel.x === x && sel.y === y) { sel = null; return; }
          sel = { x: x, y: y };
          cells[y][x].classList.add('sel');
          return;
        }
        var a = sel;
        sel = null;
        busy = true;
        swap(a, { x: x, y: y });
        paint();
        if (!findMatches().length) {
          sfx('error');
          after(function () { swap(a, { x: x, y: y }); paint(); busy = false; }, 180);
        } else {
          after(function () { resolve(1); }, 140);
        }
      }

      function swap(a, b) {
        var t = board[a.y][a.x];
        board[a.y][a.x] = board[b.y][b.x];
        board[b.y][b.x] = t;
      }

      build();
      loop(function (dt) {
        if (finished) return;
        timeLeft -= dt;
        if (timeLeft <= 0) {
          finished = true;
          api.finish(score / 2200, score);
          return;
        }
        refs.time.textContent = timeLeft.toFixed(1).replace('.', ',') + ' s';
      });
    }
  });

  /* ============================================ 5. COURSE DE LA JUNGLE == */

  define({
    id: 'course', name: 'Course de la Jungle', icon: 'assets/minigames/mg_course.png',
    scoreLabel: 'Distance',
    desc: "Sautez les rochers, glissez sous les lianes, ramassez les bananes.",
    mount: function (root, api) {
      var W = 640, H = 260, GROUND = 200;
      var refs = hud(root, [
        { key: 'dist', label: 'Distance', value: '0 m' },
        { key: 'picked', label: 'Bananes', value: 0 },
        { key: 'speed', label: 'Vitesse', value: '×1,0' }
      ]);

      var stage = U.el('div', 'mg-stage');
      var cv = U.el('canvas');
      cv.width = W; cv.height = H;
      stage.appendChild(cv);
      root.appendChild(stage);

      var controls = U.el('div', 'mg-controls');
      var jumpBtn = U.el('button', 'btn', '▲ Sauter');
      var slideBtn = U.el('button', 'btn ghost', '▼ Glisser');
      controls.appendChild(jumpBtn);
      controls.appendChild(slideBtn);
      root.appendChild(controls);
      helpText(root, "Espace ou ▲ pour sauter, ▼ pour glisser. La vitesse augmente sans arrêt.");

      var ctx = cv.getContext('2d');
      var monkey = { y: GROUND, vy: 0, sliding: 0, dead: false };
      var obstacles = [], dist = 0, picked = 0, speed = 210, spawnIn = 1.2, finished = false;
      var bgOffset = 0;

      function jump() {
        if (finished) return;
        if (monkey.y >= GROUND - 1) { monkey.vy = -430; sfx('jump'); }
      }
      function slide() {
        if (finished) return;
        if (monkey.sliding <= 0) sfx('slide');
        monkey.sliding = 0.5;
      }

      U.on(jumpBtn, 'click', jump);
      U.on(slideBtn, 'click', slide);
      onKey('keydown', function (e) {
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'z') { e.preventDefault(); jump(); }
        if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); slide(); }
      });
      U.on(cv, 'pointerdown', function (e) {
        var r = cv.getBoundingClientRect();
        if ((e.clientY - r.top) / r.height > 0.62) slide(); else jump();
      });

      function spawn() {
        var r = Math.random();
        if (r < 0.42) obstacles.push({ type: 'rock', x: W + 30, w: 34, h: 34 });
        else if (r < 0.72) obstacles.push({ type: 'vine', x: W + 30, w: 30, h: 60 });
        else obstacles.push({ type: 'banana', x: W + 30, w: 26, h: 26, yOff: U.randInt(0, 1) ? 60 : 12 });
      }

      function end() {
        if (finished) return;
        finished = true;
        var m = Math.floor(dist);
        api.finish(m / 1100 + picked / 26, m, 'Distance : ' + m + ' m · ' + picked + ' bananes ramassées');
      }

      loop(function (dt) {
        if (finished) return;

        speed += dt * 7;
        dist += speed * dt / 8;
        refs.dist.textContent = Math.floor(dist) + ' m';
        refs.speed.textContent = '×' + (speed / 210).toFixed(1);

        monkey.vy += 1250 * dt;
        monkey.y = Math.min(GROUND, monkey.y + monkey.vy * dt);
        if (monkey.y >= GROUND) { monkey.y = GROUND; monkey.vy = 0; }
        if (monkey.sliding > 0) monkey.sliding -= dt;

        spawnIn -= dt;
        if (spawnIn <= 0) { spawn(); spawnIn = Math.max(0.5, 1.25 - speed / 900); }

        var mh = monkey.sliding > 0 ? 24 : 46;
        var mx = 70, my = monkey.y - mh;

        for (var i = obstacles.length - 1; i >= 0; i--) {
          var o = obstacles[i];
          o.x -= speed * dt;
          if (o.x < -60) { obstacles.splice(i, 1); continue; }

          var oy = o.type === 'vine' ? GROUND - 108 : (o.type === 'banana' ? GROUND - o.yOff - o.h : GROUND - o.h);
          var hit = mx < o.x + o.w && mx + 34 > o.x && my < oy + o.h && my + mh > oy;
          if (!hit) continue;

          if (o.type === 'banana') {
            picked++;
            sfx('pickup');
            refs.picked.textContent = picked;
            obstacles.splice(i, 1);
          } else {
            sfx('crash');
            end();
            return;
          }
        }

        /* --- rendu --- */
        bgOffset = (bgOffset + speed * dt * 0.35) % 64;
        ctx.fillStyle = '#123b21';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#1b5c2f';
        for (var b = -1; b < W / 64 + 1; b++) {
          var bx = b * 64 - bgOffset;
          ctx.fillRect(bx, 40, 38, 120);
        }
        ctx.fillStyle = '#6b4526';
        ctx.fillRect(0, GROUND, W, H - GROUND);
        ctx.fillStyle = '#7ec850';
        ctx.fillRect(0, GROUND, W, 7);

        obstacles.forEach(function (o) {
          if (o.type === 'rock') drawSprite(ctx, 'assets/minigames/rocher.png', o.x, GROUND - o.h, o.w, o.h, '#8b8b8b');
          else if (o.type === 'vine') drawSprite(ctx, 'assets/minigames/liane.png', o.x, GROUND - 108, o.w, 60, '#3f8f3a');
          else drawSprite(ctx, 'assets/misc/banana_hero.png', o.x, GROUND - o.yOff - o.h, o.w, o.h, '#ffd23f');
        });

        drawSprite(ctx, 'assets/minigames/singe_court.png', mx, my, 34, mh, '#8a5c33');

        emitTick();
      });

      function emitTick() { /* rendu déjà fait ; garde-fou pour les futures extensions */ }
    }
  });

  /* ============================================ 6. CHASSE AU TRÉSOR ===== */

  define({
    id: 'tresor', name: 'Chasse au Trésor', icon: 'assets/minigames/mg_tresor.png',
    scoreLabel: 'Coffres déterrés',
    desc: "Creusez la grille sans réveiller les singes hurleurs.",
    mount: function (root, api) {
      var N = 9, MONKEYS = 12, CHESTS = 6;
      var refs = hud(root, [
        { key: 'chests', label: 'Coffres', value: '0/' + CHESTS },
        { key: 'flags', label: 'Marqueurs', value: 0 }
      ]);

      var grid = U.el('div', 'dig-grid');
      grid.style.gridTemplateColumns = 'repeat(' + N + ', 1fr)';
      grid.style.maxWidth = '440px';
      root.appendChild(grid);

      var flagMode = U.el('button', 'btn ghost small', 'Mode marqueur : OFF');
      var cashOut = U.el('button', 'btn small', 'Repartir avec le butin');
      var row = U.el('div', 'mg-controls');
      row.appendChild(flagMode);
      row.appendChild(cashOut);
      root.appendChild(row);
      helpText(root, "Les chiffres indiquent le nombre de singes hurleurs adjacents. " +
                     "Clic droit (ou mode marqueur) pour poser un drapeau. " +
                     "Vous pouvez repartir à tout moment avec ce que vous avez déterré.");

      var cells = [], monkeys = {}, chests = {}, dug = {}, flags = {};
      var found = 0, finished = false, flagging = false;

      function key(x, y) { return x + ',' + y; }

      function place() {
        var spots = [];
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) spots.push(key(x, y));
        spots = U.shuffle(spots);
        spots.slice(0, MONKEYS).forEach(function (k) { monkeys[k] = true; });
        spots.slice(MONKEYS, MONKEYS + CHESTS).forEach(function (k) { chests[k] = true; });
      }

      function neighbours(x, y) {
        var out = [];
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          var nx = x + dx, ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < N && ny < N) out.push({ x: nx, y: ny });
        }
        return out;
      }

      function countAround(x, y) {
        return neighbours(x, y).filter(function (p) { return monkeys[key(p.x, p.y)]; }).length;
      }

      function dig(x, y) {
        if (finished) return;
        var k = key(x, y);
        if (dug[k]) return;
        if (flagging) { toggleFlag(x, y); return; }
        if (flags[k]) return;

        if (monkeys[k]) {
          sfx('crash');
          dug[k] = true;
          cells[y][x].classList.add('dug');
          cells[y][x].textContent = '🙊';
          finished = true;
          revealAll();
          after(function () {
            api.finish(found / 2.6, found, 'Singe hurleur réveillé après ' + found + ' coffre(s)');
          }, 900);
          return;
        }

        dug[k] = true;
        var c = cells[y][x];
        c.classList.add('dug');
        if (chests[k]) {
          sfx('treasure');
          found++;
          refs.chests.textContent = found + '/' + CHESTS;
          var im = U.el('img');
          im.alt = '';
          U.setSprite(im, 'assets/minigames/coffre.png');
          var remoteChest = global.ASSETS ? global.ASSETS.remoteUrl('assets/minigames/coffre.png') : '';
          im.onerror = function () {
            if (remoteChest && im.src !== remoteChest) { im.src = remoteChest; return; }
            c.textContent = '★'; im.remove();
          };
          c.appendChild(im);
          if (found >= CHESTS) {
            finished = true;
            after(function () { api.finish(found / 2.2 + 0.8, found, 'Grille entièrement pillée !'); }, 700);
          }
          return;
        }

        var n = countAround(x, y);
        sfx('dig');
        if (n > 0) { c.textContent = n; c.classList.add('n' + n); return; }
        neighbours(x, y).forEach(function (p) { dig(p.x, p.y); });
      }

      function toggleFlag(x, y) {
        var k = key(x, y);
        if (dug[k]) return;
        flags[k] = !flags[k];
        cells[y][x].classList.toggle('flag', flags[k]);
        cells[y][x].textContent = flags[k] ? '⚑' : '';
        refs.flags.textContent = Object.keys(flags).filter(function (f) { return flags[f]; }).length;
      }

      function revealAll() {
        for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
          var k = key(x, y);
          if (monkeys[k] && !dug[k]) { cells[y][x].classList.add('flag'); cells[y][x].textContent = '🙊'; }
        }
      }

      place();
      for (var y = 0; y < N; y++) {
        cells[y] = [];
        for (var x = 0; x < N; x++) {
          var c = U.el('button', 'dig-cell');
          (function (xx, yy, cell) {
            U.on(cell, 'click', function () { dig(xx, yy); });
            U.on(cell, 'contextmenu', function (e) { e.preventDefault(); toggleFlag(xx, yy); });
          })(x, y, c);
          grid.appendChild(c);
          cells[y][x] = c;
        }
      }

      U.on(flagMode, 'click', function () {
        flagging = !flagging;
        flagMode.textContent = 'Mode marqueur : ' + (flagging ? 'ON' : 'OFF');
        flagMode.classList.toggle('ghost', !flagging);
      });
      U.on(cashOut, 'click', function () {
        if (finished) return;
        finished = true;
        api.finish(found / 2.6, found, 'Retraite prudente avec ' + found + ' coffre(s)');
      });
    }
  });

  /* ============================================ 7. ROUE DE LA FORTUNE === */

  var WHEEL = [
    { label: 'Bananes',  color: '#ffd23f', kind: 'bananas', mult: 1 },
    { label: 'Jetons',   color: '#8a5c33', kind: 'tokens',  mult: 1 },
    { label: 'Bananes+', color: '#ffb547', kind: 'bananas', mult: 3 },
    { label: 'Frénésie', color: '#e0483c', kind: 'boost',   boost: 'prod' },
    { label: 'Bananes',  color: '#ffd23f', kind: 'bananas', mult: 1 },
    { label: 'Rien…',    color: '#4a2f1c', kind: 'nothing' },
    { label: 'Jetons+',  color: '#6b4526', kind: 'tokens',  mult: 3 },
    { label: 'Bananes',  color: '#ffd23f', kind: 'bananas', mult: 1 },
    { label: 'RARE !',   color: '#b866ff', kind: 'rare' },
    { label: 'Doigts',   color: '#48b3e0', kind: 'boost',   boost: 'click' },
    { label: 'Bananes+', color: '#ffb547', kind: 'bananas', mult: 3 },
    { label: 'Jackpot',  color: '#7ec850', kind: 'bananas', mult: 12 }
  ];

  define({
    id: 'roue', name: 'Roue de la Fortune', icon: 'assets/minigames/mg_roue.png',
    scoreLabel: 'Tours joués',
    desc: "Un jeton par tour. Douze cases, une seule offre une banane rare.",
    cost: 1,
    mount: function (root, api) {
      var refs = hud(root, [
        { key: 'tokens', label: 'Jetons', value: global.G.S.tokens },
        { key: 'last', label: 'Dernier gain', value: '—' }
      ]);

      var wrap = U.el('div', 'wheel-wrap');
      var pointer = U.el('div', 'wheel-pointer');
      var cv = U.el('canvas');
      cv.width = 400; cv.height = 400;
      wrap.appendChild(pointer);
      wrap.appendChild(cv);
      root.appendChild(wrap);

      var controls = U.el('div', 'mg-controls');
      var spinBtn = U.el('button', 'btn', 'Tourner (1 jeton)');
      controls.appendChild(spinBtn);
      root.appendChild(controls);
      helpText(root, "Chaque tour coûte un jeton. La case violette offre directement une banane rare.");

      var ctx = cv.getContext('2d');
      var angle = 0, spinning = false, velocity = 0, target = 0, spins = 0;

      function draw() {
        var cx = 200, cy = 200, r = 185;
        ctx.clearRect(0, 0, 400, 400);
        var seg = Math.PI * 2 / WHEEL.length;
        for (var i = 0; i < WHEEL.length; i++) {
          var a0 = angle + i * seg, a1 = a0 + seg;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, a0, a1);
          ctx.closePath();
          ctx.fillStyle = WHEEL[i].color;
          ctx.fill();
          ctx.strokeStyle = '#17110a';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(a0 + seg / 2);
          ctx.fillStyle = '#17110a';
          ctx.font = 'bold 16px Trebuchet MS, sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(WHEEL[i].label, r - 14, 0);
          ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, 34, 0, Math.PI * 2);
        ctx.fillStyle = '#4a2f1c';
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#17110a';
        ctx.stroke();
      }

      function segmentAtPointer() {
        var seg = Math.PI * 2 / WHEEL.length;
        /* Le curseur pointe vers le haut, soit -PI/2 */
        var a = (-Math.PI / 2 - angle) % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        return Math.floor(a / seg) % WHEEL.length;
      }

      function award(seg) {
        var G = global.G, D = G.D, text = '';
        G.recompute();
        switch (seg.kind) {
          case 'bananas':
            var amount = Math.max(D.bps * 120, D.perClick * 80, 800) * seg.mult * D.miniMult;
            G.earn(amount, 'mini');
            text = U.fmtFr(amount) + ' bananes';
            break;
          case 'tokens':
            var t = G.addTokens(U.randInt(3, 9) * seg.mult * D.tokenMult);
            text = t + ' jetons';
            break;
          case 'boost':
            if (seg.boost === 'prod') { G.addBoost('prod', 7, 60, 'Frénésie (roue)'); text = 'Production ×7'; }
            else { G.addBoost('click', 15, 30, "Doigts d'Or (roue)"); text = 'Clic ×15'; }
            break;
          case 'rare':
            var r = G.drawRare(null);
            if (r) {
              var got = G.grantRare(r.id, 'mini');
              text = got.rare.name + (got.isNew ? ' (nouvelle !)' : ' (doublon)');
            } else text = 'Rien de neuf';
            break;
          default:
            text = 'Rien du tout';
        }
        refs.last.textContent = text;
        refs.tokens.textContent = global.G.S.tokens;
      }

      function spin() {
        if (spinning) return;
        if (global.G.S.tokens < 1) { refs.last.textContent = 'Pas assez de jetons'; return; }
        global.G.S.tokens--;
        refs.tokens.textContent = global.G.S.tokens;
        spinning = true;
        spins++;
        sfx('spin');
        velocity = U.randRange(11, 16);
        target = U.randRange(2.6, 3.6);
      }

      U.on(spinBtn, 'click', spin);

      var stopBtn = U.el('button', 'btn ghost', "Quitter l'arcade");
      U.on(stopBtn, 'click', function () {
        if (spins > 0) {
          global.G.S.stats.miniPlayed += spins;
          global.G.S.stats.miniByGame.roue = (global.G.S.stats.miniByGame.roue || 0) + spins;
          if (spins > (global.G.S.stats.best.roue || 0)) global.G.S.stats.best.roue = spins;
        }
        close();
        if (MG.onExit) MG.onExit();
      });
      controls.appendChild(stopBtn);

      var lastSeg = -1;
      loop(function (dt) {
        if (spinning) {
          angle += velocity * dt;
          velocity *= Math.pow(0.24, dt / target);
          var seg = segmentAtPointer();
          if (seg !== lastSeg) { lastSeg = seg; sfx('tick'); }
          if (velocity < 0.06) {
            spinning = false;
            velocity = 0;
            var prize = WHEEL[segmentAtPointer()];
            sfx(prize.kind === 'nothing' ? 'fail' : (prize.kind === 'rare' ? 'golden' : 'challenge'));
            award(prize);
          }
        }
        draw();
        spinBtn.disabled = spinning || global.G.S.tokens < 1;
      });
    }
  });

  /* ---------------------------------------------------------------- API */

  MG.open = open;
  MG.close = close;
  MG.img = img;

  /* Exposé pour js/minigames2.js : les minijeux ajoutés par le Grand Patch
     réutilisent exactement le même cycle de vie (minuteries et boucles de
     rendu enregistrées ici, donc nettoyées automatiquement à la sortie). */
  MG.define = define;
  MG.hud = hud;
  MG.helpText = helpText;
  MG.every = every;
  MG.after = after;
  MG.loop = loop;
  MG.onKey = onKey;
  MG.drawSprite = drawSprite;

  global.MG = MG;
})(window);

/* Banana Factory - les cinq minijeux du Grand Patch
 *
 *   8. Ninja Bananier        — trancher les fruits, éviter les bombes
 *   9. Serpent de la Canopée — un serpent qui s'allonge à chaque banane
 *  10. Pile de Cageots       — empiler et compléter des lignes
 *  11. Bar à Smoothies       — reproduire les recettes commandées
 *  12. Chasse aux Chapardeurs— taper les voleurs, épargner les singes
 *
 * Ils réutilisent le cycle de vie de js/minigames.js (MG.define, MG.loop,
 * MG.hud…), ce qui garantit que minuteries et écouteurs sont bien libérés
 * quand le joueur quitte la salle.
 */
(function (global) {
  'use strict';

  var U = global.U, MG = global.MG;
  function sfx(n, p) { if (global.SFX) global.SFX.play(n, p); }

  /*
   * Une url() posée dans une variable CSS est résolue par rapport à la feuille
   * de style, pas au document : il faut donc une URL absolue.
   */
  function cssUrl(path) {
    var src = global.ASSETS ? global.ASSETS.resolve(path) : path;
    return "url('" + new URL(src, location.href).href + "')";
  }

  /* Position d'un événement pointeur dans le repère interne du canvas. */
  function canvasPos(cv, e) {
    var r = cv.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (cv.width / r.width),
      y: (e.clientY - r.top) * (cv.height / r.height)
    };
  }

  /* ================================================= 8. NINJA BANANIER == */

  var NINJA_FRUITS = [
    { sprite: 'assets/minigames/f_banane.png', color: '#ffd23f', points: 1 },
    { sprite: 'assets/minigames/f_cerise.png', color: '#e0483c', points: 1 },
    { sprite: 'assets/minigames/f_coco.png',   color: '#8a5c33', points: 1 },
    { sprite: 'assets/minigames/f_fraise.png', color: '#ff5a86', points: 1 },
    { sprite: 'assets/minigames/f_kiwi.png',   color: '#7ec850', points: 1 },
    { sprite: 'assets/minigames/f_ananas.png', color: '#f0a02e', points: 2 }
  ];

  MG.define({
    id: 'ninja', name: 'Ninja Bananier', icon: 'assets/minigames/mg_ninja.png',
    scoreLabel: 'Fruits tranchés',
    desc: "Tranchez tout ce qui monte, sauf les bombes. Trois bombes et c'est fini.",
    mount: function (root, api) {
      var refs = MG.hud(root, [
        { key: 'score', label: 'Tranchés', value: 0 },
        { key: 'lives', label: 'Bombes', value: '0/3' },
        { key: 'combo', label: 'Combo', value: '—' }
      ]);

      var W = 560, H = 340;
      var stage = U.el('div', 'mg-stage');
      var cv = U.el('canvas');
      cv.width = W; cv.height = H;
      stage.appendChild(cv);
      root.appendChild(stage);
      var ctx = cv.getContext('2d');

      MG.helpText(root, "Glissez le doigt ou la souris à travers les fruits pour les trancher. " +
                        "Les bombes noires coûtent une vie. Trancher plusieurs fruits d'un seul " +
                        "geste déclenche un combo.");

      var items = [], trail = [], score = 0, bombs = 0, t = 0;
      var spawnGap = 0.95, sinceSpawn = 0, finished = false;
      var slicing = false, sliceCount = 0, bestCombo = 0;

      function spawn() {
        var isBomb = Math.random() < Math.min(0.26, 0.09 + t * 0.004);
        var fruit = isBomb ? null : U.pick(NINJA_FRUITS);
        items.push({
          bomb: isBomb, fruit: fruit,
          x: U.randRange(60, W - 60),
          y: H + 40,
          vx: U.randRange(-70, 70),
          /* Assez d'élan pour que la cloche du saut traverse presque tout
             l'écran : sinon les fruits restent tassés en bas et deviennent
             impossibles à trancher confortablement. */
          vy: -U.randRange(600, 700),
          spin: U.randRange(-3, 3), rot: 0,
          r: isBomb ? 22 : 26, dead: false
        });
      }

      function cut(it) {
        it.dead = true;
        if (it.bomb) {
          bombs++;
          sfx('crash');
          refs.lives.textContent = bombs + '/3';
          stage.style.boxShadow = 'inset 0 0 0 5px #ff5a5a';
          MG.after(function () { stage.style.boxShadow = ''; }, 180);
          if (bombs >= 3) end();
          return;
        }
        sliceCount++;
        score += it.fruit.points;
        refs.score.textContent = score;
        sfx('pop', { chain: sliceCount });
        if (sliceCount > bestCombo) bestCombo = sliceCount;
        if (sliceCount > 1) refs.combo.textContent = '×' + sliceCount;
      }

      function end() {
        if (finished) return;
        finished = true;
        api.finish(score / 60, score,
          score + ' fruits tranchés · meilleur combo ×' + Math.max(1, bestCombo));
      }

      function pointerDown(e) {
        slicing = true;
        sliceCount = 0;
        refs.combo.textContent = '—';
        trail.length = 0;
        e.preventDefault();
      }
      function pointerUp() { slicing = false; }
      function pointerMove(e) {
        if (!slicing || finished) return;
        var p = canvasPos(cv, e);
        trail.push({ x: p.x, y: p.y, life: 1 });
        if (trail.length > 14) trail.shift();
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          if (it.dead) continue;
          var dx = it.x - p.x, dy = it.y - p.y;
          if (dx * dx + dy * dy <= it.r * it.r) cut(it);
        }
        e.preventDefault();
      }

      cv.addEventListener('pointerdown', pointerDown);
      MG.onKey('pointerup', pointerUp);
      cv.addEventListener('pointermove', pointerMove);
      cv.style.touchAction = 'none';

      MG.loop(function (dt) {
        if (finished) return;
        t += dt;
        spawnGap = Math.max(0.34, 0.95 - t * 0.012);
        sinceSpawn += dt;
        if (sinceSpawn >= spawnGap) {
          sinceSpawn = 0;
          spawn();
          if (t > 18 && Math.random() < 0.35) spawn();
        }

        for (var i = items.length - 1; i >= 0; i--) {
          var it = items[i];
          it.vy += 620 * dt;
          it.x += it.vx * dt;
          it.y += it.vy * dt;
          it.rot += it.spin * dt;
          if (it.y > H + 90) items.splice(i, 1);
        }
        for (var j = trail.length - 1; j >= 0; j--) {
          trail[j].life -= dt * 3.4;
          if (trail[j].life <= 0) trail.splice(j, 1);
        }

        /* --- rendu --- */
        ctx.fillStyle = '#0d2216';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255,255,255,.05)';
        for (var g = 0; g < H; g += 40) {
          ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(W, g); ctx.stroke();
        }

        items.forEach(function (it) {
          if (it.dead) return;
          ctx.save();
          ctx.translate(it.x, it.y);
          ctx.rotate(it.rot);
          if (it.bomb) {
            MG.drawSprite(ctx, 'assets/minigames/bombe.png',
              -it.r - 4, -it.r - 4, (it.r + 4) * 2, (it.r + 4) * 2, '#17110a');
          } else {
            MG.drawSprite(ctx, it.fruit.sprite, -it.r, -it.r, it.r * 2, it.r * 2, it.fruit.color);
          }
          ctx.restore();
        });

        if (trail.length > 1) {
          ctx.strokeStyle = 'rgba(255,242,154,.85)';
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(trail[0].x, trail[0].y);
          for (var k = 1; k < trail.length; k++) ctx.lineTo(trail[k].x, trail[k].y);
          ctx.stroke();
        }
      });
    }
  });

  /* ============================================ 9. SERPENT DE LA CANOPÉE = */

  MG.define({
    id: 'serpent', name: 'Serpent de la Canopée', icon: 'assets/minigames/mg_serpent.png',
    scoreLabel: 'Longueur atteinte',
    desc: "Avalez les bananes, allongez-vous, et ne vous mordez jamais la queue.",
    mount: function (root, api) {
      var refs = MG.hud(root, [
        { key: 'len', label: 'Longueur', value: 3 },
        { key: 'speed', label: 'Vitesse', value: '×1,0' }
      ]);

      var COLS = 22, ROWS = 15, CELL = 24;
      var W = COLS * CELL, H = ROWS * CELL;

      var stage = U.el('div', 'mg-stage');
      stage.style.maxWidth = '560px';
      stage.style.margin = '0 auto';
      var cv = U.el('canvas');
      cv.width = W; cv.height = H;
      stage.appendChild(cv);
      root.appendChild(stage);
      var ctx = cv.getContext('2d');

      var pad = U.el('div', 'peel-pad');
      [['', ''], ['▲', 'up'], ['', ''], ['◀', 'left'], ['▼', 'down'], ['▶', 'right']]
        .forEach(function (b) {
          if (!b[1]) { pad.appendChild(U.el('div', 'spacer')); return; }
          var btn = U.el('button', 'btn', b[0]);
          U.on(btn, 'click', function () { turn(b[1]); });
          pad.appendChild(btn);
        });
      root.appendChild(pad);

      MG.helpText(root, "Flèches du clavier, ZQSD/WASD ou les boutons ci-dessus. " +
                        "Chaque banane allonge le serpent et accélère la partie. " +
                        "Les murs ne pardonnent pas.");

      var DIRS = {
        up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
        left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
      };

      var snake, dir, nextDir, food, step, acc, finished, grow;
      var herbe = MG.img('assets/minigames/herbe.png');

      function reset() {
        snake = [{ x: 8, y: 7 }, { x: 7, y: 7 }, { x: 6, y: 7 }];
        dir = DIRS.right; nextDir = dir;
        step = 0.19; acc = 0; grow = 0; finished = false;
        placeFood();
      }

      function placeFood() {
        var free = [];
        for (var x = 0; x < COLS; x++) {
          for (var y = 0; y < ROWS; y++) {
            if (!occupied(x, y)) free.push({ x: x, y: y });
          }
        }
        food = free.length ? U.pick(free) : null;
      }

      function occupied(x, y) {
        for (var i = 0; i < snake.length; i++) {
          if (snake[i].x === x && snake[i].y === y) return true;
        }
        return false;
      }

      function turn(name) {
        var d = DIRS[name];
        if (!d) return;
        /* Demi-tour interdit : on mordrait immédiatement son propre cou. */
        if (d.x === -dir.x && d.y === -dir.y) return;
        nextDir = d;
      }

      function end() {
        if (finished) return;
        finished = true;
        sfx('crash');
        api.finish(snake.length / 28, snake.length, 'Longueur finale : ' + snake.length);
      }

      function advance() {
        dir = nextDir;
        var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) { end(); return; }
        if (occupied(head.x, head.y)) { end(); return; }

        snake.unshift(head);
        if (food && head.x === food.x && head.y === food.y) {
          grow += 2;
          sfx('pickup');
          step = Math.max(0.07, step * 0.965);
          placeFood();
        }
        if (grow > 0) grow--; else snake.pop();

        refs.len.textContent = snake.length;
        refs.speed.textContent = '×' + (0.19 / step).toFixed(1).replace('.', ',');
      }

      MG.onKey('keydown', function (e) {
        var map = {
          ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
          w: 'up', z: 'up', s: 'down', a: 'left', q: 'left', d: 'right'
        };
        var name = map[e.key];
        if (!name) return;
        e.preventDefault();
        turn(name);
      });

      reset();

      MG.loop(function (dt) {
        if (!finished) {
          acc += dt;
          while (acc >= step) { acc -= step; if (!finished) advance(); }
        }

        /*
         * Sol : la tuile d'herbe n'est pas parfaitement raccordable, donc on
         * l'agrandit (moins de répétitions visibles) et on l'assombrit
         * franchement — elle doit rester une texture de fond, pas concurrencer
         * le serpent.
         */
        if (herbe.ok) {
          for (var gx = 0; gx < W; gx += 132) {
            for (var gy = 0; gy < H; gy += 132) ctx.drawImage(herbe, gx, gy, 132, 132);
          }
        } else {
          ctx.fillStyle = '#0d2216';
          ctx.fillRect(0, 0, W, H);
        }
        ctx.fillStyle = 'rgba(6,20,12,.62)';
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = 'rgba(0,0,0,.16)';
        ctx.lineWidth = 1;
        for (var x = 0; x <= COLS; x++) {
          ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke();
        }
        for (var y = 0; y <= ROWS; y++) {
          ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke();
        }

        if (food) {
          MG.drawSprite(ctx, 'assets/minigames/f_banane.png',
            food.x * CELL + 1, food.y * CELL + 1, CELL - 2, CELL - 2, '#ffd23f');
        }

        /*
         * Un liseré continu sous les segments : les sprites ont leur propre
         * marge, donc sans ce trait le serpent apparaîtrait en morceaux
         * détachés au lieu d'un corps d'un seul tenant.
         */
        if (snake.length > 1) {
          ctx.strokeStyle = '#3d7a30';
          ctx.lineWidth = CELL * 0.62;
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
          ctx.beginPath();
          snake.forEach(function (seg, i) {
            var cx = seg.x * CELL + CELL / 2, cy = seg.y * CELL + CELL / 2;
            /* Un saut de plus d'une case = traversée d'un bord : on coupe. */
            var prev = snake[i - 1];
            if (i === 0 || Math.abs(prev.x - seg.x) > 1 || Math.abs(prev.y - seg.y) > 1) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
          });
          ctx.stroke();
        }

        var OVER = 3;   // léger débord pour souder les segments entre eux
        snake.forEach(function (seg, i) {
          var sprite = i === 0 ? 'assets/minigames/serpent_tete.png'
                     : (i === snake.length - 1 && snake.length > 2)
                       ? 'assets/minigames/serpent_queue.png'
                       : 'assets/minigames/serpent_corps.png';
          var cx = seg.x * CELL + CELL / 2, cy = seg.y * CELL + CELL / 2;
          var size = CELL + OVER;
          if (i === 0) {
            /* La tête pivote dans la direction du déplacement. */
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.atan2(dir.y, dir.x) + Math.PI / 2);
            MG.drawSprite(ctx, sprite, -size / 2, -size / 2, size, size, '#a8e063');
            ctx.restore();
          } else {
            MG.drawSprite(ctx, sprite, cx - size / 2, cy - size / 2, size, size, '#4f9e3f');
          }
        });
      });
    }
  });

  /* ============================================== 10. PILE DE CAGEOTS === */

  var PIECES = [
    { cells: [[0, 0], [1, 0], [2, 0], [3, 0]], color: '#4aa3ff', sprite: 'assets/minigames/cageot_bleu.png' },   // I
    { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: '#ffd23f', sprite: 'assets/minigames/cageot_jaune.png' },  // O
    { cells: [[1, 0], [0, 1], [1, 1], [2, 1]], color: '#b866ff', sprite: 'assets/minigames/cageot_violet.png' }, // T
    { cells: [[0, 0], [0, 1], [1, 1], [2, 1]], color: '#f0a02e', sprite: 'assets/minigames/cageot_orange.png' }, // J
    { cells: [[2, 0], [0, 1], [1, 1], [2, 1]], color: '#7ec850', sprite: 'assets/minigames/cageot_vert.png' },   // L
    { cells: [[1, 0], [2, 0], [0, 1], [1, 1]], color: '#e0483c', sprite: 'assets/minigames/cageot_rouge.png' },  // S
    { cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: '#4de2d0', sprite: 'assets/minigames/cageot_cyan.png' }    // Z
  ];

  MG.define({
    id: 'pile', name: 'Pile de Cageots', icon: 'assets/minigames/mg_pile.png',
    scoreLabel: 'Lignes complétées',
    desc: "Empilez les cageots, complétez des lignes, et ne touchez pas le plafond.",
    mount: function (root, api) {
      var refs = MG.hud(root, [
        { key: 'lines', label: 'Lignes', value: 0 },
        { key: 'level', label: 'Niveau', value: 1 }
      ]);

      var COLS = 10, ROWS = 18, CELL = 22;
      var W = COLS * CELL, H = ROWS * CELL;

      var stage = U.el('div', 'mg-stage');
      stage.style.maxWidth = '260px';
      stage.style.margin = '0 auto';
      var cv = U.el('canvas');
      cv.width = W; cv.height = H;
      stage.appendChild(cv);
      root.appendChild(stage);
      var ctx = cv.getContext('2d');

      var pad = U.el('div', 'peel-pad');
      [['⟲', 'rot'], ['▼', 'down'], ['⇊', 'drop'], ['◀', 'left'], ['', ''], ['▶', 'right']]
        .forEach(function (b) {
          if (!b[1]) { pad.appendChild(U.el('div', 'spacer')); return; }
          var btn = U.el('button', 'btn', b[0]);
          U.on(btn, 'click', function () { act(b[1]); });
          pad.appendChild(btn);
        });
      root.appendChild(pad);

      MG.helpText(root, "◀ ▶ pour déplacer, ▲ ou ⟲ pour pivoter, ▼ pour descendre, " +
                        "Espace ou ⇊ pour lâcher d'un coup. Chaque ligne complète rapporte, " +
                        "et le rythme s'accélère tous les cinq niveaux.");

      var grid = [], piece = null, lines = 0, level = 1, fall = 0.85, acc = 0, finished = false;

      for (var r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (var c = 0; c < COLS; c++) grid[r][c] = null;
      }

      function newPiece() {
        var def = U.pick(PIECES);
        piece = {
          cells: def.cells.map(function (c) { return [c[0], c[1]]; }),
          color: def.color,
          sprite: def.sprite,
          x: 3, y: 0
        };
        if (collides(piece.cells, piece.x, piece.y)) end();
      }

      function collides(cells, px, py) {
        for (var i = 0; i < cells.length; i++) {
          var x = px + cells[i][0], y = py + cells[i][1];
          if (x < 0 || x >= COLS || y >= ROWS) return true;
          if (y >= 0 && grid[y][x]) return true;
        }
        return false;
      }

      function rotate(cells) {
        /* Rotation horaire autour du coin haut-gauche de la pièce. */
        var maxY = 0;
        cells.forEach(function (c) { maxY = Math.max(maxY, c[1]); });
        return cells.map(function (c) { return [maxY - c[1], c[0]]; });
      }

      function lock() {
        piece.cells.forEach(function (c) {
          var x = piece.x + c[0], y = piece.y + c[1];
          if (y >= 0) grid[y][x] = { color: piece.color, sprite: piece.sprite };
        });
        clearLines();
        newPiece();
      }

      function clearLines() {
        var cleared = 0;
        for (var r = ROWS - 1; r >= 0; r--) {
          var full = true;
          for (var c = 0; c < COLS; c++) if (!grid[r][c]) { full = false; break; }
          if (!full) continue;
          grid.splice(r, 1);
          var row = [];
          for (var k = 0; k < COLS; k++) row.push(null);
          grid.unshift(row);
          cleared++;
          r++;   // on réexamine la même hauteur, les lignes ont glissé
        }
        if (!cleared) return;
        lines += cleared;
        sfx(cleared >= 3 ? 'challenge' : 'good');
        refs.lines.textContent = lines;
        level = 1 + Math.floor(lines / 5);
        refs.level.textContent = level;
        fall = Math.max(0.12, 0.85 * Math.pow(0.86, level - 1));
      }

      function act(what) {
        if (finished || !piece) return;
        if (what === 'left' && !collides(piece.cells, piece.x - 1, piece.y)) piece.x--;
        else if (what === 'right' && !collides(piece.cells, piece.x + 1, piece.y)) piece.x++;
        else if (what === 'down') {
          if (!collides(piece.cells, piece.x, piece.y + 1)) { piece.y++; acc = 0; }
          else lock();
        } else if (what === 'rot') {
          var rotated = rotate(piece.cells);
          if (!collides(rotated, piece.x, piece.y)) piece.cells = rotated;
          else if (!collides(rotated, piece.x - 1, piece.y)) { piece.cells = rotated; piece.x--; }
          else if (!collides(rotated, piece.x + 1, piece.y)) { piece.cells = rotated; piece.x++; }
        } else if (what === 'drop') {
          while (!collides(piece.cells, piece.x, piece.y + 1)) piece.y++;
          sfx('buy');
          lock();
        }
      }

      function end() {
        if (finished) return;
        finished = true;
        piece = null;
        sfx('fail');
        api.finish(lines / 12, lines, lines + ' lignes complétées · niveau ' + level);
      }

      MG.onKey('keydown', function (e) {
        var map = {
          ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'down',
          ArrowUp: 'rot', ' ': 'drop', q: 'left', d: 'right', s: 'down', z: 'rot', w: 'rot'
        };
        var what = map[e.key];
        if (!what) return;
        e.preventDefault();
        act(what);
      });

      newPiece();

      MG.loop(function (dt) {
        if (!finished && piece) {
          acc += dt;
          if (acc >= fall) {
            acc = 0;
            if (!collides(piece.cells, piece.x, piece.y + 1)) piece.y++;
            else lock();
          }
        }

        ctx.fillStyle = '#0d2216';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(255,255,255,.05)';
        for (var c = 0; c <= COLS; c++) {
          ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
        }

        /* Les sprites de cageot ont leur propre marge : on les dessine un peu
           plus grands que la case pour que les blocs d'une même pièce se
           touchent au lieu de flotter séparément. */
        var BLOC = CELL * 1.24, DEC = (BLOC - CELL) / 2;
        function block(x, y, cell) {
          MG.drawSprite(ctx, cell.sprite, x * CELL - DEC, y * CELL - DEC, BLOC, BLOC, cell.color);
        }

        for (var r = 0; r < ROWS; r++) {
          for (var cc = 0; cc < COLS; cc++) if (grid[r][cc]) block(cc, r, grid[r][cc]);
        }
        if (piece) {
          piece.cells.forEach(function (cell) {
            block(piece.x + cell[0], piece.y + cell[1], piece);
          });
        }
      });
    }
  });

  /* ============================================== 11. BAR À SMOOTHIES === */

  var BAR_ITEMS = [
    { id: 'banane', label: 'Banane', sprite: 'assets/minigames/f_banane.png' },
    { id: 'fraise', label: 'Fraise', sprite: 'assets/minigames/f_fraise.png' },
    { id: 'kiwi',   label: 'Kiwi',   sprite: 'assets/minigames/f_kiwi.png' },
    { id: 'coco',   label: 'Coco',   sprite: 'assets/minigames/f_coco.png' },
    { id: 'cerise', label: 'Cerise', sprite: 'assets/minigames/f_cerise.png' },
    { id: 'ananas', label: 'Ananas', sprite: 'assets/minigames/f_ananas.png' }
  ];

  MG.define({
    id: 'cocktail', name: 'Bar à Smoothies', icon: 'assets/minigames/mg_cocktail.png',
    scoreLabel: 'Clients servis',
    desc: "Reproduisez chaque commande dans le bon ordre avant la fin du chrono.",
    mount: function (root, api) {
      var refs = MG.hud(root, [
        { key: 'served', label: 'Servis', value: 0 },
        { key: 'time', label: 'Temps', value: '60 s' },
        { key: 'order', label: 'Commande', value: '1' }
      ]);

      var stage = U.el('div', 'mg-stage bar-stage');
      stage.style.setProperty('--bar-bg', cssUrl('assets/minigames/comptoir.png'));
      root.appendChild(stage);

      var scene = U.el('div', 'bar-scene');
      var glass = U.icon('assets/minigames/verre.png', 'bar-glass', 'Verre');
      scene.appendChild(glass);
      var orderRow = U.el('div', 'bar-order');
      scene.appendChild(orderRow);
      stage.appendChild(scene);
      var progRow = U.el('div', 'bar-progress');
      stage.appendChild(progRow);

      var pad = U.el('div', 'bar-pad');
      root.appendChild(pad);

      MG.helpText(root, "Cliquez les ingrédients dans l'ordre exact de la commande. " +
                        "Une erreur vide le verre et fait perdre du temps. " +
                        "Les recettes s'allongent au fil des clients.");

      var served = 0, order = [], filled = [], left = 60, finished = false;

      BAR_ITEMS.forEach(function (item) {
        var b = U.el('button', 'bar-btn');
        b.appendChild(U.icon(item.sprite, null, item.label));
        b.appendChild(U.el('span', null, item.label));
        U.on(b, 'click', function () { pour(item); });
        pad.appendChild(b);
      });

      function newOrder() {
        var len = U.clamp(3 + Math.floor(served / 3), 3, 7);
        order = [];
        for (var i = 0; i < len; i++) order.push(U.pick(BAR_ITEMS));
        filled = [];
        refs.order.textContent = String(served + 1);
        render();
      }

      function render() {
        orderRow.innerHTML = '';
        order.forEach(function (item, i) {
          var cell = U.el('div', 'bar-cell' + (i < filled.length ? ' done' : ''));
          cell.appendChild(U.icon(item.sprite, null, item.label));
          orderRow.appendChild(cell);
        });
        progRow.innerHTML = '';
        var bar = U.el('div', 'bar');
        var fill = U.el('i');
        var ratio = order.length ? filled.length / order.length : 0;
        fill.style.width = (ratio * 100) + '%';
        bar.appendChild(fill);
        progRow.appendChild(bar);
        /* Le verre se remplit à mesure que la recette avance. */
        glass.style.setProperty('--fill', (ratio * 100) + '%');
        glass.classList.toggle('full', ratio >= 1);
      }

      function pour(item) {
        if (finished) return;
        var expected = order[filled.length];
        if (!expected) return;
        if (expected.id !== item.id) {
          sfx('bad');
          filled = [];
          left = Math.max(0, left - 2);
          stage.style.boxShadow = 'inset 0 0 0 4px #ff5a5a';
          MG.after(function () { stage.style.boxShadow = ''; }, 160);
          render();
          return;
        }
        filled.push(item);
        sfx('pop', { chain: filled.length });
        if (filled.length >= order.length) {
          served++;
          refs.served.textContent = served;
          left = Math.min(90, left + 4);
          sfx('good');
          newOrder();
        } else {
          render();
        }
      }

      function end() {
        if (finished) return;
        finished = true;
        api.finish(served / 16, served, served + ' clients servis');
      }

      newOrder();

      MG.every(function () {
        if (finished) return;
        left--;
        refs.time.textContent = Math.max(0, left) + ' s';
        if (left <= 0) end();
      }, 1000);
    }
  });

  /* ======================================= 12. CHASSE AUX CHAPARDEURS === */

  MG.define({
    id: 'taupe', name: 'Chasse aux Chapardeurs', icon: 'assets/minigames/mg_taupe.png',
    scoreLabel: 'Chapardeurs assommés',
    desc: "Tapez les voleurs qui sortent de terre, mais épargnez vos propres singes.",
    mount: function (root, api) {
      var refs = MG.hud(root, [
        { key: 'score', label: 'Assommés', value: 0 },
        { key: 'time', label: 'Temps', value: '45 s' },
        { key: 'miss', label: 'Bavures', value: '0/5' }
      ]);

      var stage = U.el('div', 'mg-stage mole-grid');
      root.appendChild(stage);

      MG.helpText(root, "Les ratons laveurs volent vos bananes : tapez-les. " +
                        "Les singes cueilleurs travaillent pour vous : laissez-les tranquilles. " +
                        "Cinq bavures et la partie s'arrête.");

      var HOLES = 9;
      var holes = [], score = 0, misses = 0, left = 45, finished = false;
      var gap = 900;

      for (var i = 0; i < HOLES; i++) {
        (function (idx) {
          var hole = U.el('button', 'mole-hole');
          var ground = U.icon('assets/minigames/trou.png', 'mole-ground', '');
          hole.appendChild(ground);
          var img = U.el('img');
          img.alt = '';
          img.className = 'mole-actor';
          hole.appendChild(img);
          U.on(hole, 'click', function () { whack(idx); });
          stage.appendChild(hole);
          holes.push({ node: hole, img: img, kind: null, until: 0 });
        })(i);
      }

      function pop() {
        var free = holes.filter(function (h) { return !h.kind; });
        if (!free.length) return;
        var h = U.pick(free);
        var thief = Math.random() < 0.72;
        h.kind = thief ? 'thief' : 'friend';
        U.setSprite(h.img, thief ? 'assets/minigames/raton.png' : 'assets/generators/singe.png');
        h.node.classList.add('up', thief ? 'thief' : 'friend');
        h.until = Date.now() + U.randRange(700, 1500);
      }

      function clear(h) {
        h.kind = null;
        h.node.classList.remove('up', 'thief', 'friend', 'hit');
        h.img.removeAttribute('src');
      }

      function whack(idx) {
        if (finished) return;
        var h = holes[idx];
        if (!h.kind) return;
        if (h.kind === 'thief') {
          score++;
          refs.score.textContent = score;
          sfx('good');
        } else {
          misses++;
          refs.miss.textContent = misses + '/5';
          sfx('bad');
          stage.style.boxShadow = 'inset 0 0 0 4px #ff5a5a';
          MG.after(function () { stage.style.boxShadow = ''; }, 160);
          if (misses >= 5) { end(); return; }
        }
        h.node.classList.add('hit');
        clear(h);
      }

      function end() {
        if (finished) return;
        finished = true;
        api.finish(score / 45, score, score + ' chapardeurs assommés');
      }

      MG.every(function () {
        if (finished) return;
        var now = Date.now();
        holes.forEach(function (h) {
          if (h.kind && now >= h.until) clear(h);
        });
      }, 80);

      var spawner = MG.every(function () {
        if (finished) return;
        pop();
        if (left < 30 && Math.random() < 0.4) pop();
      }, gap);

      MG.every(function () {
        if (finished) return;
        left--;
        refs.time.textContent = Math.max(0, left) + ' s';
        if (left <= 0) end();
      }, 1000);

      /* Le rythme s'accélère au fil de la partie. */
      MG.every(function () {
        if (finished || gap <= 380) return;
        gap -= 60;
        clearInterval(spawner);
        spawner = MG.every(function () {
          if (finished) return;
          pop();
          if (left < 30 && Math.random() < 0.4) pop();
        }, gap);
      }, 6000);
    }
  });
})(window);

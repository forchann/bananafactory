/* Banana Factory - amorçage, boucle principale, sauvegarde automatique */
(function (global) {
  'use strict';

  var G = global.G, UI = global.UI, U = global.U;

  var AUTOSAVE_MS = 12000;
  var UI_REFRESH_MS = 260;

  /* Pose tous les sprites déclarés en HTML une fois le mode de chargement connu. */
  function applySprites() {
    U.qsa('img[data-asset]').forEach(function (img) {
      U.setSprite(img, img.dataset.asset);
    });
    var fav = U.qs('#favicon');
    if (fav) fav.href = global.ASSETS.resolve('assets/misc/banana_hero.png');
    var stage = U.qs('#clicker-stage');
    if (stage) {
      stage.style.setProperty('--stage-bg',
        "url('" + global.ASSETS.resolve('assets/misc/bg_plantation.png') + "')");
      stage.classList.add('has-bg');
    }
  }

  /* Télécharge en tâche de fond ce qui manque, pour que la prochaine
     ouverture du jeu se passe intégralement hors-ligne. */
  function startPrefetch() {
    if (global.ASSETS.mode !== 'remote') return;
    var announced = false;
    global.ASSETS.prefetch(function (done, total) {
      if (done < total || announced) return;
      announced = true;
      applySprites();
      UI.toast('Sprites en cache',
        total + " illustrations enregistrées : le jeu fonctionne maintenant hors-ligne.",
        'assets/misc/book.png');
    });
  }

  function boot() {
    var loaded = G.load();
    G.recompute();
    UI.init();

    if (loaded && loaded.offline && loaded.offline.gain > 0) {
      UI.showOfflineModal(loaded.offline);
    }

    if (G.S.features.golden && !G.S.nextGoldenAt) {
      G.S.nextGoldenAt = Date.now() + G.goldenDelay();
    }

    var bootScreen = U.qs('#boot');
    if (bootScreen) {
      bootScreen.classList.add('gone');
      setTimeout(function () { bootScreen.remove(); }, 450);
    }

    startLoops();
    welcome(!loaded);
  }

  function welcome(isNew) {
    if (!isNew) return;
    UI.toast('Bienvenue à la plantation',
      "Cliquez sur la grosse banane pour commencer. Tout le reste se débloque en jouant.",
      'assets/misc/banana_hero.png');
  }

  function startLoops() {
    var last = Date.now();

    /* Boucle de simulation : pas fixe, indépendante du rendu */
    setInterval(function () {
      var now = Date.now();
      var dt = now - last;
      last = now;
      /* Un onglet en arrière-plan peut accumuler du retard : on le rattrape,
         mais jamais plus de 5 s d'un coup pour éviter les sauts absurdes. */
      G.tick(Math.min(dt, 5000));

      if (G.S.features.golden && G.S.nextGoldenAt && now >= G.S.nextGoldenAt) {
        UI.spawnGolden();
        G.S.nextGoldenAt = now + G.goldenDelay();
      }
    }, G.TICK_MS);

    /* Rafraîchissement de l'affichage, plus lent que la simulation */
    setInterval(function () {
      UI.refreshAll();
      UI.refreshTip();
    }, UI_REFRESH_MS);

    /* Le bandeau du haut suit le rythme de l'écran */
    (function frame() {
      UI.refreshHeader();
      requestAnimationFrame(frame);
    })();

    setInterval(function () { G.save(); }, AUTOSAVE_MS);

    global.addEventListener('beforeunload', function () { G.save(); });
    global.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') G.save();
    });
  }

  function start() {
    var sub = U.qs('#boot-sub');
    global.ASSETS.init(function (info) {
      if (sub && info.mode === 'remote' && !info.cached) {
        sub.textContent = 'Récupération des illustrations…';
      }
      applySprites();
      boot();
      startPrefetch();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})(window);

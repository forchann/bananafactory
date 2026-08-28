/* Banana Factory - utilitaires generaux */
(function (global) {
  'use strict';

  var SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td'];

  /* Formate un nombre en notation courte : 1234 -> "1.23K" */
  function fmt(n, decimals) {
    if (!isFinite(n)) return '∞';
    if (n < 0) return '-' + fmt(-n, decimals);
    if (n < 1000) {
      if (n === 0) return '0';
      if (n < 10 && n % 1 !== 0) return n.toFixed(decimals === undefined ? 1 : decimals);
      return String(Math.floor(n));
    }
    var tier = Math.floor(Math.log10(n) / 3);
    if (tier >= SUFFIXES.length) return n.toExponential(2).replace('e+', 'e');
    var scaled = n / Math.pow(1000, tier);
    var d = decimals === undefined ? (scaled < 10 ? 2 : scaled < 100 ? 1 : 0) : decimals;
    return scaled.toFixed(d) + SUFFIXES[tier];
  }

  /* Nombre entier avec espaces fins : 1234567 -> "1 234 567" */
  function fmtInt(n) {
    return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /* Duree en secondes -> "1h 04m 12s" */
  function fmtTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '--';
    seconds = Math.floor(seconds);
    var d = Math.floor(seconds / 86400);
    var h = Math.floor((seconds % 86400) / 3600);
    var m = Math.floor((seconds % 3600) / 60);
    var s = seconds % 60;
    if (d > 0) return d + 'j ' + pad(h) + 'h ' + pad(m) + 'm';
    if (h > 0) return h + 'h ' + pad(m) + 'm ' + pad(s) + 's';
    if (m > 0) return m + 'm ' + pad(s) + 's';
    return s + 's';
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function randRange(a, b) { return a + Math.random() * (b - a); }

  function randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Tirage pondere : items = [{weight: n, ...}] */
  function weightedPick(items, weightKey) {
    var key = weightKey || 'weight';
    var total = 0, i;
    for (i = 0; i < items.length; i++) total += items[i][key] || 0;
    if (total <= 0) return null;
    var r = Math.random() * total;
    for (i = 0; i < items.length; i++) {
      r -= items[i][key] || 0;
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  /* Cout cumule de `count` achats a partir de `owned` (croissance geometrique) */
  function bulkCost(base, growth, owned, count) {
    if (count <= 0) return 0;
    return base * Math.pow(growth, owned) * (Math.pow(growth, count) - 1) / (growth - 1);
  }

  /* Combien d'exemplaires on peut s'offrir avec `budget` */
  function maxAffordable(base, growth, owned, budget) {
    var unit = base * Math.pow(growth, owned);
    if (budget < unit) return 0;
    var n = Math.floor(Math.log(1 + (budget * (growth - 1)) / unit) / Math.log(growth));
    return Math.max(0, n);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function on(node, evt, fn) { node.addEventListener(evt, fn); return node; }

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  global.U = {
    fmt: fmt, fmtInt: fmtInt, fmtTime: fmtTime, pad: pad,
    clamp: clamp, lerp: lerp,
    randRange: randRange, randInt: randInt, pick: pick, shuffle: shuffle,
    weightedPick: weightedPick,
    bulkCost: bulkCost, maxAffordable: maxAffordable,
    el: el, on: on, qs: qs, qsa: qsa
  };
})(window);

/* Variante française : virgule décimale */
(function (global) {
  global.U.fmtFr = function (n, d) { return global.U.fmt(n, d).replace('.', ','); };
  global.U.pct = function (x) {
    var v = x * 100;
    if (v > 0 && v < 0.1) return '< 0,1 %';
    return v.toFixed(v < 10 ? 1 : 0).replace('.', ',') + ' %';
  };
  /* Image avec double repli : sprite local -> PixelLab -> cadre de bois */
  global.U.icon = function (src, cls, alt) {
    var i = document.createElement('img');
    if (cls) i.className = cls;
    i.alt = alt || '';
    global.U.setSprite(i, src);
    return i;
  };

  /* Applique un sprite à une balise <img> existante, avec repli. */
  global.U.setSprite = function (img, path) {
    var A = global.ASSETS;
    var first = A ? A.resolve(path) : path;
    var remote = A ? A.remoteUrl(path) : path;
    img.dataset.sprite = path;
    img.onerror = function () {
      if (img.src !== remote && remote !== path) { img.src = remote; return; }
      img.onerror = null;
      img.classList.add('noimg');
      img.removeAttribute('src');
    };
    img.onload = function () { img.classList.remove('noimg'); };
    img.src = first;
  };
})(window);

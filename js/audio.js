/* Banana Factory - bruitages
 *
 * Tout est synthétisé à la volée avec l'API Web Audio : aucun fichier audio,
 * rien à télécharger, et le jeu reste sonore hors-ligne. Le contexte n'est
 * créé qu'au premier geste de l'utilisateur, comme l'exigent les navigateurs.
 */
(function (global) {
  'use strict';

  var ctx = null;
  var master = null;
  var enabled = true;
  var volume = 0.45;
  var voices = 0;             // limite le nombre de sons simultanés
  var MAX_VOICES = 14;
  var lastPlayed = {};        // anti-répétition par nom

  /* ------------------------------------------------------------- socle */

  function ensure() {
    if (ctx) return ctx;
    var AC = global.AudioContext || global.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    return ctx;
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) { /* ignoré */ } }
  }

  function now() { return ctx.currentTime; }

  /* Une note : oscillateur + enveloppe, avec glissando optionnel. */
  function tone(o) {
    if (!ctx || voices >= MAX_VOICES) return;
    var t0 = now() + (o.delay || 0);
    var dur = o.dur || 0.12;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.to && o.to !== o.freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + dur);
    }

    var peak = Math.max(0.0001, (o.gain === undefined ? 0.18 : o.gain));
    var attack = o.attack === undefined ? 0.006 : o.attack;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    var node = osc;
    if (o.filter) {
      var f = ctx.createBiquadFilter();
      f.type = o.filter;
      f.frequency.value = o.filterFreq || 1200;
      node.connect(f);
      f.connect(gain);
    } else {
      node.connect(gain);
    }
    gain.connect(master);

    voices++;
    osc.onended = function () { voices--; };
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /* Un souffle : bruit blanc filtré, pour les impacts et les balayages. */
  function noise(o) {
    if (!ctx || voices >= MAX_VOICES) return;
    o = o || {};
    var t0 = now() + (o.delay || 0);
    var dur = o.dur || 0.12;
    var frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, frames, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;

    var src = ctx.createBufferSource();
    src.buffer = buf;

    var f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.freq || 900, t0);
    if (o.to) f.frequency.exponentialRampToValueAtTime(Math.max(60, o.to), t0 + dur);
    f.Q.value = o.q === undefined ? 1.2 : o.q;

    var gain = ctx.createGain();
    var peak = Math.max(0.0001, o.gain === undefined ? 0.12 : o.gain);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(f); f.connect(gain); gain.connect(master);
    voices++;
    src.onended = function () { voices--; };
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  /* Une petite mélodie : suite de notes espacées. */
  function melody(freqs, o) {
    o = o || {};
    var step = o.step || 0.07;
    for (var i = 0; i < freqs.length; i++) {
      tone({
        freq: freqs[i], to: o.glide ? freqs[i] * 1.02 : 0,
        type: o.type || 'square', dur: o.dur || 0.13,
        gain: (o.gain || 0.15) * (o.fade ? 1 - i / (freqs.length * 1.6) : 1),
        delay: (o.delay || 0) + i * step
      });
    }
  }

  /* Gamme pentatonique : sert au combo, toujours juste quoi qu'il arrive. */
  var PENTA = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51, 1567.98, 1760.00];

  /* ------------------------------------------------------------- sons */

  var SOUNDS = {
    /* combo : la hauteur monte avec la série de clics */
    click: function (p) {
      var step = Math.min(PENTA.length - 1, Math.floor((p && p.combo ? p.combo : 1) / 4));
      tone({ freq: PENTA[step], type: 'square', dur: 0.07, gain: 0.11 });
      tone({ freq: PENTA[step] * 2, type: 'triangle', dur: 0.05, gain: 0.05, delay: 0.01 });
    },
    crit: function () {
      tone({ freq: 300, to: 1400, type: 'sawtooth', dur: 0.19, gain: 0.16 });
      melody([880, 1174.66, 1567.98], { step: 0.045, dur: 0.11, gain: 0.13, type: 'square' });
      noise({ freq: 2600, to: 700, dur: 0.2, gain: 0.07 });
    },
    buy: function () {
      tone({ freq: 196, type: 'square', dur: 0.07, gain: 0.13 });
      tone({ freq: 392, type: 'square', dur: 0.1, gain: 0.11, delay: 0.055 });
      noise({ freq: 1800, to: 500, dur: 0.09, gain: 0.06 });
    },
    upgrade: function () {
      melody([523.25, 659.25, 783.99, 1046.5], { step: 0.06, dur: 0.14, gain: 0.14, type: 'square' });
    },
    feature: function () {
      melody([523.25, 659.25, 783.99, 1046.5, 1318.51], { step: 0.1, dur: 0.26, gain: 0.15, type: 'square' });
      melody([261.63, 329.63, 392, 523.25, 659.25], { step: 0.1, dur: 0.3, gain: 0.09, type: 'triangle' });
    },
    /* la fanfare s'allonge avec la rareté */
    rare: function (p) {
      var tiers = {
        'peu-commune': [880, 1174.66],
        'rare': [880, 1174.66, 1567.98],
        'epique': [783.99, 1046.5, 1318.51, 1760],
        'legendaire': [659.25, 880, 1046.5, 1318.51, 1760, 2093],
        'mythique': [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093, 2637]
      };
      var seq = tiers[p && p.rarity] || tiers['peu-commune'];
      melody(seq, { step: 0.075, dur: 0.2, gain: 0.14, type: 'triangle' });
      if (p && (p.rarity === 'legendaire' || p.rarity === 'mythique')) {
        noise({ freq: 400, to: 5000, dur: 0.7, gain: 0.05, filter: 'highpass' });
      }
    },
    golden: function () {
      melody([1046.5, 1318.51, 1567.98, 2093], { step: 0.05, dur: 0.3, gain: 0.13, type: 'sine' });
      noise({ freq: 3000, to: 900, dur: 0.45, gain: 0.05, filter: 'highpass' });
    },
    challenge: function () {
      melody([783.99, 1046.5, 1318.51], { step: 0.09, dur: 0.28, gain: 0.15, type: 'triangle' });
    },
    contract: function () {
      noise({ freq: 700, to: 200, dur: 0.09, gain: 0.11, filter: 'lowpass' });
      melody([659.25, 987.77], { step: 0.09, dur: 0.22, gain: 0.13, delay: 0.06, type: 'square' });
    },
    prestige: function () {
      tone({ freq: 110, to: 880, type: 'sawtooth', dur: 1.1, gain: 0.12, attack: 0.2 });
      melody([523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98],
             { step: 0.13, dur: 0.5, gain: 0.13, delay: 0.5, type: 'triangle' });
    },
    boost: function () {
      tone({ freq: 220, to: 1320, type: 'sawtooth', dur: 0.35, gain: 0.12 });
      noise({ freq: 300, to: 4000, dur: 0.35, gain: 0.06, filter: 'highpass' });
    },
    fail: function () {
      tone({ freq: 320, to: 90, type: 'sawtooth', dur: 0.32, gain: 0.13 });
    },
    error: function () {
      tone({ freq: 150, type: 'square', dur: 0.11, gain: 0.1 });
      tone({ freq: 120, type: 'square', dur: 0.13, gain: 0.1, delay: 0.09 });
    },

    /* --- minijeux --- */
    good: function () { tone({ freq: 880, to: 1320, type: 'square', dur: 0.1, gain: 0.12 }); },
    bad: function () { tone({ freq: 260, to: 130, type: 'sawtooth', dur: 0.17, gain: 0.12 }); },
    pop: function (p) {
      var n = Math.min(6, (p && p.chain) || 1);
      tone({ freq: 440 * Math.pow(1.18, n), to: 660 * Math.pow(1.18, n),
             type: 'sine', dur: 0.11, gain: 0.11 });
      noise({ freq: 2200, to: 900, dur: 0.07, gain: 0.05 });
    },
    drum: function (p) {
      var f = [261.63, 329.63, 392, 523.25][(p && p.pad) || 0];
      tone({ freq: f, type: 'triangle', dur: 0.26, gain: 0.16 });
      tone({ freq: f / 2, type: 'sine', dur: 0.3, gain: 0.09 });
    },
    jump: function () { tone({ freq: 330, to: 720, type: 'square', dur: 0.13, gain: 0.11 }); },
    slide: function () { noise({ freq: 1400, to: 400, dur: 0.2, gain: 0.08, filter: 'lowpass' }); },
    pickup: function () { tone({ freq: 990, to: 1480, type: 'square', dur: 0.08, gain: 0.1 }); },
    crash: function () {
      noise({ freq: 700, to: 90, dur: 0.4, gain: 0.15, filter: 'lowpass' });
      tone({ freq: 160, to: 55, type: 'sawtooth', dur: 0.4, gain: 0.12 });
    },
    dig: function () { noise({ freq: 500, to: 180, dur: 0.13, gain: 0.09, filter: 'lowpass' }); },
    treasure: function () {
      melody([784, 1046.5, 1318.51], { step: 0.06, dur: 0.24, gain: 0.14, type: 'triangle' });
    },
    tick: function () { tone({ freq: 1200, type: 'square', dur: 0.025, gain: 0.05 }); },
    spin: function () { noise({ freq: 600, to: 2400, dur: 0.3, gain: 0.06, filter: 'bandpass' }); },
    peel: function () { noise({ freq: 2200, to: 700, dur: 0.1, gain: 0.08, filter: 'bandpass' }); }
  };

  /* Intervalle minimal entre deux occurrences d'un même son (ms) */
  var THROTTLE = { click: 28, tick: 18, pop: 35, dig: 40, peel: 30, pickup: 30 };

  function play(name, params) {
    if (!enabled) return;
    var t = THROTTLE[name];
    if (t) {
      var n = Date.now();
      if (lastPlayed[name] && n - lastPlayed[name] < t) return;
      lastPlayed[name] = n;
    }
    if (!ensure()) return;
    resume();
    var fn = SOUNDS[name];
    if (fn) { try { fn(params || {}); } catch (e) { /* un son raté n'interrompt rien */ } }
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (master) master.gain.value = volume;
  }

  function setEnabled(on) {
    enabled = !!on;
    if (enabled) { ensure(); resume(); }
  }

  /* Le contexte audio ne peut naître que d'un geste : on s'accroche au premier. */
  function arm() {
    var events = ['pointerdown', 'keydown', 'touchstart'];
    function once() {
      events.forEach(function (e) { global.removeEventListener(e, once); });
      if (enabled) { ensure(); resume(); }
    }
    events.forEach(function (e) { global.addEventListener(e, once, { once: true }); });
  }

  global.SFX = {
    play: play,
    arm: arm,
    setVolume: setVolume,
    setEnabled: setEnabled,
    get volume() { return volume; },
    get enabled() { return enabled; },
    get available() { return !!(global.AudioContext || global.webkitAudioContext); },
    names: Object.keys(SOUNDS)
  };
})(window);

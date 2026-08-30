/* Banana Factory - Casino de la Canopée
 *
 * Quatre jeux d'argent, misés en bananes : machine à sous, roulette,
 * 21 Bananes et course de cochons.
 *
 * Deux garde-fous, sans lesquels le casino remplacerait tout le reste du jeu :
 *
 *  1. La mise maximale est indexée sur la PRODUCTION, pas sur le stock. On ne
 *     peut donc jamais jouer sa fortune entière sur un coup.
 *  2. Les gains passent par G.payout() et non G.earn() : ils remplissent la
 *     réserve mais ne comptent pas dans le total qui donne les Graines d'Or.
 *     Sans cela, miser en boucle ferait monter le prestige sans rien produire.
 *
 * Chaque jeu conserve un avantage de la maison d'environ 4 %, réduit — jamais
 * annulé — par la statistique « chance au casino ».
 */
(function (global) {
  'use strict';

  var U = global.U;
  function G() { return global.G; }
  function S() { return global.G.S; }

  /* Ristourne appliquée aux gains : ramène l'avantage de la maison vers 0
     sans jamais le rendre négatif. */
  function edgeBonus() { return 1 + Math.min(0.04, G().D.casinoLuck); }

  function maxBet() { return Math.max(50000, G().D.bps * 900); }

  function betOptions() {
    var m = maxBet();
    return [m * 0.05, m * 0.2, m * 0.5, m].map(function (v) { return Math.floor(v); });
  }

  function canBet(amount) {
    return amount > 0 && amount <= maxBet() && S().bananas >= amount;
  }

  /* Comptabilité commune à tous les jeux. */
  function settle(bet, gross) {
    var st = S().stats;
    st.casinoPlays++;
    var net = gross - bet;
    if (gross > 0) G().payout(gross);
    if (net > 0) {
      st.casinoWins++;
      if (net > (st.casinoBest || 0)) st.casinoBest = net;
    }
    G().recompute();
    G().emit('casino', { bet: bet, gross: gross, net: net });
    return net;
  }

  /* ================================================= MACHINE À SOUS ===== */

  var REELS = [
    { id: 'banane',  name: 'Banane',  sprite: 'assets/casino/sym_banane.png',  weight: 30, three: 5,   color: '#ffd23f' },
    { id: 'cerise',  name: 'Cerise',  sprite: 'assets/casino/sym_cerise.png',  weight: 24, three: 8,   color: '#e0483c' },
    { id: 'coco',    name: 'Coco',    sprite: 'assets/casino/sym_coco.png',    weight: 18, three: 12,  color: '#8a5c33' },
    { id: 'cloche',  name: 'Cloche',  sprite: 'assets/casino/sym_cloche.png',  weight: 12, three: 20,  color: '#ffb547' },
    { id: 'diamant', name: 'Diamant', sprite: 'assets/casino/sym_diamant.png', weight: 8,  three: 45,  color: '#4aa3ff' },
    { id: 'or',      name: 'Étoile',  sprite: 'assets/casino/sym_etoile.png',  weight: 4,  three: 140, color: '#fff29a' }
  ];

  var PAIR_PAYOUT = 1.05;

  function spinReels() {
    return [U.weightedPick(REELS), U.weightedPick(REELS), U.weightedPick(REELS)];
  }

  function slotResult(reels) {
    var a = reels[0], b = reels[1], c = reels[2];
    if (a.id === b.id && b.id === c.id) {
      return { kind: 'triple', mult: a.three, symbol: a };
    }
    var pair = (a.id === b.id) ? a : (b.id === c.id) ? b : (a.id === c.id) ? a : null;
    if (pair) return { kind: 'pair', mult: PAIR_PAYOUT, symbol: pair };
    return { kind: 'none', mult: 0, symbol: null };
  }

  function playSlots(bet) {
    if (!S().features.casino || !canBet(bet)) return null;
    if (!G().spend(bet)) return null;

    var reels = spinReels();
    var res = slotResult(reels);
    var gross = res.mult > 0 ? bet * res.mult * edgeBonus() : 0;

    var extra = { tokens: 0, rare: null };
    /* Le jackpot ⭐⭐⭐ ouvre aussi la porte à un spécimen rare. */
    if (res.kind === 'triple' && res.symbol.id === 'or') {
      extra.tokens = G().addTokens(U.randInt(40, 90) * G().D.tokenMult, true);
      var r = G().drawRare('epique');
      if (r) extra.rare = G().grantRare(r.id, 'casino');
    } else if (res.kind === 'triple' && res.symbol.id === 'diamant') {
      extra.tokens = G().addTokens(U.randInt(8, 20) * G().D.tokenMult, true);
    }

    var net = settle(bet, gross);
    return { reels: reels, result: res, gross: gross, net: net, extra: extra };
  }

  /* ====================================================== ROULETTE ====== */

  /* 25 cases : un zéro vert, puis douze rouges et douze noires. */
  var ROULETTE_SLOTS = 25;

  function slotColor(n) {
    if (n === 0) return 'vert';
    return n % 2 === 1 ? 'rouge' : 'noir';
  }

  var ROULETTE_BETS = [
    { id: 'rouge',  label: 'Rouge',      pays: 2,  test: function (n) { return slotColor(n) === 'rouge'; } },
    { id: 'noir',   label: 'Noir',       pays: 2,  test: function (n) { return slotColor(n) === 'noir'; } },
    { id: 'pair',   label: 'Pair',       pays: 2,  test: function (n) { return n > 0 && n % 2 === 0; } },
    { id: 'impair', label: 'Impair',     pays: 2,  test: function (n) { return n % 2 === 1; } },
    { id: 't1',     label: '1 → 8',      pays: 3,  test: function (n) { return n >= 1 && n <= 8; } },
    { id: 't2',     label: '9 → 16',     pays: 3,  test: function (n) { return n >= 9 && n <= 16; } },
    { id: 't3',     label: '17 → 24',    pays: 3,  test: function (n) { return n >= 17 && n <= 24; } },
    { id: 'zero',   label: 'Le Zéro',    pays: 24, test: function (n) { return n === 0; } }
  ];

  var ROULETTE_BY_ID = {};
  ROULETTE_BETS.forEach(function (b) { ROULETTE_BY_ID[b.id] = b; });

  function playRoulette(betId, amount) {
    var kind = ROULETTE_BY_ID[betId];
    if (!kind || !S().features.casino || !canBet(amount)) return null;
    if (!G().spend(amount)) return null;

    var n = U.randInt(0, ROULETTE_SLOTS - 1);
    var won = kind.test(n);
    var gross = won ? amount * kind.pays * edgeBonus() : 0;
    var net = settle(amount, gross);
    return { number: n, color: slotColor(n), bet: kind, won: won, gross: gross, net: net };
  }

  /* ==================================================== 21 BANANES ====== */

  /* Un sabot infini : chaque carte est tirée indépendamment. */
  var CARD_LABELS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'D', 'R'];

  /* Quatre enseignes, dont une maison. Purement visuel : la valeur d'une
     carte ne dépend que de son rang. */
  var SUITS = [
    { id: 'banane', sprite: 'assets/casino/suit_banane.png', red: false },
    { id: 'coeur',  sprite: 'assets/casino/suit_coeur.png',  red: true },
    { id: 'pique',  sprite: 'assets/casino/suit_pique.png',  red: false },
    { id: 'trefle', sprite: 'assets/casino/suit_trefle.png', red: false }
  ];

  function drawCard() {
    var i = U.randInt(0, 12);
    return {
      label: CARD_LABELS[i],
      value: i === 0 ? 11 : Math.min(10, i + 1),
      ace: i === 0,
      suit: U.pick(SUITS)
    };
  }

  function handValue(cards) {
    var total = 0, aces = 0;
    for (var i = 0; i < cards.length; i++) {
      total += cards[i].value;
      if (cards[i].ace) aces++;
    }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return total;
  }

  function isBlackjack(cards) { return cards.length === 2 && handValue(cards) === 21; }

  var bj = null;   // partie en cours, hors sauvegarde

  function bjStart(bet) {
    if (!S().features.casino || !canBet(bet) || bj) return null;
    if (!G().spend(bet)) return null;
    bj = {
      bet: bet,
      player: [drawCard(), drawCard()],
      dealer: [drawCard(), drawCard()],
      over: false
    };
    if (isBlackjack(bj.player)) return bjFinish();
    return bjState();
  }

  function bjState() {
    if (!bj) return null;
    return {
      bet: bj.bet,
      player: bj.player, dealer: bj.dealer,
      playerValue: handValue(bj.player),
      dealerValue: handValue(bj.dealer),
      over: bj.over, result: bj.result, gross: bj.gross, net: bj.net,
      /* Tant que le coup n'est pas fini, la seconde carte du croupier est cachée. */
      hidden: !bj.over
    };
  }

  function bjHit() {
    if (!bj || bj.over) return null;
    bj.player.push(drawCard());
    if (handValue(bj.player) > 21) return bjFinish();
    return bjState();
  }

  function bjStand() {
    if (!bj || bj.over) return null;
    while (handValue(bj.dealer) < 17) bj.dealer.push(drawCard());
    return bjFinish();
  }

  /* Double : on remet la mise, une seule carte, puis on s'arrête. */
  function bjDouble() {
    if (!bj || bj.over || bj.player.length !== 2) return null;
    if (!canBet(bj.bet) || !G().spend(bj.bet)) return null;
    bj.bet *= 2;
    bj.player.push(drawCard());
    if (handValue(bj.player) > 21) return bjFinish();
    return bjStand();
  }

  function bjFinish() {
    var p = handValue(bj.player), d = handValue(bj.dealer);
    var gross = 0, result;

    if (p > 21) { result = 'perdu'; }
    else if (isBlackjack(bj.player) && !isBlackjack(bj.dealer)) {
      result = 'blackjack'; gross = bj.bet * 2.5;
    } else {
      while (d < 17) { bj.dealer.push(drawCard()); d = handValue(bj.dealer); }
      if (d > 21 || p > d) { result = 'gagné'; gross = bj.bet * 2; }
      else if (p === d) { result = 'égalité'; gross = bj.bet; }
      else { result = 'perdu'; }
    }

    if (gross > 0) gross *= edgeBonus();
    bj.over = true;
    bj.result = result;
    bj.gross = gross;
    bj.net = settle(bj.bet, gross);
    var out = bjState();
    return out;
  }

  function bjClear() { bj = null; }
  function bjActive() { return !!bj && !bj.over; }

  /* ============================================ COURSE DE COCHONS ======= */

  var PIG_NAMES = [
    'Groin-Groin', 'Truffe Folle', 'Bacon Express', 'Rose Bonbon',
    'Cochonnet', 'Jambon Suprême', 'Piglet Fury', 'Saucisson',
    'Boudin Blanc', 'Petit Lard', 'Mademoiselle Soie', 'Tornade Rose'
  ];

  var PIG_COLORS = ['#ff9db4', '#f2a65a', '#c98cff', '#8fd3a8', '#7ec8ff', '#c9a07a'];
  var PIG_SPRITES = [
    'assets/casino/pig1.png', 'assets/casino/pig2.png', 'assets/casino/pig3.png',
    'assets/casino/pig4.png', 'assets/casino/pig5.png', 'assets/casino/pig6.png'
  ];

  var TAKEOUT = 0.94;   // 6 % pour la maison, comme un vrai PMU

  var race = null;

  /*
   * Prépare une course : six cochons, une forme aléatoire, et des cotes
   * calculées à partir des probabilités réelles.
   */
  function newRace() {
    var names = U.shuffle(PIG_NAMES).slice(0, 6);
    var pigs = names.map(function (name, i) {
      return {
        index: i,
        name: name,
        color: PIG_COLORS[i],
        sprite: PIG_SPRITES[i],
        /* La « forme » est le poids du tirage : un favori a plus de poids. */
        form: U.randRange(1, 6)
      };
    });

    var total = pigs.reduce(function (s, p) { return s + p.form; }, 0);
    pigs.forEach(function (p) {
      p.chance = p.form / total;
      p.odds = Math.max(1.15, Math.round((TAKEOUT / p.chance) * 100) / 100);
    });

    race = { pigs: pigs, bet: null, done: false };
    return race;
  }

  function currentRace() { return race || newRace(); }

  /*
   * Lance la course. L'ordre d'arrivée est tiré d'abord (échantillonnage
   * pondéré sans remise), puis on fabrique des durées cohérentes avec cet
   * ordre : l'animation reste vivante sans fausser les probabilités.
   */
  function runRace(pigIndex, amount) {
    var r = currentRace();
    if (!S().features.race || r.done) return null;
    if (pigIndex < 0 || pigIndex >= r.pigs.length) return null;
    if (!canBet(amount) || !G().spend(amount)) return null;

    var remaining = r.pigs.slice();
    var order = [];
    while (remaining.length) {
      var pick = U.weightedPick(remaining.map(function (p) {
        return { pig: p, weight: p.form };
      }));
      order.push(pick.pig);
      remaining.splice(remaining.indexOf(pick.pig), 1);
    }

    var base = U.randRange(7.5, 10.5);
    order.forEach(function (p, rank) {
      p.rank = rank;
      p.duration = base + rank * U.randRange(0.25, 0.75);
      p.wobble = U.randRange(0.5, 1.4);
    });

    var winner = order[0];
    var bet = r.pigs[pigIndex];
    var won = winner.index === bet.index;
    var gross = won ? amount * bet.odds * edgeBonus() : 0;

    S().stats.racesPlayed++;
    if (won) S().stats.racesWon++;

    r.done = true;
    r.bet = { pig: bet, amount: amount };
    r.order = order;
    r.winner = winner;
    r.won = won;
    r.gross = gross;
    /* Le règlement n'a lieu qu'à l'arrivée : c'est l'interface qui appelle
       finishRace() une fois l'animation terminée. */
    r.pending = { amount: amount, gross: gross };
    return r;
  }

  function finishRace() {
    if (!race || !race.pending) return null;
    var p = race.pending;
    race.pending = null;
    race.net = settle(p.amount, p.gross);
    return race;
  }

  function resetRace() { race = null; return newRace(); }

  /* ============================================================== API === */

  global.CASINO = {
    maxBet: maxBet, betOptions: betOptions, canBet: canBet,
    REELS: REELS, playSlots: playSlots,
    ROULETTE_BETS: ROULETTE_BETS, ROULETTE_SLOTS: ROULETTE_SLOTS, SUITS: SUITS,
    slotColor: slotColor, playRoulette: playRoulette,
    bjStart: bjStart, bjHit: bjHit, bjStand: bjStand, bjDouble: bjDouble,
    bjState: bjState, bjClear: bjClear, bjActive: bjActive,
    handValue: handValue,
    newRace: newRace, currentRace: currentRace, runRace: runRace,
    finishRace: finishRace, resetRace: resetRace
  };
})(window);

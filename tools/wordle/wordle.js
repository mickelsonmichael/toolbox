(function () {
  const WORDS = [
    'about', 'above', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after',
    'again', 'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'align',
    'alike', 'alive', 'alley', 'allow', 'alone', 'along', 'alter', 'angel',
    'anger', 'angle', 'angry', 'ankle', 'apart', 'apple', 'apply', 'apron',
    'arise', 'array', 'arrow', 'aside', 'asset', 'atlas', 'attic', 'audio',
    'avoid', 'awake', 'award', 'aware', 'awful', 'baker', 'basic', 'basis',
    'batch', 'beach', 'beard', 'beast', 'began', 'begin', 'being', 'below',
    'bench', 'birth', 'black', 'blade', 'blame', 'blank', 'blast', 'blaze',
    'bleed', 'blend', 'bless', 'blind', 'block', 'blood', 'bloom', 'blown',
    'board', 'bonus', 'boost', 'booth', 'bound', 'boxer', 'brave', 'break',
    'breed', 'brick', 'bride', 'brief', 'bring', 'broke', 'brook', 'brown',
    'brush', 'build', 'built', 'bunch', 'burst', 'cabin', 'cable', 'camel',
    'candy', 'carry', 'catch', 'cause', 'chain', 'chair', 'chalk', 'chaos',
    'charm', 'chase', 'cheap', 'check', 'cheek', 'chess', 'chest', 'chief',
    'child', 'china', 'chunk', 'civic', 'civil', 'claim', 'class', 'clean',
    'clear', 'clerk', 'click', 'cliff', 'climb', 'cling', 'clock', 'clone',
    'close', 'cloud', 'clown', 'coach', 'coast', 'cobra', 'color', 'comic',
    'coral', 'count', 'court', 'cover', 'craft', 'crane', 'crash', 'crazy',
    'cream', 'creek', 'crime', 'cross', 'crowd', 'crown', 'cruel', 'crush',
    'curve', 'cycle', 'daily', 'dance', 'death', 'debut', 'decay', 'delay',
    'delta', 'dense', 'depot', 'depth', 'derby', 'digit', 'dirty', 'disco',
    'ditch', 'doubt', 'dough', 'draft', 'drain', 'drama', 'drawl', 'dream',
    'dress', 'drink', 'drive', 'drone', 'drown', 'drunk', 'dryer', 'dusky',
    'dwarf', 'eager', 'eagle', 'early', 'earth', 'eight', 'elbow', 'elite',
    'ember', 'empty', 'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error',
    'essay', 'evade', 'event', 'every', 'exact', 'exist', 'extra', 'fable',
    'faith', 'false', 'fancy', 'fatal', 'favor', 'feast', 'fence', 'ferry',
    'fetch', 'fever', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final',
    'first', 'fixed', 'flame', 'flask', 'fleet', 'flesh', 'flick', 'flood',
    'floor', 'flora', 'flour', 'fluid', 'flute', 'focus', 'foggy', 'forge',
    'forth', 'forum', 'found', 'frame', 'frank', 'fraud', 'fresh', 'front',
    'frost', 'froze', 'fully', 'fungi', 'funky', 'fuzzy', 'gauge', 'genre',
    'ghost', 'given', 'glass', 'gleam', 'globe', 'gloom', 'glove', 'grace',
    'grade', 'grain', 'grand', 'grant', 'grape', 'grasp', 'grass', 'grave',
    'great', 'greed', 'green', 'greet', 'grief', 'grill', 'groan', 'gross',
    'group', 'grove', 'grown', 'guess', 'guide', 'guild', 'guilt', 'gusto',
    'habit', 'happy', 'harsh', 'haven', 'heart', 'heavy', 'herbs', 'hinge',
    'honor', 'horse', 'hotel', 'hound', 'house', 'human', 'humor', 'hurry',
    'ideal', 'image', 'index', 'inner', 'input', 'irony', 'issue', 'ivory',
    'jewel', 'joint', 'joker', 'judge', 'juice', 'juicy', 'jumbo', 'karma',
    'kayak', 'knife', 'knock', 'known', 'label', 'lance', 'large', 'laser',
    'laugh', 'layer', 'learn', 'lease', 'ledge', 'legal', 'lemon', 'level',
    'light', 'liner', 'liver', 'lobby', 'local', 'lodge', 'logic', 'loose',
    'lover', 'loyal', 'lucky', 'lunar', 'lyric', 'magic', 'major', 'maker',
    'manor', 'maple', 'march', 'marry', 'match', 'media', 'mercy', 'merit',
    'metal', 'might', 'miser', 'mixed', 'model', 'money', 'month', 'moral',
    'motor', 'mount', 'mourn', 'mouth', 'muddy', 'music', 'naive', 'navel',
    'nerve', 'never', 'night', 'ninja', 'noble', 'noise', 'north', 'noted',
    'novel', 'nurse', 'ocean', 'offer', 'often', 'olive', 'onset', 'opera',
    'optic', 'orbit', 'order', 'other', 'outer', 'owner', 'oxide', 'ozone',
    'paint', 'panel', 'panic', 'paper', 'party', 'pasta', 'patch', 'pause',
    'peace', 'pearl', 'pedal', 'penny', 'perch', 'peril', 'phase', 'phone',
    'photo', 'piano', 'piece', 'pilot', 'pinch', 'pixel', 'pizza', 'place',
    'plain', 'plane', 'plant', 'plead', 'pluck', 'plumb', 'plume', 'plump',
    'point', 'polar', 'poppy', 'power', 'press', 'price', 'pride', 'prime',
    'print', 'prior', 'prize', 'probe', 'prose', 'prove', 'prune', 'pulse',
    'punch', 'pupil', 'quake', 'queen', 'query', 'quest', 'quick', 'quiet',
    'quota', 'quote', 'radar', 'radio', 'rainy', 'raise', 'rally', 'ranch',
    'range', 'rapid', 'ratio', 'reach', 'ready', 'realm', 'rebel', 'refer',
    'reign', 'relax', 'remix', 'repay', 'resin', 'revel', 'rider', 'ridge',
    'risky', 'rival', 'river', 'rivet', 'robot', 'rocky', 'roost', 'rough',
    'round', 'route', 'royal', 'rugby', 'ruler', 'rusty', 'saint', 'salad',
    'salon', 'salsa', 'sauce', 'savor', 'scale', 'scene', 'scope', 'score',
    'scout', 'screw', 'sense', 'serum', 'serve', 'seven', 'shade', 'shaft',
    'shake', 'shall', 'shame', 'shape', 'share', 'shark', 'sharp', 'shelf',
    'shell', 'shift', 'shine', 'shirt', 'shock', 'shore', 'short', 'shout',
    'shove', 'shown', 'sight', 'silly', 'since', 'sixth', 'sixty', 'skill',
    'slate', 'slave', 'sleep', 'slice', 'slide', 'slime', 'slope', 'smart',
    'smoke', 'snake', 'solar', 'solid', 'solve', 'sorry', 'south', 'space',
    'spark', 'spawn', 'speak', 'spear', 'speed', 'spend', 'spice', 'spine',
    'spite', 'split', 'spoke', 'spoon', 'sport', 'spray', 'squad', 'stack',
    'staff', 'stage', 'stain', 'stair', 'stake', 'stale', 'stall', 'stamp',
    'stand', 'stark', 'start', 'state', 'steam', 'steel', 'steep', 'steer',
    'stern', 'stick', 'stiff', 'still', 'stock', 'stomp', 'stone', 'stood',
    'storm', 'story', 'stout', 'stove', 'strap', 'straw', 'stray', 'strip',
    'stuck', 'study', 'stump', 'style', 'sugar', 'suite', 'sunny', 'super',
    'surge', 'swamp', 'sweet', 'swift', 'swirl', 'sword', 'sworn', 'syrup',
    'table', 'talon', 'taste', 'teach', 'tease', 'tempt', 'thank', 'their',
    'theme', 'there', 'thick', 'thing', 'think', 'third', 'thorn', 'those',
    'three', 'threw', 'throw', 'thumb', 'tiger', 'tight', 'timer', 'tired',
    'title', 'today', 'token', 'tooth', 'total', 'touch', 'tough', 'towel',
    'tower', 'toxic', 'track', 'trade', 'trail', 'train', 'trait', 'trash',
    'trend', 'trial', 'trick', 'tried', 'troop', 'trout', 'truck', 'truly',
    'trunk', 'trust', 'truth', 'tulip', 'tumor', 'turbo', 'twice', 'twist',
    'ultra', 'uncle', 'union', 'unity', 'until', 'upper', 'upset', 'urban',
    'usage', 'usual', 'utter', 'valid', 'valor', 'value', 'valve', 'vapor',
    'vault', 'verse', 'video', 'vigil', 'viola', 'viral', 'virus', 'visit',
    'visor', 'vista', 'vital', 'vivid', 'vocal', 'vodka', 'voice', 'voter',
    'wager', 'waste', 'watch', 'water', 'weave', 'wedge', 'weigh', 'weird',
    'whale', 'wheat', 'where', 'which', 'while', 'white', 'whole', 'whose',
    'witch', 'woman', 'world', 'worry', 'worse', 'worst', 'worth', 'would',
    'wreck', 'wrist', 'write', 'wrong', 'yacht', 'yearn', 'yield', 'young',
    'youth', 'zebra',
  ];

  const ROWS = 6;
  const COLS = 5;

  let answer = '';
  let board = [];       // [row][col] = letter string
  let revealed = [];    // [row][col] = state string or ''
  let currentRow = 0;
  let currentCol = 0;
  let gameOver = false;

  // ── Init ────────────────────────────────────────────────────────────────────

  function init() {
    answer = WORDS[Math.floor(Math.random() * WORDS.length)];
    board    = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    revealed = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    currentRow = 0;
    currentCol = 0;
    gameOver   = false;
    buildBoard();
    buildKeyboard();
    hideMessage();
  }

  // ── DOM builders ────────────────────────────────────────────────────────────

  function buildBoard() {
    const el = document.getElementById('board');
    el.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      const row = document.createElement('div');
      row.className = 'wordle-row';
      for (let c = 0; c < COLS; c++) {
        const tile = document.createElement('div');
        tile.className = 'wordle-tile';
        tile.id = `tile-${r}-${c}`;
        row.appendChild(tile);
      }
      el.appendChild(row);
    }
  }

  function buildKeyboard() {
    const layout = [
      ['q','w','e','r','t','y','u','i','o','p'],
      ['a','s','d','f','g','h','j','k','l'],
      ['Enter','z','x','c','v','b','n','m','⌫'],
    ];
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    layout.forEach(keys => {
      const row = document.createElement('div');
      row.className = 'wordle-kb-row';
      keys.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'wordle-key' + (k.length > 1 ? ' wide' : '');
        btn.textContent = k;
        btn.dataset.key = k;
        btn.addEventListener('click', () => handleKey(k));
        row.appendChild(btn);
      });
      kb.appendChild(row);
    });
  }

  // ── Input handling ──────────────────────────────────────────────────────────

  function handleKey(key) {
    if (gameOver) return;
    if (key === 'Enter') {
      submitGuess();
    } else if (key === '⌫' || key === 'Backspace') {
      deleteLetter();
    } else if (/^[a-zA-Z]$/.test(key)) {
      addLetter(key.toLowerCase());
    }
  }

  function addLetter(letter) {
    if (currentCol >= COLS) return;
    board[currentRow][currentCol] = letter;
    const tile = getTile(currentRow, currentCol);
    tile.textContent = letter;
    tile.classList.add('filled');
    animatePop(tile);
    currentCol++;
  }

  function deleteLetter() {
    if (currentCol <= 0) return;
    currentCol--;
    board[currentRow][currentCol] = '';
    const tile = getTile(currentRow, currentCol);
    tile.textContent = '';
    tile.classList.remove('filled');
  }

  // ── Guess evaluation ────────────────────────────────────────────────────────

  function submitGuess() {
    if (currentCol < COLS) {
      shakeRow(currentRow);
      showMessage('Not enough letters', 'warning');
      return;
    }

    const guess  = board[currentRow].join('');
    const states = evaluateGuess(guess);

    // Flip tiles one by one, applying color after each flip midpoint
    states.forEach((state, c) => {
      const tile = getTile(currentRow, c);
      const delay = c * 120;
      setTimeout(() => {
        tile.classList.add('flip');
        setTimeout(() => {
          tile.classList.add(state);
          revealed[currentRow][c] = state;
        }, 175); // ~midpoint of 350ms flip
      }, delay);
    });

    const totalDelay = (COLS - 1) * 120 + 350;

    setTimeout(() => {
      // Update keyboard after all flips done
      states.forEach((state, c) => updateKey(board[currentRow][c], state));

      if (guess === answer) {
        gameOver = true;
        const msgs = ['Genius!', 'Magnificent!', 'Impressive!', 'Splendid!', 'Great!', 'Phew!'];
        showMessage(msgs[currentRow] ?? 'Nice!', 'success');
        return;
      }

      currentRow++;
      currentCol = 0;

      if (currentRow >= ROWS) {
        gameOver = true;
        showMessage(`The word was ${answer.toUpperCase()}`, 'danger');
      }
    }, totalDelay);
  }

  function evaluateGuess(guess) {
    const result     = Array(COLS).fill('absent');
    const answerLeft = answer.split('');
    const guessLeft  = guess.split('');

    // First pass — correct positions
    for (let i = 0; i < COLS; i++) {
      if (guessLeft[i] === answerLeft[i]) {
        result[i]     = 'correct';
        answerLeft[i] = null;
        guessLeft[i]  = null;
      }
    }

    // Second pass — present but wrong position
    for (let i = 0; i < COLS; i++) {
      if (guessLeft[i] === null) continue;
      const idx = answerLeft.indexOf(guessLeft[i]);
      if (idx !== -1) {
        result[i]      = 'present';
        answerLeft[idx] = null;
      }
    }

    return result;
  }

  // ── Keyboard coloring ───────────────────────────────────────────────────────

  const STATE_PRIORITY = { correct: 3, present: 2, absent: 1 };

  function updateKey(letter, state) {
    const btn = document.querySelector(`#keyboard [data-key="${letter}"]`);
    if (!btn) return;
    const current = [...btn.classList].find(c => STATE_PRIORITY[c]);
    if (!current || STATE_PRIORITY[state] > STATE_PRIORITY[current]) {
      if (current) btn.classList.remove(current);
      btn.classList.add(state);
    }
  }

  // ── Animations ──────────────────────────────────────────────────────────────

  function animatePop(tile) {
    tile.classList.remove('pop');
    void tile.offsetWidth;
    tile.classList.add('pop');
  }

  function shakeRow(r) {
    for (let c = 0; c < COLS; c++) {
      const tile = getTile(r, c);
      tile.classList.remove('shake');
      void tile.offsetWidth;
      tile.classList.add('shake');
    }
  }

  // ── Message banner ──────────────────────────────────────────────────────────

  function showMessage(text, type = 'info') {
    const el = document.getElementById('message');
    el.className = `alert alert-${type} text-center py-2 mb-3`;
    el.textContent = text;
    el.hidden = false;
  }

  function hideMessage() {
    document.getElementById('message').hidden = true;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function getTile(r, c) {
    return document.getElementById(`tile-${r}-${c}`);
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────

  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    handleKey(e.key === 'Backspace' ? 'Backspace' : e.key);
  });

  document.getElementById('newGameBtn').addEventListener('click', init);

  init();
})();

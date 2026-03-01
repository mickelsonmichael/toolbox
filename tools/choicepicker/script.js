(function () {
  // ── Element refs ──────────────────────────────────────────────────────────
  const choiceInput = document.getElementById('choiceInput');
  const addBtn      = document.getElementById('addBtn');
  const choiceList  = document.getElementById('choiceList');
  const emptyHint   = document.getElementById('emptyHint');
  const clearBtn    = document.getElementById('clearBtn');
  const canvas      = document.getElementById('wheelCanvas');
  const ctx         = canvas.getContext('2d');
  const spinBtn     = document.getElementById('spinBtn');
  const resultCard  = document.getElementById('resultCard');
  const resultText  = document.getElementById('resultText');

  // ── State ─────────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'toolbox-choicepicker-choices';
  let choices      = loadChoices();
  let currentAngle = 0;
  let isSpinning   = false;

  // ── Slice colors ──────────────────────────────────────────────────────────
  const COLORS = [
    '#e84393', // hot pink
    '#3b82f6', // blue
    '#22c55e', // emerald
    '#f97316', // orange
    '#a855f7', // purple
    '#14b8a6', // teal
    '#ef4444', // red
    '#0891b2', // sky
    '#d946ef', // fuchsia
    '#f43f5e', // rose
    '#8b5cf6', // violet
    '#059669', // dark emerald
  ];

  // ── Persistence ───────────────────────────────────────────────────────────
  function loadChoices() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  function saveChoices() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(choices));
  }

  // ── Drawing ───────────────────────────────────────────────────────────────
  function sliceFontSize(n) {
    if (n <= 4)  return 15;
    if (n <= 8)  return 13;
    if (n <= 12) return 11;
    return 9;
  }

  function truncate(str, maxLen) {
    return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
  }

  function drawWheel() {
    const w  = canvas.width;
    const h  = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r  = Math.min(cx, cy) - 18;

    ctx.clearRect(0, 0, w, h);

    if (choices.length === 0) {
      // Empty placeholder
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(128,128,128,0.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(128,128,128,0.3)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(128,128,128,0.5)';
      ctx.font = '15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Add choices to spin!', cx, cy);
      return;
    }

    const n          = choices.length;
    const sliceAngle = (2 * Math.PI) / n;
    const fontSize   = sliceFontSize(n);
    // Max characters that fit comfortably at 62% radius
    const maxChars   = Math.max(6, Math.floor((r * 0.62 * 2 * Math.PI / n) / (fontSize * 0.55)));

    // Draw slices
    for (let i = 0; i < n; i++) {
      const start = currentAngle + i * sliceAngle;
      const end   = start + sliceAngle;
      const mid   = start + sliceAngle / 2;

      // Fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.fill();

      // Divider line
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label — drawn radially along the slice midpoint
      const textR = r * 0.62;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 4;
      ctx.fillText(truncate(choices[i], maxChars), textR, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer — fixed triangle pointing down at the top of the wheel
    const tipY  = cy - r + 2;
    const baseY = tipY - 22;
    ctx.beginPath();
    ctx.moveTo(cx,      tipY);
    ctx.lineTo(cx - 12, baseY);
    ctx.lineTo(cx + 12, baseY);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ── Spin ──────────────────────────────────────────────────────────────────
  function spin() {
    if (isSpinning || choices.length < 2) return;

    isSpinning        = true;
    spinBtn.disabled  = true;
    addBtn.disabled   = true;
    choiceInput.disabled = true;
    clearBtn.disabled = true;
    resultCard.hidden = true;

    const n          = choices.length;
    const sliceAngle = (2 * Math.PI) / n;

    // Pick winner, then derive the exact target angle so the winner lands
    // centered under the pointer (which sits at -PI/2 = top of wheel).
    const winnerIndex  = Math.floor(Math.random() * n);
    // Land anywhere in the middle 70% of the slice (0.15 … 0.85) so it's
    // clearly within the winner but not robotically dead-center every time.
    const sliceOffset  = 0.15 + Math.random() * 0.70;
    const baseAngle    = -Math.PI / 2 - (winnerIndex + sliceOffset) * sliceAngle;
    const minTarget   = currentAngle + 4 * 2 * Math.PI; // at least 4 full spins
    const k           = Math.ceil((minTarget - baseAngle) / (2 * Math.PI));
    const targetAngle = baseAngle + k * 2 * Math.PI;

    const startAngle = currentAngle;
    const delta      = targetAngle - startAngle;
    const duration   = 3500 + Math.random() * 1000; // 3.5 – 4.5 s
    let   startTime  = null;

    function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

    function step(ts) {
      if (!startTime) startTime = ts;
      const t = Math.min((ts - startTime) / duration, 1);
      currentAngle = startAngle + delta * easeOut(t);
      drawWheel();

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        currentAngle     = targetAngle;
        isSpinning       = false;
        spinBtn.disabled = choices.length < 2;
        addBtn.disabled  = false;
        choiceInput.disabled = false;
        clearBtn.disabled = false;
        drawWheel();
        showResult(choices[winnerIndex]);
      }
    }

    requestAnimationFrame(step);
  }

  function showResult(choice) {
    resultText.textContent = choice;
    resultCard.hidden = false;
    // Restart the CSS animation so it plays even on repeated spins
    resultCard.style.animation = 'none';
    void resultCard.offsetHeight;
    resultCard.style.animation = '';
  }

  // ── Choice list UI ────────────────────────────────────────────────────────
  function renderChoiceList() {
    Array.from(choiceList.querySelectorAll('.choice-item')).forEach(el => el.remove());

    choices.forEach((choice, i) => {
      const li = document.createElement('li');
      li.className = 'list-group-item choice-item';
      li.innerHTML = `
        <span class="choice-color-dot" style="background:${COLORS[i % COLORS.length]}"></span>
        <span class="choice-label" title="${escapeAttr(choice)}">${escapeHtml(choice)}</span>
        <button class="choice-remove-btn" aria-label="Remove ${escapeAttr(choice)}" data-index="${i}">
          <i class="fa-solid fa-xmark"></i>
        </button>`;
      li.querySelector('.choice-remove-btn').addEventListener('click', () => removeChoice(i));
      choiceList.appendChild(li);
    });

    emptyHint.hidden  = choices.length > 0;
    clearBtn.hidden   = choices.length === 0;
    spinBtn.disabled  = choices.length < 2 || isSpinning;
    drawWheel();
  }

  function addChoice() {
    const val = choiceInput.value.trim();
    if (!val) return;
    choices.push(val);
    choiceInput.value = '';
    saveChoices();
    renderChoiceList();
    resultCard.hidden = true;
  }

  function removeChoice(index) {
    choices.splice(index, 1);
    saveChoices();
    renderChoiceList();
    if (choices.length < 2) resultCard.hidden = true;
  }

  // ── Escape helpers ────────────────────────────────────────────────────────
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── Event listeners ───────────────────────────────────────────────────────
  addBtn.addEventListener('click', addChoice);

  choiceInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') addChoice();
  });

  clearBtn.addEventListener('click', () => {
    choices = [];
    saveChoices();
    renderChoiceList();
    resultCard.hidden = true;
  });

  spinBtn.addEventListener('click', spin);

  // ── Init ──────────────────────────────────────────────────────────────────
  renderChoiceList();
})();

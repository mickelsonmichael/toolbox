(function () {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'netquality-settings';
  const MAX_HISTORY = 200;
  const VISIBLE_POINTS = 60;
  const ROLL_WINDOW = 10;

  const DEFAULTS = {
    target: 'https://www.google.com/generate_204',
    intervalMs: 2000,
    timeoutMs: 5000,
  };

  // ── State ────────────────────────────────────────────────────────────────────
  // entry: { timestamp: Date, success: boolean, rtt: number|null, reason: string|null }
  let history = [];
  let settings = { ...DEFAULTS };
  let running = false;
  let timerId = null;
  let selectedIdx = null;

  // Stored canvas hit areas for click detection
  let dotPositions = []; // { x, y, histIdx }

  // ── Settings ─────────────────────────────────────────────────────────────────
  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (s) settings = { ...DEFAULTS, ...s };
    } catch { /* ignore */ }
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  // ── DOM references ────────────────────────────────────────────────────────────
  const canvas   = document.getElementById('netCanvas');
  const ctx      = canvas.getContext('2d');
  const startBtn = document.getElementById('startBtn');

  // ── Probe ─────────────────────────────────────────────────────────────────────
  async function probe() {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), settings.timeoutMs);
    const t0 = performance.now();
    const timestamp = new Date();
    const sep = settings.target.includes('?') ? '&' : '?';

    try {
      await fetch(`${settings.target}${sep}_t=${Date.now()}`, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(tid);
      const rtt = Math.round(performance.now() - t0);
      record({ timestamp, success: true, rtt, reason: null });
    } catch (e) {
      clearTimeout(tid);
      record({
        timestamp,
        success: false,
        rtt: null,
        reason: controller.signal.aborted ? 'Timeout' : 'Network error',
      });
    }
  }

  function record(entry) {
    history.push(entry);
    if (history.length > MAX_HISTORY) history.shift();
    updateStats();
    renderGraph();
  }

  // ── Stats helpers ─────────────────────────────────────────────────────────────
  function computeStats(data) {
    const total = data.length;
    const lost  = data.filter(p => !p.success).length;
    const rtts  = data.filter(p => p.success).map(p => p.rtt);
    return {
      total,
      lost,
      lossPercent : total > 0 ? (lost / total * 100) : null,
      avgRtt      : rtts.length ? Math.round(rtts.reduce((a, b) => a + b, 0) / rtts.length) : null,
      minRtt      : rtts.length ? Math.min(...rtts) : null,
      maxRtt      : rtts.length ? Math.max(...rtts) : null,
    };
  }

  function updateStats() {
    const s = computeStats(history);

    const statusEl = document.getElementById('statStatus');
    statusEl.textContent = running ? 'Running' : 'Stopped';
    statusEl.className   = 'fw-bold ' + (running ? 'text-success' : 'text-secondary');

    const lossEl = document.getElementById('statLoss');
    if (s.lossPercent === null) {
      lossEl.textContent = '—';
      lossEl.className   = 'fw-bold';
    } else {
      lossEl.textContent = s.lossPercent.toFixed(1) + '%';
      lossEl.className   = 'fw-bold ' + lossClass(s.lossPercent);
    }

    const rttEl = document.getElementById('statRtt');
    rttEl.textContent = s.avgRtt !== null ? s.avgRtt + ' ms' : '—';

    document.getElementById('statProbes').textContent = `${s.total} / ${s.lost}`;
    document.getElementById('targetUrl').textContent  = settings.target;
  }

  function lossClass(pct) {
    if (pct === 0)  return 'text-success';
    if (pct < 5)    return 'text-warning';
    return 'text-danger';
  }

  // ── Graph ─────────────────────────────────────────────────────────────────────
  function themeColors() {
    const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    return dark ? {
      grid     : 'rgba(255,255,255,0.07)',
      axis     : 'rgba(255,255,255,0.18)',
      text     : '#9ca3af',
      success  : '#22c55e',
      loss     : '#ef4444',
      line     : '#3b82f6',
      gradTop  : 'rgba(59,130,246,0.28)',
      gradBot  : 'rgba(59,130,246,0)',
      selRing  : 'rgba(251,191,36,0.35)',
      selStroke: '#fbbf24',
    } : {
      grid     : 'rgba(0,0,0,0.07)',
      axis     : 'rgba(0,0,0,0.18)',
      text     : '#6b7280',
      success  : '#16a34a',
      loss     : '#dc2626',
      line     : '#2563eb',
      gradTop  : 'rgba(37,99,235,0.18)',
      gradBot  : 'rgba(37,99,235,0)',
      selRing  : 'rgba(217,119,6,0.3)',
      selStroke: '#d97706',
    };
  }

  function resizeCanvas() {
    const wrapper = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight || 260;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderGraph();
  }

  function renderGraph() {
    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;
    const c   = themeColors();

    ctx.clearRect(0, 0, W, H);

    const PAD   = { top: 16, right: 20, bottom: 46, left: 58 };
    const gW    = W - PAD.left - PAD.right;
    const gH    = H - PAD.top  - PAD.bottom;

    const visible = history.slice(-VISIBLE_POINTS);

    // ── Empty state ──
    if (visible.length === 0) {
      ctx.fillStyle    = c.text;
      ctx.font         = '14px system-ui, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        running ? 'Collecting data…' : 'Press Start to begin monitoring',
        W / 2, H / 2
      );
      return;
    }

    // ── Y scale (RTT in ms) ──
    const successRtts = visible.filter(p => p.success).map(p => p.rtt);
    const rawMax      = successRtts.length ? Math.max(...successRtts) : 0;
    const yMax        = Math.max(rawMax * 1.25, 100);

    function xOf(i) {
      return PAD.left + (i / Math.max(visible.length - 1, 1)) * gW;
    }
    function yOf(rtt) {
      return PAD.top + gH * (1 - rtt / yMax);
    }
    const baseY = PAD.top + gH; // y=0ms

    // ── Grid lines ──
    ctx.strokeStyle = c.grid;
    ctx.lineWidth   = 1;
    const tickCount = 4;
    for (let i = 0; i <= tickCount; i++) {
      const val = (yMax / tickCount) * i;
      const y   = yOf(val);
      ctx.beginPath();
      ctx.moveTo(PAD.left, y);
      ctx.lineTo(PAD.left + gW, y);
      ctx.stroke();

      ctx.fillStyle    = c.text;
      ctx.font         = '11px system-ui, sans-serif';
      ctx.textAlign    = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(val) + 'ms', PAD.left - 6, y);
    }

    // ── X axis labels ──
    ctx.fillStyle    = c.text;
    ctx.font         = '11px system-ui, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    const xLabelCount = Math.min(6, visible.length);
    if (xLabelCount > 1) {
      for (let i = 0; i < xLabelCount; i++) {
        const idx   = Math.round(i * (visible.length - 1) / (xLabelCount - 1));
        const x     = xOf(idx);
        const label = visible[idx].timestamp.toLocaleTimeString([], {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        ctx.fillText(label, x, H - PAD.bottom + 6);
      }
    } else if (visible.length === 1) {
      const label = visible[0].timestamp.toLocaleTimeString([], {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      });
      ctx.fillText(label, xOf(0), H - PAD.bottom + 6);
    }

    // ── Axis lines ──
    ctx.strokeStyle = c.axis;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.left, PAD.top);
    ctx.lineTo(PAD.left, baseY);
    ctx.lineTo(PAD.left + gW, baseY);
    ctx.stroke();

    // ── RTT line + gradient fill (per continuous segment of successes) ──
    const segments = [];
    let current = [];
    visible.forEach((p, i) => {
      if (p.success) {
        current.push({ i, rtt: p.rtt });
      } else {
        if (current.length) { segments.push(current); current = []; }
      }
    });
    if (current.length) segments.push(current);

    segments.forEach(seg => {
      // Gradient fill
      const grad = ctx.createLinearGradient(0, PAD.top, 0, baseY);
      grad.addColorStop(0, c.gradTop);
      grad.addColorStop(1, c.gradBot);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(xOf(seg[0].i), baseY);
      seg.forEach(p => ctx.lineTo(xOf(p.i), yOf(p.rtt)));
      ctx.lineTo(xOf(seg[seg.length - 1].i), baseY);
      ctx.closePath();
      ctx.fill();

      // Line
      if (seg.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = c.line;
        ctx.lineWidth   = 2;
        ctx.lineJoin    = 'round';
        seg.forEach((p, j) => {
          if (j === 0) ctx.moveTo(xOf(p.i), yOf(p.rtt));
          else         ctx.lineTo(xOf(p.i), yOf(p.rtt));
        });
        ctx.stroke();
      }
    });

    // ── Dots and loss markers ──
    dotPositions = [];
    visible.forEach((p, i) => {
      const histIdx    = history.length - visible.length + i;
      const isSelected = histIdx === selectedIdx;
      const x          = xOf(i);

      if (p.success) {
        const y = yOf(p.rtt);

        // Selection ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.fillStyle = c.selRing;
          ctx.fill();
        }

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 5 : 4, 0, Math.PI * 2);
        ctx.fillStyle = c.success;
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = c.selStroke;
          ctx.lineWidth   = 2;
          ctx.stroke();
        }

        dotPositions.push({ x, y, histIdx });

      } else {
        // Loss marker: × near the baseline
        const y  = baseY - 6;
        const hs = isSelected ? 6 : 5;

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(x, y, 10, 0, Math.PI * 2);
          ctx.strokeStyle = c.selRing;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }

        ctx.strokeStyle = c.loss;
        ctx.lineWidth   = isSelected ? 2.5 : 2;
        ctx.beginPath();
        ctx.moveTo(x - hs, y - hs); ctx.lineTo(x + hs, y + hs);
        ctx.moveTo(x + hs, y - hs); ctx.lineTo(x - hs, y + hs);
        ctx.stroke();

        dotPositions.push({ x, y, histIdx });
      }
    });
  }

  // ── Canvas interaction ────────────────────────────────────────────────────────
  canvas.addEventListener('mousemove', e => {
    const r  = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const hit = dotPositions.find(d => Math.hypot(d.x - mx, d.y - my) < 14);
    canvas.style.cursor = hit ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', e => {
    const r  = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    let bestIdx  = null;
    let bestDist = 18;
    dotPositions.forEach(d => {
      const dist = Math.hypot(d.x - mx, d.y - my);
      if (dist < bestDist) { bestDist = dist; bestIdx = d.histIdx; }
    });

    if (bestIdx !== null) {
      selectedIdx = bestIdx;
      showDetail(history[bestIdx], bestIdx);
    } else {
      selectedIdx = null;
      document.getElementById('detailPanel').hidden = true;
    }
    renderGraph();
  });

  function showDetail(entry, idx) {
    const wStart = Math.max(0, idx - ROLL_WINDOW + 1);
    const slice  = history.slice(wStart, idx + 1);
    const ws     = computeStats(slice);

    const ts = entry.timestamp;
    document.getElementById('detailTime').textContent =
      ts.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' · ' +
      ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    document.getElementById('detailProbeNum').textContent = `Probe #${idx + 1}`;

    const resultEl = document.getElementById('detailResult');
    if (entry.success) {
      resultEl.innerHTML  = `<i class="fa-solid fa-circle-check me-1"></i>Success &mdash; ${entry.rtt} ms RTT`;
      resultEl.className  = 'fw-semibold text-success';
    } else {
      resultEl.innerHTML  = `<i class="fa-solid fa-circle-xmark me-1"></i>Packet lost &mdash; ${entry.reason}`;
      resultEl.className  = 'fw-semibold text-danger';
    }

    document.getElementById('detailSent').textContent = ws.total;

    const lostEl = document.getElementById('detailLost');
    lostEl.textContent = ws.lost;
    lostEl.className   = 'fw-semibold ' + (ws.lost > 0 ? 'text-danger' : 'text-success');

    const lossRateEl = document.getElementById('detailLossRate');
    lossRateEl.textContent = ws.lossPercent !== null ? ws.lossPercent.toFixed(1) + '%' : '—';
    lossRateEl.className   = 'fw-semibold ' + (ws.lossPercent !== null ? lossClass(ws.lossPercent) : '');

    document.getElementById('detailAvgRtt').textContent   =
      ws.avgRtt !== null ? ws.avgRtt + ' ms' : '—';
    document.getElementById('detailRttRange').textContent =
      ws.minRtt !== null ? `${ws.minRtt} – ${ws.maxRtt} ms` : '—';

    const targetEl = document.getElementById('detailTarget');
    targetEl.textContent = settings.target;
    targetEl.title       = settings.target;

    document.getElementById('detailPanel').hidden = false;
  }

  document.getElementById('closeDetail').addEventListener('click', () => {
    document.getElementById('detailPanel').hidden = true;
    selectedIdx = null;
    renderGraph();
  });

  // ── Monitor controls ──────────────────────────────────────────────────────────
  function startMonitor() {
    if (running) return;
    running = true;
    startBtn.innerHTML = '<i class="fa-solid fa-stop me-1"></i>Stop';
    startBtn.className = 'btn btn-danger btn-sm';
    updateStats();
    probe();
    timerId = setInterval(probe, settings.intervalMs);
  }

  function stopMonitor() {
    if (!running) return;
    running = false;
    clearInterval(timerId);
    timerId = null;
    startBtn.innerHTML = '<i class="fa-solid fa-play me-1"></i>Start';
    startBtn.className = 'btn btn-success btn-sm';
    updateStats();
    renderGraph();
  }

  startBtn.addEventListener('click', () => running ? stopMonitor() : startMonitor());

  document.getElementById('clearBtn').addEventListener('click', () => {
    history     = [];
    selectedIdx = null;
    document.getElementById('detailPanel').hidden = true;
    updateStats();
    renderGraph();
  });

  // ── Settings modal ────────────────────────────────────────────────────────────
  function populateForm(src) {
    const intSec = Math.round(src.intervalMs / 1000);
    const toSec  = Math.round(src.timeoutMs  / 1000);

    document.getElementById('settingTarget').value = src.target;
    document.getElementById('settingInterval').value         = intSec;
    document.getElementById('settingIntervalDisplay').textContent = intSec + 's';
    document.getElementById('settingTimeout').value          = toSec;
    document.getElementById('settingTimeoutDisplay').textContent  = toSec + 's';
  }

  document.getElementById('settingsModal').addEventListener('show.bs.modal', () => {
    populateForm(settings);
  });

  document.getElementById('settingInterval').addEventListener('input', function () {
    document.getElementById('settingIntervalDisplay').textContent = this.value + 's';
  });

  document.getElementById('settingTimeout').addEventListener('input', function () {
    document.getElementById('settingTimeoutDisplay').textContent = this.value + 's';
  });

  document.getElementById('resetDefaults').addEventListener('click', () => {
    populateForm(DEFAULTS);
  });

  document.getElementById('saveSettings').addEventListener('click', () => {
    const target = document.getElementById('settingTarget').value.trim();
    if (!target) { alert('Please enter a target URL.'); return; }

    try { new URL(target); } catch {
      alert('Invalid URL. Please enter a full URL including https://');
      return;
    }

    const newIntervalMs = +document.getElementById('settingInterval').value * 1000;
    const newTimeoutMs  = +document.getElementById('settingTimeout').value  * 1000;
    const intervalChanged = newIntervalMs !== settings.intervalMs;
    const targetChanged   = target !== settings.target;

    settings.target     = target;
    settings.intervalMs = newIntervalMs;
    settings.timeoutMs  = newTimeoutMs;
    saveSettings();
    updateStats();

    bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();

    // Restart timer if interval or target changed while running
    if (running && (intervalChanged || targetChanged)) {
      stopMonitor();
      startMonitor();
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────────
  loadSettings();
  updateStats();
  renderGraph();

  new ResizeObserver(resizeCanvas).observe(canvas.parentElement);
  resizeCanvas();

  // Redraw when theme changes
  new MutationObserver(renderGraph).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-bs-theme'],
  });
})();

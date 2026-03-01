// ── Element refs ──────────────────────────────────────────────────────────────
const langSelect           = document.getElementById('langSelect');
const useSpacesSwitch      = document.getElementById('useSpacesSwitch');
const spaceCount           = document.getElementById('spaceCount');
const spaceCountWrapper    = document.getElementById('spaceCountWrapper');
const trailingNewlineSwitch = document.getElementById('trailingNewlineSwitch');
const singleQuoteSwitch    = document.getElementById('singleQuoteSwitch');
const minifySwitch         = document.getElementById('minifySwitch');
const formatControls       = document.getElementById('formatControls');
const minifyToggleRow      = document.getElementById('minifyToggleRow');
const quoteToggleRow       = document.getElementById('quoteToggleRow');
const inputError           = document.getElementById('inputError');
const errorDetail          = document.getElementById('errorDetail');
const autoDetectBadge      = document.getElementById('autoDetectBadge');
const copyInputBtn         = document.getElementById('copyInputBtn');
const copyOutputBtn        = document.getElementById('copyOutputBtn');

// ── CodeMirror editors ────────────────────────────────────────────────────────

function cmTheme() {
  return document.documentElement.getAttribute('data-bs-theme') === 'dark'
    ? 'monokai' : 'default';
}

const inputEditor = CodeMirror(document.getElementById('inputEditor'), {
  lineNumbers: true,
  theme:       cmTheme(),
  mode:        { name: 'javascript', json: true },
  autofocus:   true,
});

const outputEditor = CodeMirror(document.getElementById('outputEditor'), {
  lineNumbers: true,
  theme:       cmTheme(),
  mode:        { name: 'javascript', json: true },
  readOnly:    true,
});

new MutationObserver(() => {
  const theme = cmTheme();
  inputEditor.setOption('theme', theme);
  outputEditor.setOption('theme', theme);
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-bs-theme'] });

// ── Helpers ───────────────────────────────────────────────────────────────────

const MODES = {
  json: { name: 'javascript', json: true },
  yaml: 'text/x-yaml',
};

const LANG_NAMES = { json: 'JSON', yaml: 'YAML' };

function setMode(lang) {
  const mode = MODES[lang] ?? 'text/plain';
  inputEditor.setOption('mode', mode);
  outputEditor.setOption('mode', mode);
}

function detectLanguage(text) {
  const t = text.trim();
  if (!t) return 'json';
  try { JSON.parse(t); return 'json'; } catch {}
  return 'yaml';
}

// ── Option visibility ─────────────────────────────────────────────────────────

function setVisible(el, show) {
  el.classList.toggle('d-none', !show);
  el.classList.toggle('d-flex', show);
}

function updateCommonOptions() {
  spaceCount.disabled = !useSpacesSwitch.checked;
}

function updateFormatSpecific(lang) {
  const isJSON = lang === 'json';
  const isYAML = lang === 'yaml';
  setVisible(minifyToggleRow, isJSON);
  setVisible(quoteToggleRow, isYAML);
  setVisible(formatControls, isJSON || isYAML);
}

function updateOptions() {
  updateCommonOptions();
  const lang = langSelect.value;
  if (lang === 'auto') {
    // Hide format-specific until language is detected
    updateFormatSpecific(null);
  } else {
    autoDetectBadge.hidden = true;
    setMode(lang);
    updateFormatSpecific(lang);
  }
}

// ── Formatting ────────────────────────────────────────────────────────────────

async function prettyFormat() {
  const value    = inputEditor.getValue();
  const useTabs  = !useSpacesSwitch.checked;
  const tabWidth = parseInt(spaceCount.value, 10) || 2;
  const addTrailingNewline = trailingNewlineSwitch.checked;
  const singleQ  = singleQuoteSwitch.checked;
  const selected = langSelect.value;

  if (!value.trim()) {
    outputEditor.setValue('');
    inputError.hidden = true;
    if (selected === 'auto') {
      autoDetectBadge.hidden = true;
      updateFormatSpecific(null);
    }
    return;
  }

  let lang = selected;

  if (selected === 'auto') {
    lang = detectLanguage(value);
    autoDetectBadge.textContent = `Auto detected: ${LANG_NAMES[lang]}`;
    autoDetectBadge.hidden      = false;
  }

  setMode(lang);
  updateFormatSpecific(lang);

  let formatted;
  if (lang === 'json' && minifySwitch.checked) {
    formatted = JSON.stringify(JSON.parse(value));
  } else if (lang === 'json') {
    formatted = await prettier.format(value, {
      parser:  'json',
      useTabs,
      tabWidth,
      plugins: [prettierPlugins.babel, prettierPlugins.estree],
    });
  } else if (lang === 'yaml') {
    formatted = await prettier.format(value, {
      parser:      'yaml',
      useTabs,
      tabWidth,
      singleQuote: singleQ,
      plugins:     [prettierPlugins.yaml],
    });
  }

  if (!addTrailingNewline) formatted = formatted.trimEnd();

  outputEditor.setValue(formatted);
  inputError.hidden = true;
}

// ── Error modal ───────────────────────────────────────────────────────────────

const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));

inputError.addEventListener('click', () => errorModal.show());

// ── Auto-format (debounced) ───────────────────────────────────────────────────

let debounceTimer;

function scheduleFormat() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      await prettyFormat();
    } catch (e) {
      errorDetail.textContent = e?.message ?? String(e);
      inputError.hidden = false;
    }
  }, 400);
}

// ── Event listeners ───────────────────────────────────────────────────────────

inputEditor.on('change', scheduleFormat);
langSelect.addEventListener('change',            () => { updateOptions(); scheduleFormat(); });
useSpacesSwitch.addEventListener('change',       () => { updateCommonOptions(); scheduleFormat(); });
spaceCount.addEventListener('input',             scheduleFormat);
trailingNewlineSwitch.addEventListener('change', scheduleFormat);
singleQuoteSwitch.addEventListener('change',     scheduleFormat);
minifySwitch.addEventListener('change',          scheduleFormat);

document.getElementById('clearBtn').addEventListener('click', () => {
  inputEditor.setValue('');
  outputEditor.setValue('');
  inputError.hidden      = true;
  autoDetectBadge.hidden = true;
  updateFormatSpecific(langSelect.value === 'auto' ? null : langSelect.value);
});

// ── Copy buttons ──────────────────────────────────────────────────────────────

function copyWithFeedback(btn, getText) {
  const text = getText();
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const icon = btn.querySelector('i');
    icon.className = 'fa-solid fa-check me-1';
    btn.disabled = true;
    setTimeout(() => {
      icon.className = 'fa-regular fa-copy me-1';
      btn.disabled = false;
    }, 1500);
  });
}

copyInputBtn.addEventListener('click', function () {
  copyWithFeedback(this, () => inputEditor.getValue());
});

copyOutputBtn.addEventListener('click', function () {
  copyWithFeedback(this, () => outputEditor.getValue());
});

// ── Init ──────────────────────────────────────────────────────────────────────

updateOptions();

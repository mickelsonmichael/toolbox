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
const autoDetectBadge      = document.getElementById('autoDetectBadge');

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
  json:   { name: 'javascript', json: true },
  yaml:   'text/x-yaml',
  python: 'text/x-python',
};

const LANG_NAMES = { json: 'JSON', yaml: 'YAML', python: 'Python' };

function setMode(lang) {
  const mode = MODES[lang] ?? 'text/plain';
  inputEditor.setOption('mode', mode);
  outputEditor.setOption('mode', mode);
}

function detectLanguage(text) {
  const t = text.trim();
  if (!t) return 'json';
  try { JSON.parse(t); return 'json'; } catch {}
  if (/^[ \t]*(def |class |import |from |async def |@\w+|print\(|if __name__)/m.test(t)) return 'python';
  return 'yaml';
}

// ── Option visibility ─────────────────────────────────────────────────────────

function updateCommonOptions() {
  spaceCount.disabled = !useSpacesSwitch.checked;
}

function updateFormatSpecific(lang) {
  const isJSON   = lang === 'json';
  const isPython = lang === 'python';
  minifyToggleRow.hidden = !isJSON;
  quoteToggleRow.hidden  = !isPython;
  formatControls.hidden  = !isJSON && !isPython;
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
    if (selected === 'auto') autoDetectBadge.hidden = true;
    return;
  }

  let lang = selected;

  if (selected === 'auto') {
    lang = detectLanguage(value);
    autoDetectBadge.textContent = `Auto detected: ${LANG_NAMES[lang]}`;
    autoDetectBadge.hidden      = false;
    updateFormatSpecific(lang);
  }

  setMode(lang);

  let formatted;
  if (lang === 'json' && minifySwitch.checked) {
    formatted = JSON.stringify(JSON.parse(value));
  } else if (lang === 'python') {
    formatted = await prettier.format(value, {
      parser:      'python',
      useTabs,
      tabWidth,
      singleQuote: singleQ,
      plugins:     [prettierPluginPython],
    });
  } else {
    formatted = await prettier.format(value, {
      parser:  lang,
      useTabs,
      tabWidth,
      plugins: [prettierPlugins.babel, prettierPlugins.estree, prettierPlugins.yaml],
    });
  }

  if (!addTrailingNewline) formatted = formatted.trimEnd();

  outputEditor.setValue(formatted);
  inputError.hidden = true;
}

// ── Auto-format (debounced) ───────────────────────────────────────────────────

let debounceTimer;

function scheduleFormat() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      await prettyFormat();
    } catch {
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

// ── Init ──────────────────────────────────────────────────────────────────────

updateOptions();

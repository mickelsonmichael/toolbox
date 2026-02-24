const input = document.getElementById('inputText');
const output = document.getElementById('outputText');
const formatSwitch = document.getElementById('formatSwitch');
const indentSwitch = document.getElementById('indentSwitch');
const formatHint = document.getElementById('formatHint');
const status = document.getElementById('status');

function setStatus(message, tone = 'success') {
  status.textContent = message;
  status.className = 'small mb-0';
  if (tone === 'error') {
    status.classList.add('text-danger');
    return;
  }
  if (tone === 'neutral') {
    status.classList.add('text-body-secondary');
    return;
  }
  status.classList.add('text-success');
}

function getParser() {
  return formatSwitch.checked ? 'yaml' : 'json';
}

function updateFormatHint() {
  formatHint.textContent = formatSwitch.checked ? 'YAML mode enabled.' : 'JSON mode enabled.';
}

async function prettyFormat() {
  const parser = getParser();
  const tabWidth = indentSwitch.checked ? 4 : 2;

  const formatted = await prettier.format(input.value, {
    parser,
    tabWidth,
    plugins: [prettierPlugins.babel, prettierPlugins.estree, prettierPlugins.yaml]
  });

  output.value = formatted;
}

formatSwitch.addEventListener('change', updateFormatHint);

document.getElementById('formatBtn').addEventListener('click', async () => {
  try {
    await prettyFormat();
    setStatus('Formatting completed.');
  } catch (error) {
    setStatus('Unable to format input. Check syntax and selected mode.', 'error');
  }
});

document.getElementById('clearBtn').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  setStatus('Cleared.', 'neutral');
});

updateFormatHint();
setStatus('Ready.', 'neutral');

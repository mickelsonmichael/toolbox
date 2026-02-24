const input = document.getElementById('inputText');
const output = document.getElementById('outputText');
const modeSwitch = document.getElementById('urlModeSwitch');
const operationSwitch = document.getElementById('operationSwitch');
const modeHint = document.getElementById('modeHint');
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

function updateModeHint() {
  if (modeSwitch.checked) {
    modeHint.textContent = 'Using full URL mode (`encodeURI` / `decodeURI`).';
    return;
  }
  modeHint.textContent = 'Using component mode (`encodeURIComponent` / `decodeURIComponent`).';
}

function getCodec() {
  if (modeSwitch.checked) {
    return { encode: encodeURI, decode: decodeURI };
  }
  return { encode: encodeURIComponent, decode: decodeURIComponent };
}

function processInput() {
  if (!input.value) {
    output.value = '';
    setStatus('Ready.', 'neutral');
    return;
  }

  if (operationSwitch.checked) {
    try {
      const { decode } = getCodec();
      output.value = decode(input.value);
      setStatus('Decoded successfully.');
    } catch (error) {
      setStatus('Invalid encoded input.', 'error');
    }
    return;
  }

  try {
    const { encode } = getCodec();
    output.value = encode(input.value);
    setStatus('Encoded successfully.');
  } catch (error) {
    setStatus('Unable to encode input.', 'error');
  }
}

modeSwitch.addEventListener('change', () => {
  updateModeHint();
  processInput();
});
operationSwitch.addEventListener('change', processInput);
input.addEventListener('input', processInput);

document.getElementById('swapBtn').addEventListener('click', () => {
  const temp = input.value;
  input.value = output.value;
  output.value = temp;
  processInput();
  setStatus('Input and output swapped. Auto-processed with current mode.');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  setStatus('Cleared.', 'neutral');
});

updateModeHint();
processInput();

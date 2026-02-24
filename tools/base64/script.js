const input = document.getElementById('inputText');
const output = document.getElementById('outputText');
const operationSwitch = document.getElementById('operationSwitch');
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

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (value) => value.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function processInput() {
  if (!input.value) {
    output.value = '';
    setStatus('Ready.', 'neutral');
    return;
  }

  if (operationSwitch.checked) {
    try {
      output.value = fromBase64(input.value.trim());
      setStatus('Base64 decoded successfully.');
    } catch (error) {
      setStatus('Invalid Base64 input.', 'error');
    }
    return;
  }

  try {
    output.value = toBase64(input.value);
    setStatus('Text encoded successfully.');
  } catch (error) {
    setStatus('Unable to encode input.', 'error');
  }
}

input.addEventListener('input', processInput);
operationSwitch.addEventListener('change', processInput);

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

processInput();

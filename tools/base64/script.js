const plaintextInput  = document.getElementById('plaintextInput');
const base64Input     = document.getElementById('base64Input');
const plaintextError  = document.getElementById('plaintextError');
const base64Error     = document.getElementById('base64Error');

function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach(v => binary += String.fromCharCode(v));
  return btoa(binary);
}

function fromBase64(b64) {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, v => v.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

let updating = false;

plaintextInput.addEventListener('input', () => {
  if (updating) return;
  updating = true;
  if (!plaintextInput.value) {
    base64Input.value    = '';
    plaintextError.hidden = true;
  } else {
    try {
      base64Input.value    = toBase64(plaintextInput.value);
      plaintextError.hidden = true;
    } catch {
      base64Input.value    = '';
      plaintextError.hidden = false;
    }
  }
  updating = false;
});

base64Input.addEventListener('input', () => {
  if (updating) return;
  updating = true;
  if (!base64Input.value) {
    plaintextInput.value = '';
    base64Error.hidden    = true;
  } else {
    try {
      plaintextInput.value = fromBase64(base64Input.value.trim());
      base64Error.hidden    = true;
    } catch {
      plaintextInput.value = '';
      base64Error.hidden    = false;
    }
  }
  updating = false;
});

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

document.getElementById('copyPlaintext').addEventListener('click', function () {
  copyWithFeedback(this, () => plaintextInput.value);
});

document.getElementById('copyBase64').addEventListener('click', function () {
  copyWithFeedback(this, () => base64Input.value);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  plaintextInput.value  = '';
  base64Input.value     = '';
  plaintextError.hidden = true;
  base64Error.hidden    = true;
});

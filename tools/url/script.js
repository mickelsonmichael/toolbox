const plainInput   = document.getElementById('plainInput');
const encodedInput = document.getElementById('encodedInput');
const plainError   = document.getElementById('plainError');
const encodedError = document.getElementById('encodedError');

let updating = false;

plainInput.addEventListener('input', () => {
  if (updating) return;
  updating = true;
  if (!plainInput.value) {
    encodedInput.value  = '';
    plainError.hidden   = true;
  } else {
    try {
      encodedInput.value  = encodeURIComponent(plainInput.value);
      plainError.hidden   = true;
    } catch {
      encodedInput.value  = '';
      plainError.hidden   = false;
    }
  }
  updating = false;
});

encodedInput.addEventListener('input', () => {
  if (updating) return;
  updating = true;
  if (!encodedInput.value) {
    plainInput.value   = '';
    encodedError.hidden = true;
  } else {
    try {
      plainInput.value   = decodeURIComponent(encodedInput.value);
      encodedError.hidden = true;
    } catch {
      plainInput.value   = '';
      encodedError.hidden = false;
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

document.getElementById('copyPlain').addEventListener('click', function () {
  copyWithFeedback(this, () => plainInput.value);
});

document.getElementById('copyEncoded').addEventListener('click', function () {
  copyWithFeedback(this, () => encodedInput.value);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  plainInput.value    = '';
  encodedInput.value  = '';
  plainError.hidden   = true;
  encodedError.hidden = true;
});

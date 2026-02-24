(function () {
  const key = 'toolbox-theme';
  const root = document.documentElement;
  const themeSwitch = document.getElementById('themeSwitch');

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    root.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    if (themeSwitch) {
      themeSwitch.checked = isDark;
    }
  }

  const current = root.getAttribute('data-bs-theme') || 'light';
  applyTheme(current);

  if (themeSwitch) {
    themeSwitch.addEventListener('change', () => {
      const next = themeSwitch.checked ? 'dark' : 'light';
      localStorage.setItem(key, next);
      applyTheme(next);
    });
  }
})();

(function () {
  class ToolboxLayout extends HTMLElement {
    connectedCallback() {
      if (this.dataset.initialized === 'true') {
        return;
      }

      const root = this.getAttribute('root') || '.';
      const homeHref = this.getAttribute('home') || `${root}/index.html`;
      const changelogHref = this.getAttribute('changelog') || `${root}/changelog.html`;
      const mainClass = this.getAttribute('main-class') || 'container py-4';
      const brand = this.getAttribute('brand') || "Mike's Toolbox";
      const showChangelog = this.getAttribute('show-changelog') !== 'false';

      const content = this.innerHTML;

      this.innerHTML = `
  <nav class="navbar border-bottom bg-body-tertiary">
    <div class="container">
      <a class="navbar-brand fw-semibold" href="${homeHref}"><i class="fa-solid fa-toolbox me-2"></i>${brand}</a>
      <div class="d-flex align-items-center gap-3">
        ${showChangelog ? `<a class="link-body-emphasis text-decoration-none small" href="${changelogHref}"><i class="fa-solid fa-clock-rotate-left me-1"></i>Changelog</a>` : ''}
        <div class="form-check form-switch theme-switch d-flex align-items-center gap-2">
          <i class="fa-solid fa-sun small text-body-secondary" aria-hidden="true"></i>
          <input class="form-check-input" type="checkbox" role="switch" id="themeSwitch" aria-label="Toggle dark mode">
        </div>
      </div>
    </div>
  </nav>

  <main class="${mainClass}">
    ${content}
  </main>
`;

      this.dataset.initialized = 'true';
    }
  }

  customElements.define('toolbox-layout', ToolboxLayout);
})();

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
          <i class="fa-solid fa-moon small text-body-secondary" aria-hidden="true"></i>
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

  class ToolPanelHeader extends HTMLElement {
    connectedCallback() {
      if (this.dataset.initialized === 'true') {
        return;
      }

      const title = this.getAttribute('title') || '';
      const icon = this.getAttribute('icon') || 'fa-solid fa-square';

      this.innerHTML = `
        <div class="tool-panel-header d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <div class="d-flex align-items-center gap-2">
            <i class="${icon}" aria-hidden="true"></i>
            <h2 class="h5 mb-0">${title}</h2>
          </div>
          <div class="tool-panel-actions ms-auto d-flex align-items-center gap-2">
            <slot name="actions"></slot>
          </div>
        </div>
      `;

      this.dataset.initialized = 'true';
    }
  }

  customElements.define('toolbox-layout', ToolboxLayout);
  customElements.define('tool-panel-header', ToolPanelHeader);
})();

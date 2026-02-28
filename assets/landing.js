(function () {
  const TOOLS = [
    {
      id: 'base64',
      name: 'Base64 Encoder/Decoder',
      icon: 'fa-solid fa-key',
      description: 'Encode and decode UTF-8 text to and from Base64.',
      href: './tools/base64/index.html',
      keywords: ['encode', 'decode', 'binary', 'ascii', 'btoa', 'atob', 'text', 'convert'],
      dateAdded: '2026-02-24',
    },
    {
      id: 'formatter',
      name: 'JSON/YAML Formatter',
      icon: 'fa-solid fa-wand-magic-sparkles',
      description: 'Pretty-format JSON or YAML without converting between formats.',
      href: './tools/formatter/index.html',
      keywords: ['json', 'yaml', 'format', 'pretty', 'prettify', 'lint', 'validate', 'indent', 'beautify'],
      dateAdded: '2026-02-24',
    },
    {
      id: 'url',
      name: 'URL Encoder/Decoder',
      icon: 'fa-solid fa-link',
      description: 'Encode or decode URLs and URL components.',
      href: './tools/url/index.html',
      keywords: ['url', 'encode', 'decode', 'percent', 'uri', 'component', 'query', 'escape'],
      dateAdded: '2026-02-24',
    },
  ];

  const FAV_KEY = 'toolbox-favorites';
  const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

  function getFavorites() {
    try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY)) || []); }
    catch { return new Set(); }
  }

  function saveFavorites(set) {
    localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
  }

  function isNew(dateStr) {
    return Date.now() - new Date(dateStr).getTime() < TWO_WEEKS_MS;
  }

  function matches(tool, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return tool.name.toLowerCase().includes(q)
      || tool.description.toLowerCase().includes(q)
      || tool.keywords.some(k => k.includes(q));
  }

  function buildCard(tool, favorites) {
    const isFav = favorites.has(tool.id);
    const newBadge = isNew(tool.dateAdded)
      ? '<span class="badge text-bg-success ms-2" style="font-size:0.6em;vertical-align:middle">New</span>'
      : '';
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="tool-card-wrapper h-100">
        <a class="tool-link" href="${tool.href}">
          <article class="card h-100 tool-card">
            <div class="card-body d-flex flex-column">
              <h2 class="h5"><i class="${tool.icon} me-2"></i>${tool.name}${newBadge}</h2>
              <p class="text-body-secondary mb-0">${tool.description}</p>
            </div>
          </article>
        </a>
        <button class="fav-btn${isFav ? ' fav-active' : ''}"
                aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
          <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>`;
    col.querySelector('.fav-btn').addEventListener('click', () => {
      const favs = getFavorites();
      favs.has(tool.id) ? favs.delete(tool.id) : favs.add(tool.id);
      saveFavorites(favs);
      render(document.getElementById('toolSearch').value.trim());
    });
    return col;
  }

  function render(query) {
    const favorites  = getFavorites();
    const favSection = document.getElementById('favoritesSection');
    const favGrid    = document.getElementById('favoritesGrid');
    const toolGrid   = document.getElementById('toolsGrid');
    const noResults  = document.getElementById('noResults');

    const matched   = TOOLS.filter(t => matches(t, query));
    const favItems  = matched.filter(t => favorites.has(t.id));
    const restItems = matched.filter(t => !favorites.has(t.id));

    favGrid.innerHTML  = '';
    toolGrid.innerHTML = '';
    favItems.forEach(t  => favGrid.appendChild(buildCard(t, favorites)));
    restItems.forEach(t => toolGrid.appendChild(buildCard(t, favorites)));

    favSection.hidden = favItems.length === 0;
    noResults.hidden  = matched.length > 0;
  }

  const searchInput = document.getElementById('toolSearch');
  render('');
  searchInput.addEventListener('input', () => render(searchInput.value.trim()));
})();

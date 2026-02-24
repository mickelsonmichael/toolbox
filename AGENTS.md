# Mike's Toolbox

Mike's Toolbox is a pure HTML/CSS/JavaScript utility site that runs fully in the browser with no backend.

## Project Rules
- Keep the app static and browser-only. No server required.
- Prefer CDN-hosted libraries when practical.
- Use reusable UI components through Bootstrap.
- Keep each tool in its own folder under `tools/` with `index.html`, `styles.css`, and `script.js`.
- Update `changelog.html` whenever behavior or UI changes.

## Current Tools
- Base64 encoder/decoder
- JSON/YAML formatter (pretty-format only)
- URL encoder/decoder

## File Map
- `index.html`: Landing page with links to all tools
- `tools/base64/index.html`: Base64 utility entrypoint
- `tools/formatter/index.html`: JSON/YAML formatter entrypoint
- `tools/url/index.html`: URL encoding utility entrypoint
- `changelog.html`: Project update history

## UX Expectations
- Mobile-friendly layout with Bootstrap grid/components.
- Use Bootstrap switches where they improve clarity.
- Clear success/error status text for each action.
- Include a dark mode switch in the top nav.
- Put tool options (mode toggles, indent switches, etc.) in a dedicated options card above input/output cards unless explicitly specified otherwise.
- Keep input and output in separate cards; avoid combining both areas in a single card.
- Place input clear actions in the input card header action area.
- Avoid adding build steps or package managers unless explicitly requested.

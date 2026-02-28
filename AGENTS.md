# Mike's Toolbox

Mike's Toolbox is a pure HTML/CSS/JavaScript utility site that runs fully in the browser with no backend.

## Project Rules

- Keep the app static and browser-only. No server required.
- Prefer CDN-hosted libraries when practical.
- Use reusable UI components through Halfmoon (Bootstrap v5-compatible drop-in; CDN: halfmoon@2.0.2).
- Keep each tool in its own folder under `tools/` with `index.html`, `styles.css`, and `script.js`.
- Update `changelog.html` whenever behavior or UI changes.
- When adding new tools, always append to the end of the list. Users will expect the tools to be in certain spots

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

- Mobile-friendly layout with Halfmoon grid/components.
- Pages should support both dark and light mode
- Never add build steps or packages. Only use browser compatible libraries and CDN packages

## Changelog Rules

- Group entries by date
- When adding a new tool, give a short, one or two sentence summary of the tool
- Never mention specific features like "clicking 'x' will close the modal". Keep it general like "Added a settings modal"
- Mention bugs fixed in vague terms. Like "Fixed modal not closing" instead of "clicking on the 'x' will now close the modal"

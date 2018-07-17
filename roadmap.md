# Roadmap

- Generate from page. (get and parse `http://service.maxymiser.net/cg/v5/`).
- Scaffold from git-repo
- Use Maxymiser Rest API.
  - Get Scripts
  - Save/Update Scripts.
- Use babel-macros to give more flexibity

## Done

- Extract from `http://service.maxymiser.net/cg/v5/`.
- Minify Scripts (Uglify/closure compiler)
- Build creates html of variants
- Add support for `HTML` in variants.
- Detect and cache API version.
- Detect and cache callback `mmRequestCallbacks[?]`.

## Rejected

- Be a Proxy rather than using one
  - Best to have it do only one thing, and not try to do too much.

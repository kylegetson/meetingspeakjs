# MeetingSpeak

MeetingSpeak is a browser-first JavaScript runtime DSL that maps polished business-jargon function names onto normal browser APIs. It is a real runtime, not a compiler, parser, or framework.

## What It Is

- A single `MeetingSpeak.js` file you can load with a script tag
- A thin wrapper layer over DOM selection, content updates, events, storage, async helpers, network calls, logging, and accessibility utilities
- A novelty project that is still practical enough to build a small static app

## Quick Start

```html
<div id="status"></div>
<button id="save">Save</button>

<script src="./MeetingSpeak.js"></script>
<script>
  BROADCAST('#status', 'Ready to align.')

  ACTION_ITEM('#save', () => {
    INSTITUTIONAL_KNOWLEDGE('draft', { savedAt: Date.now() })
    BROADCAST('#status', 'Draft has been socialized.')
  })
</script>
```

Namespace usage is also supported:

```js
MeetingSpeak.BROADCAST('#status', 'Ready to align.')
```

## Project Structure

- `MeetingSpeak.js`: canonical v1 browser runtime
- `demo/`: static product-style demo site built primarily with MeetingSpeak calls
- `docs/`: static documentation site with examples and API reference
- `spec.md`: product spec and source of truth for the v1 API

## Open The Demo And Docs

Open these files directly in a browser:

- `demo/index.html`
- `docs/index.html`

No build step or package install is required.

## Build A Dist Folder

If you want a distributable copy:

```bash
npm install
npm run build
```

That creates a flattened `dist/` with:

- `dist/MeetingSpeak.js` minified
- `dist/index.html`, `dist/docs.css`, and `dist/docs.js` for the docs site
- `dist/demo.html`, `dist/demo.css`, and `dist/demo.js` for the demo site

The docs and demo assets stay readable. Only the runtime is minified.

## Example Snippet

```js
SOURCE_OF_TRUTH('projects', [
  { name: 'StackLoop', owner: 'Alex' },
  { name: 'Recipe Digitizer', owner: 'Jordan' }
])

const names = PIPELINE(MeetingSpeak.state.projects, (project) => project.name)
ORG_UPDATE('#results', names.map((name) => `<li>${name}</li>`).join(''))
```

## Current Scope

MeetingSpeak currently ships as a browser runtime DSL. It does not yet include a standalone language, parser, or transpiler. The API surface is intentionally thin and browser-native so the joke stays readable and the behavior stays debuggable.

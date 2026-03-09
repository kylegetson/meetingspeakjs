# MeetingSpeak v2

MeetingSpeak is a browser-first JavaScript runtime DSL that maps corporate-jargon function names onto ordinary browser APIs. It is a real runtime, not a compiler, parser, framework, or standalone language.

v2 keeps the v1 joke intact and makes the runtime more useful for small static apps:

- rendering helpers like `SPIN_UP`, `REORG`, `RUN_IT_UP_THE_FLAGPOLE`, and `LOW_HANGING_FRUIT`
- subscription-aware state with `OPEN_LOOP`, `CLOSE_THE_LOOP`, `LISTEN_FOR_ALIGNMENT`, and `TRUE_UP`
- feedback and loading helpers like `WIN_THE_ROOM`, `TAKE_THE_L`, and `PULSE_CHECK`
- better event ergonomics with `HEAR_ME_OUT`, `TAKE_IT_OFFLINE`, `KEY_STAKEHOLDER`, and `HARD_STOP`
- small storage lifecycle and tone-mode additions without changing the browser-first setup

## What MeetingSpeak Is

- One script file: `MeetingSpeak.js`
- Thin wrappers over DOM, events, storage, timing, fetch, accessibility, and small UI helpers
- A novelty runtime that still stays inspectable and dependency-free

## Quick Start

```html
<ul id="queue"></ul>

<script src="./MeetingSpeak.js"></script>
<script>
  OPEN_LOOP('queue', ['Columbo', 'Party Down'])

  function renderQueue(items) {
    RUN_IT_UP_THE_FLAGPOLE('#queue', items, (title) => `<li>${title}</li>`)
  }

  LISTEN_FOR_ALIGNMENT('queue', renderQueue)
  renderQueue(SINGLE_SOURCE_OF_TRUTH('queue'))
</script>
```

Namespace usage is also supported:

```js
MeetingSpeak.RUN_IT_UP_THE_FLAGPOLE('#queue', items, renderItem)
```

## Project Structure

- `MeetingSpeak.js` - the runtime, including the full v1 API plus v2 additions
- `docs/` - static documentation site for v2
- `demo/` - static demo app showing state, rendering, feedback, and loading helpers
- `spec.md` - original v1 spec
- `v2.spec.md` - v2 source of truth

## Run Locally

Open these files directly in a browser:

- `docs/index.html`
- `demo/index.html`

No package install or build step is required for local use.

## Optional Dist Build

If you want a distributable copy:

```bash
npm install
npm run build
```

## Small Example

```js
OPEN_LOOP('watchlist', LOOK_IT_UP_NOW('watchlist') || [])

LISTEN_FOR_ALIGNMENT('watchlist', function (items) {
  RUN_IT_UP_THE_FLAGPOLE(
    '#watchlist',
    items,
    function (item) {
      return '<li>' + item.title + '</li>'
    },
    '<li>No titles yet.</li>'
  )

  HARD_COMMIT('watchlist', items)
})

ACTION_ITEM('#add-title', function () {
  TRUE_UP('watchlist', function (items) {
    return items.concat([{ title: CAPTURE_INPUT('#title-input') }])
  })

  WIN_THE_ROOM('#toast', 'Title added.')
})
```

## Scope

MeetingSpeak is still a browser runtime DSL. v2 does not turn it into a standalone language, a component system, a reactive framework, or a build-tool story.

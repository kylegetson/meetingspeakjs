# MeetingSpeak PRD / Spec

## 1. Overview

**MeetingSpeak** is a humorous browser-first JavaScript DSL and runtime that lets developers write UI logic using fake corporate meeting jargon while still running on normal web technology.

Instead of writing plain JavaScript like this:

```js
const el = document.querySelector('#status')
el.textContent = 'Saved'
```

A developer could write:

```js
BROADCAST('#status', 'Saved')
```

Or instead of:

```js
document.querySelector('#save').addEventListener('click', handler)
```

They could write:

```js
ACTION_ITEM('#save', handler)
```

The initial product is **not** a standalone compiled language. It is a **runtime library** (`MeetingSpeak.js`) that exposes a set of global functions or a namespace that map funny business terminology onto standard browser APIs.

Over time, the runtime can evolve into a true parser/transpiler where full MeetingSpeak source files compile into JavaScript.

---

## 2. Goals

### Primary goals

* Create a funny but functional browser runtime for DOM-heavy websites.
* Make it easy to build a public site where the source visibly uses MeetingSpeak terminology.
* Keep the implementation predictable and thin, so debugging remains possible.
* Make the project good enough to be shared publicly as a novelty that actually works.

### Secondary goals

* Establish a coherent vocabulary of business jargon terms.
* Support enough browser operations to build simple interactive sites.
* Create a foundation for a future parser/transpiler.

### Non-goals for v1

* Replacing all of JavaScript.
* Server-side execution.
* Type system.
* Full package/module ecosystem.
* Supporting every business phrase imaginable.
* Building a serious production framework.

---

## 3. Product vision

MeetingSpeak should feel like:

* Funny within 5 seconds.
* Understandable within 30 seconds.
* Actually usable within 5 minutes.

It should read like a mix of:

* status-meeting jargon,
* PM/ops/business slang,
* workplace cliches,
* and intentionally polished corporate nonsense.

The joke is that developers can write a real working page using phrases like:

* `ORG_UPDATE`
* `ACTION_ITEM`
* `CIRCLE_BACK_IN`
* `SOURCE_OF_TRUTH`
* `INSTITUTIONAL_KNOWLEDGE`
* `EXECUTIVE_SUMMARY`

Under the hood, everything should still map cleanly to browser APIs.

---

## 4. Target users

### Primary audience

* Developers who enjoy novelty languages and joke tools.
* Makers who want to create a funny public demo site.
* Front-end developers who appreciate DSLs and parody APIs.
* People who enjoy workplace satire.

### Secondary audience

* Tech Twitter / Hacker News / GitHub audiences.
* People who liked LOLCODE, Brainfuck, Whitespace, or unusual esolangs.
* Engineering leaders and PMs who will recognize the jargon immediately.

---

## 5. Product shape

MeetingSpeak v1 is a **single browser library** that can be included via script tag.

### Example inclusion

```html
<script src="MeetingSpeak.js"></script>
```

Then the page can use MeetingSpeak calls directly:

```html
<script>
  BROADCAST('#headline', 'We are aligned.')
  ALIGN_ON('#headline', 'green')
</script>
```

### Optional namespace form

```html
<script>
  MeetingSpeak.BROADCAST('#headline', 'We are aligned.')
</script>
```

The global version is funnier. The namespace version is safer.

---

## 6. Core design principles

### 6.1 Thin wrappers

Every MeetingSpeak function should be a thin wrapper around real browser APIs.

### 6.2 Predictable behavior

The humor should live in the names, not in bizarre semantics.

### 6.3 Browser-first

This should focus on DOM manipulation, user interaction, state, storage, and simple async behavior.

### 6.4 Funny but not unreadable

The vocabulary should be broad, but common actions should have one obvious canonical name.

### 6.5 Progressive ambition

Start as a DSL runtime. Add a parser later if the concept lands.

---

## 7. Functional scope

MeetingSpeak v1 should support these categories:

1. DOM selection
2. DOM content updates
3. DOM insertion/removal
4. CSS class and style changes
5. Forms and attributes
6. Events
7. State and variables
8. Collection helpers
9. Async/timers
10. Network requests
11. Storage/persistence
12. Logging/debugging
13. Basic accessibility helpers

---

## 8. Canonical v1 API

This is the recommended v1 surface. It is intentionally smaller than the full catalog.

### DOM selection

* `FIND_STAKEHOLDER(selector)`
* `FIND_STAKEHOLDERS(selector)`
* `IS_ON_THE_CALENDAR(selector)`
* `READ_THE_ROOM(selector)`
* `TAKE_THE_TEMPERATURE(selector)`

### DOM updates

* `ORG_UPDATE(selector, html)`
* `BROADCAST(selector, text)`
* `SOCIALIZE(selector, html)`
* `SUNSET(selector)`
* `ABOVE_THE_FOLD(selector)`

### Styling and class helpers

* `ALIGN_ON(selector, className)`
* `DEPRIORITIZE(selector, className)`
* `BRAND_REFRESH(selector, styles)`
* `TAKE_COVER(selector)`
* `VISIBILITY_INTO(selector)`

### Forms and attributes

* `CAPTURE_INPUT(selector)`
* `PREFILL(selector, value)`
* `GET_BUY_IN(selector)`
* `LOCK_IT(selector)`
* `UNBLOCK(selector)`
* `TAG_FOR_FOLLOWUP(selector, key, value)`
* `PULL_METADATA(selector, key)`

### Events

* `LISTEN_IN(selector, eventName, handler)`
* `ACTION_ITEM(selector, handler)`
* `FOLLOW_UP(selector, handler)`
* `ESCALATE(eventName, detail)`

### State and utility

* `SOURCE_OF_TRUTH(name, value)`
* `ALIGN(name, value)`
* `SYNERGIZE(a, b)`
* `RIGHTSIZE(value)`

### Collections

* `PIPELINE(items, fn)`
* `FILTER_FOR_FIT(items, fn)`
* `NET_NET(items, fn, initial)`
* `SORT_THE_DECK(items, fn)`

### Async / scheduling

* `CIRCLE_BACK_IN(ms, fn)`
* `RECURRING_SYNC(ms, fn)`
* `CANCEL_THE_SERIES(id)`
* `BY_CLOSE_OF_BUSINESS(fn)`
* `TIMEBOX(ms, promise)`

### Network

* `OUTREACH(url, options)`
* `PULL_NUMBERS(url)`
* `SUBMIT_DECK(url, data)`

### Storage

* `INSTITUTIONAL_KNOWLEDGE(key, value)`
* `LOOK_IT_UP(key)`
* `MEMORY_HOLE(key)`

### Logging

* `EXECUTIVE_SUMMARY(...args)`
* `FLAG_FOR_REVIEW(...args)`
* `FIVE_ALARM_FIRE(...args)`
* `SANITY_CHECK(value, msg)`

### Accessibility / UX

* `FOCUS_THE_ROOM(selector)`
* `INCLUSIVE_ALIGNMENT(selector, label)`
* `GIVE_IT_A_VOICE(selector, text)`

---

## 9. Behavioral spec by function

## 9.1 DOM selection

### `FIND_STAKEHOLDER(selector)`

Returns the first element matching the selector.

```js
const card = FIND_STAKEHOLDER('.project-card')
```

Equivalent JS:

```js
const card = document.querySelector('.project-card')
```

### `FIND_STAKEHOLDERS(selector)`

Returns all matching elements.

```js
const cards = FIND_STAKEHOLDERS('.project-card')
```

Equivalent JS:

```js
const cards = document.querySelectorAll('.project-card')
```

### `IS_ON_THE_CALENDAR(selector)`

Checks whether at least one matching element exists.

```js
if (IS_ON_THE_CALENDAR('#toast')) {
  BROADCAST('#toast', 'Still here.')
}
```

### `READ_THE_ROOM(selector)`

Returns `textContent`.

```js
const headline = READ_THE_ROOM('#headline')
```

### `TAKE_THE_TEMPERATURE(selector)`

Returns `value` for form controls, otherwise text content.

```js
const draft = TAKE_THE_TEMPERATURE('#editor')
```

---

## 9.2 DOM updates

### `ORG_UPDATE(selector, html)`

Sets `innerHTML`.

```js
ORG_UPDATE('#status', '<strong>Aligned.</strong>')
```

### `BROADCAST(selector, text)`

Sets text content.

```js
BROADCAST('#status', 'Aligned.')
```

### `SOCIALIZE(selector, html)`

Appends HTML.

```js
SOCIALIZE('#feed', '<li>New initiative landed.</li>')
```

### `SUNSET(selector)`

Removes matching element.

```js
SUNSET('#old-banner')
```

### `ABOVE_THE_FOLD(selector)`

Scrolls a matching element into view.

```js
ABOVE_THE_FOLD('#pricing')
```

---

## 9.3 Styling and classes

### `ALIGN_ON(selector, className)`

Adds a class.

```js
ALIGN_ON('#status', 'green')
```

### `DEPRIORITIZE(selector, className)`

Removes a class.

```js
DEPRIORITIZE('#status', 'error')
```

### `BRAND_REFRESH(selector, styles)`

Applies inline style values.

```js
BRAND_REFRESH('#hero', {
  background: 'linear-gradient(to right, #f5f5f5, #ffffff)',
  padding: '24px'
})
```

### `TAKE_COVER(selector)`

Hides an element.

```js
TAKE_COVER('#loading')
```

### `VISIBILITY_INTO(selector)`

Shows an element.

```js
VISIBILITY_INTO('#loading')
```

---

## 9.4 Forms and metadata

### `CAPTURE_INPUT(selector)`

Returns `.value`.

```js
const email = CAPTURE_INPUT('#email')
```

### `PREFILL(selector, value)`

Sets `.value`.

```js
PREFILL('#email', 'kyle@example.com')
```

### `GET_BUY_IN(selector)`

Returns checkbox/radio checked state.

```js
if (GET_BUY_IN('#terms')) {
  BROADCAST('#status', 'Buy-in received.')
}
```

### `LOCK_IT(selector)` and `UNBLOCK(selector)`

Disable or enable controls.

```js
LOCK_IT('#submit')
UNBLOCK('#submit')
```

### `TAG_FOR_FOLLOWUP(selector, key, value)`

Sets a data attribute.

```js
TAG_FOR_FOLLOWUP('#card-1', 'owner', 'Kyle')
```

### `PULL_METADATA(selector, key)`

Reads a data attribute.

```js
const owner = PULL_METADATA('#card-1', 'owner')
```

---

## 9.5 Events

### `LISTEN_IN(selector, eventName, handler)`

Generic event listener.

```js
LISTEN_IN('#search', 'input', (event) => {
  BROADCAST('#debug', event.target.value)
})
```

### `ACTION_ITEM(selector, handler)`

Click handler shorthand.

```js
ACTION_ITEM('#save', () => {
  BROADCAST('#toast', 'Draft saved.')
})
```

### `FOLLOW_UP(selector, handler)`

Input/change shorthand.

```js
FOLLOW_UP('#name', (event) => {
  BROADCAST('#preview', event.target.value)
})
```

### `ESCALATE(eventName, detail)`

Dispatches a custom event.

```js
ESCALATE('initiative:launched', { id: 7, owner: 'Kyle' })
```

---

## 9.6 State and data helpers

### `SOURCE_OF_TRUTH(name, value)`

Registers value in a central runtime store.

```js
SOURCE_OF_TRUTH('draft', '')
SOURCE_OF_TRUTH('projects', [])
```

### `ALIGN(name, value)`

Updates a named state value.

```js
ALIGN('draft', 'New homepage copy')
```

### `SYNERGIZE(a, b)`

Adds numbers or concatenates strings, depending on type.

```js
const total = SYNERGIZE(2, 3)
const msg = SYNERGIZE('Hello, ', 'team')
```

### `RIGHTSIZE(value)`

Normalizes/coerces incoming values.

```js
const safeCount = RIGHTSIZE('42')
```

---

## 9.7 Collection helpers

### `PIPELINE(items, fn)`

Maps items.

```js
const names = PIPELINE(users, (u) => u.name)
```

### `FILTER_FOR_FIT(items, fn)`

Filters items.

```js
const active = FILTER_FOR_FIT(users, (u) => u.active)
```

### `NET_NET(items, fn, initial)`

Reduces items.

```js
const total = NET_NET(prices, (sum, p) => sum + p, 0)
```

### `SORT_THE_DECK(items, fn)`

Sorts items.

```js
SORT_THE_DECK(projects, (a, b) => a.priority - b.priority)
```

---

## 9.8 Async / timing

### `CIRCLE_BACK_IN(ms, fn)`

Runs callback later.

```js
CIRCLE_BACK_IN(2000, () => {
  TAKE_COVER('#toast')
})
```

### `RECURRING_SYNC(ms, fn)`

Runs callback repeatedly.

```js
const syncId = RECURRING_SYNC(1000, () => {
  EXECUTIVE_SUMMARY('Still aligned.')
})
```

### `CANCEL_THE_SERIES(id)`

Clears timeout/interval.

```js
CANCEL_THE_SERIES(syncId)
```

### `BY_CLOSE_OF_BUSINESS(fn)`

Queues callback soon without blocking.

```js
BY_CLOSE_OF_BUSINESS(() => {
  BROADCAST('#status', 'Follow-up complete.')
})
```

### `TIMEBOX(ms, promise)`

Rejects if a promise takes too long.

```js
const data = await TIMEBOX(3000, PULL_NUMBERS('/api/projects'))
```

---

## 9.9 Network

### `OUTREACH(url, options)`

Thin wrapper around `fetch`.

```js
const response = await OUTREACH('/api/ping')
```

### `PULL_NUMBERS(url)`

Fetches JSON.

```js
const projects = await PULL_NUMBERS('/api/projects')
```

### `SUBMIT_DECK(url, data)`

Posts JSON.

```js
await SUBMIT_DECK('/api/contact', {
  name: CAPTURE_INPUT('#name'),
  message: CAPTURE_INPUT('#message')
})
```

---

## 9.10 Storage

### `INSTITUTIONAL_KNOWLEDGE(key, value)`

Writes serialized data to localStorage.

```js
INSTITUTIONAL_KNOWLEDGE('draft', {
  title: 'Homepage rewrite',
  body: 'Better headline here'
})
```

### `LOOK_IT_UP(key)`

Reads and parses localStorage.

```js
const draft = LOOK_IT_UP('draft')
```

### `MEMORY_HOLE(key)`

Deletes storage key.

```js
MEMORY_HOLE('draft')
```

---

## 9.11 Logging and debugging

### `EXECUTIVE_SUMMARY(...args)`

Console log.

```js
EXECUTIVE_SUMMARY('Loaded', LOOK_IT_UP('draft'))
```

### `FLAG_FOR_REVIEW(...args)`

Console warn.

```js
FLAG_FOR_REVIEW('Search returned no results')
```

### `FIVE_ALARM_FIRE(...args)`

Console error.

```js
FIVE_ALARM_FIRE('Submission failed')
```

### `SANITY_CHECK(value, msg)`

Asserts truthy condition.

```js
SANITY_CHECK(IS_ON_THE_CALENDAR('#app'), 'Missing app root')
```

---

## 9.12 Accessibility / UX helpers

### `FOCUS_THE_ROOM(selector)`

Moves focus to an element.

```js
FOCUS_THE_ROOM('#search')
```

### `INCLUSIVE_ALIGNMENT(selector, label)`

Sets ARIA label.

```js
INCLUSIVE_ALIGNMENT('#search', 'Search projects')
```

### `GIVE_IT_A_VOICE(selector, text)`

Updates an ARIA live region.

```js
GIVE_IT_A_VOICE('#sr-updates', 'Draft saved successfully')
```

---

## 10. Example implementation behavior

### Example runtime usage in a static page

```html
<div id="status"></div>
<button id="save">Save</button>
<script src="MeetingSpeak.js"></script>
<script>
  BROADCAST('#status', 'Ready to align.')

  ACTION_ITEM('#save', () => {
    BROADCAST('#status', 'Draft has been socialized.')
    ALIGN_ON('#status', 'green')
  })
</script>
```

### Example with namespace usage

```html
<script>
  MeetingSpeak.BROADCAST('#status', 'Ready to align.')
</script>
```

---

## 11. End-to-end examples

## 11.1 Example: save a draft to localStorage

```html
<textarea id="editor"></textarea>
<button id="save">Save Draft</button>
<div id="toast"></div>
<script src="MeetingSpeak.js"></script>
<script>
  ACTION_ITEM('#save', () => {
    const draft = CAPTURE_INPUT('#editor')
    INSTITUTIONAL_KNOWLEDGE('homepage-draft', draft)
    BROADCAST('#toast', 'Draft has been socialized.')
    VISIBILITY_INTO('#toast')
    CIRCLE_BACK_IN(1500, () => TAKE_COVER('#toast'))
  })
</script>
```

Equivalent plain JS:

```js
document.querySelector('#save').addEventListener('click', () => {
  const draft = document.querySelector('#editor').value
  localStorage.setItem('homepage-draft', JSON.stringify(draft))
  document.querySelector('#toast').textContent = 'Draft has been socialized.'
  document.querySelector('#toast').style.display = ''
  setTimeout(() => {
    document.querySelector('#toast').style.display = 'none'
  }, 1500)
})
```

---

## 11.2 Example: live preview form

```html
<input id="headline-input" />
<h1 id="headline-preview"></h1>
<script src="MeetingSpeak.js"></script>
<script>
  FOLLOW_UP('#headline-input', (event) => {
    BROADCAST('#headline-preview', event.target.value)
  })
</script>
```

---

## 11.3 Example: render a project grid

```html
<div id="projects"></div>
<script src="MeetingSpeak.js"></script>
<script>
  const projects = [
    { name: 'StackLoop', category: 'Mac App' },
    { name: 'KnowThatName', category: 'Game' },
    { name: 'Recipe Digitizer', category: 'Utility' }
  ]

  const cards = PIPELINE(projects, (project) => `
    <article class="project-card">
      <h3>${project.name}</h3>
      <p>${project.category}</p>
    </article>
  `)

  ORG_UPDATE('#projects', cards.join(''))
</script>
```

---

## 11.4 Example: fetch and display metrics

```html
<div id="metrics">Loading...</div>
<script src="MeetingSpeak.js"></script>
<script>
  async function loadMetrics() {
    try {
      const data = await PULL_NUMBERS('/api/metrics')
      BROADCAST('#metrics', `Users: ${data.users}`)
    } catch (error) {
      FIVE_ALARM_FIRE(error)
      BROADCAST('#metrics', 'We are blocked pending API alignment.')
    }
  }

  loadMetrics()
</script>
```

---

## 11.5 Example: search filter

```html
<input id="search" placeholder="Search initiatives" />
<ul id="results"></ul>
<script src="MeetingSpeak.js"></script>
<script>
  const initiatives = ['StackLoop', 'Word Tweaker', 'Recipe Digitizer', 'KnowThatName']

  function render(items) {
    ORG_UPDATE('#results', items.map((item) => `<li>${item}</li>`).join(''))
  }

  render(initiatives)

  FOLLOW_UP('#search', (event) => {
    const q = event.target.value.toLowerCase()
    const filtered = FILTER_FOR_FIT(initiatives, (item) =>
      item.toLowerCase().includes(q)
    )
    render(filtered)
  })
</script>
```

---

## 11.6 Example: custom event flow

```html
<button id="launch">Launch</button>
<div id="status"></div>
<script src="MeetingSpeak.js"></script>
<script>
  document.addEventListener('initiative:launched', (event) => {
    BROADCAST('#status', `Initiative ${event.detail.id} is live.`)
  })

  ACTION_ITEM('#launch', () => {
    ESCALATE('initiative:launched', { id: 42 })
  })
</script>
```

---

## 11.7 Example: status banner with classes

```html
<div id="banner" class="banner hidden"></div>
<button id="show-success">Success</button>
<button id="show-error">Error</button>
<script src="MeetingSpeak.js"></script>
<script>
  ACTION_ITEM('#show-success', () => {
    BROADCAST('#banner', 'All stakeholders are aligned.')
    DEPRIORITIZE('#banner', 'hidden')
    DEPRIORITIZE('#banner', 'error')
    ALIGN_ON('#banner', 'success')
  })

  ACTION_ITEM('#show-error', () => {
    BROADCAST('#banner', 'Blocked pending cross-functional buy-in.')
    DEPRIORITIZE('#banner', 'hidden')
    DEPRIORITIZE('#banner', 'success')
    ALIGN_ON('#banner', 'error')
  })
</script>
```

---

## 11.8 Example: auto-save every 5 seconds

```html
<textarea id="notes"></textarea>
<div id="save-status"></div>
<script src="MeetingSpeak.js"></script>
<script>
  RECURRING_SYNC(5000, () => {
    INSTITUTIONAL_KNOWLEDGE('notes', CAPTURE_INPUT('#notes'))
    BROADCAST('#save-status', 'Institutional knowledge updated.')
  })
</script>
```

---

## 11.9 Example: delayed loading state

```html
<div id="spinner">Loading...</div>
<div id="content"></div>
<script src="MeetingSpeak.js"></script>
<script>
  async function init() {
    TAKE_COVER('#content')
    VISIBILITY_INTO('#spinner')

    const data = await PULL_NUMBERS('/api/content')

    ORG_UPDATE('#content', `<p>${data.message}</p>`)
    TAKE_COVER('#spinner')
    VISIBILITY_INTO('#content')
  }

  init()
</script>
```

---

## 11.10 Example: keyboard-focused search box

```html
<input id="search-box" />
<script src="MeetingSpeak.js"></script>
<script>
  FOCUS_THE_ROOM('#search-box')
  INCLUSIVE_ALIGNMENT('#search-box', 'Search initiatives')
</script>
```

---

## 12. Technical architecture

## 12.1 Runtime structure

Proposed internal structure:

* `MeetingSpeak.state` — runtime state store
* `MeetingSpeak.dom` — DOM helpers
* `MeetingSpeak.events` — event wrappers
* `MeetingSpeak.net` — fetch wrappers
* `MeetingSpeak.storage` — local/session storage wrappers
* `MeetingSpeak.debug` — logging/assert helpers
* `MeetingSpeak.a11y` — focus/ARIA helpers

Public API can be exposed both as globals and under `window.MeetingSpeak`.

---

## 12.2 State model

Simple object-backed store for v1:

```js
const state = {}

function SOURCE_OF_TRUTH(name, value) {
  state[name] = value
  return value
}

function ALIGN(name, value) {
  state[name] = value
  return value
}
```

This does not need reactivity in v1.

---

## 12.3 DOM strategy

All DOM helpers should:

* accept CSS selector strings,
* fail loudly in dev mode when selector is missing,
* optionally no-op in soft mode,
* support first-match semantics by default.

A small internal helper is recommended:

```js
function getEl(selector) {
  const el = document.querySelector(selector)
  if (!el) throw new Error(`Missing stakeholder: ${selector}`)
  return el
}
```

---

## 12.4 Error philosophy

MeetingSpeak should be fun, but hidden failures would make it useless.

Recommended behavior:

* throw useful developer errors,
* log funny but readable messages,
* do not silently ignore core failures.

Example:

```js
throw new Error(`Blocked pending stakeholder discovery: ${selector}`)
```

---

## 13. API design guidelines

### 13.1 Naming rules

* Use uppercase with underscores.
* Prefer 1 canonical phrase per function.
* Keep common operations short.
* Reserve absurd jargon for optional aliases.

### 13.2 Argument rules

* Selector-first for DOM operations.
* Data-second for updates.
* Callback-last for handlers.

### 13.3 Return value rules

* Getter-like functions return useful data.
* Setter-like functions return the affected element or assigned value where practical.

---

## 14. Example code style

Preferred style:

```js
ACTION_ITEM('#submit', async () => {
  LOCK_IT('#submit')
  BROADCAST('#status', 'Submitting for review...')

  try {
    await SUBMIT_DECK('/api/submit', {
      draft: CAPTURE_INPUT('#draft')
    })
    BROADCAST('#status', 'Submission complete.')
  } catch (error) {
    FIVE_ALARM_FIRE(error)
    BROADCAST('#status', 'Blocked pending external alignment.')
  } finally {
    UNBLOCK('#submit')
  }
})
```

---

## 15. Nice-to-have v1.5 / v2 additions

### v1.5

* Better custom event helpers
* Small template helper
* Simple animation helpers
* Session storage wrappers
* Better debug modes

### v2

* Parser for MeetingSpeak source files
* Transpiler from `.meeting` to JS
* Real control-flow syntax
* Package examples and starter templates
* Playground site with live editor

Example future syntax:

```meetingspeak
BROADCAST '#status' 'We are aligned.'
ACTION_ITEM '#save' => {
  INSTITUTIONAL_KNOWLEDGE 'draft' CAPTURE_INPUT '#editor'
}
```

---

## 16. Risks

### Risk: the joke gets old fast

Mitigation: keep the runtime useful, not just funny.

### Risk: too many aliases make it unreadable

Mitigation: define canonical names and document them clearly.

### Risk: weird names make debugging painful

Mitigation: keep wrappers thin and errors direct.

### Risk: scope explodes into fake-framework territory

Mitigation: stay focused on browser utility primitives.

---

## 17. Success criteria

The project is successful if:

* a developer can drop in one script tag and use it immediately,
* a demo site can be built entirely in MeetingSpeak runtime calls,
* readers instantly get the joke,
* the API still feels coherent enough to actually use,
* the repo is entertaining enough to share publicly.

---

## 18. MVP deliverables

### Required

* `MeetingSpeak.js`
* README with usage examples
* Demo HTML page
* Basic docs for the canonical API
* At least 10 working examples

### Nice to have

* Minified build
* ESM build
* Playground page
* Themed docs with fake corporate language

---

## 19. Recommended first build order

1. Implement DOM getters/setters.
2. Implement event wrappers.
3. Implement storage and logging.
4. Implement async/network helpers.
5. Build a demo site.
6. Write README using the same voice.
7. Only then consider parser work.

---

## 20. Final recommendation

Do **not** start by building a real programming language. Start by building a **browser runtime joke DSL** that is clean, stable, and fun to demo.

That gets you:

* fast progress,
* working examples,
* a public site people can inspect,
* and a foundation for a real language later.

The runtime is the smart version of the idea. The parser can come after the joke proves itself.

---

## 21. Appendix: quick example gallery

### Example: simple text update

```js
BROADCAST('#title', 'Quarterly alignment achieved.')
```

### Example: html replacement

```js
ORG_UPDATE('#app', '<section><h1>MeetingSpeak Demo</h1></section>')
```

### Example: click handler

```js
ACTION_ITEM('#cta', () => {
  BROADCAST('#status', 'Stakeholder engagement increased.')
})
```

### Example: append feed items

```js
SOCIALIZE('#feed', '<li>Net-new initiative</li>')
```

### Example: add class

```js
ALIGN_ON('#card', 'elevated')
```

### Example: remove class

```js
DEPRIORITIZE('#card', 'muted')
```

### Example: style tweak

```js
BRAND_REFRESH('#hero', {
  borderRadius: '20px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.12)'
})
```

### Example: custom data tag

```js
TAG_FOR_FOLLOWUP('#item-7', 'priority', 'high')
```

### Example: local persistence

```js
INSTITUTIONAL_KNOWLEDGE('theme', 'light')
```

### Example: read persistence

```js
const theme = LOOK_IT_UP('theme')
```

### Example: warn

```js
FLAG_FOR_REVIEW('No search results for current query')
```

### Example: timeout

```js
CIRCLE_BACK_IN(1000, () => BROADCAST('#status', 'Following up now.'))
```

### Example: fetch

```js
const metrics = await PULL_NUMBERS('/api/metrics')
```

### Example: reducer

```js
const total = NET_NET([4, 8, 15], (sum, n) => sum + n, 0)
```

### Example: focus input

```js
FOCUS_THE_ROOM('#search')
```

### Example: full mini app

```html
<input id="task-input" placeholder="Net-new action item" />
<button id="add-task">Add</button>
<ul id="task-list"></ul>
<script src="MeetingSpeak.js"></script>
<script>
  const tasks = LOOK_IT_UP('tasks') || []

  function render() {
    ORG_UPDATE(
      '#task-list',
      tasks.map((task) => `<li>${task}</li>`).join('')
    )
  }

  render()

  ACTION_ITEM('#add-task', () => {
    const task = CAPTURE_INPUT('#task-input')
    if (!task) {
      FLAG_FOR_REVIEW('Cannot align on an empty action item')
      return
    }

    tasks.push(task)
    INSTITUTIONAL_KNOWLEDGE('tasks', tasks)
    PREFILL('#task-input', '')
    render()
  })
</script>
```


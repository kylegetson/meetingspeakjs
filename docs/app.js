var STORAGE_KEYS = {
  agenda: 'meetingspeak-docs-agenda-v2',
  apiSearch: 'meetingspeak-docs-api-search-v2',
  codeMode: 'meetingspeak-docs-code-mode-v2',
  tone: 'meetingspeak-docs-tone-v2'
};

var SECTION_IDS = [
  'overview',
  'whats-new',
  'quick-start',
  'live-examples',
  'comparison',
  'api-reference',
  'compatibility',
  'tone',
  'boundaries'
];

var DEFAULT_AGENDA = [
  { id: 'agenda-1', title: 'Document rendering helpers' },
  { id: 'agenda-2', title: 'Show state subscriptions in action' }
];

var API_GROUPS = [
  {
    id: 'dom-selection',
    title: 'DOM selection',
    keywords: 'dom selection find text value v1',
    version: 'v1',
    items: [
      '<code>FIND_STAKEHOLDER</code>, <code>FIND_STAKEHOLDERS</code>, <code>IS_ON_THE_CALENDAR</code>',
      '<code>READ_THE_ROOM</code>, <code>TAKE_THE_TEMPERATURE</code>'
    ]
  },
  {
    id: 'rendering',
    title: 'Rendering',
    keywords: 'rendering templating list conditional v2',
    version: 'v2',
    items: [
      '<code>SPIN_UP(tagName, attributes?)</code> creates elements.',
      '<code>ONBOARD(selector, node)</code> appends existing nodes.',
      '<code>REORG(selector, html)</code> replaces children.',
      '<code>TALK_TRACK(template, data)</code> interpolates strings.',
      '<code>RUN_IT_UP_THE_FLAGPOLE</code> and <code>LOW_HANGING_FRUIT</code> handle list and conditional rendering.'
    ]
  },
  {
    id: 'state',
    title: 'State',
    keywords: 'state subscriptions store align v1 v2',
    version: 'v2',
    items: [
      '<code>SOURCE_OF_TRUTH</code> and <code>ALIGN</code> still perform direct state assignment.',
      '<code>OPEN_LOOP</code>, <code>CLOSE_THE_LOOP</code>, <code>SINGLE_SOURCE_OF_TRUTH</code>, <code>LISTEN_FOR_ALIGNMENT</code>, and <code>TRUE_UP</code> add subscription-aware updates.'
    ]
  },
  {
    id: 'styles',
    title: 'Styles and visibility',
    keywords: 'style class hide show animation polish v1 v2',
    version: 'v2',
    items: [
      '<code>ALIGN_ON</code>, <code>DEPRIORITIZE</code>, <code>BRAND_REFRESH</code>, <code>TAKE_COVER</code>, <code>VISIBILITY_INTO</code>',
      '<code>PUT_A_PIN_IN_IT</code>, <code>UNPIN_IT</code>, <code>WAR_ROOM_MODE</code>, <code>QUIET_QUITTING</code>, <code>MAKE_IT_POP</code>, <code>HOLD_THE_APPLAUSE</code>'
    ]
  },
  {
    id: 'events',
    title: 'Events and interaction',
    keywords: 'events click submit keyboard focus custom v1 v2',
    version: 'v2',
    items: [
      '<code>LISTEN_IN</code>, <code>ACTION_ITEM</code>, <code>FOLLOW_UP</code>, <code>ESCALATE</code>',
      '<code>HEAR_ME_OUT</code>, <code>TAKE_IT_OFFLINE</code>, <code>DOUBLE_CLICK_ON</code>, <code>KEY_STAKEHOLDER</code>, <code>OPEN_THE_FLOOR</code>, <code>HARD_STOP</code>'
    ]
  },
  {
    id: 'async-network',
    title: 'Async and network',
    keywords: 'async network loading promise fetch timing v1 v2',
    version: 'v2',
    items: [
      '<code>CIRCLE_BACK_IN</code>, <code>RECURRING_SYNC</code>, <code>BY_CLOSE_OF_BUSINESS</code>, <code>TIMEBOX</code>',
      '<code>OUTREACH</code>, <code>PULL_NUMBERS</code>, <code>SUBMIT_DECK</code>',
      '<code>PULSE_CHECK</code>, <code>AIR_COVER</code>, and optional <code>BACKCHANNEL</code>'
    ]
  },
  {
    id: 'storage',
    title: 'Storage',
    keywords: 'storage persistence ttl session local metadata v1 v2',
    version: 'v2',
    items: [
      '<code>INSTITUTIONAL_KNOWLEDGE</code>, <code>LOOK_IT_UP</code>, <code>MEMORY_HOLE</code>',
      '<code>SESSION_CONTEXT</code>, <code>SOFT_COMMIT</code>, <code>HARD_COMMIT</code>, <code>DATA_RETENTION_POLICY</code>, <code>LOOK_IT_UP_NOW</code>'
    ]
  },
  {
    id: 'debug',
    title: 'Logging, tone, and diagnostics',
    keywords: 'logging tone errors diagnostics comedy v1 v2',
    version: 'v2',
    items: [
      '<code>EXECUTIVE_SUMMARY</code>, <code>FLAG_FOR_REVIEW</code>, <code>FIVE_ALARM_FIRE</code>, <code>SANITY_CHECK</code>',
      '<code>POSTMORTEM</code>, <code>THIS_COULD_HAVE_BEEN_AN_EMAIL</code>, <code>FIVE_MINUTE_BREAKTHROUGH</code>, <code>SET_THE_TONE</code>'
    ]
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    keywords: 'accessibility focus aria live region v1',
    version: 'v1',
    items: [
      '<code>FOCUS_THE_ROOM</code>, <code>INCLUSIVE_ALIGNMENT</code>, and <code>GIVE_IT_A_VOICE</code> remain available unchanged.'
    ]
  }
];

var CODE_EXAMPLES = {
  render: {
    caption: 'Showing the rendering helper example.',
    meetingspeak: [
      "RUN_IT_UP_THE_FLAGPOLE('#results', items, (item) => `",
      "  <li>${item.title}</li>",
      "`, '<li>No results yet.</li>')"
    ].join('\n'),
    javascript: [
      "const html = items.length",
      "  ? items.map((item) => `<li>${item.title}</li>`).join('')",
      "  : '<li>No results yet.</li>'",
      "",
      "document.querySelector('#results').innerHTML = html"
    ].join('\n')
  },
  state: {
    caption: 'Showing the subscription-aware state example.',
    meetingspeak: [
      "OPEN_LOOP('count', 0)",
      "",
      "LISTEN_FOR_ALIGNMENT('count', (value) => {",
      "  BROADCAST('#count', value)",
      "})",
      "",
      "ACTION_ITEM('#increment', () => {",
      "  TRUE_UP('count', (value) => value + 1)",
      "})"
    ].join('\n'),
    javascript: [
      "let count = 0",
      "const countEl = document.querySelector('#count')",
      "",
      "document.querySelector('#increment').addEventListener('click', () => {",
      "  count += 1",
      "  countEl.textContent = count",
      "})"
    ].join('\n')
  },
  feedback: {
    caption: 'Showing the feedback and loading helper example.',
    meetingspeak: [
      "ACTION_ITEM('#save', async () => {",
      "  await PULSE_CHECK('#status', saveDraft(), '<p>Saving...</p>')",
      "  WIN_THE_ROOM('#toast', 'Draft saved.')",
      "})"
    ].join('\n'),
    javascript: [
      "document.querySelector('#save').addEventListener('click', async () => {",
      "  status.innerHTML = '<p>Saving...</p>'",
      "  await saveDraft()",
      "  toast.textContent = 'Draft saved.'",
      "})"
    ].join('\n')
  }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCurrentSectionHash() {
  var currentHash = globalThis.location.hash || '#overview';
  var normalizedHash = '#overview';
  var index = 0;

  if (currentHash && SECTION_IDS.indexOf(currentHash.replace('#', '')) !== -1) {
    return currentHash;
  }

  for (index = 0; index < SECTION_IDS.length; index += 1) {
    if (globalThis.scrollY + 140 >= FIND_STAKEHOLDER('#' + SECTION_IDS[index]).offsetTop) {
      normalizedHash = '#' + SECTION_IDS[index];
    }
  }

  return normalizedHash;
}

function setActiveNav(targetHash) {
  PIPELINE(FIND_STAKEHOLDERS('.docs-link'), function (link) {
    var selector = '#' + link.id;

    if (link.getAttribute('href') === targetHash) {
      ALIGN_ON(selector, 'active');
    } else {
      DEPRIORITIZE(selector, 'active');
    }

    return link;
  });
}

function syncActiveNav() {
  setActiveNav(getCurrentSectionHash());
}

function copyText(text, message) {
  if (!globalThis.navigator || !globalThis.navigator.clipboard || !globalThis.navigator.clipboard.writeText) {
    TAKE_THE_L('#docs-toast-stack', 'Clipboard support is unavailable in this browser.', 1800);
    return;
  }

  globalThis.navigator.clipboard.writeText(text).then(function () {
    WIN_THE_ROOM('#docs-toast-stack', message, 1400);
  }).catch(function () {
    TAKE_THE_L('#docs-toast-stack', 'Could not copy to the clipboard.', 1800);
  });
}

function renderAgenda() {
  var items = SINGLE_SOURCE_OF_TRUTH('agendaItems') || [];

  LOW_HANGING_FRUIT(
    '#agenda-summary',
    items.length > 0,
    '<strong>' + items.length + ' agenda items</strong><br />This example is using subscriptions plus list rendering.',
    'No agenda items yet. Strong opportunity for alignment.'
  );

  RUN_IT_UP_THE_FLAGPOLE('#agenda-list', items, function (item) {
    return '<li class="agenda-item">' +
      '<span>' + escapeHtml(item.title) + '</span>' +
      '<button type="button" data-remove-id="' + escapeHtml(item.id) + '">Remove</button>' +
    '</li>';
  }, '<li class="agenda-item">No agenda items yet.</li>');
}

function renderComparison() {
  var mode = SINGLE_SOURCE_OF_TRUTH('codeMode');
  var example = CODE_EXAMPLES[mode];

  BROADCAST('#comparison-caption', example.caption);
  ORG_UPDATE('#comparison-meetingspeak', escapeHtml(example.meetingspeak));
  ORG_UPDATE('#comparison-javascript', escapeHtml(example.javascript));

  DEPRIORITIZE('#show-render', 'active');
  DEPRIORITIZE('#show-state', 'active');
  DEPRIORITIZE('#show-feedback', 'active');
  ALIGN_ON('#show-' + mode, 'active');
}

function renderApiGroups() {
  var query = (SINGLE_SOURCE_OF_TRUTH('apiSearch') || '').toLowerCase();
  var visible = FILTER_FOR_FIT(API_GROUPS, function (group) {
    return !query || group.title.toLowerCase().indexOf(query) !== -1 || group.keywords.indexOf(query) !== -1;
  });

  BROADCAST(
    '#api-summary',
    visible.length === API_GROUPS.length
      ? 'Showing all API groups.'
      : 'Showing ' + visible.length + ' of ' + API_GROUPS.length + ' API groups.'
  );

  REORG('#api-empty', '<p>No API groups match that filter.</p>');

  if (!visible.length) {
    VISIBILITY_INTO('#api-empty');
  } else {
    TAKE_COVER('#api-empty');
  }

  RUN_IT_UP_THE_FLAGPOLE('#api-groups', visible, function (group) {
    return '<article class="api-group">' +
      '<p class="mini-label">' + escapeHtml(group.version) + '</p>' +
      '<h3>' + escapeHtml(group.title) + '</h3>' +
      '<ul>' + PIPELINE(group.items, function (item) {
        return '<li>' + item + '</li>';
      }).join('') + '</ul>' +
    '</article>';
  });
}

function renderToneMode() {
  var toneMode = SINGLE_SOURCE_OF_TRUTH('toneMode');
  var summary = 'Professional keeps the voice mostly restrained.';

  if (toneMode === 'buzzword') {
    summary = 'Buzzword adds more jargon to logs and errors without changing runtime behavior.';
  } else if (toneMode === 'boardroom') {
    summary = 'Boardroom sounds like the runtime brought a CFO to standup.';
  } else if (toneMode === 'unhinged') {
    summary = 'Unhinged keeps the same APIs but lets the copy get a little feral.';
  }

  PREFILL('#tone-select', toneMode);
  BROADCAST('#tone-summary', summary);
}

function recordEvent(title, message) {
  var item = SPIN_UP('li', {
    class: 'event-item',
    children: [
      SPIN_UP('strong', { text: title }),
      SPIN_UP('p', { text: message }),
      SPIN_UP('time', { text: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) })
    ]
  });
  var list = FIND_STAKEHOLDER('#event-log');

  ONBOARD('#event-log', item);

  while (list.children.length > 5) {
    list.removeChild(list.firstElementChild);
  }
}

function installNavigation() {
  ACTION_ITEM('.jump-link', function (event) {
    var href = event.currentTarget.getAttribute('href');

    if (!href || href.charAt(0) !== '#') {
      return;
    }

    TAKE_IT_OFFLINE(event);
    ABOVE_THE_FOLD(href);
    globalThis.history.replaceState(null, '', href);
    setActiveNav(href);
    GIVE_IT_A_VOICE('#docs-live-region', 'Jumped to ' + href.replace('#', '').replace(/-/g, ' ') + '.');
  });

  globalThis.addEventListener('hashchange', syncActiveNav);
  globalThis.addEventListener('scroll', syncActiveNav, { passive: true });
}

function installExampleHandlers() {
  HARD_STOP('#agenda-form', function () {
    var title = CAPTURE_INPUT('#agenda-input').trim();

    if (!title) {
      TAKE_THE_L('#docs-toast-stack', 'Agenda items need actual text.', 1600);
      return;
    }

    TRUE_UP('agendaItems', function (items) {
      return items.concat([{ id: 'agenda-' + Date.now(), title: title }]);
    });

    PREFILL('#agenda-input', '');
    MAKE_IT_POP('#agenda-list');
    WIN_THE_ROOM('#docs-toast-stack', 'Agenda item added.', 1400);
  });

  ACTION_ITEM('#agenda-clear', function () {
    CLOSE_THE_LOOP('agendaItems', []);
    TAKE_THE_L('#docs-toast-stack', 'Agenda cleared.', 1400);
  });

  LISTEN_IN('#agenda-list', 'click', function (event) {
    var button = event.target.closest('[data-remove-id]');

    if (!button) {
      return;
    }

    TRUE_UP('agendaItems', function (items) {
      return FILTER_FOR_FIT(items, function (item) {
        return item.id !== button.dataset.removeId;
      });
    });

    TAKE_THE_L('#docs-toast-stack', 'Agenda item removed.', 1400);
  });

  ACTION_ITEM('#trigger-win', function () {
    WIN_THE_ROOM('#feedback-banner', 'Draft saved to institutional knowledge.', 1800);
    MAKE_IT_POP('#feedback-banner');
  });

  ACTION_ITEM('#trigger-loss', function () {
    TAKE_THE_L('#feedback-banner', 'Could not align on external vendor response.', 2200);
  });

  ACTION_ITEM('#trigger-loading', function () {
    PULSE_CHECK(
      '#loading-preview',
      new Promise(function (resolve) {
        CIRCLE_BACK_IN(700, function () {
          resolve([
            'Loading helper completed.',
            'Container was pinned during the promise.',
            'No framework status component was harmed.'
          ]);
        });
      }),
      '<p>Gathering stakeholder input...</p>'
    ).then(function (messages) {
      RUN_IT_UP_THE_FLAGPOLE('#loading-preview', messages, function (message) {
        return '<div class="summary-pill"><strong>' + escapeHtml(message) + '</strong></div>';
      });
      WIN_THE_ROOM('#docs-toast-stack', 'Loading example completed.', 1400);
    }).catch(function (error) {
      POSTMORTEM(error);
      TAKE_THE_L('#docs-toast-stack', 'Loading example failed.', 1800);
    });
  });

  HARD_STOP('#shortcut-form', function () {
    var value = CAPTURE_INPUT('#shortcut-input').trim();

    if (!value) {
      TAKE_THE_L('#docs-toast-stack', 'Type something before submitting the shortcut form.', 1600);
      return;
    }

    BROADCAST('#shortcut-output', 'Submitted via HARD_STOP: ' + value);
    recordEvent('Form submit', 'Submitted "' + value + '" without a page reload.');
    PREFILL('#shortcut-input', '');
  });

  KEY_STAKEHOLDER('#shortcut-input', 'Escape', function () {
    PREFILL('#shortcut-input', '');
    BROADCAST('#shortcut-output', 'Escape cleared the input via KEY_STAKEHOLDER.');
    recordEvent('Keyboard shortcut', 'Escape cleared the field.');
  });

  OPEN_THE_FLOOR('#shortcut-input', function () {
    BROADCAST('#shortcut-output', 'Focus registered. Enter submits. Escape clears.');
  });

  ACTION_ITEM('#shortcut-link', function (event) {
    TAKE_IT_OFFLINE(event);
    BROADCAST('#shortcut-output', 'TAKE_IT_OFFLINE prevented the default jump.');
    recordEvent('Intercepted link', 'Default navigation was prevented.');
  });

  ACTION_ITEM('#show-render', function () {
    CLOSE_THE_LOOP('codeMode', 'render');
  });

  ACTION_ITEM('#show-state', function () {
    CLOSE_THE_LOOP('codeMode', 'state');
  });

  ACTION_ITEM('#show-feedback', function () {
    CLOSE_THE_LOOP('codeMode', 'feedback');
  });

  FOLLOW_UP('#api-search', function () {
    CLOSE_THE_LOOP('apiSearch', CAPTURE_INPUT('#api-search').trim());
  });

  FOLLOW_UP('#tone-select', function () {
    CLOSE_THE_LOOP('toneMode', CAPTURE_INPUT('#tone-select'));
  });

  ACTION_ITEM('#copy-install', function () {
    copyText(READ_THE_ROOM('#install-snippet'), 'Install snippet copied.');
  });

  ACTION_ITEM('#copy-quickstart', function () {
    copyText(READ_THE_ROOM('#quickstart-snippet'), 'Quick start snippet copied.');
  });
}

function installSubscriptions() {
  LISTEN_FOR_ALIGNMENT('agendaItems', function (items) {
    HARD_COMMIT(STORAGE_KEYS.agenda, items);
    renderAgenda();
    ESCALATE('docs:agenda-updated', { count: items.length });
  });

  LISTEN_FOR_ALIGNMENT('apiSearch', function (value) {
    INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.apiSearch, value);
    renderApiGroups();
  });

  LISTEN_FOR_ALIGNMENT('codeMode', function (value) {
    INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.codeMode, value);
    renderComparison();
  });

  LISTEN_FOR_ALIGNMENT('toneMode', function (value) {
    SET_THE_TONE(value);
    SESSION_CONTEXT(STORAGE_KEYS.tone, value);
    renderToneMode();
  });
}

function installGlobalEvents() {
  HEAR_ME_OUT('docs:agenda-updated', function (event) {
    GIVE_IT_A_VOICE('#docs-live-region', event.detail.count + ' agenda items in the live example.');
  });
}

function installA11y() {
  INCLUSIVE_ALIGNMENT('#agenda-input', 'Agenda item input');
  INCLUSIVE_ALIGNMENT('#api-search', 'Filter API reference groups');
  INCLUSIVE_ALIGNMENT('#shortcut-input', 'Keyboard shortcut example');
  INCLUSIVE_ALIGNMENT('#copy-install', 'Copy install snippet');
  INCLUSIVE_ALIGNMENT('#copy-quickstart', 'Copy quick start snippet');
  INCLUSIVE_ALIGNMENT('#tone-select', 'Select runtime tone mode');
}

function init() {
  SANITY_CHECK(IS_ON_THE_CALENDAR('#api-groups'), 'Docs markup is missing the API reference.');

  OPEN_LOOP('agendaItems', LOOK_IT_UP_NOW(STORAGE_KEYS.agenda) || DEFAULT_AGENDA.slice());
  OPEN_LOOP('apiSearch', LOOK_IT_UP(STORAGE_KEYS.apiSearch) || '');
  OPEN_LOOP('codeMode', LOOK_IT_UP(STORAGE_KEYS.codeMode) || 'render');
  OPEN_LOOP('toneMode', SESSION_CONTEXT(STORAGE_KEYS.tone) || 'professional');
  SET_THE_TONE(SINGLE_SOURCE_OF_TRUTH('toneMode'));

  installNavigation();
  installExampleHandlers();
  installSubscriptions();
  installGlobalEvents();
  installA11y();

  PREFILL('#api-search', SINGLE_SOURCE_OF_TRUTH('apiSearch'));
  renderAgenda();
  renderComparison();
  renderApiGroups();
  renderToneMode();
  syncActiveNav();
  EXECUTIVE_SUMMARY('MeetingSpeak docs initialized.');
}

init();

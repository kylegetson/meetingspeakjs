var STORAGE_KEYS = {
  watchlist: 'meetingspeak-demo-watchlist-v2',
  filters: 'meetingspeak-demo-filters-v2',
  tone: 'meetingspeak-demo-tone-v2'
};

var RETENTION_MS = 1000 * 60 * 60 * 24 * 30;
var STATUS_LABELS = {
  queued: 'Queued',
  watching: 'Watching',
  watched: 'Watched'
};
var STATUS_FLOW = ['queued', 'watching', 'watched'];
var TRAILER_LINES = [
  'Prestige nonsense, but with excellent lighting.',
  'Mildly cursed. Very streamable.',
  'Somehow both sincere and deeply unserious.',
  'A perfect use of one irresponsible weeknight.',
  'Highly aligned with dramatic exits and sharp coats.'
];

var DEFAULT_WATCHLIST = [
  {
    id: 'tape-1',
    title: 'Severance',
    service: 'Apple TV+',
    status: 'watching',
    note: 'Prestige office dread with suspiciously beautiful hallways.',
    createdAt: '2026-03-07T20:30:00.000Z'
  },
  {
    id: 'tape-2',
    title: 'The Nice Guys',
    service: 'Max',
    status: 'queued',
    note: 'Los Angeles chaos. Extremely loose governance.',
    createdAt: '2026-03-08T18:00:00.000Z'
  },
  {
    id: 'tape-3',
    title: 'Taskmaster',
    service: 'YouTube',
    status: 'watched',
    note: 'Proof that low-stakes nonsense is still a premium product.',
    createdAt: '2026-03-09T00:15:00.000Z'
  }
];

var DEFAULT_DRAFT = {
  title: '',
  service: 'Criterion Channel',
  status: 'queued',
  note: ''
};

var DEFAULT_FILTERS = {
  query: '',
  service: 'all',
  status: 'all',
  sort: 'recent'
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cloneWatchlist(items) {
  return PIPELINE(items, function (item) {
    return {
      id: item.id,
      title: item.title,
      service: item.service,
      status: item.status,
      note: item.note,
      createdAt: item.createdAt
    };
  });
}

function getWatchlist() {
  return SINGLE_SOURCE_OF_TRUTH('watchlist') || [];
}

function getDraft() {
  return SINGLE_SOURCE_OF_TRUTH('draft') || DEFAULT_DRAFT;
}

function getFilters() {
  return SINGLE_SOURCE_OF_TRUTH('filters') || DEFAULT_FILTERS;
}

function nowStamp() {
  return new Date().toISOString();
}

function formatShortTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
}

function formatCreatedAt(iso) {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

function getStatusCopy(status) {
  if (status === 'watching') {
    return 'In flight';
  }

  if (status === 'watched') {
    return 'Closed out';
  }

  return 'Queued';
}

function getToneCaption(mode) {
  if (mode === 'buzzword') {
    return 'Buzzword mode adds a little more jargon without fully setting the room on fire.';
  }

  if (mode === 'boardroom') {
    return 'Boardroom mode sounds like the quarterly review slid directly into the runtime.';
  }

  if (mode === 'unhinged') {
    return 'Unhinged mode lets the logs sound like morale has entered the chat.';
  }

  return 'Professional mode keeps the joke mostly in the names.';
}

function getStatusCounts(items) {
  return NET_NET(items, function (summary, item) {
    summary[item.status] += 1;
    return summary;
  }, {
    queued: 0,
    watching: 0,
    watched: 0
  });
}

function getServices(items) {
  var services = NET_NET(items, function (list, item) {
    if (item.service && list.indexOf(item.service) === -1) {
      list.push(item.service);
    }

    return list;
  }, ['all']);

  return SORT_THE_DECK(services, function (a, b) {
    if (a === 'all') {
      return -1;
    }

    if (b === 'all') {
      return 1;
    }

    return a.localeCompare(b);
  });
}

function getVisibleItems() {
  var filters = getFilters();
  var query = filters.query.toLowerCase();
  var filtered = FILTER_FOR_FIT(getWatchlist(), function (item) {
    var haystack = [item.title, item.service, item.note].join(' ').toLowerCase();
    var matchesQuery = !query || haystack.indexOf(query) !== -1;
    var matchesService = filters.service === 'all' || item.service === filters.service;
    var matchesStatus = filters.status === 'all' || item.status === filters.status;

    return matchesQuery && matchesService && matchesStatus;
  });

  if (filters.sort === 'title') {
    return SORT_THE_DECK(filtered, function (a, b) {
      return a.title.localeCompare(b.title);
    });
  }

  if (filters.sort === 'service') {
    return SORT_THE_DECK(filtered, function (a, b) {
      return a.service.localeCompare(b.service);
    });
  }

  if (filters.sort === 'status') {
    return SORT_THE_DECK(filtered, function (a, b) {
      return STATUS_FLOW.indexOf(a.status) - STATUS_FLOW.indexOf(b.status);
    });
  }

  return SORT_THE_DECK(filtered, function (a, b) {
    return b.createdAt.localeCompare(a.createdAt);
  });
}

function readDraftFromInputs() {
  return {
    title: CAPTURE_INPUT('#title-input').trim(),
    service: CAPTURE_INPUT('#service-input'),
    status: CAPTURE_INPUT('#status-input'),
    note: CAPTURE_INPUT('#note-input').trim()
  };
}

function syncInputsFromDraft() {
  var draft = getDraft();

  PREFILL('#title-input', draft.title);
  PREFILL('#service-input', draft.service);
  PREFILL('#status-input', draft.status);
  PREFILL('#note-input', draft.note);
}

function syncFilterInputs() {
  var filters = getFilters();

  PREFILL('#search-input', filters.query);
  PREFILL('#service-filter', filters.service);
  PREFILL('#status-filter', filters.status);
  PREFILL('#sort-filter', filters.sort);
}

function renderHeroStats() {
  var items = getWatchlist();
  var counts = getStatusCounts(items);
  var stats = [
    { label: 'Titles tracked', value: items.length, caption: 'Persisted with local storage metadata.' },
    { label: 'Queued next', value: counts.queued, caption: 'Strong candidates for the next idle Tuesday.' },
    { label: 'Currently watching', value: counts.watching, caption: 'Active workstreams with snacks.' },
    { label: 'Closed out', value: counts.watched, caption: 'Deliverables already absorbed by culture.' }
  ];

  RUN_IT_UP_THE_FLAGPOLE('#hero-stats', stats, function (item) {
    return TALK_TRACK(
      '<article class="hero-stat"><strong>{{value}}</strong><small>{{label}}</small><small>{{caption}}</small></article>',
      item
    );
  });
}

function renderToneMode() {
  var toneMode = SINGLE_SOURCE_OF_TRUTH('toneMode');
  PREFILL('#tone-select', toneMode);
  BROADCAST('#tone-caption', getToneCaption(toneMode));
}

function renderComposer() {
  var editingId = SINGLE_SOURCE_OF_TRUTH('editingId');
  var isEditing = !!editingId;

  BROADCAST('#composer-kicker', isEditing ? 'Edit the current entry' : 'Add something to the queue');
  BROADCAST('#submit-copy', isEditing ? 'Save changes' : 'Add to board');

  if (isEditing) {
    VISIBILITY_INTO('#cancel-edit');
    WAR_ROOM_MODE('#composer-panel', true);
  } else {
    TAKE_COVER('#cancel-edit');
    WAR_ROOM_MODE('#composer-panel', false);
  }
}

function renderPreview() {
  var draft = getDraft();
  var title = draft.title || 'Severance';
  var service = draft.service || 'Criterion Channel';
  var note = draft.note || 'Petty office politics. Excellent coats.';
  var status = STATUS_LABELS[draft.status] || STATUS_LABELS.queued;

  BROADCAST('#preview-title', title);
  BROADCAST('#preview-service', service);
  BROADCAST('#preview-note', note);
  BROADCAST('#preview-status', status);
}

function renderServiceFilter() {
  RUN_IT_UP_THE_FLAGPOLE('#service-filter', getServices(getWatchlist()), function (service) {
    var label = service === 'all' ? 'All services' : service;
    return '<option value="' + escapeHtml(service) + '">' + escapeHtml(label) + '</option>';
  });

  var filters = getFilters();

  if (getServices(getWatchlist()).indexOf(filters.service) === -1) {
    CLOSE_THE_LOOP('filters', {
      query: filters.query,
      service: 'all',
      status: filters.status,
      sort: filters.sort
    });
    return;
  }

  PREFILL('#service-filter', filters.service);
}

function renderSummary() {
  var filters = getFilters();
  var visible = getVisibleItems();
  var counts = getStatusCounts(visible);
  var hasActiveFilters = !!(filters.query || filters.service !== 'all' || filters.status !== 'all');

  LOW_HANGING_FRUIT(
    '#summary-bar',
    visible.length > 0,
    [
      '<article class="summary-pill"><strong>' + visible.length + '</strong><p>Visible titles</p><small>' +
        escapeHtml(hasActiveFilters ? 'Current filters narrowed the board.' : 'No filters are constraining the board.') +
      '</small></article>',
      '<article class="summary-pill"><strong>' + counts.watching + '</strong><p>In flight</p><small>' +
        escapeHtml('Watching status uses a tiny state machine, not a framework sermon.') +
      '</small></article>',
      '<article class="summary-pill"><strong>' + counts.watched + '</strong><p>Closed out</p><small>' +
        escapeHtml('Watched entries are visually de-emphasized via a runtime helper.') +
      '</small></article>'
    ],
    '<article class="summary-pill"><strong>0</strong><p>No visible titles</p><small>Clear filters or restore the sample lineup.</small></article>' +
    '<article class="summary-pill"><strong>' + getWatchlist().length + '</strong><p>Total tracked</p><small>The list itself is still intact.</small></article>' +
    '<article class="summary-pill"><strong>' + SINGLE_SOURCE_OF_TRUTH('toneMode') + '</strong><p>Runtime tone</p><small>The copy changes. The behavior does not.</small></article>'
  );
}

function renderBoard() {
  var visible = getVisibleItems();
  var filters = getFilters();
  var activeMessage = filters.query
    ? TALK_TRACK('Filtering for "{{query}}". Escape clears the search field.', { query: filters.query })
    : 'Standing by. The board is rendering from state subscriptions, not manual DOM surgery.';

  RUN_IT_UP_THE_FLAGPOLE('#watch-list', visible, function (item) {
    return TALK_TRACK(
      '<article class="watch-card {{cardClass}}" data-id="{{id}}">' +
        '<div class="card-topline">' +
          '<span class="service-pill">{{service}}</span>' +
          '<span class="status-pill">{{statusCopy}}</span>' +
        '</div>' +
        '<h3>{{title}}</h3>' +
        '<p class="card-note">{{note}}</p>' +
        '<p class="card-meta">Added {{createdAt}}</p>' +
        '<div class="card-actions">' +
          '<button class="mini-button" type="button" data-action="advance" data-id="{{id}}">Advance status</button>' +
          '<button class="mini-button" type="button" data-action="edit" data-id="{{id}}">Edit</button>' +
          '<button class="mini-button danger" type="button" data-action="delete" data-id="{{id}}">Delete</button>' +
        '</div>' +
      '</article>',
      {
        id: escapeHtml(item.id),
        title: escapeHtml(item.title),
        service: escapeHtml(item.service),
        note: escapeHtml(item.note || 'No trailer line yet. Strong space for improvisation.'),
        createdAt: escapeHtml(formatCreatedAt(item.createdAt)),
        statusCopy: escapeHtml(getStatusCopy(item.status)),
        cardClass: item.status === 'watched' ? 'is-watched' : ''
      }
    );
  });

  LOW_HANGING_FRUIT(
    '#empty-state-shell',
    !visible.length,
    '<article class="empty-state"><h3>No titles match this filter stack.</h3><p>Clear the filters or restore the sample lineup.</p></article>',
    ''
  );

  BROADCAST('#board-status', visible.length ? activeMessage : 'No titles match the current search stack.');
  DEPRIORITIZE('#board-status', 'success');
  DEPRIORITIZE('#board-status', 'warning');

  if (visible.length) {
    ALIGN_ON('#board-status', 'success');
  } else {
    ALIGN_ON('#board-status', 'warning');
  }

  WAR_ROOM_MODE('#watch-board', !!(filters.query || filters.service !== 'all' || filters.status !== 'all'));
  QUIET_QUITTING('.watch-card.is-watched');
  SMOOTH_THE_TRANSITION('.watch-card', {
    transition: 'transform 180ms ease, opacity 180ms ease, filter 180ms ease, box-shadow 180ms ease'
  });
}

function renderRecommendations() {
  var recommendations = SINGLE_SOURCE_OF_TRUTH('recommendations') || [];

  RUN_IT_UP_THE_FLAGPOLE('#recommendations', recommendations, function (item) {
    return TALK_TRACK(
      '<article class="recommendation-card">' +
        '<h3>{{title}}</h3>' +
        '<p>{{service}}</p>' +
        '<p>{{reason}}</p>' +
      '</article>',
      {
        title: escapeHtml(item.title),
        service: escapeHtml(item.service),
        reason: escapeHtml(item.reason)
      }
    );
  }, '<article class="empty-state"><h3>No suggestions right now.</h3><p>The mock vendor came back with a shrug.</p></article>');
}

function buildRecommendations() {
  var watchlist = getWatchlist();
  var counts = getStatusCounts(watchlist);
  var filters = getFilters();
  var backlogFriendly = counts.queued > counts.watching;

  return [
    {
      title: backlogFriendly ? 'Murder by Death' : 'Columbo',
      service: 'Criterion Channel',
      reason: backlogFriendly
        ? 'Your queue is deep. Add something reliably fun instead of another prestige liability.'
        : 'You are mid-flight on enough serious television. The detective in the raincoat can carry this sprint.'
    },
    {
      title: filters.service === 'all' ? 'Party Down' : 'The Bear',
      service: filters.service === 'all' ? 'Starz' : filters.service,
      reason: filters.service === 'all'
        ? 'The board was not aligned on a single service, so the runtime improvised.'
        : 'Using the active service filter to make the fake vendor look suspiciously competent.'
    },
    {
      title: counts.watched ? 'The Nice Guys' : 'Stop Making Sense',
      service: counts.watched ? 'Max' : 'A24',
      reason: counts.watched
        ? 'You have already closed out a few titles, which earns a little chaos.'
        : 'You need one undeniable win on the board before morale starts freelancing.'
    }
  ];
}

function loadRecommendations(showToast) {
  WAR_ROOM_MODE('#recommendations-panel', true);
  THIS_COULD_HAVE_BEEN_AN_EMAIL('Refreshing recommendations...');

  return PULSE_CHECK(
    '#recommendations',
    AIR_COVER(
      TIMEBOX(1400, new Promise(function (resolve) {
        CIRCLE_BACK_IN(720, function () {
          resolve(buildRecommendations());
        });
      })),
      []
    ),
    '<div class="loading-card">Gathering stakeholder input from a completely fake content vendor...</div>'
  ).then(function (results) {
    WAR_ROOM_MODE('#recommendations-panel', false);
    CLOSE_THE_LOOP('recommendations', results);

    if (showToast) {
      WIN_THE_ROOM('#toast-stack', 'Recommendations refreshed.', 1600);
    }
  }).catch(function (error) {
    WAR_ROOM_MODE('#recommendations-panel', false);
    POSTMORTEM(error);
    TAKE_THE_L('#toast-stack', 'Recommendations stalled in procurement.', 2200);
  });
}

function persistWatchlist(items) {
  HARD_COMMIT(STORAGE_KEYS.watchlist, items);
  DATA_RETENTION_POLICY(STORAGE_KEYS.watchlist, RETENTION_MS);
}

function persistFilters(filters) {
  SOFT_COMMIT(STORAGE_KEYS.filters, filters);
}

function persistTone(mode) {
  SESSION_CONTEXT(STORAGE_KEYS.tone, mode);
}

function resetDraft() {
  CLOSE_THE_LOOP('editingId', null);
  CLOSE_THE_LOOP('draft', {
    title: '',
    service: 'Criterion Channel',
    status: 'queued',
    note: ''
  });
  syncInputsFromDraft();
  renderComposer();
}

function startEditing(id) {
  var entry = FILTER_FOR_FIT(getWatchlist(), function (item) {
    return item.id === id;
  })[0];

  if (!entry) {
    TAKE_THE_L('#toast-stack', 'That title has already left the agenda.', 1800);
    return;
  }

  CLOSE_THE_LOOP('editingId', id);
  CLOSE_THE_LOOP('draft', {
    title: entry.title,
    service: entry.service,
    status: entry.status,
    note: entry.note
  });
  syncInputsFromDraft();
  renderComposer();
  queueFocus('#title-input');
  MAKE_IT_POP('#composer-panel');
}

function advanceStatus(id) {
  TRUE_UP('watchlist', function (items) {
    return PIPELINE(items, function (item) {
      if (item.id !== id) {
        return item;
      }

      var nextStatus = STATUS_FLOW[(STATUS_FLOW.indexOf(item.status) + 1) % STATUS_FLOW.length];

      return {
        id: item.id,
        title: item.title,
        service: item.service,
        status: nextStatus,
        note: item.note,
        createdAt: item.createdAt
      };
    });
  });

  WIN_THE_ROOM('#toast-stack', 'Status advanced.', 1400);
}

function deleteEntry(id) {
  var next = FILTER_FOR_FIT(getWatchlist(), function (item) {
    return item.id !== id;
  });

  if (next.length === getWatchlist().length) {
    return;
  }

  CLOSE_THE_LOOP('watchlist', next);

  if (SINGLE_SOURCE_OF_TRUTH('editingId') === id) {
    resetDraft();
  }

  TAKE_THE_L('#toast-stack', 'Entry removed from the board.', 1800);
}

function submitDraft() {
  var draft = readDraftFromInputs();
  var editingId = SINGLE_SOURCE_OF_TRUTH('editingId');

  CLOSE_THE_LOOP('draft', draft);

  if (!draft.title || !draft.service) {
    TAKE_THE_L('#toast-stack', 'Title and service are both required before this ships.', 2200);
    return;
  }

  if (editingId) {
    TRUE_UP('watchlist', function (items) {
      return PIPELINE(items, function (item) {
        if (item.id !== editingId) {
          return item;
        }

        return {
          id: item.id,
          title: draft.title,
          service: draft.service,
          status: draft.status,
          note: draft.note,
          createdAt: item.createdAt
        };
      });
    });

    WIN_THE_ROOM('#toast-stack', 'Entry updated.', 1500);
  } else {
    TRUE_UP('watchlist', function (items) {
      return [{
        id: 'tape-' + Date.now(),
        title: draft.title,
        service: draft.service,
        status: draft.status,
        note: draft.note,
        createdAt: nowStamp()
      }].concat(items);
    });

    FIVE_MINUTE_BREAKTHROUGH('Added a new title to the board.');
    WIN_THE_ROOM('#toast-stack', 'Added to the board.', 1500);
  }

  VICTORY_LAP('#preview-card');
  resetDraft();
}

function restoreSamples() {
  CLOSE_THE_LOOP('watchlist', cloneWatchlist(DEFAULT_WATCHLIST));
  CLOSE_THE_LOOP('filters', {
    query: '',
    service: 'all',
    status: 'all',
    sort: 'recent'
  });
  syncFilterInputs();
  resetDraft();
  WIN_THE_ROOM('#toast-stack', 'Sample watchlist restored.', 1600);
  loadRecommendations(false);
}

function clearFilters() {
  CLOSE_THE_LOOP('filters', {
    query: '',
    service: 'all',
    status: 'all',
    sort: 'recent'
  });
  syncFilterInputs();
  FOCUS_THE_ROOM('#search-input');
}

function cyclePreviewLine() {
  var draft = getDraft();
  var nextNote = TRAILER_LINES[Math.floor(Math.random() * TRAILER_LINES.length)];

  CLOSE_THE_LOOP('draft', {
    title: draft.title,
    service: draft.service,
    status: draft.status,
    note: nextNote
  });
  PREFILL('#note-input', nextNote);
  MAKE_IT_POP('#preview-card');
}

function queueFocus(selector) {
  BY_CLOSE_OF_BUSINESS(function () {
    FOCUS_THE_ROOM(selector);
  });
}

function recordActivity(detail) {
  var feedItem = SPIN_UP('li', {
    class: 'activity-item',
    children: [
      SPIN_UP('strong', { text: detail.title }),
      SPIN_UP('p', { text: detail.message }),
      SPIN_UP('time', { text: detail.timestamp })
    ]
  });
  var feed = FIND_STAKEHOLDER('#activity-feed');

  ONBOARD('#activity-feed', feedItem);

  while (feed.children.length > 6) {
    feed.removeChild(feed.firstElementChild);
  }
}

function buildActivityDetail(eventDetail) {
  return {
    title: 'Board updated',
    message: TALK_TRACK('{{count}} titles tracked. {{watching}} currently in flight.', eventDetail),
    timestamp: formatShortTime(nowStamp())
  };
}

function installSubscriptions() {
  LISTEN_FOR_ALIGNMENT('watchlist', function (items) {
    persistWatchlist(items);
    renderHeroStats();
    renderServiceFilter();
    renderSummary();
    renderBoard();
    ESCALATE('watchlist:updated', {
      count: items.length,
      watching: getStatusCounts(items).watching
    });
  });

  LISTEN_FOR_ALIGNMENT('filters', function (filters) {
    persistFilters(filters);
    renderSummary();
    renderBoard();
  });

  LISTEN_FOR_ALIGNMENT('draft', function () {
    renderPreview();
  });

  LISTEN_FOR_ALIGNMENT('editingId', function () {
    renderComposer();
  });

  LISTEN_FOR_ALIGNMENT('recommendations', function () {
    renderRecommendations();
  });

  LISTEN_FOR_ALIGNMENT('toneMode', function (mode) {
    SET_THE_TONE(mode);
    persistTone(mode);
    renderToneMode();
  });
}

function installEventHandlers() {
  HARD_STOP('#watch-form', submitDraft);

  ACTION_ITEM('#cancel-edit', function () {
    resetDraft();
    TAKE_THE_L('#toast-stack', 'Edit mode canceled.', 1400);
  });

  ACTION_ITEM('#restore-samples', restoreSamples);
  ACTION_ITEM('#refresh-recommendations', function () {
    loadRecommendations(true);
  });

  FOLLOW_UP('#title-input', function () {
    CLOSE_THE_LOOP('draft', readDraftFromInputs());
  });

  FOLLOW_UP('#service-input', function () {
    CLOSE_THE_LOOP('draft', readDraftFromInputs());
  });

  FOLLOW_UP('#status-input', function () {
    CLOSE_THE_LOOP('draft', readDraftFromInputs());
  });

  FOLLOW_UP('#note-input', function () {
    CLOSE_THE_LOOP('draft', readDraftFromInputs());
  });

  FOLLOW_UP('#search-input', function () {
    var filters = getFilters();

    CLOSE_THE_LOOP('filters', {
      query: CAPTURE_INPUT('#search-input').trim(),
      service: filters.service,
      status: filters.status,
      sort: filters.sort
    });
  });

  FOLLOW_UP('#service-filter', function () {
    var filters = getFilters();

    CLOSE_THE_LOOP('filters', {
      query: filters.query,
      service: CAPTURE_INPUT('#service-filter'),
      status: filters.status,
      sort: filters.sort
    });
  });

  FOLLOW_UP('#status-filter', function () {
    var filters = getFilters();

    CLOSE_THE_LOOP('filters', {
      query: filters.query,
      service: filters.service,
      status: CAPTURE_INPUT('#status-filter'),
      sort: filters.sort
    });
  });

  FOLLOW_UP('#sort-filter', function () {
    var filters = getFilters();

    CLOSE_THE_LOOP('filters', {
      query: filters.query,
      service: filters.service,
      status: filters.status,
      sort: CAPTURE_INPUT('#sort-filter')
    });
  });

  FOLLOW_UP('#tone-select', function () {
    CLOSE_THE_LOOP('toneMode', CAPTURE_INPUT('#tone-select'));
  });

  LISTEN_IN('#watch-list', 'click', function (event) {
    var trigger = event.target.closest('[data-action]');

    if (!trigger) {
      return;
    }

    if (trigger.dataset.action === 'advance') {
      advanceStatus(trigger.dataset.id);
      return;
    }

    if (trigger.dataset.action === 'edit') {
      startEditing(trigger.dataset.id);
      return;
    }

    if (trigger.dataset.action === 'delete') {
      deleteEntry(trigger.dataset.id);
    }
  });

  ACTION_ITEM('#clear-filters', function (event) {
    TAKE_IT_OFFLINE(event);
    clearFilters();
    WIN_THE_ROOM('#toast-stack', 'Filters cleared.', 1200);
  });

  KEY_STAKEHOLDER('#search-input', 'Escape', function () {
    clearFilters();
    WIN_THE_ROOM('#toast-stack', 'Search cleared.', 1200);
  });

  OPEN_THE_FLOOR('#search-input', function () {
    BROADCAST('#board-status', 'Tip: Escape clears the search field in one move.');
    DEPRIORITIZE('#board-status', 'warning');
    ALIGN_ON('#board-status', 'success');
  });

  DOUBLE_CLICK_ON('#preview-card', function () {
    cyclePreviewLine();
    WIN_THE_ROOM('#toast-stack', 'Preview line remixed.', 1200);
  });

  HEAR_ME_OUT('watchlist:updated', function (event) {
    var detail = buildActivityDetail(event.detail || { count: 0, watching: 0 });
    recordActivity(detail);
    GIVE_IT_A_VOICE('#sr-updates', detail.message);
  });
}

function installA11y() {
  INCLUSIVE_ALIGNMENT('#title-input', 'Title');
  INCLUSIVE_ALIGNMENT('#service-input', 'Streaming service');
  INCLUSIVE_ALIGNMENT('#status-input', 'Watch status');
  INCLUSIVE_ALIGNMENT('#note-input', 'Trailer line');
  INCLUSIVE_ALIGNMENT('#search-input', 'Search titles, services, or notes');
  INCLUSIVE_ALIGNMENT('#service-filter', 'Filter by service');
  INCLUSIVE_ALIGNMENT('#status-filter', 'Filter by status');
  INCLUSIVE_ALIGNMENT('#sort-filter', 'Sort the board');
  INCLUSIVE_ALIGNMENT('#tone-select', 'Select runtime tone mode');
  INCLUSIVE_ALIGNMENT('#restore-samples', 'Restore the sample watchlist');
  INCLUSIVE_ALIGNMENT('#refresh-recommendations', 'Refresh recommendations');
}

function init() {
  SANITY_CHECK(IS_ON_THE_CALENDAR('#watch-list'), 'Demo markup is missing the watch board.');
  REDUCE_FRICTION();

  var savedTone = SESSION_CONTEXT(STORAGE_KEYS.tone) || 'professional';
  var savedFilters = SESSION_CONTEXT(STORAGE_KEYS.filters) || DEFAULT_FILTERS;
  var savedWatchlist = LOOK_IT_UP_NOW(STORAGE_KEYS.watchlist) || cloneWatchlist(DEFAULT_WATCHLIST);

  OPEN_LOOP('watchlist', savedWatchlist);
  OPEN_LOOP('draft', {
    title: '',
    service: 'Criterion Channel',
    status: 'queued',
    note: ''
  });
  OPEN_LOOP('filters', {
    query: savedFilters.query || '',
    service: savedFilters.service || 'all',
    status: savedFilters.status || 'all',
    sort: savedFilters.sort || 'recent'
  });
  OPEN_LOOP('editingId', null);
  OPEN_LOOP('recommendations', []);
  OPEN_LOOP('toneMode', savedTone);
  SET_THE_TONE(savedTone);

  installSubscriptions();
  installEventHandlers();
  installA11y();

  syncInputsFromDraft();
  renderComposer();
  renderPreview();
  renderToneMode();
  renderHeroStats();
  renderServiceFilter();
  syncFilterInputs();
  renderSummary();
  renderBoard();
  renderRecommendations();

  LAUNCH_SEQUENCE('.chrome-panel');
  queueFocus('#title-input');
  loadRecommendations(false);

  EXECUTIVE_SUMMARY('MeetingSpeak v2 demo initialized.');
}

init();

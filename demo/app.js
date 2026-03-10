var STORAGE_KEYS = {
  watchlist: 'meetingspeak-demo-watchlist-v3',
  filters: 'meetingspeak-demo-filters-v3',
  tone: 'meetingspeak-demo-tone-v3'
};

var RETENTION_MS = 1000 * 60 * 60 * 24 * 30;
var STATUS_LABELS = {
  queued: 'Pre-Game',
  watching: 'Crushing It',
  watched: 'Win Column'
};
var STATUS_FLOW = ['queued', 'watching', 'watched'];

var TRAILER_LINES = [
  'Like a scrappy underdog that just had its IPO.',
  'A fourth-quarter comeback wrapped in a limited series.',
  'Moves the needle. Checks all the boxes.',
  'MVP-level storytelling. Championship production values.',
  'A blue-sky concept that somehow made it to post.',
  'Disruptive content that is not afraid to pivot.',
  'A full-court press on your emotional bandwidth.',
  'Delivers ROI on your couch time. Synergizes well with snacks.',
  'This show has excellent culture fit.',
  'Brought to market faster than our last sprint.',
  'Tackles the pain points. Leans in. Does not blink.',
  'World-class narrative velocity. Strong bench depth.',
  'Not afraid to go into overtime for the right story.',
  'A masterclass in cross-functional character development.'
];

var SPORTS_CELEBRATIONS = [
  'TOUCHDOWN. Status moved to the end zone.',
  'SLAM DUNK. Nothing but net on that status update.',
  'HOME RUN. That one left the park.',
  'GOAL! Status advanced. The crowd goes wild.',
  'HOLE IN ONE. Crushed that status cycle.',
  'ACE. Game. Set. Match. Status updated.',
  'THREE-POINTER AT THE BUZZER. Status advanced.',
  'CHECKERED FLAG. Status moved. Full send.',
  'STRIKE. Knocked it right down the middle.',
  'SLAPSHOT. Status cleared the boards.',
  'BIRDIE. One under par on the status advance.',
  'POWERING THROUGH THE PAINT. Status closed out.'
];

var CORPORATE_BUZZWORDS = [
  'Synergizes cross-functional core competencies. Strong ROI profile.',
  'Leverages best-in-class storytelling to disrupt legacy narratives.',
  'Moves the needle on character development. Iterates fast.',
  'Built for scale. Drama delivered with agile methodology.',
  'Boils the ocean of human experience into a digestible arc.',
  'Peel back the onion and you find a masterclass in alignment.',
  'Drinking from a fire hose of plot. High bandwidth required.',
  'Blue-sky concept executed with disciplined narrative execution.',
  'Touch base with your feelings. This show will circle back.',
  'A low-hanging fruit pick that delivers outsized emotional returns.',
  'Let\'s unpack this. You will not regret the bandwidth investment.',
  'Bandwidth-efficient storytelling. Low lift. High yield.'
];

var DEFAULT_WATCHLIST = [
  {
    id: 'tape-1',
    title: 'Succession',
    service: 'Max',
    status: 'watched',
    note: 'Premium corporate warfare with extremely high synergy destruction potential.',
    createdAt: '2026-03-07T20:30:00.000Z'
  },
  {
    id: 'tape-2',
    title: 'Ted Lasso',
    service: 'Apple TV+',
    status: 'watching',
    note: 'A full-court press for optimism in a metrics-obsessed industry. Strong culture fit.',
    createdAt: '2026-03-08T18:00:00.000Z'
  },
  {
    id: 'tape-3',
    title: 'Industry',
    service: 'Max',
    status: 'queued',
    note: 'Finance bros going all-in. Governance: none. KPI awareness: surprisingly excellent.',
    createdAt: '2026-03-09T00:15:00.000Z'
  },
  {
    id: 'tape-4',
    title: 'The Wire',
    service: 'Max',
    status: 'queued',
    note: 'A masterclass in misaligned organizational incentives across every vertical.',
    createdAt: '2026-03-09T08:30:00.000Z'
  },
  {
    id: 'tape-5',
    title: 'Abbott Elementary',
    service: 'Hulu',
    status: 'watched',
    note: 'Scrappy underdog school district. Culture fit: exceptional. Budget: nonexistent.',
    createdAt: '2026-03-09T14:00:00.000Z'
  }
];

var DEFAULT_DRAFT = {
  title: '',
  service: 'Netflix',
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
    return 'Crushing It';
  }

  if (status === 'watched') {
    return 'Win Column';
  }

  return 'Pre-Game';
}

function getToneCaption(mode) {
  if (mode === 'buzzword') {
    return 'Buzzword mode leverages synergistic jargon to disrupt your existing reading experience.';
  }

  if (mode === 'boardroom') {
    return 'Boardroom mode assumes you are presenting this watchlist to a Series B investor who has questions.';
  }

  if (mode === 'unhinged') {
    return 'Unhinged mode has disconnected from the mothership. Please advise.';
  }

  if (mode === 'sports') {
    return 'Sports mode turns every log into a play-by-play and every error into a flag on the field.';
  }

  return 'Professional mode keeps the joke mostly in the names. Recommended for all-hands.';
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

function getSynergyScore(items) {
  var counts = getStatusCounts(items);
  var total = items.length;

  if (total === 0) {
    return 0;
  }

  var score = Math.round(
    (counts.watching * 3 + counts.watched * 2 + counts.queued * 1) /
    (total * 3) * 100
  );

  return Math.min(score, 99);
}

function getSynergyLabel(score) {
  if (score >= 80) {
    return 'MARKET-LEADING';
  }

  if (score >= 60) {
    return 'HIGH-VELOCITY';
  }

  if (score >= 40) {
    return 'ON-TRACK';
  }

  if (score >= 20) {
    return 'NEEDS ALIGNMENT';
  }

  return 'PIPELINE RISK';
}

function getRandomSportsCelebration() {
  return SPORTS_CELEBRATIONS[Math.floor(Math.random() * SPORTS_CELEBRATIONS.length)];
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
  var score = getSynergyScore(items);
  var scoreLabel = getSynergyLabel(score);

  var stats = [
    {
      label: 'Total pipeline',
      value: items.length,
      caption: 'Every title tracked. Every rep counted.'
    },
    {
      label: 'Pre-game queue',
      value: counts.queued,
      caption: 'Warming the bench. Ready to enter the rotation.'
    },
    {
      label: 'Actively crushing',
      value: counts.watching,
      caption: 'In the game. Eyes on the prize. Popcorn deployed.'
    },
    {
      label: 'Win column',
      value: counts.watched,
      caption: 'Closed out. These are fully in the W column.'
    },
    {
      label: 'Synergy score',
      value: score + '%',
      caption: scoreLabel + '. Content ROI is ' + (score > 50 ? 'exceptional' : 'under review') + '.'
    }
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

  BROADCAST('#composer-kicker', isEditing ? 'Renegotiate the current entry' : 'Add a deliverable to the pipeline');
  BROADCAST('#submit-copy', isEditing ? 'Commit changes' : 'Ship to board');

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
  var service = draft.service || 'Netflix';
  var note = draft.note || 'Peak prestige content. Excellent ROI on couch time.';
  var status = STATUS_LABELS[draft.status] || STATUS_LABELS.queued;

  BROADCAST('#preview-title', title);
  BROADCAST('#preview-service', service);
  BROADCAST('#preview-note', note);
  BROADCAST('#preview-status', status);
}

function renderServiceFilter() {
  RUN_IT_UP_THE_FLAGPOLE('#service-filter', getServices(getWatchlist()), function (service) {
    var label = service === 'all' ? 'All vendors' : service;
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
      '<article class="summary-pill"><strong>' + visible.length + '</strong><p>Visible deliverables</p><small>' +
        escapeHtml(hasActiveFilters ? 'Filters have narrowed the funnel.' : 'Full pipeline visibility. No filters constraining the board.') +
      '</small></article>',
      '<article class="summary-pill"><strong>' + counts.watching + '</strong><p>Crushing it</p><small>' +
        escapeHtml('Actively in-game. State machine confirmed. No framework required.') +
      '</small></article>',
      '<article class="summary-pill"><strong>' + counts.watched + '</strong><p>In the W column</p><small>' +
        escapeHtml('Watched entries are de-emphasized. Like a veteran who has nothing left to prove.') +
      '</small></article>'
    ],
    '<article class="summary-pill"><strong>0</strong><p>Empty pipeline</p><small>Clear filters or restore the sample roster.</small></article>' +
    '<article class="summary-pill"><strong>' + getWatchlist().length + '</strong><p>Total tracked</p><small>The full roster is still intact.</small></article>' +
    '<article class="summary-pill"><strong>' + SINGLE_SOURCE_OF_TRUTH('toneMode') + '</strong><p>Runtime tone</p><small>The copy pivots. The behavior does not.</small></article>'
  );
}

function renderBoard() {
  var visible = getVisibleItems();
  var filters = getFilters();
  var activeMessage = filters.query
    ? TALK_TRACK('Filtering for "{{query}}". Escape clears the search field.', { query: filters.query })
    : 'Standing by. Board is rendering from state subscriptions. No DOM surgery. No frameworks. Just results.';

  RUN_IT_UP_THE_FLAGPOLE('#watch-list', visible, function (item) {
    return TALK_TRACK(
      '<article class="watch-card {{cardClass}}" data-id="{{id}}">' +
        '<div class="card-topline">' +
          '<span class="service-pill">{{service}}</span>' +
          '<span class="status-pill">{{statusCopy}}</span>' +
        '</div>' +
        '<h3>{{title}}</h3>' +
        '<p class="card-note">{{note}}</p>' +
        '<p class="card-meta">Onboarded {{createdAt}}</p>' +
        '<div class="card-actions">' +
          '<button class="mini-button" type="button" data-action="advance" data-id="{{id}}">Advance the ball</button>' +
          '<button class="mini-button" type="button" data-action="edit" data-id="{{id}}">Renegotiate</button>' +
          '<button class="mini-button danger" type="button" data-action="delete" data-id="{{id}}">Cut from roster</button>' +
        '</div>' +
      '</article>',
      {
        id: escapeHtml(item.id),
        title: escapeHtml(item.title),
        service: escapeHtml(item.service),
        note: escapeHtml(item.note || 'Executive summary pending. Strong space for strategic improvisation.'),
        createdAt: escapeHtml(formatCreatedAt(item.createdAt)),
        statusCopy: escapeHtml(getStatusCopy(item.status)),
        cardClass: item.status === 'watched' ? 'is-watched' : ''
      }
    );
  });

  LOW_HANGING_FRUIT(
    '#empty-state-shell',
    !visible.length,
    '<article class="empty-state"><h3>No deliverables cleared the filter threshold.</h3><p>Clear the filters or restore the sample roster. The pipeline needs to breathe.</p></article>',
    ''
  );

  BROADCAST('#board-status', visible.length ? activeMessage : 'No content matched the current search parameters. Are we even moving the needle?');
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
        '<div class="rec-topline"><h3>{{title}}</h3><span class="rec-fit-pill">{{fitLabel}}</span></div>' +
        '<p class="rec-vendor">{{service}}</p>' +
        '<p>{{reason}}</p>' +
      '</article>',
      {
        title: escapeHtml(item.title),
        service: escapeHtml(item.service),
        reason: escapeHtml(item.reason),
        fitLabel: escapeHtml(item.fitLabel || 'CULTURE FIT')
      }
    );
  }, '<article class="empty-state"><h3>No recommendations at this time.</h3><p>The content intelligence vendor is offline. We are looping in procurement.</p></article>');
}

function buildRecommendations() {
  var watchlist = getWatchlist();
  var counts = getStatusCounts(watchlist);
  var filters = getFilters();
  var isHustling = counts.watching > counts.queued;

  return [
    {
      title: isHustling ? 'The Bear' : 'Halt and Catch Fire',
      service: isHustling ? 'Hulu' : 'AMC+',
      fitLabel: 'HIGH PRIORITY',
      reason: isHustling
        ? 'You are actively crushing it. This show will not lower your velocity. It may increase it.'
        : 'Your pipeline is deep. This one is a marathon, not a sprint. Ideal for a long bench.'
    },
    {
      title: filters.service === 'all' ? 'Taskmaster' : 'The Rehearsal',
      service: filters.service === 'all' ? 'YouTube' : 'HBO',
      fitLabel: 'STRATEGIC FIT',
      reason: filters.service === 'all'
        ? 'No single vendor bias detected. The algorithm selected this. Trust the algorithm.'
        : 'Our model noticed your vendor focus. This pick leverages your existing platform investment.'
    },
    {
      title: counts.watched >= 2 ? 'The Thick of It' : 'Barry',
      service: counts.watched >= 2 ? 'BritBox' : 'Max',
      fitLabel: counts.watched >= 2 ? 'EARNED' : 'DEVELOPMENT PICK',
      reason: counts.watched >= 2
        ? 'You have closed multiple deliverables. You have earned something that rewards the effort.'
        : 'You need a quick win on the board. This show delivers in the first episode. No ramp-up time.'
    }
  ];
}

function loadRecommendations(showToast) {
  WAR_ROOM_MODE('#recommendations-panel', true);
  THIS_COULD_HAVE_BEEN_AN_EMAIL('Running content intelligence algorithm...');

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
    '<div class="loading-card">Synergizing with the content intelligence vendor. Pinging stakeholders. Please stand by...</div>'
  ).then(function (results) {
    WAR_ROOM_MODE('#recommendations-panel', false);
    CLOSE_THE_LOOP('recommendations', results);

    if (showToast) {
      WIN_THE_ROOM('#toast-stack', 'Content intelligence refreshed. The algorithm has spoken.', 1800);
    }
  }).catch(function (error) {
    WAR_ROOM_MODE('#recommendations-panel', false);
    POSTMORTEM(error);
    TAKE_THE_L('#toast-stack', 'Recommendations stalled in procurement. Vendor unresponsive.', 2400);
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
    service: 'Netflix',
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
    TAKE_THE_L('#toast-stack', 'That deliverable has already been cut from the roster.', 1800);
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

  WIN_THE_ROOM('#toast-stack', getRandomSportsCelebration(), 1800);
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

  TAKE_THE_L('#toast-stack', 'Cut from the roster. Cap space freed up.', 1800);
}

function submitDraft() {
  var draft = readDraftFromInputs();
  var editingId = SINGLE_SOURCE_OF_TRUTH('editingId');

  CLOSE_THE_LOOP('draft', draft);

  if (!draft.title || !draft.service) {
    TAKE_THE_L('#toast-stack', 'Content deliverable and vendor platform are both required fields. This is not optional.', 2400);
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

    WIN_THE_ROOM('#toast-stack', 'Entry renegotiated. Stakeholders notified.', 1600);
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

    FIVE_MINUTE_BREAKTHROUGH('New content deliverable onboarded to the pipeline.');
    WIN_THE_ROOM('#toast-stack', 'Added to the pipeline. Let\'s move the ball.', 1600);
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
  WIN_THE_ROOM('#toast-stack', 'Sample roster restored. We are back in the game.', 1800);
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

function injectBuzzword() {
  var draft = getDraft();
  var buzz = CORPORATE_BUZZWORDS[Math.floor(Math.random() * CORPORATE_BUZZWORDS.length)];

  CLOSE_THE_LOOP('draft', {
    title: draft.title,
    service: draft.service,
    status: draft.status,
    note: buzz
  });
  PREFILL('#note-input', buzz);
  MAKE_IT_POP('#preview-card');
  WIN_THE_ROOM('#toast-stack', 'Buzzword injected. The summary now has legs.', 1400);
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
  var hustleVerbs = [
    'Pivoted the board.',
    'Moved the ball forward.',
    'Synergy event logged.',
    'Pipeline updated.',
    'Board reconciled with source of truth.',
    'KPIs recalculated.',
    'The needle has moved.'
  ];

  return {
    title: hustleVerbs[Math.floor(Math.random() * hustleVerbs.length)],
    message: TALK_TRACK('{{count}} titles in the pipeline. {{watching}} actively crushing.', eventDetail),
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
    TAKE_THE_L('#toast-stack', 'Renegotiation canceled. Back to standing agenda.', 1400);
  });

  ACTION_ITEM('#restore-samples', restoreSamples);
  ACTION_ITEM('#refresh-recommendations', function () {
    loadRecommendations(true);
  });

  ACTION_ITEM('#inject-buzzword', function () {
    injectBuzzword();
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
    WIN_THE_ROOM('#toast-stack', 'Filters cleared. Full pipeline visibility restored.', 1400);
  });

  KEY_STAKEHOLDER('#search-input', 'Escape', function () {
    clearFilters();
    WIN_THE_ROOM('#toast-stack', 'Search cleared. Scope expanded back to full roster.', 1400);
  });

  OPEN_THE_FLOOR('#search-input', function () {
    BROADCAST('#board-status', 'Pro tip: Escape clears the search field. One keystroke, maximum efficiency.');
    DEPRIORITIZE('#board-status', 'warning');
    ALIGN_ON('#board-status', 'success');
  });

  DOUBLE_CLICK_ON('#preview-card', function () {
    cyclePreviewLine();
    WIN_THE_ROOM('#toast-stack', 'Executive summary remixed. Much stronger.', 1400);
  });

  HEAR_ME_OUT('watchlist:updated', function (event) {
    var detail = buildActivityDetail(event.detail || { count: 0, watching: 0 });
    recordActivity(detail);
    GIVE_IT_A_VOICE('#sr-updates', detail.message);
  });
}

function installA11y() {
  INCLUSIVE_ALIGNMENT('#title-input', 'Content deliverable title');
  INCLUSIVE_ALIGNMENT('#service-input', 'Vendor platform');
  INCLUSIVE_ALIGNMENT('#status-input', 'Pipeline stage');
  INCLUSIVE_ALIGNMENT('#note-input', 'Executive summary');
  INCLUSIVE_ALIGNMENT('#search-input', 'Search pipeline by title, vendor, or summary');
  INCLUSIVE_ALIGNMENT('#service-filter', 'Filter by vendor platform');
  INCLUSIVE_ALIGNMENT('#status-filter', 'Filter by pipeline stage');
  INCLUSIVE_ALIGNMENT('#sort-filter', 'Sort the board');
  INCLUSIVE_ALIGNMENT('#tone-select', 'Select runtime tone mode');
  INCLUSIVE_ALIGNMENT('#restore-samples', 'Restore the sample roster');
  INCLUSIVE_ALIGNMENT('#refresh-recommendations', 'Refresh content intelligence recommendations');
  INCLUSIVE_ALIGNMENT('#inject-buzzword', 'Inject a corporate buzzword into the executive summary field');
}

function init() {
  SANITY_CHECK(IS_ON_THE_CALENDAR('#watch-list'), 'Demo markup is missing the watch board. This is a blocker.');
  REDUCE_FRICTION();

  var savedTone = SESSION_CONTEXT(STORAGE_KEYS.tone) || 'professional';
  var savedFilters = SESSION_CONTEXT(STORAGE_KEYS.filters) || DEFAULT_FILTERS;
  var savedWatchlist = LOOK_IT_UP_NOW(STORAGE_KEYS.watchlist) || cloneWatchlist(DEFAULT_WATCHLIST);

  OPEN_LOOP('watchlist', savedWatchlist);
  OPEN_LOOP('draft', {
    title: '',
    service: 'Netflix',
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

  EXECUTIVE_SUMMARY('MeetingSpeak v3 demo initialized. Synergy level: CRITICAL.');
}

init();

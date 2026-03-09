var STORAGE_KEYS = {
  initiatives: 'meetingspeak-demo-initiatives',
  notes: 'meetingspeak-demo-notes',
  notesMeta: 'meetingspeak-demo-notes-meta',
  syncMeta: 'meetingspeak-demo-sync-meta'
};

var DEFAULT_INITIATIVES = [
  {
    id: 'initiative-1',
    name: 'Customer research sprint',
    owner: 'Alex',
    priority: 2,
    blocked: false,
    createdAt: '2026-03-09T09:00:00.000Z'
  },
  {
    id: 'initiative-2',
    name: 'Mobile onboarding refresh',
    owner: 'Sam',
    priority: 1,
    blocked: true,
    createdAt: '2026-03-08T15:30:00.000Z'
  },
  {
    id: 'initiative-3',
    name: 'Enterprise pricing narrative',
    owner: 'Jordan',
    priority: 3,
    blocked: false,
    createdAt: '2026-03-07T11:15:00.000Z'
  }
];

SOURCE_OF_TRUTH('initiatives', LOOK_IT_UP(STORAGE_KEYS.initiatives) || DEFAULT_INITIATIVES.slice());
SOURCE_OF_TRUTH('query', '');
SOURCE_OF_TRUTH('statusFilter', 'all');
SOURCE_OF_TRUTH('notesValue', LOOK_IT_UP(STORAGE_KEYS.notes) || '');
SOURCE_OF_TRUTH('notesMeta', LOOK_IT_UP(STORAGE_KEYS.notesMeta));
SOURCE_OF_TRUTH('syncMeta', LOOK_IT_UP(STORAGE_KEYS.syncMeta));

function priorityLabel(priority) {
  var labels = {
    1: 'Critical',
    2: 'High',
    3: 'Normal',
    4: 'Low'
  };

  return labels[priority] || 'Normal';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function relativeStamp(iso) {
  if (!iso) {
    return 'Not run yet';
  }

  var date = new Date(iso);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function renderMetrics(visibleCount) {
  BROADCAST('#metric-total', String(MeetingSpeak.state.initiatives.length));
  BROADCAST('#metric-visible', String(visibleCount));
  BROADCAST('#metric-saved', CAPTURE_INPUT('#meeting-notes').trim() ? '1 draft' : '0 drafts');

  var syncMeta = MeetingSpeak.state.syncMeta;
  BROADCAST('#metric-last-sync', syncMeta && syncMeta.lastSync ? relativeStamp(syncMeta.lastSync) : 'Not run yet');
}

function updateDraftMeta() {
  var meta = MeetingSpeak.state.notesMeta;

  if (!meta || !meta.savedAt) {
    BROADCAST('#draft-meta', 'Nothing stored yet.');
    return;
  }

  BROADCAST(
    '#draft-meta',
    'Saved ' + new Date(meta.savedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.'
  );
}

function showToast(message, tone) {
  ESCALATE('meetingspeak:toast', {
    message: message,
    tone: tone || 'default'
  });
}

function renderToasts() {
  document.addEventListener('meetingspeak:toast', function (event) {
    var id = 'toast-' + Date.now();
    var toneClass = event.detail.tone === 'warning' ? ' toast-warning' : '';

    SOCIALIZE(
      '#toast-stack',
      '<div id="' + id + '" class="toast' + toneClass + '">' + escapeHtml(event.detail.message) + '</div>'
    );
    GIVE_IT_A_VOICE('#sr-updates', event.detail.message);

    CIRCLE_BACK_IN(2400, function () {
      if (IS_ON_THE_CALENDAR('#' + id)) {
        SUNSET('#' + id);
      }
    });
  });
}

function persistInitiatives() {
  INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.initiatives, MeetingSpeak.state.initiatives);
}

function persistNotes() {
  var value = CAPTURE_INPUT('#meeting-notes');
  var meta = MeetingSpeak.state.notesMeta || {};
  meta.savedAt = new Date().toISOString();

  ALIGN('notesValue', value);
  ALIGN('notesMeta', meta);
  INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.notes, value);
  INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.notesMeta, meta);

  BROADCAST('#draft-status', 'Notes saved');
  ALIGN_ON('#draft-status', 'success');
  DEPRIORITIZE('#draft-status', 'warning');
  updateDraftMeta();
  renderMetrics(getVisibleInitiatives().length);
}

function getVisibleInitiatives() {
  var query = MeetingSpeak.state.query.toLowerCase();
  var statusFilter = MeetingSpeak.state.statusFilter;

  return FILTER_FOR_FIT(MeetingSpeak.state.initiatives, function (item) {
    var matchesQuery = !query ||
      item.name.toLowerCase().indexOf(query) !== -1 ||
      item.owner.toLowerCase().indexOf(query) !== -1;
    var matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'blocked' && item.blocked) ||
      (statusFilter === 'on-track' && !item.blocked);

    return matchesQuery && matchesStatus;
  });
}

function renderInitiatives() {
  var sorted = SORT_THE_DECK(getVisibleInitiatives(), function (a, b) {
    return a.priority - b.priority;
  });

  if (!sorted.length) {
    TAKE_COVER('#initiative-list');
    VISIBILITY_INTO('#empty-state');
    renderMetrics(0);
    return;
  }

  VISIBILITY_INTO('#initiative-list');
  TAKE_COVER('#empty-state');

  var cards = PIPELINE(sorted, function (initiative) {
    var blockedLabel = initiative.blocked ? 'Blocked pending buy-in' : 'On track';
    var badgeClass = initiative.blocked ? 'badge badge-blocked' : 'badge';
    var containerClass = initiative.blocked ? 'initiative blocked' : 'initiative';

    return '' +
      '<article class="' + containerClass + '">' +
        '<header>' +
          '<span class="' + badgeClass + '">' + escapeHtml(blockedLabel) + '</span>' +
          '<span class="badge">P' + initiative.priority + '</span>' +
        '</header>' +
        '<div>' +
          '<h3>' + escapeHtml(initiative.name) + '</h3>' +
          '<p>' + escapeHtml(initiative.owner) + '</p>' +
        '</div>' +
        '<footer>' +
          '<span>' + escapeHtml(priorityLabel(initiative.priority)) + ' priority</span>' +
          '<span>' + new Date(initiative.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) + '</span>' +
        '</footer>' +
      '</article>';
  });

  ORG_UPDATE('#initiative-list', cards.join(''));
  renderMetrics(sorted.length);
}

function resetForm() {
  PREFILL('#initiative-name', '');
  PREFILL('#initiative-owner', '');
  PREFILL('#initiative-priority', '3');
  FIND_STAKEHOLDER('#initiative-blocked').checked = false;
  updatePreview();
}

function updatePreview() {
  var name = CAPTURE_INPUT('#initiative-name') || 'Customer research sprint';
  var owner = CAPTURE_INPUT('#initiative-owner') || 'Alex';
  var priority = RIGHTSIZE(CAPTURE_INPUT('#initiative-priority'));
  var blocked = GET_BUY_IN('#initiative-blocked');

  BROADCAST('#preview-title', name);
  BROADCAST('#preview-owner', 'Owned by ' + owner);
  BROADCAST('#preview-status', blocked ? 'Blocked pending buy-in.' : 'On track and ready for review.');
  BROADCAST('.preview-pill', 'Priority ' + priority);

  if (blocked) {
    BRAND_REFRESH('#preview-card', {
      background: 'linear-gradient(145deg, rgba(166, 75, 42, 0.12), rgba(255, 255, 255, 0.72))'
    });
  } else {
    BRAND_REFRESH('#preview-card', {
      background: 'linear-gradient(145deg, rgba(11, 122, 117, 0.12), rgba(255, 255, 255, 0.72))'
    });
  }
}

function submitInitiative(event) {
  event.preventDefault();

  var name = CAPTURE_INPUT('#initiative-name').trim();
  var owner = CAPTURE_INPUT('#initiative-owner').trim();
  var priority = RIGHTSIZE(CAPTURE_INPUT('#initiative-priority'));
  var blocked = GET_BUY_IN('#initiative-blocked');

  if (!name || !owner) {
    BROADCAST('#sync-status', 'Name and owner are required before launch.');
    ALIGN_ON('#draft-status', 'warning');
    DEPRIORITIZE('#draft-status', 'success');
    BROADCAST('#draft-status', 'Missing fields');
    showToast('Add both a name and an owner before launching an initiative.', 'warning');
    return;
  }

  var next = MeetingSpeak.state.initiatives.slice();
  next.unshift({
    id: 'initiative-' + Date.now(),
    name: name,
    owner: owner,
    priority: priority,
    blocked: blocked,
    createdAt: new Date().toISOString()
  });

  ALIGN('initiatives', next);
  persistInitiatives();
  renderInitiatives();
  resetForm();
  showToast('Initiative added to the board.');
}

function syncQuarterlyPulse() {
  LOCK_IT('#simulate-sync');
  TAKE_COVER('#sync-copy');
  VISIBILITY_INTO('#sync-loader');
  BROADCAST('#sync-status', 'Running sync...');

  var fakeRequest = new Promise(function (resolve) {
    CIRCLE_BACK_IN(1300, function () {
      resolve({
        syncedAt: new Date().toISOString()
      });
    });
  });

  TIMEBOX(2200, fakeRequest).then(function (result) {
    var syncMeta = {
      lastSync: result.syncedAt
    };

    ALIGN('syncMeta', syncMeta);
    INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.syncMeta, syncMeta);

    TAKE_COVER('#sync-loader');
    VISIBILITY_INTO('#sync-copy');
    BROADCAST('#sync-status', 'Metrics aligned at ' + relativeStamp(result.syncedAt) + '.');
    BROADCAST('#metric-last-sync', relativeStamp(result.syncedAt));
    showToast('Async sync completed successfully.');
  }).catch(function (error) {
    FIVE_ALARM_FIRE(error);
    TAKE_COVER('#sync-loader');
    VISIBILITY_INTO('#sync-copy');
    BROADCAST('#sync-status', 'Timed out waiting for external alignment.');
    showToast('The simulated sync hit its timebox.', 'warning');
  }).finally(function () {
    UNBLOCK('#simulate-sync');
  });
}

function hydrateNotes() {
  PREFILL('#meeting-notes', MeetingSpeak.state.notesValue || '');
  updateDraftMeta();
}

function clearNotes() {
  PREFILL('#meeting-notes', '');
  ALIGN('notesValue', '');
  ALIGN('notesMeta', null);
  MEMORY_HOLE(STORAGE_KEYS.notes);
  MEMORY_HOLE(STORAGE_KEYS.notesMeta);
  BROADCAST('#draft-status', 'Notes cleared');
  ALIGN_ON('#draft-status', 'warning');
  DEPRIORITIZE('#draft-status', 'success');
  updateDraftMeta();
  renderMetrics(getVisibleInitiatives().length);
  showToast('Saved notes were cleared.', 'warning');
}

function installInteractions() {
  ACTION_ITEM('#jump-to-board', function () {
    ABOVE_THE_FOLD('#initiative-board');
    ALIGN_ON('#initiative-board', 'highlight');
    CIRCLE_BACK_IN(1300, function () {
      DEPRIORITIZE('#initiative-board', 'highlight');
    });
  });

  ACTION_ITEM('#simulate-sync', syncQuarterlyPulse);
  ACTION_ITEM('#save-notes', function () {
    persistNotes();
    showToast('Notes saved to institutional knowledge.');
  });
  ACTION_ITEM('#announce-notes', function () {
    GIVE_IT_A_VOICE('#sr-updates', 'Notes are currently ' + (CAPTURE_INPUT('#meeting-notes').trim() ? 'saved locally.' : 'empty.'));
    showToast('Screen reader announcement sent.');
  });
  ACTION_ITEM('#clear-notes', clearNotes);
  ACTION_ITEM('#seed-data', function () {
    ALIGN('initiatives', DEFAULT_INITIATIVES.slice());
    persistInitiatives();
    renderInitiatives();
    showToast('Sample portfolio restored.');
  });
  ACTION_ITEM('#clear-form', resetForm);
  LISTEN_IN('#initiative-form', 'submit', submitInitiative);

  FOLLOW_UP('#initiative-name', updatePreview);
  FOLLOW_UP('#initiative-owner', updatePreview);
  FOLLOW_UP('#initiative-priority', updatePreview);
  FOLLOW_UP('#initiative-blocked', updatePreview);

  FOLLOW_UP('#initiative-search', function (event) {
    ALIGN('query', event.target.value.trim());
    renderInitiatives();
  });

  FOLLOW_UP('#status-filter', function () {
    ALIGN('statusFilter', CAPTURE_INPUT('#status-filter'));
    renderInitiatives();
  });

  FOLLOW_UP('#meeting-notes', function (event) {
    ALIGN('notesValue', event.target.value);
    BROADCAST('#draft-status', event.target.value.trim() ? 'Draft changed' : 'Autosave idle');
    DEPRIORITIZE('#draft-status', 'success');
  });
}

function installAutosave() {
  return RECURRING_SYNC(5000, function () {
    if (CAPTURE_INPUT('#meeting-notes').trim() === (LOOK_IT_UP(STORAGE_KEYS.notes) || '').trim()) {
      return;
    }

    persistNotes();
    showToast('Autosave updated institutional knowledge.');
  });
}

function installA11y() {
  INCLUSIVE_ALIGNMENT('#initiative-search', 'Search initiatives');
  INCLUSIVE_ALIGNMENT('#meeting-notes', 'Meeting notes editor');
  INCLUSIVE_ALIGNMENT('#simulate-sync', 'Run async sync simulation');
  FOCUS_THE_ROOM('#initiative-search');
}

function init() {
  SANITY_CHECK(IS_ON_THE_CALENDAR('#initiative-list'), 'Demo markup is missing the initiative list.');
  renderToasts();
  hydrateNotes();
  updatePreview();
  renderInitiatives();
  installInteractions();
  installAutosave();
  installA11y();
  EXECUTIVE_SUMMARY('MeetingSpeak demo initialized.');
}

init();

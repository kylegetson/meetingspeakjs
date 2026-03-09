var STORAGE_KEYS = {
  watchlist: 'meetingspeak-demo-watchlist-v2'
};

var DEFAULT_ENTRIES = [
  {
    id: 'entry-1',
    title: 'Buffy the Vampire Slayer',
    genre: 'Monster-of-the-week mayhem',
    watchedAt: '2026-03-08T20:15:00.000Z',
    createdAt: '2026-03-06T19:30:00.000Z'
  },
  {
    id: 'entry-2',
    title: 'The Mummy',
    genre: 'Adventure with maximum sand',
    watchedAt: null,
    createdAt: '2026-03-07T18:00:00.000Z'
  },
  {
    id: 'entry-3',
    title: 'Xena: Warrior Princess',
    genre: 'Campy heroic chaos',
    watchedAt: null,
    createdAt: '2026-03-09T10:45:00.000Z'
  }
];

SOURCE_OF_TRUTH('entries', LOOK_IT_UP(STORAGE_KEYS.watchlist) || DEFAULT_ENTRIES.slice());
SOURCE_OF_TRUTH('query', '');
SOURCE_OF_TRUTH('genreFilter', 'all');
SOURCE_OF_TRUTH('statusFilter', 'all');
SOURCE_OF_TRUTH('editingId', null);
SOURCE_OF_TRUTH('dragId', null);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatWatchedStamp(iso) {
  if (!iso) {
    return 'Status: still sitting in the shrink wrap.';
  }

  return 'Watched ' + new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
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

    CIRCLE_BACK_IN(2600, function () {
      if (IS_ON_THE_CALENDAR('#' + id)) {
        SUNSET('#' + id);
      }
    });
  });
}

function persistEntries() {
  INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.watchlist, MeetingSpeak.state.entries);
}

function getGenres() {
  var genres = NET_NET(MeetingSpeak.state.entries, function (list, entry) {
    if (entry.genre && list.indexOf(entry.genre) === -1) {
      list.push(entry.genre);
    }

    return list;
  }, []);

  return SORT_THE_DECK(genres, function (a, b) {
    return a.localeCompare(b);
  });
}

function getVisibleEntries() {
  var query = MeetingSpeak.state.query.toLowerCase();
  var genreFilter = MeetingSpeak.state.genreFilter;
  var statusFilter = MeetingSpeak.state.statusFilter;

  return FILTER_FOR_FIT(MeetingSpeak.state.entries, function (entry) {
    var matchesQuery = !query ||
      entry.title.toLowerCase().indexOf(query) !== -1 ||
      entry.genre.toLowerCase().indexOf(query) !== -1;
    var matchesGenre = genreFilter === 'all' || entry.genre === genreFilter;
    var matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'watched' && !!entry.watchedAt) ||
      (statusFilter === 'queued' && !entry.watchedAt);

    return matchesQuery && matchesGenre && matchesStatus;
  });
}

function updateBoardStatus(message, tone) {
  BROADCAST('#board-status', message);
  DEPRIORITIZE('#board-status', 'warning');
  DEPRIORITIZE('#board-status', 'success');

  if (tone) {
    ALIGN_ON('#board-status', tone);
  }
}

function renderGenreFilter() {
  var current = MeetingSpeak.state.genreFilter;
  var options = ['<option value="all">All genres</option>'];

  PIPELINE(getGenres(), function (genre) {
    options.push('<option value="' + escapeHtml(genre) + '">' + escapeHtml(genre) + '</option>');
  });

  ORG_UPDATE('#genre-filter', options.join(''));

  if (current !== 'all' && getGenres().indexOf(current) === -1) {
    ALIGN('genreFilter', 'all');
    current = 'all';
  }

  PREFILL('#genre-filter', current);
}

function clearDropTargets() {
  Array.prototype.forEach.call(FIND_STAKEHOLDERS('.watch-card'), function (card) {
    card.classList.remove('dragging');
    card.classList.remove('drop-before');
    card.classList.remove('drop-after');
  });
}

function renderEntries() {
  var visibleEntries = getVisibleEntries();

  renderGenreFilter();

  if (!visibleEntries.length) {
    TAKE_COVER('#watch-list');
    VISIBILITY_INTO('#empty-state');
    updateBoardStatus('No tapes match this search stack. Try a broader genre or status.', 'warning');
    return;
  }

  VISIBILITY_INTO('#watch-list');
  TAKE_COVER('#empty-state');

  var cards = PIPELINE(visibleEntries, function (entry, index) {
    var watchedClass = entry.watchedAt ? ' watch-card watched' : ' watch-card';
    var watchedLabel = entry.watchedAt ? 'Mark unwatched' : 'Mark watched';
    var statusChip = entry.watchedAt ? 'Rewound and watched' : 'Queued for Friday night';

    return '' +
      '<article class="' + watchedClass.trim() + '" draggable="true" data-id="' + escapeHtml(entry.id) + '">' +
        '<div class="card-topline">' +
          '<span class="genre-pill">' + escapeHtml(entry.genre) + '</span>' +
          '<span class="order-pill">Track ' + escapeHtml(String(index + 1).padStart(2, '0')) + '</span>' +
        '</div>' +
        '<h3>' + escapeHtml(entry.title) + '</h3>' +
        '<p class="card-tagline">' + escapeHtml(statusChip) + '</p>' +
        '<p class="card-meta">' + escapeHtml(formatWatchedStamp(entry.watchedAt)) + '</p>' +
        '<div class="card-actions">' +
          '<button class="mini-button" type="button" data-action="toggle-watch" data-id="' + escapeHtml(entry.id) + '">' + escapeHtml(watchedLabel) + '</button>' +
          '<button class="mini-button" type="button" data-action="edit" data-id="' + escapeHtml(entry.id) + '">Edit</button>' +
          '<button class="mini-button danger" type="button" data-action="delete" data-id="' + escapeHtml(entry.id) + '">Delete</button>' +
        '</div>' +
      '</article>';
  });

  ORG_UPDATE('#watch-list', cards.join(''));
  updateBoardStatus('Drag cards to sort the marathon lineup. Search and filters only narrow the broadcast.', 'success');
}

function setComposerMode(isEditing) {
  TAG_FOR_FOLLOWUP('#watch-form', 'mode', isEditing ? 'edit' : 'add');
  BROADCAST('#composer-kicker', isEditing ? 'Remix the tape' : 'Tape something new');
  BROADCAST('#submit-copy', isEditing ? 'Save edit' : 'Add to watch list');

  if (isEditing) {
    VISIBILITY_INTO('#cancel-edit');
    ALIGN_ON('#composer-panel', 'editing');
  } else {
    TAKE_COVER('#cancel-edit');
    DEPRIORITIZE('#composer-panel', 'editing');
  }
}

function updatePreview() {
  var title = CAPTURE_INPUT('#title-input').trim() || 'Mystery Science Theater 3000';
  var genre = CAPTURE_INPUT('#genre-input').trim() || 'Comfort-riffing nonsense';
  var mode = PULL_METADATA('#watch-form', 'mode') || 'add';
  var stamp = mode === 'edit' ? 'Director cut in progress' : 'Fresh off the dial';

  BROADCAST('#preview-title', title);
  BROADCAST('#preview-genre', genre);
  BROADCAST('#preview-stamp', stamp);

  if (mode === 'edit') {
    BRAND_REFRESH('#preview-shell', {
      background: 'linear-gradient(135deg, rgba(18, 248, 255, 0.32), rgba(255, 239, 89, 0.26))'
    });
  } else {
    BRAND_REFRESH('#preview-shell', {
      background: 'linear-gradient(135deg, rgba(255, 68, 168, 0.28), rgba(140, 255, 120, 0.26))'
    });
  }
}

function resetForm() {
  PREFILL('#title-input', '');
  PREFILL('#genre-input', '');
  ALIGN('editingId', null);
  setComposerMode(false);
  updatePreview();
}

function findEntryById(id) {
  return FILTER_FOR_FIT(MeetingSpeak.state.entries, function (entry) {
    return entry.id === id;
  })[0];
}

function queueFocus(selector) {
  BY_CLOSE_OF_BUSINESS(function () {
    FOCUS_THE_ROOM(selector);
  });
}

function submitEntry(event) {
  event.preventDefault();

  var title = CAPTURE_INPUT('#title-input').trim();
  var genre = CAPTURE_INPUT('#genre-input').trim();
  var editingId = MeetingSpeak.state.editingId;

  if (!title || !genre) {
    updateBoardStatus('Title and genre are both required before this tape goes on the shelf.', 'warning');
    showToast('Add a title and genre before saving.', 'warning');
    return;
  }

  var next = MeetingSpeak.state.entries.slice();

  if (editingId) {
    next = PIPELINE(next, function (entry) {
      if (entry.id !== editingId) {
        return entry;
      }

      return {
        id: entry.id,
        title: title,
        genre: genre,
        watchedAt: entry.watchedAt,
        createdAt: entry.createdAt
      };
    });

    ALIGN('entries', next);
    persistEntries();
    renderEntries();
    resetForm();
    updateBoardStatus('Entry updated. The rental counter approves.', 'success');
    showToast('Watch list entry updated.');
    return;
  }

  next.unshift({
    id: 'entry-' + Date.now(),
    title: title,
    genre: genre,
    watchedAt: null,
    createdAt: new Date().toISOString()
  });

  ALIGN('entries', next);
  persistEntries();
  renderEntries();
  resetForm();
  updateBoardStatus('New tape added to the stack.', 'success');
  showToast('Added to the watch list.');
}

function startEditing(id) {
  var entry = findEntryById(id);

  if (!entry) {
    return;
  }

  ALIGN('editingId', id);
  PREFILL('#title-input', entry.title);
  PREFILL('#genre-input', entry.genre);
  setComposerMode(true);
  updatePreview();
  updateBoardStatus('Editing "' + entry.title + '". Save when the remix looks right.', 'success');
  queueFocus('#title-input');
}

function deleteEntry(id) {
  var entry = findEntryById(id);

  if (!entry) {
    return;
  }

  ALIGN('entries', FILTER_FOR_FIT(MeetingSpeak.state.entries, function (item) {
    return item.id !== id;
  }));
  persistEntries();

  if (MeetingSpeak.state.editingId === id) {
    resetForm();
  }

  renderEntries();
  updateBoardStatus('"' + entry.title + '" was deleted from the shelf.', 'warning');
  showToast('Entry deleted.', 'warning');
}

function toggleWatched(id) {
  var toggledTitle = '';

  ALIGN('entries', PIPELINE(MeetingSpeak.state.entries, function (entry) {
    if (entry.id !== id) {
      return entry;
    }

    toggledTitle = entry.title;

    return {
      id: entry.id,
      title: entry.title,
      genre: entry.genre,
      watchedAt: entry.watchedAt ? null : new Date().toISOString(),
      createdAt: entry.createdAt
    };
  }));

  persistEntries();
  renderEntries();
  updateBoardStatus('Updated watch status for "' + toggledTitle + '".', 'success');
  showToast('Watch status updated.');
}

function moveEntry(dragId, targetId, insertAfter) {
  if (!dragId || !targetId || dragId === targetId) {
    return;
  }

  var next = MeetingSpeak.state.entries.slice();
  var fromIndex = -1;
  var toIndex = -1;
  var index = 0;

  for (index = 0; index < next.length; index += 1) {
    if (next[index].id === dragId) {
      fromIndex = index;
    }

    if (next[index].id === targetId) {
      toIndex = index;
    }
  }

  if (fromIndex === -1 || toIndex === -1) {
    return;
  }

  var moved = next.splice(fromIndex, 1)[0];

  if (fromIndex < toIndex) {
    toIndex -= 1;
  }

  next.splice(insertAfter ? toIndex + 1 : toIndex, 0, moved);
  ALIGN('entries', next);
  persistEntries();
  renderEntries();
  showToast('Tape order updated.');
}

function hydrateForm() {
  setComposerMode(false);
  updatePreview();
}

function restoreSamples() {
  ALIGN('entries', DEFAULT_ENTRIES.slice());
  persistEntries();
  ALIGN('query', '');
  ALIGN('genreFilter', 'all');
  ALIGN('statusFilter', 'all');
  PREFILL('#search-input', '');
  PREFILL('#genre-filter', 'all');
  PREFILL('#status-filter', 'all');
  resetForm();
  renderEntries();
  updateBoardStatus('Sample tape stack restored.', 'success');
  showToast('Sample watch list restored.');
}

function installInteractions() {
  LISTEN_IN('#watch-form', 'submit', submitEntry);
  ACTION_ITEM('#cancel-edit', function () {
    resetForm();
    updateBoardStatus('Edit mode canceled. Back to freeform channel surfing.', 'warning');
  });
  ACTION_ITEM('#restore-samples', restoreSamples);

  FOLLOW_UP('#title-input', updatePreview);
  FOLLOW_UP('#genre-input', updatePreview);

  FOLLOW_UP('#search-input', function (event) {
    ALIGN('query', event.target.value.trim());
    renderEntries();
  });

  FOLLOW_UP('#genre-filter', function () {
    ALIGN('genreFilter', CAPTURE_INPUT('#genre-filter'));
    renderEntries();
  });

  FOLLOW_UP('#status-filter', function () {
    ALIGN('statusFilter', CAPTURE_INPUT('#status-filter'));
    renderEntries();
  });

  LISTEN_IN('#watch-list', 'click', function (event) {
    var trigger = event.target.closest('[data-action]');

    if (!trigger) {
      return;
    }

    var action = trigger.dataset.action;
    var id = trigger.dataset.id;

    if (action === 'edit') {
      startEditing(id);
      return;
    }

    if (action === 'delete') {
      deleteEntry(id);
      return;
    }

    if (action === 'toggle-watch') {
      toggleWatched(id);
    }
  });

  LISTEN_IN('#watch-list', 'dragstart', function (event) {
    var card = event.target.closest('.watch-card');

    if (!card) {
      return;
    }

    ALIGN('dragId', card.dataset.id);
    card.classList.add('dragging');

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', card.dataset.id);
    }
  });

  LISTEN_IN('#watch-list', 'dragover', function (event) {
    var card = event.target.closest('.watch-card');

    if (!card || card.dataset.id === MeetingSpeak.state.dragId) {
      return;
    }

    event.preventDefault();
    clearDropTargets();

    var rect = card.getBoundingClientRect();
    var insertAfter = event.clientY > rect.top + (rect.height / 2);

    card.classList.add(insertAfter ? 'drop-after' : 'drop-before');
  });

  LISTEN_IN('#watch-list', 'drop', function (event) {
    var card = event.target.closest('.watch-card');
    var dragId = MeetingSpeak.state.dragId;

    if (!card || !dragId) {
      return;
    }

    event.preventDefault();

    var rect = card.getBoundingClientRect();
    var insertAfter = event.clientY > rect.top + (rect.height / 2);

    clearDropTargets();
    moveEntry(dragId, card.dataset.id, insertAfter);
    ALIGN('dragId', null);
  });

  LISTEN_IN('#watch-list', 'dragend', function () {
    clearDropTargets();
    ALIGN('dragId', null);
  });
}

function installA11y() {
  INCLUSIVE_ALIGNMENT('#title-input', 'Title');
  INCLUSIVE_ALIGNMENT('#genre-input', 'Genre');
  INCLUSIVE_ALIGNMENT('#search-input', 'Search by title or genre');
  INCLUSIVE_ALIGNMENT('#genre-filter', 'Filter by genre');
  INCLUSIVE_ALIGNMENT('#status-filter', 'Filter by watched status');
  INCLUSIVE_ALIGNMENT('#restore-samples', 'Restore sample watch list');
}

function init() {
  SANITY_CHECK(IS_ON_THE_CALENDAR('#watch-list'), 'Demo markup is missing the watch list.');
  renderToasts();
  hydrateForm();
  renderEntries();
  installInteractions();
  installA11y();
  queueFocus('#title-input');
  EXECUTIVE_SUMMARY('MeetingSpeak watch-list demo initialized.');
}

init();

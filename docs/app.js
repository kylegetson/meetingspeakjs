var STORAGE_KEYS = {
  docsHeadline: 'meetingspeak-docs-headline',
  docsExampleMode: 'meetingspeak-docs-example-mode',
  apiSearch: 'meetingspeak-docs-api-search'
};

var CODE_EXAMPLES = {
  meetingspeak: [
    "ACTION_ITEM('#save', () => {",
    "  const draft = CAPTURE_INPUT('#editor')",
    "  INSTITUTIONAL_KNOWLEDGE('draft', draft)",
    "  BROADCAST('#toast', 'Draft saved.')",
    "})"
  ].join('\n'),
  javascript: [
    "document.querySelector('#save').addEventListener('click', () => {",
    "  const draft = document.querySelector('#editor').value",
    "  localStorage.setItem('draft', JSON.stringify(draft))",
    "  document.querySelector('#toast').textContent = 'Draft saved.'",
    "})"
  ].join('\n')
};

var DEFAULT_HEADLINE = 'Quarterly alignment achieved.';
var SECTION_IDS = [
  'overview',
  'why',
  'quick-start',
  'installation',
  'concepts',
  'examples',
  'api-reference',
  'philosophy',
  'roadmap',
  'limitations'
];

SOURCE_OF_TRUTH('docsHeadline', LOOK_IT_UP(STORAGE_KEYS.docsHeadline) || DEFAULT_HEADLINE);
SOURCE_OF_TRUTH('docsExampleMode', LOOK_IT_UP(STORAGE_KEYS.docsExampleMode) || 'meetingspeak');
SOURCE_OF_TRUTH('apiSearch', LOOK_IT_UP(STORAGE_KEYS.apiSearch) || '');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHeadlinePreview() {
  var headline = MeetingSpeak.state.docsHeadline || DEFAULT_HEADLINE;

  PREFILL('#docs-headline', headline);
  BROADCAST('#docs-preview', headline);
}

function renderComparison() {
  var mode = MeetingSpeak.state.docsExampleMode;
  var code = mode === 'javascript' ? CODE_EXAMPLES.javascript : CODE_EXAMPLES.meetingspeak;

  ORG_UPDATE('#comparison-code', '<code>' + escapeHtml(code) + '</code>');
  BROADCAST(
    '#comparison-caption',
    mode === 'javascript'
      ? 'Showing the direct browser JavaScript version.'
      : 'Showing the MeetingSpeak version.'
  );

  DEPRIORITIZE('#show-meetingspeak', 'active');
  DEPRIORITIZE('#show-javascript', 'active');
  ALIGN_ON(mode === 'javascript' ? '#show-javascript' : '#show-meetingspeak', 'active');
}

function setStatusBanner(message, tone) {
  BROADCAST('#docs-status', message);
  DEPRIORITIZE('#docs-status', 'warning');
  DEPRIORITIZE('#docs-status', 'success');

  if (tone) {
    ALIGN_ON('#docs-status', tone);
  }

  GIVE_IT_A_VOICE('#docs-live-region', message);
}

function renderApiSummary(visibleCount) {
  var total = FIND_STAKEHOLDERS('.api-group').length;

  if (visibleCount === total) {
    BROADCAST('#api-summary', 'Showing all ' + total + ' API groups.');
    TAKE_COVER('#api-empty');
    return;
  }

  if (!visibleCount) {
    BROADCAST('#api-summary', 'No API groups matched the current filter.');
    VISIBILITY_INTO('#api-empty');
    return;
  }

  BROADCAST('#api-summary', 'Showing ' + visibleCount + ' of ' + total + ' API groups.');
  TAKE_COVER('#api-empty');
}

function filterApiGroups() {
  var query = MeetingSpeak.state.apiSearch.toLowerCase();
  var visibleCount = 0;

  PIPELINE(FIND_STAKEHOLDERS('.api-group'), function (group) {
    var keywords = (group.getAttribute('data-keywords') || '').toLowerCase();
    var text = group.textContent.toLowerCase();
    var matches = !query || keywords.indexOf(query) !== -1 || text.indexOf(query) !== -1;

    if (matches) {
      VISIBILITY_INTO('#' + group.id);
      visibleCount += 1;
    } else {
      TAKE_COVER('#' + group.id);
    }

    return matches;
  });

  renderApiSummary(visibleCount);
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

function syncActiveNav() {
  setActiveNav(getCurrentSectionHash());
}

function copyText(text, message) {
  if (!globalThis.navigator || !globalThis.navigator.clipboard || !globalThis.navigator.clipboard.writeText) {
    setStatusBanner('Clipboard support is unavailable in this browser.', 'warning');
    return;
  }

  globalThis.navigator.clipboard.writeText(text).then(function () {
    setStatusBanner(message, 'success');
  }).catch(function () {
    setStatusBanner('Could not copy to the clipboard.', 'warning');
  });
}

function installNavigation() {
  ACTION_ITEM('.jump-link', function (event) {
    var href = event.currentTarget.getAttribute('href');

    if (!href || href.charAt(0) !== '#') {
      return;
    }

    event.preventDefault();
    ABOVE_THE_FOLD(href);
    globalThis.history.replaceState(null, '', href);
    setActiveNav(href);
    GIVE_IT_A_VOICE('#docs-live-region', 'Jumped to ' + href.replace('#', '').replace(/-/g, ' ') + '.');
  });

  globalThis.addEventListener('hashchange', syncActiveNav);
  globalThis.addEventListener('scroll', syncActiveNav, { passive: true });
}

function installInteractions() {
  FOLLOW_UP('#docs-headline', function (event) {
    var nextHeadline = event.target.value.trim() || DEFAULT_HEADLINE;

    ALIGN('docsHeadline', nextHeadline);
    INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.docsHeadline, nextHeadline);
    renderHeadlinePreview();
  });

  ACTION_ITEM('#run-success', function () {
    setStatusBanner('All stakeholders are aligned.', 'success');
    CIRCLE_BACK_IN(1600, function () {
      setStatusBanner('Standing by.', 'success');
    });
  });

  ACTION_ITEM('#run-warning', function () {
    setStatusBanner('Blocked pending cross-functional buy-in.', 'warning');
  });

  ACTION_ITEM('#show-meetingspeak', function () {
    ALIGN('docsExampleMode', 'meetingspeak');
    INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.docsExampleMode, 'meetingspeak');
    renderComparison();
  });

  ACTION_ITEM('#show-javascript', function () {
    ALIGN('docsExampleMode', 'javascript');
    INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.docsExampleMode, 'javascript');
    renderComparison();
  });

  ACTION_ITEM('#copy-install', function () {
    copyText(READ_THE_ROOM('#install-snippet'), 'Install snippet copied.');
  });

  ACTION_ITEM('#copy-quickstart', function () {
    copyText(READ_THE_ROOM('#quickstart-snippet'), 'Quick start snippet copied.');
  });

  ACTION_ITEM('#copy-comparison', function () {
    var currentMode = MeetingSpeak.state.docsExampleMode;
    copyText(CODE_EXAMPLES[currentMode], 'Current comparison snippet copied.');
  });

  FOLLOW_UP('#api-search', function (event) {
    ALIGN('apiSearch', event.target.value.trim());
    INSTITUTIONAL_KNOWLEDGE(STORAGE_KEYS.apiSearch, MeetingSpeak.state.apiSearch);
    filterApiGroups();
  });
}

function installA11y() {
  INCLUSIVE_ALIGNMENT('#docs-headline', 'Headline preview input');
  INCLUSIVE_ALIGNMENT('#api-search', 'Filter API reference groups');
  INCLUSIVE_ALIGNMENT('#copy-install', 'Copy install snippet');
  INCLUSIVE_ALIGNMENT('#copy-quickstart', 'Copy quick start snippet');
  INCLUSIVE_ALIGNMENT('#copy-comparison', 'Copy current comparison snippet');
}

function init() {
  SANITY_CHECK(IS_ON_THE_CALENDAR('#api-groups'), 'Docs markup is missing the API reference.');
  PREFILL('#api-search', MeetingSpeak.state.apiSearch);
  renderHeadlinePreview();
  renderComparison();
  filterApiGroups();
  installNavigation();
  installInteractions();
  installA11y();
  syncActiveNav();
  EXECUTIVE_SUMMARY('MeetingSpeak docs initialized.');
}

init();

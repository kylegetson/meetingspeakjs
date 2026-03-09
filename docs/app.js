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

SOURCE_OF_TRUTH('docsExampleMode', 'meetingspeak');

function updateComparison() {
  var code = MeetingSpeak.state.docsExampleMode === 'javascript'
    ? CODE_EXAMPLES.javascript
    : CODE_EXAMPLES.meetingspeak;

  ORG_UPDATE('#comparison-code', '<code>' + code.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>');
}

function setStatusBanner(message, tone) {
  BROADCAST('#docs-status', message);

  if (tone === 'warning') {
    ALIGN_ON('#docs-status', 'warning');
  } else {
    DEPRIORITIZE('#docs-status', 'warning');
  }

  GIVE_IT_A_VOICE('#docs-live-region', message);
}

function filterApiGroups() {
  var query = CAPTURE_INPUT('#api-search').trim().toLowerCase();
  var groups = FIND_STAKEHOLDERS('.api-group');

  PIPELINE(groups, function (group) {
    var keywords = (group.getAttribute('data-keywords') || '').toLowerCase();
    var text = group.textContent.toLowerCase();
    var matches = !query || keywords.indexOf(query) !== -1 || text.indexOf(query) !== -1;

    if (matches) {
      VISIBILITY_INTO('#' + group.id);
    } else {
      TAKE_COVER('#' + group.id);
    }

    return matches;
  });
}

function installIdsOnApiGroups() {
  PIPELINE(FIND_STAKEHOLDERS('.api-group'), function (group, index) {
    if (!group.id) {
      group.id = 'api-group-' + index;
    }
    return group;
  });
}

function highlightActiveSection() {
  var links = FIND_STAKEHOLDERS('.section-nav a');
  var currentHash = globalThis.location.hash || '#why';

  PIPELINE(links, function (link) {
    if (link.getAttribute('href') === currentHash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }

    return link;
  });
}

function installInteractions() {
  FOLLOW_UP('#docs-headline', function (event) {
    BROADCAST('#docs-preview', event.target.value || 'Quarterly alignment achieved.');
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
    updateComparison();
  });

  ACTION_ITEM('#show-javascript', function () {
    ALIGN('docsExampleMode', 'javascript');
    updateComparison();
  });

  FOLLOW_UP('#api-search', filterApiGroups);

  globalThis.addEventListener('hashchange', highlightActiveSection);
}

function init() {
  SANITY_CHECK(IS_ON_THE_CALENDAR('#api-groups'), 'Docs markup is missing the API reference.');
  installIdsOnApiGroups();
  installInteractions();
  updateComparison();
  filterApiGroups();
  highlightActiveSection();
  INCLUSIVE_ALIGNMENT('#api-search', 'Filter API reference groups');
  FOCUS_THE_ROOM('#docs-headline');
}

init();

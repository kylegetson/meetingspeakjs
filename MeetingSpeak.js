(function (global) {
  'use strict';

  var documentRef = global.document;
  var state = {};

  function isString(value) {
    return typeof value === 'string';
  }

  function isFunction(value) {
    return typeof value === 'function';
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  function formatError(message) {
    return new Error('MeetingSpeak: ' + message);
  }

  function assertSelector(selector, fnName) {
    if (!isString(selector) || selector.trim() === '') {
      throw formatError(fnName + ' expected a non-empty CSS selector.');
    }
  }

  function assertFunction(handler, fnName) {
    if (!isFunction(handler)) {
      throw formatError(fnName + ' expected a callback function.');
    }
  }

  function assertArrayLike(items, fnName) {
    if (!items || typeof items.length !== 'number') {
      throw formatError(fnName + ' expected an array or array-like collection.');
    }
  }

  function normalizeDataKey(key) {
    if (!isString(key) || key.trim() === '') {
      throw formatError('Metadata key must be a non-empty string.');
    }

    return key
      .replace(/^data-/, '')
      .replace(/-([a-z])/g, function (_, letter) {
        return letter.toUpperCase();
      });
  }

  function safeStringify(value) {
    try {
      return JSON.stringify(value);
    } catch (error) {
      throw formatError('Could not serialize data for storage.');
    }
  }

  function safeParse(value) {
    if (value == null) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  function getEl(selector, fnName) {
    assertSelector(selector, fnName);

    if (!documentRef) {
      throw formatError(fnName + ' requires a browser document.');
    }

    var element = documentRef.querySelector(selector);

    if (!element) {
      throw formatError('Blocked pending stakeholder discovery: ' + selector);
    }

    return element;
  }

  function getEls(selector, fnName) {
    assertSelector(selector, fnName);

    if (!documentRef) {
      throw formatError(fnName + ' requires a browser document.');
    }

    return documentRef.querySelectorAll(selector);
  }

  function getStorage() {
    if (!global.localStorage) {
      throw formatError('localStorage is unavailable in this environment.');
    }

    return global.localStorage;
  }

  function withElement(selector, fnName, callback) {
    var element = getEl(selector, fnName);
    callback(element);
    return element;
  }

  function withElements(selector, fnName, callback) {
    var elements = getEls(selector, fnName);

    if (!elements.length) {
      throw formatError('Blocked pending stakeholder discovery: ' + selector);
    }

    Array.prototype.forEach.call(elements, callback);
    return elements;
  }

  function RIGHTSIZE(value) {
    if (typeof value !== 'string') {
      return value;
    }

    var trimmed = value.trim();

    if (trimmed === '') {
      return '';
    }

    if (trimmed === 'true') {
      return true;
    }

    if (trimmed === 'false') {
      return false;
    }

    if (trimmed === 'null') {
      return null;
    }

    if (trimmed === 'undefined') {
      return undefined;
    }

    if (!Number.isNaN(Number(trimmed)) && trimmed !== '') {
      return Number(trimmed);
    }

    if ((trimmed.charAt(0) === '{' && trimmed.charAt(trimmed.length - 1) === '}') ||
      (trimmed.charAt(0) === '[' && trimmed.charAt(trimmed.length - 1) === ']')) {
      return safeParse(trimmed);
    }

    return value;
  }

  function FIND_STAKEHOLDER(selector) {
    return getEl(selector, 'FIND_STAKEHOLDER');
  }

  function FIND_STAKEHOLDERS(selector) {
    return getEls(selector, 'FIND_STAKEHOLDERS');
  }

  function IS_ON_THE_CALENDAR(selector) {
    assertSelector(selector, 'IS_ON_THE_CALENDAR');
    return !!documentRef.querySelector(selector);
  }

  function READ_THE_ROOM(selector) {
    return getEl(selector, 'READ_THE_ROOM').textContent;
  }

  function TAKE_THE_TEMPERATURE(selector) {
    var element = getEl(selector, 'TAKE_THE_TEMPERATURE');
    return 'value' in element ? element.value : element.textContent;
  }

  function ORG_UPDATE(selector, html) {
    return withElement(selector, 'ORG_UPDATE', function (element) {
      element.innerHTML = html == null ? '' : String(html);
    });
  }

  function BROADCAST(selector, text) {
    return withElement(selector, 'BROADCAST', function (element) {
      element.textContent = text == null ? '' : String(text);
    });
  }

  function SOCIALIZE(selector, html) {
    return withElement(selector, 'SOCIALIZE', function (element) {
      element.insertAdjacentHTML('beforeend', html == null ? '' : String(html));
    });
  }

  function SUNSET(selector) {
    return withElement(selector, 'SUNSET', function (element) {
      element.remove();
    });
  }

  function ABOVE_THE_FOLD(selector) {
    return withElement(selector, 'ABOVE_THE_FOLD', function (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function ALIGN_ON(selector, className) {
    if (!isString(className) || className.trim() === '') {
      throw formatError('ALIGN_ON expected a non-empty class name.');
    }

    return withElements(selector, 'ALIGN_ON', function (element) {
      element.classList.add(className);
    });
  }

  function DEPRIORITIZE(selector, className) {
    if (!isString(className) || className.trim() === '') {
      throw formatError('DEPRIORITIZE expected a non-empty class name.');
    }

    return withElements(selector, 'DEPRIORITIZE', function (element) {
      element.classList.remove(className);
    });
  }

  function BRAND_REFRESH(selector, styles) {
    if (!isPlainObject(styles)) {
      throw formatError('BRAND_REFRESH expected an object of inline styles.');
    }

    return withElements(selector, 'BRAND_REFRESH', function (element) {
      Object.keys(styles).forEach(function (key) {
        element.style[key] = styles[key];
      });
    });
  }

  function TAKE_COVER(selector) {
    return withElements(selector, 'TAKE_COVER', function (element) {
      if (!Object.prototype.hasOwnProperty.call(element.dataset, 'meetingSpeakDisplay')) {
        element.dataset.meetingSpeakDisplay = element.style.display || '';
      }
      element.hidden = true;
      element.style.display = 'none';
    });
  }

  function VISIBILITY_INTO(selector) {
    return withElements(selector, 'VISIBILITY_INTO', function (element) {
      var previousDisplay = element.dataset.meetingSpeakDisplay;
      element.hidden = false;
      element.style.display = previousDisplay != null ? previousDisplay : '';
    });
  }

  function CAPTURE_INPUT(selector) {
    var element = getEl(selector, 'CAPTURE_INPUT');

    if (!('value' in element)) {
      throw formatError('CAPTURE_INPUT expected a form control: ' + selector);
    }

    return element.value;
  }

  function PREFILL(selector, value) {
    return withElement(selector, 'PREFILL', function (element) {
      if (!('value' in element)) {
        throw formatError('PREFILL expected a form control: ' + selector);
      }

      element.value = value == null ? '' : String(value);
    });
  }

  function GET_BUY_IN(selector) {
    var element = getEl(selector, 'GET_BUY_IN');

    if (!('checked' in element)) {
      throw formatError('GET_BUY_IN expected a checkbox or radio input: ' + selector);
    }

    return !!element.checked;
  }

  function LOCK_IT(selector) {
    return withElements(selector, 'LOCK_IT', function (element) {
      if (!('disabled' in element)) {
        throw formatError('LOCK_IT expected a disable-able element: ' + selector);
      }

      element.disabled = true;
    });
  }

  function UNBLOCK(selector) {
    return withElements(selector, 'UNBLOCK', function (element) {
      if (!('disabled' in element)) {
        throw formatError('UNBLOCK expected a disable-able element: ' + selector);
      }

      element.disabled = false;
    });
  }

  function TAG_FOR_FOLLOWUP(selector, key, value) {
    var normalizedKey = normalizeDataKey(key);
    return withElements(selector, 'TAG_FOR_FOLLOWUP', function (element) {
      element.dataset[normalizedKey] = String(value);
    });
  }

  function PULL_METADATA(selector, key) {
    var normalizedKey = normalizeDataKey(key);
    return getEl(selector, 'PULL_METADATA').dataset[normalizedKey];
  }

  function LISTEN_IN(selector, eventName, handler) {
    if (!isString(eventName) || eventName.trim() === '') {
      throw formatError('LISTEN_IN expected a non-empty event name.');
    }

    assertFunction(handler, 'LISTEN_IN');

    var elements = withElements(selector, 'LISTEN_IN', function (element) {
      element.addEventListener(eventName, handler);
    });

    return function () {
      Array.prototype.forEach.call(elements, function (element) {
        element.removeEventListener(eventName, handler);
      });
    };
  }

  function ACTION_ITEM(selector, handler) {
    return LISTEN_IN(selector, 'click', handler);
  }

  function FOLLOW_UP(selector, handler) {
    assertFunction(handler, 'FOLLOW_UP');

    var removeInput = LISTEN_IN(selector, 'input', handler);
    var removeChange = LISTEN_IN(selector, 'change', handler);

    return function () {
      removeInput();
      removeChange();
    };
  }

  function ESCALATE(eventName, detail) {
    if (!isString(eventName) || eventName.trim() === '') {
      throw formatError('ESCALATE expected a non-empty event name.');
    }

    var event = new global.CustomEvent(eventName, {
      bubbles: true,
      detail: detail
    });

    return documentRef.dispatchEvent(event);
  }

  function SOURCE_OF_TRUTH(name, value) {
    if (!isString(name) || name.trim() === '') {
      throw formatError('SOURCE_OF_TRUTH expected a non-empty state key.');
    }

    state[name] = value;
    return value;
  }

  function ALIGN(name, value) {
    return SOURCE_OF_TRUTH(name, value);
  }

  function SYNERGIZE(a, b) {
    if (typeof a === 'number' && typeof b === 'number') {
      return a + b;
    }

    return String(a) + String(b);
  }

  function PIPELINE(items, fn) {
    assertArrayLike(items, 'PIPELINE');
    assertFunction(fn, 'PIPELINE');
    return Array.prototype.map.call(items, fn);
  }

  function FILTER_FOR_FIT(items, fn) {
    assertArrayLike(items, 'FILTER_FOR_FIT');
    assertFunction(fn, 'FILTER_FOR_FIT');
    return Array.prototype.filter.call(items, fn);
  }

  function NET_NET(items, fn, initial) {
    assertArrayLike(items, 'NET_NET');
    assertFunction(fn, 'NET_NET');
    return Array.prototype.reduce.call(items, fn, initial);
  }

  function SORT_THE_DECK(items, fn) {
    assertArrayLike(items, 'SORT_THE_DECK');
    assertFunction(fn, 'SORT_THE_DECK');
    return Array.prototype.slice.call(items).sort(fn);
  }

  function CIRCLE_BACK_IN(ms, fn) {
    if (typeof ms !== 'number' || ms < 0) {
      throw formatError('CIRCLE_BACK_IN expected a non-negative delay in milliseconds.');
    }

    assertFunction(fn, 'CIRCLE_BACK_IN');
    return global.setTimeout(fn, ms);
  }

  function RECURRING_SYNC(ms, fn) {
    if (typeof ms !== 'number' || ms < 0) {
      throw formatError('RECURRING_SYNC expected a non-negative delay in milliseconds.');
    }

    assertFunction(fn, 'RECURRING_SYNC');
    return global.setInterval(fn, ms);
  }

  function CANCEL_THE_SERIES(id) {
    global.clearTimeout(id);
    global.clearInterval(id);
  }

  function BY_CLOSE_OF_BUSINESS(fn) {
    assertFunction(fn, 'BY_CLOSE_OF_BUSINESS');

    if (typeof global.queueMicrotask === 'function') {
      global.queueMicrotask(fn);
      return null;
    }

    return global.setTimeout(fn, 0);
  }

  function TIMEBOX(ms, promise) {
    if (typeof ms !== 'number' || ms < 0) {
      throw formatError('TIMEBOX expected a non-negative timeout in milliseconds.');
    }

    if (!promise || typeof promise.then !== 'function') {
      throw formatError('TIMEBOX expected a Promise-like value.');
    }

    return new Promise(function (resolve, reject) {
      var timeoutId = global.setTimeout(function () {
        reject(formatError('Timebox exceeded after ' + ms + 'ms.'));
      }, ms);

      promise.then(function (value) {
        global.clearTimeout(timeoutId);
        resolve(value);
      }).catch(function (error) {
        global.clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  function OUTREACH(url, options) {
    if (!isString(url) || url.trim() === '') {
      throw formatError('OUTREACH expected a URL string.');
    }

    return global.fetch(url, options);
  }

  function PULL_NUMBERS(url) {
    return OUTREACH(url).then(function (response) {
      if (!response.ok) {
        throw formatError('Network request failed with status ' + response.status + '.');
      }

      return response.json();
    });
  }

  function SUBMIT_DECK(url, data) {
    return OUTREACH(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: safeStringify(data)
    }).then(function (response) {
      if (!response.ok) {
        throw formatError('Submission failed with status ' + response.status + '.');
      }

      var contentType = response.headers.get('content-type') || '';
      if (contentType.indexOf('application/json') !== -1) {
        return response.json();
      }
      return response.text();
    });
  }

  function INSTITUTIONAL_KNOWLEDGE(key, value) {
    if (!isString(key) || key.trim() === '') {
      throw formatError('INSTITUTIONAL_KNOWLEDGE expected a non-empty storage key.');
    }

    getStorage().setItem(key, safeStringify(value));
    return value;
  }

  function LOOK_IT_UP(key) {
    if (!isString(key) || key.trim() === '') {
      throw formatError('LOOK_IT_UP expected a non-empty storage key.');
    }

    return safeParse(getStorage().getItem(key));
  }

  function MEMORY_HOLE(key) {
    if (!isString(key) || key.trim() === '') {
      throw formatError('MEMORY_HOLE expected a non-empty storage key.');
    }

    getStorage().removeItem(key);
  }

  function EXECUTIVE_SUMMARY() {
    global.console.log.apply(global.console, arguments);
  }

  function FLAG_FOR_REVIEW() {
    global.console.warn.apply(global.console, arguments);
  }

  function FIVE_ALARM_FIRE() {
    global.console.error.apply(global.console, arguments);
  }

  function SANITY_CHECK(value, msg) {
    if (!value) {
      throw formatError(msg || 'Sanity check failed.');
    }

    return value;
  }

  function FOCUS_THE_ROOM(selector) {
    return withElement(selector, 'FOCUS_THE_ROOM', function (element) {
      if (!element.hasAttribute('tabindex') &&
        !/^(?:a|button|input|select|textarea)$/i.test(element.tagName)) {
        element.setAttribute('tabindex', '-1');
      }
      element.focus();
    });
  }

  function INCLUSIVE_ALIGNMENT(selector, label) {
    if (!isString(label) || label.trim() === '') {
      throw formatError('INCLUSIVE_ALIGNMENT expected a non-empty label.');
    }

    return withElements(selector, 'INCLUSIVE_ALIGNMENT', function (element) {
      element.setAttribute('aria-label', label);
    });
  }

  function GIVE_IT_A_VOICE(selector, text) {
    return withElement(selector, 'GIVE_IT_A_VOICE', function (element) {
      if (!element.hasAttribute('aria-live')) {
        element.setAttribute('aria-live', 'polite');
      }
      if (!element.hasAttribute('role')) {
        element.setAttribute('role', 'status');
      }
      element.textContent = text == null ? '' : String(text);
    });
  }

  var api = {
    version: '1.0.0',
    state: state,
    dom: {
      get: FIND_STAKEHOLDER,
      getAll: FIND_STAKEHOLDERS
    },
    events: {
      on: LISTEN_IN,
      emit: ESCALATE
    },
    net: {
      fetch: OUTREACH,
      json: PULL_NUMBERS,
      submit: SUBMIT_DECK
    },
    storage: {
      set: INSTITUTIONAL_KNOWLEDGE,
      get: LOOK_IT_UP,
      remove: MEMORY_HOLE
    },
    debug: {
      log: EXECUTIVE_SUMMARY,
      warn: FLAG_FOR_REVIEW,
      error: FIVE_ALARM_FIRE,
      assert: SANITY_CHECK
    },
    a11y: {
      focus: FOCUS_THE_ROOM,
      label: INCLUSIVE_ALIGNMENT,
      announce: GIVE_IT_A_VOICE
    },
    FIND_STAKEHOLDER: FIND_STAKEHOLDER,
    FIND_STAKEHOLDERS: FIND_STAKEHOLDERS,
    IS_ON_THE_CALENDAR: IS_ON_THE_CALENDAR,
    READ_THE_ROOM: READ_THE_ROOM,
    TAKE_THE_TEMPERATURE: TAKE_THE_TEMPERATURE,
    ORG_UPDATE: ORG_UPDATE,
    BROADCAST: BROADCAST,
    SOCIALIZE: SOCIALIZE,
    SUNSET: SUNSET,
    ABOVE_THE_FOLD: ABOVE_THE_FOLD,
    ALIGN_ON: ALIGN_ON,
    DEPRIORITIZE: DEPRIORITIZE,
    BRAND_REFRESH: BRAND_REFRESH,
    TAKE_COVER: TAKE_COVER,
    VISIBILITY_INTO: VISIBILITY_INTO,
    CAPTURE_INPUT: CAPTURE_INPUT,
    PREFILL: PREFILL,
    GET_BUY_IN: GET_BUY_IN,
    LOCK_IT: LOCK_IT,
    UNBLOCK: UNBLOCK,
    TAG_FOR_FOLLOWUP: TAG_FOR_FOLLOWUP,
    PULL_METADATA: PULL_METADATA,
    LISTEN_IN: LISTEN_IN,
    ACTION_ITEM: ACTION_ITEM,
    FOLLOW_UP: FOLLOW_UP,
    ESCALATE: ESCALATE,
    SOURCE_OF_TRUTH: SOURCE_OF_TRUTH,
    ALIGN: ALIGN,
    SYNERGIZE: SYNERGIZE,
    RIGHTSIZE: RIGHTSIZE,
    PIPELINE: PIPELINE,
    FILTER_FOR_FIT: FILTER_FOR_FIT,
    NET_NET: NET_NET,
    SORT_THE_DECK: SORT_THE_DECK,
    CIRCLE_BACK_IN: CIRCLE_BACK_IN,
    RECURRING_SYNC: RECURRING_SYNC,
    CANCEL_THE_SERIES: CANCEL_THE_SERIES,
    BY_CLOSE_OF_BUSINESS: BY_CLOSE_OF_BUSINESS,
    TIMEBOX: TIMEBOX,
    OUTREACH: OUTREACH,
    PULL_NUMBERS: PULL_NUMBERS,
    SUBMIT_DECK: SUBMIT_DECK,
    INSTITUTIONAL_KNOWLEDGE: INSTITUTIONAL_KNOWLEDGE,
    LOOK_IT_UP: LOOK_IT_UP,
    MEMORY_HOLE: MEMORY_HOLE,
    EXECUTIVE_SUMMARY: EXECUTIVE_SUMMARY,
    FLAG_FOR_REVIEW: FLAG_FOR_REVIEW,
    FIVE_ALARM_FIRE: FIVE_ALARM_FIRE,
    SANITY_CHECK: SANITY_CHECK,
    FOCUS_THE_ROOM: FOCUS_THE_ROOM,
    INCLUSIVE_ALIGNMENT: INCLUSIVE_ALIGNMENT,
    GIVE_IT_A_VOICE: GIVE_IT_A_VOICE
  };

  global.MeetingSpeak = api;

  Object.keys(api).forEach(function (key) {
    if (key === 'version' || key === 'state' || key === 'dom' || key === 'events' ||
      key === 'net' || key === 'storage' || key === 'debug' || key === 'a11y') {
      return;
    }

    global[key] = api[key];
  });
})(window);

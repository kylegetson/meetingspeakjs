(function (global) {
  'use strict';

  var documentRef = global.document;
  var state = {};
  var subscribers = {};
  var runtimeConfig = {
    tone: 'professional',
    reducedMotion: false
  };
  var feedbackTimers = new WeakMap();
  var effectTimers = new WeakMap();
  var STORAGE_META_PREFIX = '__meetingspeak_meta__:';
  var TONE_MODES = {
    professional: true,
    buzzword: true,
    unhinged: true,
    boardroom: true,
    sports: true
  };

  function isString(value) {
    return typeof value === 'string';
  }

  function isFunction(value) {
    return typeof value === 'function';
  }

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  function isPromiseLike(value) {
    return !!value && typeof value.then === 'function';
  }

  function isArrayLike(value) {
    return !!value && typeof value.length === 'number';
  }

  function isNode(value) {
    return !!value && typeof value === 'object' && typeof value.nodeType === 'number';
  }

  function prefersReducedMotion() {
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  runtimeConfig.reducedMotion = prefersReducedMotion();

  function toneWrap(message, type) {
    if (runtimeConfig.tone === 'professional') {
      return message;
    }

    if (type === 'error') {
      if (runtimeConfig.tone === 'buzzword') {
        return message + ' Please realign before the next sync.';
      }

      if (runtimeConfig.tone === 'unhinged') {
        return message + ' The synergy goblin has entered the conference room.';
      }

      if (runtimeConfig.tone === 'boardroom') {
        return 'Board directive: ' + message;
      }

      if (runtimeConfig.tone === 'sports') {
        return message + ' Flag on the play. Review the tape.';
      }
    }

    if (runtimeConfig.tone === 'buzzword') {
      return '[alignment] ' + message;
    }

    if (runtimeConfig.tone === 'unhinged') {
      return '[panic-but-make-it-strategic] ' + message;
    }

    if (runtimeConfig.tone === 'boardroom') {
      return '[executive summary] ' + message;
    }

    if (runtimeConfig.tone === 'sports') {
      return '[play-by-play] ' + message;
    }

    return message;
  }

  function formatError(message) {
    return new Error('MeetingSpeak: ' + toneWrap(message, 'error'));
  }

  function safeConsole(method, args) {
    if (!global.console || !isFunction(global.console[method])) {
      return;
    }

    global.console[method].apply(global.console, args);
  }

  function structuredLog(method, label, args) {
    var parts = ['MeetingSpeak ' + toneWrap(label, 'log') + ':'];
    Array.prototype.push.apply(parts, args);
    safeConsole(method, parts);
  }

  function assertNamedString(value, fnName, message) {
    if (!isString(value) || value.trim() === '') {
      throw formatError(fnName + ' expected ' + message + '.');
    }
  }

  function assertSelector(selector, fnName) {
    assertNamedString(selector, fnName, 'a non-empty CSS selector');
  }

  function assertFunction(handler, fnName) {
    if (!isFunction(handler)) {
      throw formatError('This initiative lacks a callback function.');
    }
  }

  function assertArrayLike(items, fnName) {
    if (!isArrayLike(items)) {
      throw formatError(fnName + ' expected an array or array-like collection.');
    }
  }

  function assertPromiseLike(value, fnName) {
    if (!isPromiseLike(value)) {
      throw formatError(fnName + ' expected a Promise-like value.');
    }
  }

  function normalizeDataKey(key) {
    assertNamedString(key, 'TAG_FOR_FOLLOWUP', 'a non-empty metadata key');

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

  function getSessionStorage() {
    if (!global.sessionStorage) {
      throw formatError('sessionStorage is unavailable in this environment.');
    }

    return global.sessionStorage;
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

  function clearWeakTimer(store, element) {
    var id = store.get(element);

    if (id) {
      global.clearTimeout(id);
      store.delete(element);
    }
  }

  function appendRenderable(parent, value) {
    if (value == null) {
      return;
    }

    if (isNode(value)) {
      parent.appendChild(value);
      return;
    }

    if (isArrayLike(value) && !isString(value)) {
      Array.prototype.forEach.call(value, function (item) {
        appendRenderable(parent, item);
      });
      return;
    }

    var template = documentRef.createElement('template');
    template.innerHTML = String(value);
    parent.appendChild(template.content.cloneNode(true));
  }

  function replaceRenderable(element, value) {
    element.replaceChildren();
    appendRenderable(element, value);
  }

  function setStyleMap(element, styles) {
    Object.keys(styles).forEach(function (key) {
      element.style[key] = styles[key];
    });
  }

  function getPathValue(source, path) {
    var steps = path.split('.');
    var current = source;
    var index = 0;

    for (index = 0; index < steps.length; index += 1) {
      if (current == null) {
        return '';
      }

      current = current[steps[index]];
    }

    return current == null ? '' : current;
  }

  function notifySubscribers(key) {
    var bucket = subscribers[key];

    if (!bucket) {
      return state[key];
    }

    bucket.forEach(function (callback) {
      callback(state[key], key, state);
    });

    return state[key];
  }

  function getStorageMetaKey(key) {
    return STORAGE_META_PREFIX + key;
  }

  function readStorageMeta(storage, key) {
    return safeParse(storage.getItem(getStorageMetaKey(key))) || {};
  }

  function writeStorageMeta(storage, key, meta) {
    storage.setItem(getStorageMetaKey(key), safeStringify(meta));
    return meta;
  }

  function clearStorageMeta(storage, key) {
    storage.removeItem(getStorageMetaKey(key));
  }

  function getFeedbackMode(element) {
    return element.getAttribute('data-feedback-mode') || element.dataset.meetingSpeakFeedback || '';
  }

  function prepareFeedbackElement(element, tone) {
    element.classList.add('meeting-feedback');
    element.dataset.feedbackTone = tone;
    element.classList.toggle('meeting-feedback-success', tone === 'success');
    element.classList.toggle('meeting-feedback-error', tone === 'error');

    if (!element.hasAttribute('aria-live')) {
      element.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
    }

    if (!element.hasAttribute('role')) {
      element.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    }
  }

  function pushFeedback(selector, tone, message, ms, fnName) {
    return withElement(selector, fnName, function (element) {
      var timeoutMs = typeof ms === 'number' && ms >= 0 ? ms : null;
      var mode = getFeedbackMode(element);

      if (mode === 'stack') {
        var toast = SPIN_UP('div', {
          class: 'meeting-feedback-toast meeting-feedback-toast--' + tone,
          text: message
        });

        prepareFeedbackElement(toast, tone);
        element.appendChild(toast);

        if (runtimeConfig.reducedMotion) {
          toast.style.transition = 'none';
        } else {
          toast.style.transform = 'translateY(6px)';
          toast.style.opacity = '0';
          BY_CLOSE_OF_BUSINESS(function () {
            toast.style.transition = 'transform 180ms ease, opacity 180ms ease';
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
          });
        }

        if (timeoutMs != null) {
          CIRCLE_BACK_IN(timeoutMs, function () {
            if (toast.parentNode) {
              toast.remove();
            }
          });
        }

        return toast;
      }

      clearWeakTimer(feedbackTimers, element);
      prepareFeedbackElement(element, tone);
      VISIBILITY_INTO(selector);
      element.textContent = message;

      if (timeoutMs != null) {
        feedbackTimers.set(element, CIRCLE_BACK_IN(timeoutMs, function () {
          TAKE_COVER(selector);
        }));
      }

      return element;
    });
  }

  function animateElement(selector, key, config) {
    return withElements(selector, key, function (element) {
      if (runtimeConfig.reducedMotion) {
        if (config.endStyles) {
          setStyleMap(element, config.endStyles);
        }
        return;
      }

      if (isFunction(element.animate)) {
        element.animate(config.frames, config.options);
        return;
      }

      clearWeakTimer(effectTimers, element);

      if (config.startStyles) {
        setStyleMap(element, config.startStyles);
      }

      BY_CLOSE_OF_BUSINESS(function () {
        if (config.endStyles) {
          setStyleMap(element, config.endStyles);
        }
      });

      effectTimers.set(element, CIRCLE_BACK_IN(config.options.duration || 300, function () {
        if (config.cleanupStyles) {
          Object.keys(config.cleanupStyles).forEach(function (styleKey) {
            element.style[styleKey] = config.cleanupStyles[styleKey];
          });
        }
      }));
    });
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

    if (!Number.isNaN(Number(trimmed))) {
      return Number(trimmed);
    }

    if ((trimmed.charAt(0) === '{' && trimmed.charAt(trimmed.length - 1) === '}') ||
      (trimmed.charAt(0) === '[' && trimmed.charAt(trimmed.length - 1) === ']')) {
      return safeParse(trimmed);
    }

    return value;
  }

  // DOM selection and updates
  function FIND_STAKEHOLDER(selector) {
    return getEl(selector, 'FIND_STAKEHOLDER');
  }

  function FIND_STAKEHOLDERS(selector) {
    return getEls(selector, 'FIND_STAKEHOLDERS');
  }

  function IS_ON_THE_CALENDAR(selector) {
    assertSelector(selector, 'IS_ON_THE_CALENDAR');

    if (!documentRef) {
      return false;
    }

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

  function REORG(selector, html) {
    return withElement(selector, 'REORG', function (element) {
      replaceRenderable(element, html);
    });
  }

  function SPIN_UP(tagName, attributes) {
    assertNamedString(tagName, 'SPIN_UP', 'a non-empty tag name');

    if (!documentRef) {
      throw formatError('SPIN_UP requires a browser document.');
    }

    var element = documentRef.createElement(tagName);

    if (!attributes) {
      return element;
    }

    if (!isPlainObject(attributes)) {
      throw formatError('SPIN_UP expected an attributes object when provided.');
    }

    Object.keys(attributes).forEach(function (key) {
      var value = attributes[key];

      if (value == null) {
        return;
      }

      if (key === 'class') {
        element.className = String(value);
        return;
      }

      if (key === 'className') {
        element.className = String(value);
        return;
      }

      if (key === 'text') {
        element.textContent = String(value);
        return;
      }

      if (key === 'html') {
        element.innerHTML = String(value);
        return;
      }

      if (key === 'style' && isPlainObject(value)) {
        setStyleMap(element, value);
        return;
      }

      if (key === 'dataset' && isPlainObject(value)) {
        Object.keys(value).forEach(function (dataKey) {
          element.dataset[dataKey] = String(value[dataKey]);
        });
        return;
      }

      if (key === 'children') {
        appendRenderable(element, value);
        return;
      }

      if (key in element && !isFunction(element[key])) {
        element[key] = value;
        return;
      }

      element.setAttribute(key, String(value));
    });

    return element;
  }

  function ONBOARD(selector, node) {
    return withElement(selector, 'ONBOARD', function (element) {
      if (!isNode(node)) {
        throw formatError('ONBOARD expected a DOM node.');
      }

      element.appendChild(node);
    });
  }

  function TALK_TRACK(template, data) {
    assertNamedString(template, 'TALK_TRACK', 'a template string');

    return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (_, path) {
      return String(getPathValue(data || {}, path));
    });
  }

  function RUN_IT_UP_THE_FLAGPOLE(selector, items, renderFn, emptyHtml) {
    assertArrayLike(items, 'RUN_IT_UP_THE_FLAGPOLE');
    assertFunction(renderFn, 'RUN_IT_UP_THE_FLAGPOLE');

    if (!items.length) {
      return REORG(selector, emptyHtml || '');
    }

    return REORG(selector, PIPELINE(items, renderFn));
  }

  function LOW_HANGING_FRUIT(selector, condition, truthyHtml, falsyHtml) {
    return REORG(selector, condition ? truthyHtml : (falsyHtml || ''));
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

  // Classes, styles, and visibility
  function ALIGN_ON(selector, className) {
    assertNamedString(className, 'ALIGN_ON', 'a non-empty class name');

    return withElements(selector, 'ALIGN_ON', function (element) {
      element.classList.add(className);
    });
  }

  function DEPRIORITIZE(selector, className) {
    assertNamedString(className, 'DEPRIORITIZE', 'a non-empty class name');

    return withElements(selector, 'DEPRIORITIZE', function (element) {
      element.classList.remove(className);
    });
  }

  function BRAND_REFRESH(selector, styles) {
    if (!isPlainObject(styles)) {
      throw formatError('BRAND_REFRESH expected an object of inline styles.');
    }

    return withElements(selector, 'BRAND_REFRESH', function (element) {
      setStyleMap(element, styles);
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

  function PUT_A_PIN_IN_IT(selector) {
    return withElements(selector, 'PUT_A_PIN_IN_IT', function (element) {
      if (!Object.prototype.hasOwnProperty.call(element.dataset, 'meetingSpeakPointerEvents')) {
        element.dataset.meetingSpeakPointerEvents = element.style.pointerEvents || '';
      }

      if (!Object.prototype.hasOwnProperty.call(element.dataset, 'meetingSpeakOpacity')) {
        element.dataset.meetingSpeakOpacity = element.style.opacity || '';
      }

      element.style.pointerEvents = 'none';
      element.style.opacity = '0.68';
      element.setAttribute('aria-busy', 'true');
    });
  }

  function UNPIN_IT(selector) {
    return withElements(selector, 'UNPIN_IT', function (element) {
      element.style.pointerEvents = element.dataset.meetingSpeakPointerEvents || '';
      element.style.opacity = element.dataset.meetingSpeakOpacity || '';
      element.removeAttribute('aria-busy');
    });
  }

  function WIN_THE_ROOM(selector, message, ms) {
    return pushFeedback(
      selector,
      'success',
      message == null ? 'All stakeholders are aligned.' : String(message),
      typeof ms === 'number' ? ms : 1800,
      'WIN_THE_ROOM'
    );
  }

  function TAKE_THE_L(selector, message, ms) {
    return pushFeedback(
      selector,
      'error',
      message == null ? 'Unable to align on the current deliverable.' : String(message),
      typeof ms === 'number' ? ms : 2500,
      'TAKE_THE_L'
    );
  }

  function WAR_ROOM_MODE(selector, isActive) {
    return withElements(selector, 'WAR_ROOM_MODE', function (element) {
      element.classList.toggle('meeting-war-room', !!isActive);
      element.dataset.warRoom = isActive ? 'true' : 'false';
    });
  }

  function QUIET_QUITTING(selector) {
    return withElements(selector, 'QUIET_QUITTING', function (element) {
      element.classList.add('meeting-quiet-quitting');
      element.style.opacity = '0.6';
      element.style.filter = 'saturate(0.84)';
    });
  }

  function MAKE_IT_POP(selector) {
    return animateElement(selector, 'MAKE_IT_POP', {
      frames: [
        { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0, 0, 0, 0)' },
        { transform: 'scale(1.02)', boxShadow: '0 0 0.9rem rgba(255, 191, 61, 0.35)' },
        { transform: 'scale(1)', boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }
      ],
      options: {
        duration: 420,
        easing: 'ease-out'
      },
      startStyles: {
        transition: 'transform 180ms ease, box-shadow 180ms ease'
      },
      endStyles: {
        transform: 'scale(1.02)',
        boxShadow: '0 0 0.9rem rgba(255, 191, 61, 0.35)'
      },
      cleanupStyles: {
        transform: '',
        boxShadow: '',
        transition: ''
      }
    });
  }

  function HOLD_THE_APPLAUSE(selector, ms) {
    if (typeof ms !== 'number' || ms < 0) {
      throw formatError('HOLD_THE_APPLAUSE expected a non-negative delay in milliseconds.');
    }

    TAKE_COVER(selector);

    return CIRCLE_BACK_IN(ms, function () {
      VISIBILITY_INTO(selector);
    });
  }

  // Forms and metadata
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

  // Events and interaction
  function LISTEN_IN(selector, eventName, handler) {
    assertNamedString(eventName, 'LISTEN_IN', 'a non-empty event name');
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
    assertNamedString(eventName, 'ESCALATE', 'a non-empty event name');

    if (!documentRef) {
      throw formatError('ESCALATE requires a browser document.');
    }

    var event = new global.CustomEvent(eventName, {
      bubbles: true,
      detail: detail
    });

    return documentRef.dispatchEvent(event);
  }

  function HEAR_ME_OUT(eventName, handler) {
    assertNamedString(eventName, 'HEAR_ME_OUT', 'a non-empty event name');
    assertFunction(handler, 'HEAR_ME_OUT');

    if (!documentRef) {
      throw formatError('HEAR_ME_OUT requires a browser document.');
    }

    documentRef.addEventListener(eventName, handler);

    return function () {
      documentRef.removeEventListener(eventName, handler);
    };
  }

  function TAKE_IT_OFFLINE(event) {
    if (!event || !isFunction(event.preventDefault) || !isFunction(event.stopPropagation)) {
      throw formatError('TAKE_IT_OFFLINE expected a browser event.');
    }

    event.preventDefault();
    event.stopPropagation();
    return event;
  }

  function DOUBLE_CLICK_ON(selector, handler) {
    return LISTEN_IN(selector, 'dblclick', handler);
  }

  function KEY_STAKEHOLDER(selector, key, handler) {
    assertNamedString(key, 'KEY_STAKEHOLDER', 'a non-empty keyboard key');
    assertFunction(handler, 'KEY_STAKEHOLDER');

    return LISTEN_IN(selector, 'keydown', function (event) {
      if (event.key === key) {
        handler(event);
      }
    });
  }

  function OPEN_THE_FLOOR(selector, handler) {
    return LISTEN_IN(selector, 'focus', handler);
  }

  function HARD_STOP(selector, handler) {
    assertFunction(handler, 'HARD_STOP');

    return LISTEN_IN(selector, 'submit', function (event) {
      event.preventDefault();
      handler(event);
    });
  }

  // State and collections
  function SOURCE_OF_TRUTH(name, value) {
    assertNamedString(name, 'SOURCE_OF_TRUTH', 'a non-empty state key');
    state[name] = value;
    return value;
  }

  function ALIGN(name, value) {
    return SOURCE_OF_TRUTH(name, value);
  }

  function OPEN_LOOP(key, initialValue) {
    assertNamedString(key, 'OPEN_LOOP', 'a non-empty state key');

    if (!Object.prototype.hasOwnProperty.call(state, key)) {
      state[key] = initialValue;
    }

    return state[key];
  }

  function CLOSE_THE_LOOP(key, nextValue) {
    assertNamedString(key, 'CLOSE_THE_LOOP', 'a non-empty state key');
    state[key] = nextValue;
    return notifySubscribers(key);
  }

  function SINGLE_SOURCE_OF_TRUTH(key) {
    assertNamedString(key, 'SINGLE_SOURCE_OF_TRUTH', 'a non-empty state key');
    return state[key];
  }

  function LISTEN_FOR_ALIGNMENT(key, callback) {
    assertNamedString(key, 'LISTEN_FOR_ALIGNMENT', 'a non-empty state key');
    assertFunction(callback, 'LISTEN_FOR_ALIGNMENT');

    if (!subscribers[key]) {
      subscribers[key] = new Set();
    }

    subscribers[key].add(callback);

    return function () {
      subscribers[key].delete(callback);

      if (!subscribers[key].size) {
        delete subscribers[key];
      }
    };
  }

  function TRUE_UP(key, updaterFn) {
    assertFunction(updaterFn, 'TRUE_UP');
    return CLOSE_THE_LOOP(key, updaterFn(SINGLE_SOURCE_OF_TRUTH(key)));
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

  // Timing, async, and network
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
      throw formatError('Deliverable exceeded agreed-upon timebox.');
    }

    assertPromiseLike(promise, 'TIMEBOX');

    return new Promise(function (resolve, reject) {
      var timeoutId = global.setTimeout(function () {
        reject(formatError('Deliverable exceeded agreed-upon timebox.'));
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
    assertNamedString(url, 'OUTREACH', 'a URL string');
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

  function PULSE_CHECK(selector, promise, loadingHtml) {
    assertPromiseLike(promise, 'PULSE_CHECK');
    PUT_A_PIN_IN_IT(selector);

    if (loadingHtml != null) {
      REORG(selector, loadingHtml);
    }

    return promise.then(function (value) {
      UNPIN_IT(selector);
      return value;
    }).catch(function (error) {
      UNPIN_IT(selector);
      throw error;
    });
  }

  function AIR_COVER(promise, fallbackValue) {
    assertPromiseLike(promise, 'AIR_COVER');
    return promise.catch(function () {
      return fallbackValue;
    });
  }

  function BACKCHANNEL(url, onMessage) {
    assertNamedString(url, 'BACKCHANNEL', 'a URL string');
    assertFunction(onMessage, 'BACKCHANNEL');

    if (typeof global.EventSource === 'function' && /^https?:/i.test(url)) {
      var stream = new global.EventSource(url);
      stream.onmessage = onMessage;
      return stream;
    }

    if (typeof global.WebSocket === 'function') {
      var socket = new global.WebSocket(url);
      socket.addEventListener('message', onMessage);
      return socket;
    }

    throw formatError('BACKCHANNEL requires EventSource or WebSocket support.');
  }

  // Storage and persistence
  function INSTITUTIONAL_KNOWLEDGE(key, value) {
    assertNamedString(key, 'INSTITUTIONAL_KNOWLEDGE', 'a non-empty storage key');
    getStorage().setItem(key, safeStringify(value));
    return value;
  }

  function LOOK_IT_UP(key) {
    assertNamedString(key, 'LOOK_IT_UP', 'a non-empty storage key');
    return safeParse(getStorage().getItem(key));
  }

  function MEMORY_HOLE(key) {
    assertNamedString(key, 'MEMORY_HOLE', 'a non-empty storage key');
    getStorage().removeItem(key);
    clearStorageMeta(getStorage(), key);
  }

  function SESSION_CONTEXT(key, value) {
    assertNamedString(key, 'SESSION_CONTEXT', 'a non-empty storage key');

    if (arguments.length === 1) {
      return safeParse(getSessionStorage().getItem(key));
    }

    getSessionStorage().setItem(key, safeStringify(value));
    return value;
  }

  function HARD_COMMIT(key, value) {
    var savedAt = Date.now();
    var storage = getStorage();
    var meta = readStorageMeta(storage, key);

    INSTITUTIONAL_KNOWLEDGE(key, value);
    meta.savedAt = savedAt;
    meta.storage = 'localStorage';
    writeStorageMeta(storage, key, meta);

    return {
      key: key,
      storage: 'localStorage',
      savedAt: savedAt,
      expiresAt: meta.expiresAt || null,
      value: value
    };
  }

  function SOFT_COMMIT(key, value) {
    var savedAt = Date.now();
    var storage = getSessionStorage();
    var meta = readStorageMeta(storage, key);

    SESSION_CONTEXT(key, value);
    meta.savedAt = savedAt;
    meta.storage = 'sessionStorage';
    writeStorageMeta(storage, key, meta);

    return {
      key: key,
      storage: 'sessionStorage',
      savedAt: savedAt,
      expiresAt: meta.expiresAt || null,
      value: value
    };
  }

  function DATA_RETENTION_POLICY(key, ttlMs) {
    assertNamedString(key, 'DATA_RETENTION_POLICY', 'a non-empty storage key');

    if (typeof ttlMs !== 'number' || ttlMs < 0) {
      throw formatError('DATA_RETENTION_POLICY expected a non-negative TTL in milliseconds.');
    }

    var expiresAt = Date.now() + ttlMs;
    var localMeta = readStorageMeta(getStorage(), key);
    var sessionMeta = readStorageMeta(getSessionStorage(), key);

    localMeta.expiresAt = expiresAt;
    sessionMeta.expiresAt = expiresAt;

    writeStorageMeta(getStorage(), key, localMeta);
    writeStorageMeta(getSessionStorage(), key, sessionMeta);

    return {
      key: key,
      ttlMs: ttlMs,
      expiresAt: expiresAt
    };
  }

  function LOOK_IT_UP_NOW(key) {
    assertNamedString(key, 'LOOK_IT_UP_NOW', 'a non-empty storage key');

    var now = Date.now();
    var localStorageRef = getStorage();
    var sessionStorageRef = getSessionStorage();
    var localMeta = readStorageMeta(localStorageRef, key);
    var sessionMeta = readStorageMeta(sessionStorageRef, key);

    if (localMeta.expiresAt && localMeta.expiresAt <= now) {
      localStorageRef.removeItem(key);
      clearStorageMeta(localStorageRef, key);
    }

    if (sessionMeta.expiresAt && sessionMeta.expiresAt <= now) {
      sessionStorageRef.removeItem(key);
      clearStorageMeta(sessionStorageRef, key);
    }

    if (localStorageRef.getItem(key) != null) {
      return safeParse(localStorageRef.getItem(key));
    }

    if (sessionStorageRef.getItem(key) != null) {
      return safeParse(sessionStorageRef.getItem(key));
    }

    return null;
  }

  // Developer experience and accessibility
  function EXECUTIVE_SUMMARY() {
    safeConsole('log', arguments);
  }

  function FLAG_FOR_REVIEW() {
    safeConsole('warn', arguments);
  }

  function FIVE_ALARM_FIRE() {
    safeConsole('error', arguments);
  }

  function POSTMORTEM(error) {
    var description = error && error.message ? error.message : String(error);

    if (global.console && isFunction(global.console.groupCollapsed)) {
      global.console.groupCollapsed('MeetingSpeak postmortem');
      global.console.error(toneWrap(description, 'error'));

      if (error && error.stack) {
        global.console.error(error.stack);
      }

      global.console.groupEnd();
    } else {
      structuredLog('error', 'POSTMORTEM', [description]);
    }

    return error;
  }

  function THIS_COULD_HAVE_BEEN_AN_EMAIL() {
    structuredLog('info', 'FYI', Array.prototype.slice.call(arguments));
  }

  function FIVE_MINUTE_BREAKTHROUGH() {
    structuredLog('info', 'BREAKTHROUGH', Array.prototype.slice.call(arguments));
  }

  function SANITY_CHECK(value, msg) {
    if (!value) {
      throw formatError(msg || 'Sanity check failed.');
    }

    return value;
  }

  function SET_THE_TONE(mode) {
    assertNamedString(mode, 'SET_THE_TONE', 'a tone mode');

    if (!TONE_MODES[mode]) {
      throw formatError('SET_THE_TONE expected one of: professional, buzzword, unhinged, boardroom.');
    }

    runtimeConfig.tone = mode;
    return mode;
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
    assertNamedString(label, 'INCLUSIVE_ALIGNMENT', 'a non-empty label');

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

  // Animation helpers
  function LAUNCH_SEQUENCE(selector, className) {
    if (className) {
      return withElements(selector, 'LAUNCH_SEQUENCE', function (element) {
        element.classList.add(className);

        if (!runtimeConfig.reducedMotion) {
          CIRCLE_BACK_IN(700, function () {
            element.classList.remove(className);
          });
        }
      });
    }

    return animateElement(selector, 'LAUNCH_SEQUENCE', {
      frames: [
        { opacity: 0, transform: 'translateY(10px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      options: {
        duration: 320,
        easing: 'ease-out'
      },
      startStyles: {
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'opacity 220ms ease, transform 220ms ease'
      },
      endStyles: {
        opacity: '1',
        transform: 'translateY(0)'
      },
      cleanupStyles: {
        transition: ''
      }
    });
  }

  function SMOOTH_THE_TRANSITION(selector, styles) {
    var transitionStyles = isPlainObject(styles) ? styles : {
      transition: 'all 180ms ease'
    };

    return BRAND_REFRESH(selector, transitionStyles);
  }

  function VICTORY_LAP(selector) {
    MAKE_IT_POP(selector);

    return animateElement(selector, 'VICTORY_LAP', {
      frames: [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-4px)' },
        { transform: 'translateY(0)' }
      ],
      options: {
        duration: 320,
        easing: 'ease-out'
      },
      startStyles: {
        transition: 'transform 180ms ease'
      },
      endStyles: {
        transform: 'translateY(-4px)'
      },
      cleanupStyles: {
        transform: '',
        transition: ''
      }
    });
  }

  function REDUCE_FRICTION() {
    runtimeConfig.reducedMotion = prefersReducedMotion();
    return runtimeConfig.reducedMotion;
  }

  var api = {
    version: '2.0.0',
    state: state,
    config: runtimeConfig,
    dom: {
      get: FIND_STAKEHOLDER,
      getAll: FIND_STAKEHOLDERS
    },
    render: {
      create: SPIN_UP,
      append: ONBOARD,
      replace: REORG,
      template: TALK_TRACK,
      list: RUN_IT_UP_THE_FLAGPOLE,
      when: LOW_HANGING_FRUIT
    },
    store: {
      create: OPEN_LOOP,
      set: CLOSE_THE_LOOP,
      get: SINGLE_SOURCE_OF_TRUTH,
      subscribe: LISTEN_FOR_ALIGNMENT,
      update: TRUE_UP
    },
    events: {
      on: LISTEN_IN,
      emit: ESCALATE,
      hear: HEAR_ME_OUT
    },
    net: {
      fetch: OUTREACH,
      json: PULL_NUMBERS,
      submit: SUBMIT_DECK,
      loading: PULSE_CHECK
    },
    storage: {
      set: INSTITUTIONAL_KNOWLEDGE,
      get: LOOK_IT_UP,
      remove: MEMORY_HOLE,
      session: SESSION_CONTEXT,
      commit: HARD_COMMIT
    },
    ui: {
      success: WIN_THE_ROOM,
      error: TAKE_THE_L,
      pin: PUT_A_PIN_IN_IT,
      unpin: UNPIN_IT
    },
    debug: {
      log: EXECUTIVE_SUMMARY,
      warn: FLAG_FOR_REVIEW,
      error: FIVE_ALARM_FIRE,
      assert: SANITY_CHECK,
      postmortem: POSTMORTEM
    },
    tone: {
      set: SET_THE_TONE
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
    REORG: REORG,
    SPIN_UP: SPIN_UP,
    ONBOARD: ONBOARD,
    TALK_TRACK: TALK_TRACK,
    RUN_IT_UP_THE_FLAGPOLE: RUN_IT_UP_THE_FLAGPOLE,
    LOW_HANGING_FRUIT: LOW_HANGING_FRUIT,
    SUNSET: SUNSET,
    ABOVE_THE_FOLD: ABOVE_THE_FOLD,
    ALIGN_ON: ALIGN_ON,
    DEPRIORITIZE: DEPRIORITIZE,
    BRAND_REFRESH: BRAND_REFRESH,
    TAKE_COVER: TAKE_COVER,
    VISIBILITY_INTO: VISIBILITY_INTO,
    PUT_A_PIN_IN_IT: PUT_A_PIN_IN_IT,
    UNPIN_IT: UNPIN_IT,
    WIN_THE_ROOM: WIN_THE_ROOM,
    TAKE_THE_L: TAKE_THE_L,
    WAR_ROOM_MODE: WAR_ROOM_MODE,
    QUIET_QUITTING: QUIET_QUITTING,
    MAKE_IT_POP: MAKE_IT_POP,
    HOLD_THE_APPLAUSE: HOLD_THE_APPLAUSE,
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
    HEAR_ME_OUT: HEAR_ME_OUT,
    TAKE_IT_OFFLINE: TAKE_IT_OFFLINE,
    DOUBLE_CLICK_ON: DOUBLE_CLICK_ON,
    KEY_STAKEHOLDER: KEY_STAKEHOLDER,
    OPEN_THE_FLOOR: OPEN_THE_FLOOR,
    HARD_STOP: HARD_STOP,
    SOURCE_OF_TRUTH: SOURCE_OF_TRUTH,
    ALIGN: ALIGN,
    OPEN_LOOP: OPEN_LOOP,
    CLOSE_THE_LOOP: CLOSE_THE_LOOP,
    SINGLE_SOURCE_OF_TRUTH: SINGLE_SOURCE_OF_TRUTH,
    LISTEN_FOR_ALIGNMENT: LISTEN_FOR_ALIGNMENT,
    TRUE_UP: TRUE_UP,
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
    PULSE_CHECK: PULSE_CHECK,
    AIR_COVER: AIR_COVER,
    BACKCHANNEL: BACKCHANNEL,
    INSTITUTIONAL_KNOWLEDGE: INSTITUTIONAL_KNOWLEDGE,
    LOOK_IT_UP: LOOK_IT_UP,
    MEMORY_HOLE: MEMORY_HOLE,
    SESSION_CONTEXT: SESSION_CONTEXT,
    HARD_COMMIT: HARD_COMMIT,
    SOFT_COMMIT: SOFT_COMMIT,
    DATA_RETENTION_POLICY: DATA_RETENTION_POLICY,
    LOOK_IT_UP_NOW: LOOK_IT_UP_NOW,
    EXECUTIVE_SUMMARY: EXECUTIVE_SUMMARY,
    FLAG_FOR_REVIEW: FLAG_FOR_REVIEW,
    FIVE_ALARM_FIRE: FIVE_ALARM_FIRE,
    POSTMORTEM: POSTMORTEM,
    THIS_COULD_HAVE_BEEN_AN_EMAIL: THIS_COULD_HAVE_BEEN_AN_EMAIL,
    FIVE_MINUTE_BREAKTHROUGH: FIVE_MINUTE_BREAKTHROUGH,
    SANITY_CHECK: SANITY_CHECK,
    SET_THE_TONE: SET_THE_TONE,
    FOCUS_THE_ROOM: FOCUS_THE_ROOM,
    INCLUSIVE_ALIGNMENT: INCLUSIVE_ALIGNMENT,
    GIVE_IT_A_VOICE: GIVE_IT_A_VOICE,
    LAUNCH_SEQUENCE: LAUNCH_SEQUENCE,
    SMOOTH_THE_TRANSITION: SMOOTH_THE_TRANSITION,
    VICTORY_LAP: VICTORY_LAP,
    REDUCE_FRICTION: REDUCE_FRICTION
  };

  global.MeetingSpeak = api;

  Object.keys(api).forEach(function (key) {
    if (key === 'version' || key === 'state' || key === 'config' ||
      key === 'dom' || key === 'render' || key === 'store' || key === 'events' ||
      key === 'net' || key === 'storage' || key === 'ui' || key === 'debug' ||
      key === 'tone' || key === 'a11y') {
      return;
    }

    global[key] = api[key];
  });
})(window);

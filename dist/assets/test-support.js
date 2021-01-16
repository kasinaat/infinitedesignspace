/* jshint ignore:start */



/* jshint ignore:end */

;(function() {
/*!
 * @overview  Ember - JavaScript Application Framework
 * @copyright Copyright 2011-2016 Tilde Inc. and contributors
 *            Portions Copyright 2006-2011 Strobe Inc.
 *            Portions Copyright 2008-2011 Apple Inc. All rights reserved.
 * @license   Licensed under MIT license
 *            See https://raw.github.com/emberjs/ember.js/master/LICENSE
 * @version   2.10.2
 */

var enifed, requireModule, Ember;
var mainContext = this;

(function() {
  var isNode = typeof window === 'undefined' &&
    typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

  if (!isNode) {
    Ember = this.Ember = this.Ember || {};
  }

  if (typeof Ember === 'undefined') { Ember = {}; }

  if (typeof Ember.__loader === 'undefined') {
    var registry = {};
    var seen = {};

    enifed = function(name, deps, callback) {
      var value = { };

      if (!callback) {
        value.deps = [];
        value.callback = deps;
      } else {
        value.deps = deps;
        value.callback = callback;
      }

      registry[name] = value;
    };

    requireModule = function(name) {
      return internalRequire(name, null);
    };

    // setup `require` module
    requireModule['default'] = requireModule;

    requireModule.has = function registryHas(moduleName) {
      return !!registry[moduleName] || !!registry[moduleName + '/index'];
    };

    function missingModule(name, referrerName) {
      if (referrerName) {
        throw new Error('Could not find module ' + name + ' required by: ' + referrerName);
      } else {
        throw new Error('Could not find module ' + name);
      }
    }

    function internalRequire(_name, referrerName) {
      var name = _name;
      var mod = registry[name];

      if (!mod) {
        name = name + '/index';
        mod = registry[name];
      }

      var exports = seen[name];

      if (exports !== undefined) {
        return exports;
      }

      exports = seen[name] = {};

      if (!mod) {
        missingModule(_name, referrerName);
      }

      var deps = mod.deps;
      var callback = mod.callback;
      var reified = new Array(deps.length);

      for (var i = 0; i < deps.length; i++) {
        if (deps[i] === 'exports') {
          reified[i] = exports;
        } else if (deps[i] === 'require') {
          reified[i] = requireModule;
        } else {
          reified[i] = internalRequire(deps[i], name);
        }
      }

      callback.apply(this, reified);

      return exports;
    }

    requireModule._eak_seen = registry;

    Ember.__loader = {
      define: enifed,
      require: requireModule,
      registry: registry
    };
  } else {
    enifed = Ember.__loader.define;
    requireModule = Ember.__loader.require;
  }
})();

var babelHelpers;

function classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

function inherits(subClass, superClass) {
  if (typeof superClass !== 'function' && superClass !== null) {
    throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : defaults(subClass, superClass);
}

function taggedTemplateLiteralLoose(strings, raw) {
  strings.raw = raw;
  return strings;
}

function defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ('value' in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function createClass(Constructor, protoProps, staticProps) {
  if (protoProps) defineProperties(Constructor.prototype, protoProps);
  if (staticProps) defineProperties(Constructor, staticProps);
  return Constructor;
}

function interopExportWildcard(obj, defaults) {
  var newObj = defaults({}, obj);
  delete newObj['default'];
  return newObj;
}

function defaults(obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);
    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }
  return obj;
}

babelHelpers = {
  classCallCheck: classCallCheck,
  inherits: inherits,
  taggedTemplateLiteralLoose: taggedTemplateLiteralLoose,
  slice: Array.prototype.slice,
  createClass: createClass,
  interopExportWildcard: interopExportWildcard,
  defaults: defaults
};

enifed('ember-debug/deprecate', ['exports', 'ember-metal', 'ember-console', 'ember-environment', 'ember-debug/handlers'], function (exports, _emberMetal, _emberConsole, _emberEnvironment, _emberDebugHandlers) {
  /*global __fail__*/

  'use strict';

  exports.registerHandler = registerHandler;
  exports.default = deprecate;

  function registerHandler(handler) {
    _emberDebugHandlers.registerHandler('deprecate', handler);
  }

  function formatMessage(_message, options) {
    var message = _message;

    if (options && options.id) {
      message = message + (' [deprecation id: ' + options.id + ']');
    }

    if (options && options.url) {
      message += ' See ' + options.url + ' for more details.';
    }

    return message;
  }

  registerHandler(function logDeprecationToConsole(message, options) {
    var updatedMessage = formatMessage(message, options);

    _emberConsole.default.warn('DEPRECATION: ' + updatedMessage);
  });

  var captureErrorForStack = undefined;

  if (new Error().stack) {
    captureErrorForStack = function () {
      return new Error();
    };
  } else {
    captureErrorForStack = function () {
      try {
        __fail__.fail();
      } catch (e) {
        return e;
      }
    };
  }

  registerHandler(function logDeprecationStackTrace(message, options, next) {
    if (_emberEnvironment.ENV.LOG_STACKTRACE_ON_DEPRECATION) {
      var stackStr = '';
      var error = captureErrorForStack();
      var stack = undefined;

      if (error.stack) {
        if (error['arguments']) {
          // Chrome
          stack = error.stack.replace(/^\s+at\s+/gm, '').replace(/^([^\(]+?)([\n$])/gm, '{anonymous}($1)$2').replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}($1)').split('\n');
          stack.shift();
        } else {
          // Firefox
          stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
        }

        stackStr = '\n    ' + stack.slice(2).join('\n    ');
      }

      var updatedMessage = formatMessage(message, options);

      _emberConsole.default.warn('DEPRECATION: ' + updatedMessage + stackStr);
    } else {
      next.apply(undefined, arguments);
    }
  });

  registerHandler(function raiseOnDeprecation(message, options, next) {
    if (_emberEnvironment.ENV.RAISE_ON_DEPRECATION) {
      var updatedMessage = formatMessage(message);

      throw new _emberMetal.Error(updatedMessage);
    } else {
      next.apply(undefined, arguments);
    }
  });

  var missingOptionsDeprecation = 'When calling `Ember.deprecate` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include `id` and `until` properties.';
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation = 'When calling `Ember.deprecate` you must provide `id` in options.';
  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  var missingOptionsUntilDeprecation = 'When calling `Ember.deprecate` you must provide `until` in options.';

  exports.missingOptionsUntilDeprecation = missingOptionsUntilDeprecation;
  /**
  @module ember
  @submodule ember-debug
  */

  /**
    Display a deprecation warning with the provided message and a stack trace
    (Chrome and Firefox only).
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method deprecate
    @param {String} message A description of the deprecation.
    @param {Boolean} test A boolean. If falsy, the deprecation will be displayed.
    @param {Object} options
    @param {String} options.id A unique id for this deprecation. The id can be
      used by Ember debugging tools to change the behavior (raise, log or silence)
      for that specific deprecation. The id should be namespaced by dots, e.g.
      "view.helper.select".
    @param {string} options.until The version of Ember when this deprecation
      warning will be removed.
    @param {String} [options.url] An optional url to the transition guide on the
      emberjs.com website.
    @for Ember
    @public
    @since 1.0.0
  */

  function deprecate(message, test, options) {
    if (!options || !options.id && !options.until) {
      deprecate(missingOptionsDeprecation, false, {
        id: 'ember-debug.deprecate-options-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.id) {
      deprecate(missingOptionsIdDeprecation, false, {
        id: 'ember-debug.deprecate-id-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.until) {
      deprecate(missingOptionsUntilDeprecation, options && options.until, {
        id: 'ember-debug.deprecate-until-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    _emberDebugHandlers.invoke.apply(undefined, ['deprecate'].concat(babelHelpers.slice.call(arguments)));
  }
});
enifed("ember-debug/handlers", ["exports"], function (exports) {
  "use strict";

  exports.registerHandler = registerHandler;
  exports.invoke = invoke;
  var HANDLERS = {};

  exports.HANDLERS = HANDLERS;

  function registerHandler(type, callback) {
    var nextHandler = HANDLERS[type] || function () {};

    HANDLERS[type] = function (message, options) {
      callback(message, options, nextHandler);
    };
  }

  function invoke(type, message, test, options) {
    if (test) {
      return;
    }

    var handlerForType = HANDLERS[type];

    if (!handlerForType) {
      return;
    }

    if (handlerForType) {
      handlerForType(message, options);
    }
  }
});
enifed('ember-debug/index', ['exports', 'ember-metal', 'ember-environment', 'ember-console', 'ember-debug/deprecate', 'ember-debug/warn'], function (exports, _emberMetal, _emberEnvironment, _emberConsole, _emberDebugDeprecate, _emberDebugWarn) {
  'use strict';

  exports._warnIfUsingStrippedFeatureFlags = _warnIfUsingStrippedFeatureFlags;

  /**
  @module ember
  @submodule ember-debug
  */

  /**
  @class Ember
  @public
  */

  /**
    Define an assertion that will throw an exception if the condition is not met.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    // Test for truthiness
    Ember.assert('Must pass a valid object', obj);
  
    // Fail unconditionally
    Ember.assert('This code path should never be run');
    ```
  
    @method assert
    @param {String} desc A description of the assertion. This will become
      the text of the Error thrown if the assertion fails.
    @param {Boolean} test Must be truthy for the assertion to pass. If
      falsy, an exception will be thrown.
    @public
    @since 1.0.0
  */
  _emberMetal.setDebugFunction('assert', function assert(desc, test) {
    if (!test) {
      throw new _emberMetal.Error('Assertion Failed: ' + desc);
    }
  });

  /**
    Display a debug notice.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    Ember.debug('I\'m a debug notice!');
    ```
  
    @method debug
    @param {String} message A debug message to display.
    @public
  */
  _emberMetal.setDebugFunction('debug', function debug(message) {
    _emberConsole.default.debug('DEBUG: ' + message);
  });

  /**
    Display an info notice.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method info
    @private
  */
  _emberMetal.setDebugFunction('info', function info() {
    _emberConsole.default.info.apply(undefined, arguments);
  });

  /**
    Alias an old, deprecated method with its new counterpart.
  
    Display a deprecation warning with the provided message and a stack trace
    (Chrome and Firefox only) when the assigned method is called.
  
    * In a production build, this method is defined as an empty function (NOP).
  
    ```javascript
    Ember.oldMethod = Ember.deprecateFunc('Please use the new, updated method', Ember.newMethod);
    ```
  
    @method deprecateFunc
    @param {String} message A description of the deprecation.
    @param {Object} [options] The options object for Ember.deprecate.
    @param {Function} func The new function called to replace its deprecated counterpart.
    @return {Function} A new function that wraps the original function with a deprecation warning
    @private
  */
  _emberMetal.setDebugFunction('deprecateFunc', function deprecateFunc() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (args.length === 3) {
      var _ret = (function () {
        var message = args[0];
        var options = args[1];
        var func = args[2];

        return {
          v: function () {
            _emberMetal.deprecate(message, false, options);
            return func.apply(this, arguments);
          }
        };
      })();

      if (typeof _ret === 'object') return _ret.v;
    } else {
      var _ret2 = (function () {
        var message = args[0];
        var func = args[1];

        return {
          v: function () {
            _emberMetal.deprecate(message);
            return func.apply(this, arguments);
          }
        };
      })();

      if (typeof _ret2 === 'object') return _ret2.v;
    }
  });

  /**
    Run a function meant for debugging.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    ```javascript
    Ember.runInDebug(() => {
      Ember.Component.reopen({
        didInsertElement() {
          console.log("I'm happy");
        }
      });
    });
    ```
  
    @method runInDebug
    @param {Function} func The function to be executed.
    @since 1.5.0
    @public
  */
  _emberMetal.setDebugFunction('runInDebug', function runInDebug(func) {
    func();
  });

  _emberMetal.setDebugFunction('debugSeal', function debugSeal(obj) {
    Object.seal(obj);
  });

  _emberMetal.setDebugFunction('debugFreeze', function debugFreeze(obj) {
    Object.freeze(obj);
  });

  _emberMetal.setDebugFunction('deprecate', _emberDebugDeprecate.default);

  _emberMetal.setDebugFunction('warn', _emberDebugWarn.default);

  /**
    Will call `Ember.warn()` if ENABLE_OPTIONAL_FEATURES or
    any specific FEATURES flag is truthy.
  
    This method is called automatically in debug canary builds.
  
    @private
    @method _warnIfUsingStrippedFeatureFlags
    @return {void}
  */

  function _warnIfUsingStrippedFeatureFlags(FEATURES, knownFeatures, featuresWereStripped) {
    if (featuresWereStripped) {
      _emberMetal.warn('Ember.ENV.ENABLE_OPTIONAL_FEATURES is only available in canary builds.', !_emberEnvironment.ENV.ENABLE_OPTIONAL_FEATURES, { id: 'ember-debug.feature-flag-with-features-stripped' });

      var keys = Object.keys(FEATURES || {});
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === 'isEnabled' || !(key in knownFeatures)) {
          continue;
        }

        _emberMetal.warn('FEATURE["' + key + '"] is set as enabled, but FEATURE flags are only available in canary builds.', !FEATURES[key], { id: 'ember-debug.feature-flag-with-features-stripped' });
      }
    }
  }

  if (!_emberMetal.isTesting()) {
    (function () {
      // Complain if they're using FEATURE flags in builds other than canary
      _emberMetal.FEATURES['features-stripped-test'] = true;
      var featuresWereStripped = true;

      if (false) {
        featuresWereStripped = false;
      }

      delete _emberMetal.FEATURES['features-stripped-test'];
      _warnIfUsingStrippedFeatureFlags(_emberEnvironment.ENV.FEATURES, _emberMetal.DEFAULT_FEATURES, featuresWereStripped);

      // Inform the developer about the Ember Inspector if not installed.
      var isFirefox = _emberEnvironment.environment.isFirefox;
      var isChrome = _emberEnvironment.environment.isChrome;

      if (typeof window !== 'undefined' && (isFirefox || isChrome) && window.addEventListener) {
        window.addEventListener('load', function () {
          if (document.documentElement && document.documentElement.dataset && !document.documentElement.dataset.emberExtension) {
            var downloadURL;

            if (isChrome) {
              downloadURL = 'https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi';
            } else if (isFirefox) {
              downloadURL = 'https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/';
            }

            _emberMetal.debug('For more advanced debugging, install the Ember Inspector from ' + downloadURL);
          }
        }, false);
      }
    })();
  }
  /**
    @public
    @class Ember.Debug
  */
  _emberMetal.default.Debug = {};

  /**
    Allows for runtime registration of handler functions that override the default deprecation behavior.
    Deprecations are invoked by calls to [Ember.deprecate](http://emberjs.com/api/classes/Ember.html#method_deprecate).
    The following example demonstrates its usage by registering a handler that throws an error if the
    message contains the word "should", otherwise defers to the default handler.
  
    ```javascript
    Ember.Debug.registerDeprecationHandler((message, options, next) => {
      if (message.indexOf('should') !== -1) {
        throw new Error(`Deprecation message with should: ${message}`);
      } else {
        // defer to whatever handler was registered before this one
        next(message, options);
      }
    });
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the deprecation call.</li>
      <li> <code>options</code> - An object passed in with the deprecation call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the deprecation in the form of <code>package-name.specific-deprecation</code>.</li>
          <li> <code>until</code> - The Ember version number the feature and deprecation will be removed in.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerDeprecationHandler
    @param handler {Function} A function to handle deprecation calls.
    @since 2.1.0
  */
  _emberMetal.default.Debug.registerDeprecationHandler = _emberDebugDeprecate.registerHandler;
  /**
    Allows for runtime registration of handler functions that override the default warning behavior.
    Warnings are invoked by calls made to [Ember.warn](http://emberjs.com/api/classes/Ember.html#method_warn).
    The following example demonstrates its usage by registering a handler that does nothing overriding Ember's
    default warning behavior.
  
    ```javascript
    // next is not called, so no warnings get the default behavior
    Ember.Debug.registerWarnHandler(() => {});
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the warn call. </li>
      <li> <code>options</code> - An object passed in with the warn call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the warning in the form of <code>package-name.specific-warning</code>.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerWarnHandler
    @param handler {Function} A function to handle warnings.
    @since 2.1.0
  */
  _emberMetal.default.Debug.registerWarnHandler = _emberDebugWarn.registerHandler;

  /*
    We are transitioning away from `ember.js` to `ember.debug.js` to make
    it much clearer that it is only for local development purposes.
  
    This flag value is changed by the tooling (by a simple string replacement)
    so that if `ember.js` (which must be output for backwards compat reasons) is
    used a nice helpful warning message will be printed out.
  */
  var runningNonEmberDebugJS = false;
  exports.runningNonEmberDebugJS = runningNonEmberDebugJS;
  if (runningNonEmberDebugJS) {
    _emberMetal.warn('Please use `ember.debug.js` instead of `ember.js` for development and debugging.');
  }
});
// reexports
enifed('ember-debug/warn', ['exports', 'ember-console', 'ember-metal', 'ember-debug/handlers'], function (exports, _emberConsole, _emberMetal, _emberDebugHandlers) {
  'use strict';

  exports.registerHandler = registerHandler;
  exports.default = warn;

  function registerHandler(handler) {
    _emberDebugHandlers.registerHandler('warn', handler);
  }

  registerHandler(function logWarning(message, options) {
    _emberConsole.default.warn('WARNING: ' + message);
    if ('trace' in _emberConsole.default) {
      _emberConsole.default.trace();
    }
  });

  var missingOptionsDeprecation = 'When calling `Ember.warn` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include an `id` property.';
  exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation = 'When calling `Ember.warn` you must provide `id` in options.';

  exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  /**
  @module ember
  @submodule ember-debug
  */

  /**
    Display a warning with the provided message.
  
    * In a production build, this method is defined as an empty function (NOP).
    Uses of this method in Ember itself are stripped from the ember.prod.js build.
  
    @method warn
    @param {String} message A warning to display.
    @param {Boolean} test An optional boolean. If falsy, the warning
      will be displayed.
    @param {Object} options An object that can be used to pass a unique
      `id` for this warning.  The `id` can be used by Ember debugging tools
      to change the behavior (raise, log, or silence) for that specific warning.
      The `id` should be namespaced by dots, e.g. "ember-debug.feature-flag-with-features-stripped"
    @for Ember
    @public
    @since 1.0.0
  */

  function warn(message, test, options) {
    if (!options) {
      _emberMetal.deprecate(missingOptionsDeprecation, false, {
        id: 'ember-debug.warn-options-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    if (options && !options.id) {
      _emberMetal.deprecate(missingOptionsIdDeprecation, false, {
        id: 'ember-debug.warn-id-missing',
        until: '3.0.0',
        url: 'http://emberjs.com/deprecations/v2.x/#toc_ember-debug-function-options'
      });
    }

    _emberDebugHandlers.invoke.apply(undefined, ['warn'].concat(babelHelpers.slice.call(arguments)));
  }
});
enifed('ember-testing/adapters/adapter', ['exports', 'ember-runtime'], function (exports, _emberRuntime) {
  'use strict';

  function K() {
    return this;
  }

  /**
   @module ember
   @submodule ember-testing
  */

  /**
    The primary purpose of this class is to create hooks that can be implemented
    by an adapter for various test frameworks.
  
    @class Adapter
    @namespace Ember.Test
    @public
  */
  exports.default = _emberRuntime.Object.extend({
    /**
      This callback will be called whenever an async operation is about to start.
       Override this to call your framework's methods that handle async
      operations.
       @public
      @method asyncStart
    */
    asyncStart: K,

    /**
      This callback will be called whenever an async operation has completed.
       @public
      @method asyncEnd
    */
    asyncEnd: K,

    /**
      Override this method with your testing framework's false assertion.
      This function is called whenever an exception occurs causing the testing
      promise to fail.
       QUnit example:
       ```javascript
        exception: function(error) {
          ok(false, error);
        };
      ```
       @public
      @method exception
      @param {String} error The exception to be raised.
    */
    exception: function (error) {
      throw error;
    }
  });
});
enifed('ember-testing/adapters/qunit', ['exports', 'ember-utils', 'ember-testing/adapters/adapter'], function (exports, _emberUtils, _emberTestingAdaptersAdapter) {
  'use strict';

  /**
    This class implements the methods defined by Ember.Test.Adapter for the
    QUnit testing framework.
  
    @class QUnitAdapter
    @namespace Ember.Test
    @extends Ember.Test.Adapter
    @public
  */
  exports.default = _emberTestingAdaptersAdapter.default.extend({
    asyncStart: function () {
      QUnit.stop();
    },
    asyncEnd: function () {
      QUnit.start();
    },
    exception: function (error) {
      ok(false, _emberUtils.inspect(error));
    }
  });
});
enifed('ember-testing/events', ['exports', 'ember-views', 'ember-metal'], function (exports, _emberViews, _emberMetal) {
  'use strict';

  exports.focus = focus;
  exports.fireEvent = fireEvent;

  var DEFAULT_EVENT_OPTIONS = { canBubble: true, cancelable: true };
  var KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];
  var MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];

  function focus(el) {
    if (!el) {
      return;
    }
    var $el = _emberViews.jQuery(el);
    if ($el.is(':input, [contenteditable=true]')) {
      var type = $el.prop('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
        _emberMetal.run(null, function () {
          // Firefox does not trigger the `focusin` event if the window
          // does not have focus. If the document doesn't have focus just
          // use trigger('focusin') instead.

          if (!document.hasFocus || document.hasFocus()) {
            el.focus();
          } else {
            $el.trigger('focusin');
          }
        });
      }
    }
  }

  function fireEvent(element, type) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!element) {
      return;
    }
    var event = undefined;
    if (KEYBOARD_EVENT_TYPES.indexOf(type) > -1) {
      event = buildKeyboardEvent(type, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(type) > -1) {
      var rect = element.getBoundingClientRect();
      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5,
        screenY: y + 95,
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(type, _emberViews.jQuery.extend(simulatedCoordinates, options));
    } else {
      event = buildBasicEvent(type, options);
    }
    element.dispatchEvent(event);
  }

  function buildBasicEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = document.createEvent('Events');
    event.initEvent(type, true, true);
    _emberViews.jQuery.extend(event, options);
    return event;
  }

  function buildMouseEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = undefined;
    try {
      event = document.createEvent('MouseEvents');
      var eventOpts = _emberViews.jQuery.extend({}, DEFAULT_EVENT_OPTIONS, options);
      event.initMouseEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }

  function buildKeyboardEvent(type) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var event = undefined;
    try {
      event = document.createEvent('KeyEvents');
      var eventOpts = _emberViews.jQuery.extend({}, DEFAULT_EVENT_OPTIONS, options);
      event.initKeyEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }
});
enifed('ember-testing/ext/application', ['exports', 'ember-application', 'ember-testing/setup_for_testing', 'ember-testing/test/helpers', 'ember-testing/test/promise', 'ember-testing/test/run', 'ember-testing/test/on_inject_helpers', 'ember-testing/test/adapter'], function (exports, _emberApplication, _emberTestingSetup_for_testing, _emberTestingTestHelpers, _emberTestingTestPromise, _emberTestingTestRun, _emberTestingTestOn_inject_helpers, _emberTestingTestAdapter) {
  'use strict';

  _emberApplication.Application.reopen({
    /**
     This property contains the testing helpers for the current application. These
     are created once you call `injectTestHelpers` on your `Ember.Application`
     instance. The included helpers are also available on the `window` object by
     default, but can be used from this object on the individual application also.
       @property testHelpers
      @type {Object}
      @default {}
      @public
    */
    testHelpers: {},

    /**
     This property will contain the original methods that were registered
     on the `helperContainer` before `injectTestHelpers` is called.
      When `removeTestHelpers` is called, these methods are restored to the
     `helperContainer`.
       @property originalMethods
      @type {Object}
      @default {}
      @private
      @since 1.3.0
    */
    originalMethods: {},

    /**
    This property indicates whether or not this application is currently in
    testing mode. This is set when `setupForTesting` is called on the current
    application.
     @property testing
    @type {Boolean}
    @default false
    @since 1.3.0
    @public
    */
    testing: false,

    /**
      This hook defers the readiness of the application, so that you can start
      the app when your tests are ready to run. It also sets the router's
      location to 'none', so that the window's location will not be modified
      (preventing both accidental leaking of state between tests and interference
      with your testing framework).
       Example:
       ```
      App.setupForTesting();
      ```
       @method setupForTesting
      @public
    */
    setupForTesting: function () {
      _emberTestingSetup_for_testing.default();

      this.testing = true;

      this.Router.reopen({
        location: 'none'
      });
    },

    /**
      This will be used as the container to inject the test helpers into. By
      default the helpers are injected into `window`.
       @property helperContainer
      @type {Object} The object to be used for test helpers.
      @default window
      @since 1.2.0
      @private
    */
    helperContainer: null,

    /**
      This injects the test helpers into the `helperContainer` object. If an object is provided
      it will be used as the helperContainer. If `helperContainer` is not set it will default
      to `window`. If a function of the same name has already been defined it will be cached
      (so that it can be reset if the helper is removed with `unregisterHelper` or
      `removeTestHelpers`).
       Any callbacks registered with `onInjectHelpers` will be called once the
      helpers have been injected.
       Example:
      ```
      App.injectTestHelpers();
      ```
       @method injectTestHelpers
      @public
    */
    injectTestHelpers: function (helperContainer) {
      if (helperContainer) {
        this.helperContainer = helperContainer;
      } else {
        this.helperContainer = window;
      }

      this.reopen({
        willDestroy: function () {
          this._super.apply(this, arguments);
          this.removeTestHelpers();
        }
      });

      this.testHelpers = {};
      for (var _name in _emberTestingTestHelpers.helpers) {
        this.originalMethods[_name] = this.helperContainer[_name];
        this.testHelpers[_name] = this.helperContainer[_name] = helper(this, _name);
        protoWrap(_emberTestingTestPromise.default.prototype, _name, helper(this, _name), _emberTestingTestHelpers.helpers[_name].meta.wait);
      }

      _emberTestingTestOn_inject_helpers.invokeInjectHelpersCallbacks(this);
    },

    /**
      This removes all helpers that have been registered, and resets and functions
      that were overridden by the helpers.
       Example:
       ```javascript
      App.removeTestHelpers();
      ```
       @public
      @method removeTestHelpers
    */
    removeTestHelpers: function () {
      if (!this.helperContainer) {
        return;
      }

      for (var _name2 in _emberTestingTestHelpers.helpers) {
        this.helperContainer[_name2] = this.originalMethods[_name2];
        delete _emberTestingTestPromise.default.prototype[_name2];
        delete this.testHelpers[_name2];
        delete this.originalMethods[_name2];
      }
    }
  });

  // This method is no longer needed
  // But still here for backwards compatibility
  // of helper chaining
  function protoWrap(proto, name, callback, isAsync) {
    proto[name] = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (isAsync) {
        return callback.apply(this, args);
      } else {
        return this.then(function () {
          return callback.apply(this, args);
        });
      }
    };
  }

  function helper(app, name) {
    var fn = _emberTestingTestHelpers.helpers[name].method;
    var meta = _emberTestingTestHelpers.helpers[name].meta;
    if (!meta.wait) {
      return function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return fn.apply(app, [app].concat(args));
      };
    }

    return function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      var lastPromise = _emberTestingTestRun.default(function () {
        return _emberTestingTestPromise.resolve(_emberTestingTestPromise.getLastPromise());
      });

      // wait for last helper's promise to resolve and then
      // execute. To be safe, we need to tell the adapter we're going
      // asynchronous here, because fn may not be invoked before we
      // return.
      _emberTestingTestAdapter.asyncStart();
      return lastPromise.then(function () {
        return fn.apply(app, [app].concat(args));
      }).finally(_emberTestingTestAdapter.asyncEnd);
    };
  }
});
enifed('ember-testing/ext/rsvp', ['exports', 'ember-runtime', 'ember-metal', 'ember-testing/test/adapter'], function (exports, _emberRuntime, _emberMetal, _emberTestingTestAdapter) {
  'use strict';

  _emberRuntime.RSVP.configure('async', function (callback, promise) {
    // if schedule will cause autorun, we need to inform adapter
    if (_emberMetal.isTesting() && !_emberMetal.run.backburner.currentInstance) {
      _emberTestingTestAdapter.asyncStart();
      _emberMetal.run.backburner.schedule('actions', function () {
        _emberTestingTestAdapter.asyncEnd();
        callback(promise);
      });
    } else {
      _emberMetal.run.backburner.schedule('actions', function () {
        return callback(promise);
      });
    }
  });

  exports.default = _emberRuntime.RSVP;
});
enifed('ember-testing/helpers', ['exports', 'ember-metal', 'ember-testing/test/helpers', 'ember-testing/helpers/and_then', 'ember-testing/helpers/click', 'ember-testing/helpers/current_path', 'ember-testing/helpers/current_route_name', 'ember-testing/helpers/current_url', 'ember-testing/helpers/fill_in', 'ember-testing/helpers/find', 'ember-testing/helpers/find_with_assert', 'ember-testing/helpers/key_event', 'ember-testing/helpers/pause_test', 'ember-testing/helpers/trigger_event', 'ember-testing/helpers/visit', 'ember-testing/helpers/wait'], function (exports, _emberMetal, _emberTestingTestHelpers, _emberTestingHelpersAnd_then, _emberTestingHelpersClick, _emberTestingHelpersCurrent_path, _emberTestingHelpersCurrent_route_name, _emberTestingHelpersCurrent_url, _emberTestingHelpersFill_in, _emberTestingHelpersFind, _emberTestingHelpersFind_with_assert, _emberTestingHelpersKey_event, _emberTestingHelpersPause_test, _emberTestingHelpersTrigger_event, _emberTestingHelpersVisit, _emberTestingHelpersWait) {
  'use strict';

  _emberTestingTestHelpers.registerAsyncHelper('visit', _emberTestingHelpersVisit.default);
  _emberTestingTestHelpers.registerAsyncHelper('click', _emberTestingHelpersClick.default);
  _emberTestingTestHelpers.registerAsyncHelper('keyEvent', _emberTestingHelpersKey_event.default);
  _emberTestingTestHelpers.registerAsyncHelper('fillIn', _emberTestingHelpersFill_in.default);
  _emberTestingTestHelpers.registerAsyncHelper('wait', _emberTestingHelpersWait.default);
  _emberTestingTestHelpers.registerAsyncHelper('andThen', _emberTestingHelpersAnd_then.default);
  _emberTestingTestHelpers.registerAsyncHelper('pauseTest', _emberTestingHelpersPause_test.pauseTest);
  _emberTestingTestHelpers.registerAsyncHelper('triggerEvent', _emberTestingHelpersTrigger_event.default);

  _emberTestingTestHelpers.registerHelper('find', _emberTestingHelpersFind.default);
  _emberTestingTestHelpers.registerHelper('findWithAssert', _emberTestingHelpersFind_with_assert.default);
  _emberTestingTestHelpers.registerHelper('currentRouteName', _emberTestingHelpersCurrent_route_name.default);
  _emberTestingTestHelpers.registerHelper('currentPath', _emberTestingHelpersCurrent_path.default);
  _emberTestingTestHelpers.registerHelper('currentURL', _emberTestingHelpersCurrent_url.default);

  if (false) {
    _emberTestingTestHelpers.registerHelper('resumeTest', _emberTestingHelpersPause_test.resumeTest);
  }
});
enifed("ember-testing/helpers/and_then", ["exports"], function (exports) {
  /**
  @module ember
  @submodule ember-testing
  */
  "use strict";

  exports.default = andThen;

  function andThen(app, callback) {
    return app.testHelpers.wait(callback(app));
  }
});
enifed('ember-testing/helpers/click', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = click;

  /**
    Clicks an element and triggers any actions triggered by the element's `click`
    event.
  
    Example:
  
    ```javascript
    click('.some-jQuery-selector').then(function() {
      // assert something
    });
    ```
  
    @method click
    @param {String} selector jQuery selector for finding element on the DOM
    @param {Object} context A DOM Element, Document, or jQuery to use as context
    @return {RSVP.Promise}
    @public
  */

  function click(app, selector, context) {
    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    _emberTestingEvents.fireEvent(el, 'mousedown');

    _emberTestingEvents.focus(el);

    _emberTestingEvents.fireEvent(el, 'mouseup');
    _emberTestingEvents.fireEvent(el, 'click');

    return app.testHelpers.wait();
  }
});
enifed('ember-testing/helpers/current_path', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = currentPath;

  /**
    Returns the current path.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentPath(), 'some.path.index', "correct path was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentPath
  @return {Object} The currently active path.
  @since 1.5.0
  @public
  */

  function currentPath(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return _emberMetal.get(routingService, 'currentPath');
  }
});
enifed('ember-testing/helpers/current_route_name', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = currentRouteName;

  /**
    Returns the currently active route name.
  Example:
  ```javascript
  function validateRouteName() {
    equal(currentRouteName(), 'some.path', "correct route was transitioned into.");
  }
  visit('/some/path').then(validateRouteName)
  ```
  @method currentRouteName
  @return {Object} The name of the currently active route.
  @since 1.5.0
  @public
  */

  function currentRouteName(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return _emberMetal.get(routingService, 'currentRouteName');
  }
});
enifed('ember-testing/helpers/current_url', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = currentURL;

  /**
    Returns the current URL.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentURL(), '/some/path', "correct URL was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentURL
  @return {Object} The currently active URL.
  @since 1.5.0
  @public
  */

  function currentURL(app) {
    var router = app.__container__.lookup('router:main');
    return _emberMetal.get(router, 'location').getURL();
  }
});
enifed('ember-testing/helpers/fill_in', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = fillIn;

  /**
    Fills in an input element with some text.
  
    Example:
  
    ```javascript
    fillIn('#email', 'you@example.com').then(function() {
      // assert something
    });
    ```
  
    @method fillIn
    @param {String} selector jQuery selector finding an input element on the DOM
    to fill text with
    @param {String} text text to place inside the input element
    @return {RSVP.Promise}
    @public
  */

  function fillIn(app, selector, contextOrText, text) {
    var $el = undefined,
        el = undefined,
        context = undefined;
    if (typeof text === 'undefined') {
      text = contextOrText;
    } else {
      context = contextOrText;
    }
    $el = app.testHelpers.findWithAssert(selector, context);
    el = $el[0];
    _emberTestingEvents.focus(el);

    $el.eq(0).val(text);
    _emberTestingEvents.fireEvent(el, 'input');
    _emberTestingEvents.fireEvent(el, 'change');

    return app.testHelpers.wait();
  }
});
enifed('ember-testing/helpers/find', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = find;

  /**
    Finds an element in the context of the app's container element. A simple alias
    for `app.$(selector)`.
  
    Example:
  
    ```javascript
    var $el = find('.my-selector');
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = find('.my-selector', '.parent-element-class');
    ```
  
    @method find
    @param {String} selector jQuery string selector for element lookup
    @param {String} [context] (optional) jQuery selector that will limit the selector
                              argument to find only within the context's children
    @return {Object} jQuery object representing the results of the query
    @public
  */

  function find(app, selector, context) {
    var $el = undefined;
    context = context || _emberMetal.get(app, 'rootElement');
    $el = app.$(selector, context);
    return $el;
  }
});
enifed('ember-testing/helpers/find_with_assert', ['exports'], function (exports) {
  /**
  @module ember
  @submodule ember-testing
  */
  /**
    Like `find`, but throws an error if the element selector returns no results.
  
    Example:
  
    ```javascript
    var $el = findWithAssert('.doesnt-exist'); // throws error
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = findWithAssert('.selector-id', '.parent-element-class'); // assert will pass
    ```
  
    @method findWithAssert
    @param {String} selector jQuery selector string for finding an element within
    the DOM
    @param {String} [context] (optional) jQuery selector that will limit the
    selector argument to find only within the context's children
    @return {Object} jQuery object representing the results of the query
    @throws {Error} throws error if jQuery object returned has a length of 0
    @public
  */
  'use strict';

  exports.default = findWithAssert;

  function findWithAssert(app, selector, context) {
    var $el = app.testHelpers.find(selector, context);
    if ($el.length === 0) {
      throw new Error('Element ' + selector + ' not found.');
    }
    return $el;
  }
});
enifed('ember-testing/helpers/key_event', ['exports'], function (exports) {
  /**
  @module ember
  @submodule ember-testing
  */
  /**
    Simulates a key event, e.g. `keypress`, `keydown`, `keyup` with the desired keyCode
    Example:
    ```javascript
    keyEvent('.some-jQuery-selector', 'keypress', 13).then(function() {
     // assert something
    });
    ```
    @method keyEvent
    @param {String} selector jQuery selector for finding element on the DOM
    @param {String} type the type of key event, e.g. `keypress`, `keydown`, `keyup`
    @param {Number} keyCode the keyCode of the simulated key event
    @return {RSVP.Promise}
    @since 1.5.0
    @public
  */
  'use strict';

  exports.default = keyEvent;

  function keyEvent(app, selector, contextOrType, typeOrKeyCode, keyCode) {
    var context = undefined,
        type = undefined;

    if (typeof keyCode === 'undefined') {
      context = null;
      keyCode = typeOrKeyCode;
      type = contextOrType;
    } else {
      context = contextOrType;
      type = typeOrKeyCode;
    }

    return app.testHelpers.triggerEvent(selector, context, type, { keyCode: keyCode, which: keyCode });
  }
});
enifed('ember-testing/helpers/pause_test', ['exports', 'ember-runtime', 'ember-console', 'ember-metal'], function (exports, _emberRuntime, _emberConsole, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.resumeTest = resumeTest;
  exports.pauseTest = pauseTest;

  var resume = undefined;

  /**
   Resumes a test paused by `pauseTest`.
  
   @method resumeTest
   @return {void}
   @public
  */

  function resumeTest() {
    _emberMetal.assert('Testing has not been paused. There is nothing to resume.', resume);
    resume();
    resume = undefined;
  }

  /**
   Pauses the current test - this is useful for debugging while testing or for test-driving.
   It allows you to inspect the state of your application at any point.
   Example (The test will pause before clicking the button):
  
   ```javascript
   visit('/')
   return pauseTest();
   click('.btn');
   ```
   @since 1.9.0
   @method pauseTest
   @return {Object} A promise that will never resolve
   @public
  */

  function pauseTest() {
    if (false) {
      _emberConsole.default.info('Testing paused. Use `resumeTest()` to continue.');
    }

    return new _emberRuntime.RSVP.Promise(function (resolve) {
      if (false) {
        resume = resolve;
      }
    }, 'TestAdapter paused promise');
  }
});
enifed('ember-testing/helpers/trigger_event', ['exports', 'ember-testing/events'], function (exports, _emberTestingEvents) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = triggerEvent;

  /**
    Triggers the given DOM event on the element identified by the provided selector.
    Example:
    ```javascript
    triggerEvent('#some-elem-id', 'blur');
    ```
    This is actually used internally by the `keyEvent` helper like so:
    ```javascript
    triggerEvent('#some-elem-id', 'keypress', { keyCode: 13 });
    ```
   @method triggerEvent
   @param {String} selector jQuery selector for finding element on the DOM
   @param {String} [context] jQuery selector that will limit the selector
                             argument to find only within the context's children
   @param {String} type The event type to be triggered.
   @param {Object} [options] The options to be passed to jQuery.Event.
   @return {RSVP.Promise}
   @since 1.5.0
   @public
  */

  function triggerEvent(app, selector, contextOrType, typeOrOptions, possibleOptions) {
    var arity = arguments.length;
    var context = undefined,
        type = undefined,
        options = undefined;

    if (arity === 3) {
      // context and options are optional, so this is
      // app, selector, type
      context = null;
      type = contextOrType;
      options = {};
    } else if (arity === 4) {
      // context and options are optional, so this is
      if (typeof typeOrOptions === 'object') {
        // either
        // app, selector, type, options
        context = null;
        type = contextOrType;
        options = typeOrOptions;
      } else {
        // or
        // app, selector, context, type
        context = contextOrType;
        type = typeOrOptions;
        options = {};
      }
    } else {
      context = contextOrType;
      type = typeOrOptions;
      options = possibleOptions;
    }

    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];

    _emberTestingEvents.fireEvent(el, type, options);

    return app.testHelpers.wait();
  }
});
enifed('ember-testing/helpers/visit', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = visit;

  /**
    Loads a route, sets up any controllers, and renders any templates associated
    with the route as though a real user had triggered the route change while
    using your app.
  
    Example:
  
    ```javascript
    visit('posts/index').then(function() {
      // assert something
    });
    ```
  
    @method visit
    @param {String} url the name of the route
    @return {RSVP.Promise}
    @public
  */

  function visit(app, url) {
    var router = app.__container__.lookup('router:main');
    var shouldHandleURL = false;

    app.boot().then(function () {
      router.location.setURL(url);

      if (shouldHandleURL) {
        _emberMetal.run(app.__deprecatedInstance__, 'handleURL', url);
      }
    });

    if (app._readinessDeferrals > 0) {
      router['initialURL'] = url;
      _emberMetal.run(app, 'advanceReadiness');
      delete router['initialURL'];
    } else {
      shouldHandleURL = true;
    }

    return app.testHelpers.wait();
  }
});
enifed('ember-testing/helpers/wait', ['exports', 'ember-testing/test/waiters', 'ember-runtime', 'ember-metal', 'ember-testing/test/pending_requests'], function (exports, _emberTestingTestWaiters, _emberRuntime, _emberMetal, _emberTestingTestPending_requests) {
  /**
  @module ember
  @submodule ember-testing
  */
  'use strict';

  exports.default = wait;

  /**
    Causes the run loop to process any pending events. This is used to ensure that
    any async operations from other helpers (or your assertions) have been processed.
  
    This is most often used as the return value for the helper functions (see 'click',
    'fillIn','visit',etc). However, there is a method to register a test helper which
    utilizes this method without the need to actually call `wait()` in your helpers.
  
    The `wait` helper is built into `registerAsyncHelper` by default. You will not need
    to `return app.testHelpers.wait();` - the wait behavior is provided for you.
  
    Example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('loginUser', function(app, username, password) {
      visit('secured/path/here')
        .fillIn('#username', username)
        .fillIn('#password', password)
        .click('.submit');
    });
  
    @method wait
    @param {Object} value The value to be returned.
    @return {RSVP.Promise}
    @public
    @since 1.0.0
  */

  function wait(app, value) {
    return new _emberRuntime.RSVP.Promise(function (resolve) {
      var router = app.__container__.lookup('router:main');

      // Every 10ms, poll for the async thing to have finished
      var watcher = setInterval(function () {
        // 1. If the router is loading, keep polling
        var routerIsLoading = router.router && !!router.router.activeTransition;
        if (routerIsLoading) {
          return;
        }

        // 2. If there are pending Ajax requests, keep polling
        if (_emberTestingTestPending_requests.pendingRequests()) {
          return;
        }

        // 3. If there are scheduled timers or we are inside of a run loop, keep polling
        if (_emberMetal.run.hasScheduledTimers() || _emberMetal.run.currentRunLoop) {
          return;
        }

        if (_emberTestingTestWaiters.checkWaiters()) {
          return;
        }

        // Stop polling
        clearInterval(watcher);

        // Synchronously resolve the promise
        _emberMetal.run(null, resolve, value);
      }, 10);
    });
  }
});
enifed('ember-testing/index', ['exports', 'ember-testing/support', 'ember-testing/ext/application', 'ember-testing/ext/rsvp', 'ember-testing/helpers', 'ember-testing/initializers', 'ember-testing/test', 'ember-testing/adapters/adapter', 'ember-testing/setup_for_testing', 'ember-testing/adapters/qunit'], function (exports, _emberTestingSupport, _emberTestingExtApplication, _emberTestingExtRsvp, _emberTestingHelpers, _emberTestingInitializers, _emberTestingTest, _emberTestingAdaptersAdapter, _emberTestingSetup_for_testing, _emberTestingAdaptersQunit) {
  'use strict';

  exports.Test = _emberTestingTest.default;
  exports.Adapter = _emberTestingAdaptersAdapter.default;
  exports.setupForTesting = _emberTestingSetup_for_testing.default;
  exports.QUnitAdapter = _emberTestingAdaptersQunit.default;
});
// to handle various edge cases
// setup RSVP + run loop integration
// adds helpers to helpers object in Test
// to setup initializer

/**
  @module ember
  @submodule ember-testing
*/
enifed('ember-testing/initializers', ['exports', 'ember-runtime'], function (exports, _emberRuntime) {
  'use strict';

  var name = 'deferReadiness in `testing` mode';

  _emberRuntime.onLoad('Ember.Application', function (Application) {
    if (!Application.initializers[name]) {
      Application.initializer({
        name: name,

        initialize: function (application) {
          if (application.testing) {
            application.deferReadiness();
          }
        }
      });
    }
  });
});
enifed('ember-testing/setup_for_testing', ['exports', 'ember-metal', 'ember-views', 'ember-testing/test/adapter', 'ember-testing/test/pending_requests', 'ember-testing/adapters/qunit'], function (exports, _emberMetal, _emberViews, _emberTestingTestAdapter, _emberTestingTestPending_requests, _emberTestingAdaptersQunit) {
  'use strict';

  exports.default = setupForTesting;

  /**
    Sets Ember up for testing. This is useful to perform
    basic setup steps in order to unit test.
  
    Use `App.setupForTesting` to perform integration tests (full
    application testing).
  
    @method setupForTesting
    @namespace Ember
    @since 1.5.0
    @private
  */

  function setupForTesting() {
    _emberMetal.setTesting(true);

    var adapter = _emberTestingTestAdapter.getAdapter();
    // if adapter is not manually set default to QUnit
    if (!adapter) {
      _emberTestingTestAdapter.setAdapter(new _emberTestingAdaptersQunit.default());
    }

    _emberViews.jQuery(document).off('ajaxSend', _emberTestingTestPending_requests.incrementPendingRequests);
    _emberViews.jQuery(document).off('ajaxComplete', _emberTestingTestPending_requests.decrementPendingRequests);

    _emberTestingTestPending_requests.clearPendingRequests();

    _emberViews.jQuery(document).on('ajaxSend', _emberTestingTestPending_requests.incrementPendingRequests);
    _emberViews.jQuery(document).on('ajaxComplete', _emberTestingTestPending_requests.decrementPendingRequests);
  }
});
enifed('ember-testing/support', ['exports', 'ember-metal', 'ember-views', 'ember-environment'], function (exports, _emberMetal, _emberViews, _emberEnvironment) {
  'use strict';

  /**
    @module ember
    @submodule ember-testing
  */

  var $ = _emberViews.jQuery;

  /**
    This method creates a checkbox and triggers the click event to fire the
    passed in handler. It is used to correct for a bug in older versions
    of jQuery (e.g 1.8.3).
  
    @private
    @method testCheckboxClick
  */
  function testCheckboxClick(handler) {
    var input = document.createElement('input');
    $(input).attr('type', 'checkbox').css({ position: 'absolute', left: '-1000px', top: '-1000px' }).appendTo('body').on('click', handler).trigger('click').remove();
  }

  if (_emberEnvironment.environment.hasDOM && typeof $ === 'function') {
    $(function () {
      /*
        Determine whether a checkbox checked using jQuery's "click" method will have
        the correct value for its checked property.
         If we determine that the current jQuery version exhibits this behavior,
        patch it to work correctly as in the commit for the actual fix:
        https://github.com/jquery/jquery/commit/1fb2f92.
      */
      testCheckboxClick(function () {
        if (!this.checked && !$.event.special.click) {
          $.event.special.click = {
            // For checkbox, fire native event so checked state will be right
            trigger: function () {
              if ($.nodeName(this, 'input') && this.type === 'checkbox' && this.click) {
                this.click();
                return false;
              }
            }
          };
        }
      });

      // Try again to verify that the patch took effect or blow up.
      testCheckboxClick(function () {
        _emberMetal.warn('clicked checkboxes should be checked! the jQuery patch didn\'t work', this.checked, { id: 'ember-testing.test-checkbox-click' });
      });
    });
  }
});
enifed('ember-testing/test', ['exports', 'ember-testing/test/helpers', 'ember-testing/test/on_inject_helpers', 'ember-testing/test/promise', 'ember-testing/test/waiters', 'ember-testing/test/adapter', 'ember-metal'], function (exports, _emberTestingTestHelpers, _emberTestingTestOn_inject_helpers, _emberTestingTestPromise, _emberTestingTestWaiters, _emberTestingTestAdapter, _emberMetal) {
  /**
    @module ember
    @submodule ember-testing
  */
  'use strict';

  /**
    This is a container for an assortment of testing related functionality:
  
    * Choose your default test adapter (for your framework of choice).
    * Register/Unregister additional test helpers.
    * Setup callbacks to be fired when the test helpers are injected into
      your application.
  
    @class Test
    @namespace Ember
    @public
  */
  var Test = {
    /**
      Hash containing all known test helpers.
       @property _helpers
      @private
      @since 1.7.0
    */
    _helpers: _emberTestingTestHelpers.helpers,

    registerHelper: _emberTestingTestHelpers.registerHelper,
    registerAsyncHelper: _emberTestingTestHelpers.registerAsyncHelper,
    unregisterHelper: _emberTestingTestHelpers.unregisterHelper,
    onInjectHelpers: _emberTestingTestOn_inject_helpers.onInjectHelpers,
    Promise: _emberTestingTestPromise.default,
    promise: _emberTestingTestPromise.promise,
    resolve: _emberTestingTestPromise.resolve,
    registerWaiter: _emberTestingTestWaiters.registerWaiter,
    unregisterWaiter: _emberTestingTestWaiters.unregisterWaiter
  };

  if (true) {
    Test.checkWaiters = _emberTestingTestWaiters.checkWaiters;
  }

  /**
   Used to allow ember-testing to communicate with a specific testing
   framework.
  
   You can manually set it before calling `App.setupForTesting()`.
  
   Example:
  
   ```javascript
   Ember.Test.adapter = MyCustomAdapter.create()
   ```
  
   If you do not set it, ember-testing will default to `Ember.Test.QUnitAdapter`.
  
   @public
   @for Ember.Test
   @property adapter
   @type {Class} The adapter to be used.
   @default Ember.Test.QUnitAdapter
  */
  Object.defineProperty(Test, 'adapter', {
    get: _emberTestingTestAdapter.getAdapter,
    set: _emberTestingTestAdapter.setAdapter
  });

  Object.defineProperty(Test, 'waiters', {
    get: _emberTestingTestWaiters.generateDeprecatedWaitersArray
  });

  exports.default = Test;
});
enifed('ember-testing/test/adapter', ['exports', 'ember-console', 'ember-metal'], function (exports, _emberConsole, _emberMetal) {
  'use strict';

  exports.getAdapter = getAdapter;
  exports.setAdapter = setAdapter;
  exports.asyncStart = asyncStart;
  exports.asyncEnd = asyncEnd;

  var adapter = undefined;

  function getAdapter() {
    return adapter;
  }

  function setAdapter(value) {
    adapter = value;
    if (value) {
      _emberMetal.setDispatchOverride(adapterDispatch);
    } else {
      _emberMetal.setDispatchOverride(null);
    }
  }

  function asyncStart() {
    if (adapter) {
      adapter.asyncStart();
    }
  }

  function asyncEnd() {
    if (adapter) {
      adapter.asyncEnd();
    }
  }

  function adapterDispatch(error) {
    adapter.exception(error);
    _emberConsole.default.error(error.stack);
  }
});
enifed('ember-testing/test/helpers', ['exports', 'ember-testing/test/promise'], function (exports, _emberTestingTestPromise) {
  'use strict';

  exports.registerHelper = registerHelper;
  exports.registerAsyncHelper = registerAsyncHelper;
  exports.unregisterHelper = unregisterHelper;
  var helpers = {};

  exports.helpers = helpers;
  /**
    `registerHelper` is used to register a test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    Ember.Test.registerHelper('boot', function(app) {
      Ember.run(app, app.advanceReadiness);
    });
    ```
  
    This helper can later be called without arguments because it will be
    called with `app` as the first parameter.
  
    ```javascript
    App = Ember.Application.create();
    App.injectTestHelpers();
    boot();
    ```
  
    @public
    @for Ember.Test
    @method registerHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @param options {Object}
  */

  function registerHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: { wait: false }
    };
  }

  /**
    `registerAsyncHelper` is used to register an async test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('boot', function(app) {
      Ember.run(app, app.advanceReadiness);
    });
    ```
  
    The advantage of an async helper is that it will not run
    until the last async helper has completed.  All async helpers
    after it will wait for it complete before running.
  
  
    For example:
  
    ```javascript
    Ember.Test.registerAsyncHelper('deletePost', function(app, postId) {
      click('.delete-' + postId);
    });
  
    // ... in your test
    visit('/post/2');
    deletePost(2);
    visit('/post/3');
    deletePost(3);
    ```
  
    @public
    @for Ember.Test
    @method registerAsyncHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @since 1.2.0
  */

  function registerAsyncHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: { wait: true }
    };
  }

  /**
    Remove a previously added helper method.
  
    Example:
  
    ```javascript
    Ember.Test.unregisterHelper('wait');
    ```
  
    @public
    @method unregisterHelper
    @param {String} name The helper to remove.
  */

  function unregisterHelper(name) {
    delete helpers[name];
    delete _emberTestingTestPromise.default.prototype[name];
  }
});
enifed("ember-testing/test/on_inject_helpers", ["exports"], function (exports) {
  "use strict";

  exports.onInjectHelpers = onInjectHelpers;
  exports.invokeInjectHelpersCallbacks = invokeInjectHelpersCallbacks;
  var callbacks = [];

  exports.callbacks = callbacks;
  /**
    Used to register callbacks to be fired whenever `App.injectTestHelpers`
    is called.
  
    The callback will receive the current application as an argument.
  
    Example:
  
    ```javascript
    Ember.Test.onInjectHelpers(function() {
      Ember.$(document).ajaxSend(function() {
        Test.pendingRequests++;
      });
  
      Ember.$(document).ajaxComplete(function() {
        Test.pendingRequests--;
      });
    });
    ```
  
    @public
    @for Ember.Test
    @method onInjectHelpers
    @param {Function} callback The function to be called.
  */

  function onInjectHelpers(callback) {
    callbacks.push(callback);
  }

  function invokeInjectHelpersCallbacks(app) {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i](app);
    }
  }
});
enifed("ember-testing/test/pending_requests", ["exports"], function (exports) {
  "use strict";

  exports.pendingRequests = pendingRequests;
  exports.clearPendingRequests = clearPendingRequests;
  exports.incrementPendingRequests = incrementPendingRequests;
  exports.decrementPendingRequests = decrementPendingRequests;
  var requests = [];

  function pendingRequests() {
    return requests.length;
  }

  function clearPendingRequests() {
    requests.length = 0;
  }

  function incrementPendingRequests(_, xhr) {
    requests.push(xhr);
  }

  function decrementPendingRequests(_, xhr) {
    for (var i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
        break;
      }
    }
  }
});
enifed('ember-testing/test/promise', ['exports', 'ember-runtime', 'ember-testing/test/run'], function (exports, _emberRuntime, _emberTestingTestRun) {
  'use strict';

  exports.promise = promise;
  exports.resolve = resolve;
  exports.getLastPromise = getLastPromise;

  var lastPromise = undefined;

  var TestPromise = (function (_RSVP$Promise) {
    babelHelpers.inherits(TestPromise, _RSVP$Promise);

    function TestPromise() {
      babelHelpers.classCallCheck(this, TestPromise);

      _RSVP$Promise.apply(this, arguments);
      lastPromise = this;
    }

    /**
      This returns a thenable tailored for testing.  It catches failed
      `onSuccess` callbacks and invokes the `Ember.Test.adapter.exception`
      callback in the last chained then.
    
      This method should be returned by async helpers such as `wait`.
    
      @public
      @for Ember.Test
      @method promise
      @param {Function} resolver The function used to resolve the promise.
      @param {String} label An optional string for identifying the promise.
    */

    TestPromise.prototype.then = function then(onFulfillment) {
      var _RSVP$Promise$prototype$then;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return (_RSVP$Promise$prototype$then = _RSVP$Promise.prototype.then).call.apply(_RSVP$Promise$prototype$then, [this, function (result) {
        return isolate(onFulfillment, result);
      }].concat(args));
    };

    return TestPromise;
  })(_emberRuntime.RSVP.Promise);

  exports.default = TestPromise;

  function promise(resolver, label) {
    var fullLabel = 'Ember.Test.promise: ' + (label || '<Unknown Promise>');
    return new TestPromise(resolver, fullLabel);
  }

  /**
    Replacement for `Ember.RSVP.resolve`
    The only difference is this uses
    an instance of `Ember.Test.Promise`
  
    @public
    @for Ember.Test
    @method resolve
    @param {Mixed} The value to resolve
    @since 1.2.0
  */

  function resolve(result, label) {
    return TestPromise.resolve(result, label);
  }

  function getLastPromise() {
    return lastPromise;
  }

  // This method isolates nested async methods
  // so that they don't conflict with other last promises.
  //
  // 1. Set `Ember.Test.lastPromise` to null
  // 2. Invoke method
  // 3. Return the last promise created during method
  function isolate(onFulfillment, result) {
    // Reset lastPromise for nested helpers
    lastPromise = null;

    var value = onFulfillment(result);

    var promise = lastPromise;
    lastPromise = null;

    // If the method returned a promise
    // return that promise. If not,
    // return the last async helper's promise
    if (value && value instanceof TestPromise || !promise) {
      return value;
    } else {
      return _emberTestingTestRun.default(function () {
        return resolve(promise).then(function () {
          return value;
        });
      });
    }
  }
});
enifed('ember-testing/test/run', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.default = run;

  function run(fn) {
    if (!_emberMetal.run.currentRunLoop) {
      return _emberMetal.run(fn);
    } else {
      return fn();
    }
  }
});
enifed('ember-testing/test/waiters', ['exports', 'ember-metal'], function (exports, _emberMetal) {
  'use strict';

  exports.registerWaiter = registerWaiter;
  exports.unregisterWaiter = unregisterWaiter;
  exports.checkWaiters = checkWaiters;
  exports.generateDeprecatedWaitersArray = generateDeprecatedWaitersArray;

  var contexts = [];
  var callbacks = [];

  /**
     This allows ember-testing to play nicely with other asynchronous
     events, such as an application that is waiting for a CSS3
     transition or an IndexDB transaction. The waiter runs periodically
     after each async helper (i.e. `click`, `andThen`, `visit`, etc) has executed,
     until the returning result is truthy. After the waiters finish, the next async helper
     is executed and the process repeats.
  
     For example:
  
     ```javascript
     Ember.Test.registerWaiter(function() {
       return myPendingTransactions() == 0;
     });
     ```
     The `context` argument allows you to optionally specify the `this`
     with which your callback will be invoked.
  
     For example:
  
     ```javascript
     Ember.Test.registerWaiter(MyDB, MyDB.hasPendingTransactions);
     ```
  
     @public
     @for Ember.Test
     @method registerWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */

  function registerWaiter(context, callback) {
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    if (indexOf(context, callback) > -1) {
      return;
    }
    contexts.push(context);
    callbacks.push(callback);
  }

  /**
     `unregisterWaiter` is used to unregister a callback that was
     registered with `registerWaiter`.
  
     @public
     @for Ember.Test
     @method unregisterWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */

  function unregisterWaiter(context, callback) {
    if (!callbacks.length) {
      return;
    }
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    var i = indexOf(context, callback);
    if (i === -1) {
      return;
    }
    contexts.splice(i, 1);
    callbacks.splice(i, 1);
  }

  /**
    Iterates through each registered test waiter, and invokes
    its callback. If any waiter returns false, this method will return
    true indicating that the waiters have not settled yet.
  
    This is generally used internally from the acceptance/integration test
    infrastructure.
  
    @public
    @for Ember.Test
    @static
    @method checkWaiters
  */

  function checkWaiters() {
    if (!callbacks.length) {
      return false;
    }
    for (var i = 0; i < callbacks.length; i++) {
      var context = contexts[i];
      var callback = callbacks[i];
      if (!callback.call(context)) {
        return true;
      }
    }
    return false;
  }

  function indexOf(context, callback) {
    for (var i = 0; i < callbacks.length; i++) {
      if (callbacks[i] === callback && contexts[i] === context) {
        return i;
      }
    }
    return -1;
  }

  function generateDeprecatedWaitersArray() {
    _emberMetal.deprecate('Usage of `Ember.Test.waiters` is deprecated. Please refactor to `Ember.Test.checkWaiters`.', !true, { until: '2.8.0', id: 'ember-testing.test-waiters' });

    var array = new Array(callbacks.length);
    for (var i = 0; i < callbacks.length; i++) {
      var context = contexts[i];
      var callback = callbacks[i];

      array[i] = [context, callback];
    }

    return array;
  }
});
requireModule("ember-testing");

}());

/*!
 * QUnit 2.14.0
 * https://qunitjs.com/
 *
 * Copyright OpenJS Foundation and other contributors
 * Released under the MIT license
 * https://jquery.org/license
 *
 * Date: 2021-01-12
 */
(function (global$1) {
	'use strict';

	// Support IE 9-10, PhantomJS: Fallback for fuzzysort.js used by ./html.js
	// eslint-disable-next-line no-unused-vars
	var Map = typeof Map === "function" ? Map : function StringMap() {
		var store = Object.create( null );
		this.get = function( strKey ) {
			return store[ strKey ];
		};
		this.set = function( strKey, val ) {
			store[ strKey ] = val;
			return this;
		};
		this.clear = function() {
			store = Object.create( null );
		};
	};

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var global__default = /*#__PURE__*/_interopDefaultLegacy(global$1);

	var window$1 = global__default['default'].window;
	var self$1 = global__default['default'].self;
	var console$1 = global__default['default'].console;
	var setTimeout$1 = global__default['default'].setTimeout;
	var clearTimeout = global__default['default'].clearTimeout;
	var document = window$1 && window$1.document;
	var navigator = window$1 && window$1.navigator;
	var localSessionStorage = function () {
	  var x = "qunit-test-string";

	  try {
	    global__default['default'].sessionStorage.setItem(x, x);
	    global__default['default'].sessionStorage.removeItem(x);
	    return global__default['default'].sessionStorage;
	  } catch (e) {
	    return undefined;
	  }
	}();

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _toConsumableArray(arr) {
	  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
	}

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
	}

	function _iterableToArray(iter) {
	  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(o);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}

	function _createForOfIteratorHelper(o, allowArrayLike) {
	  var it;

	  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
	    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
	      if (it) o = it;
	      var i = 0;

	      var F = function () {};

	      return {
	        s: F,
	        n: function () {
	          if (i >= o.length) return {
	            done: true
	          };
	          return {
	            done: false,
	            value: o[i++]
	          };
	        },
	        e: function (e) {
	          throw e;
	        },
	        f: F
	      };
	    }

	    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }

	  var normalCompletion = true,
	      didErr = false,
	      err;
	  return {
	    s: function () {
	      it = o[Symbol.iterator]();
	    },
	    n: function () {
	      var step = it.next();
	      normalCompletion = step.done;
	      return step;
	    },
	    e: function (e) {
	      didErr = true;
	      err = e;
	    },
	    f: function () {
	      try {
	        if (!normalCompletion && it.return != null) it.return();
	      } finally {
	        if (didErr) throw err;
	      }
	    }
	  };
	}

	// Detect if the console object exists and no-op otherwise.
	// This allows support for IE 9, which doesn't have a console
	// object if the developer tools are not open.
	// Support: SpiderMonkey (mozjs 68+)
	// The console object has a log method, but no warn method.

	var Logger = {
	  warn: console$1 ? (console$1.warn || console$1.log).bind(console$1) : function () {}
	};

	var toString = Object.prototype.toString;
	var hasOwn = Object.prototype.hasOwnProperty;
	var now = Date.now || function () {
	  return new Date().getTime();
	};
	var nativePerf = getNativePerf();

	function getNativePerf() {
	  if (window$1 && typeof window$1.performance !== "undefined" && typeof window$1.performance.mark === "function" && typeof window$1.performance.measure === "function") {
	    return window$1.performance;
	  } else {
	    return undefined;
	  }
	}

	var performance = {
	  now: nativePerf ? nativePerf.now.bind(nativePerf) : now,
	  measure: nativePerf ? function (comment, startMark, endMark) {
	    // `performance.measure` may fail if the mark could not be found.
	    // reasons a specific mark could not be found include: outside code invoking `performance.clearMarks()`
	    try {
	      nativePerf.measure(comment, startMark, endMark);
	    } catch (ex) {
	      Logger.warn("performance.measure could not be executed because of ", ex.message);
	    }
	  } : function () {},
	  mark: nativePerf ? nativePerf.mark.bind(nativePerf) : function () {}
	}; // Returns a new Array with the elements that are in a but not in b

	function diff(a, b) {
	  var result = a.slice();

	  for (var i = 0; i < result.length; i++) {
	    for (var j = 0; j < b.length; j++) {
	      if (result[i] === b[j]) {
	        result.splice(i, 1);
	        i--;
	        break;
	      }
	    }
	  }

	  return result;
	}
	/**
	 * Determines whether an element exists in a given array or not.
	 *
	 * @method inArray
	 * @param {Any} elem
	 * @param {Array} array
	 * @return {boolean}
	 */

	function inArray(elem, array) {
	  return array.indexOf(elem) !== -1;
	}
	/**
	 * Makes a clone of an object using only Array or Object as base,
	 * and copies over the own enumerable properties.
	 *
	 * @param {Object} obj
	 * @return {Object} New object with only the own properties (recursively).
	 */

	function objectValues(obj) {
	  var vals = is("array", obj) ? [] : {};

	  for (var key in obj) {
	    if (hasOwn.call(obj, key)) {
	      var val = obj[key];
	      vals[key] = val === Object(val) ? objectValues(val) : val;
	    }
	  }

	  return vals;
	}
	function extend(a, b, undefOnly) {
	  for (var prop in b) {
	    if (hasOwn.call(b, prop)) {
	      if (b[prop] === undefined) {
	        delete a[prop];
	      } else if (!(undefOnly && typeof a[prop] !== "undefined")) {
	        a[prop] = b[prop];
	      }
	    }
	  }

	  return a;
	}
	function objectType(obj) {
	  if (typeof obj === "undefined") {
	    return "undefined";
	  } // Consider: typeof null === object


	  if (obj === null) {
	    return "null";
	  }

	  var match = toString.call(obj).match(/^\[object\s(.*)\]$/);
	  var type = match && match[1];

	  switch (type) {
	    case "Number":
	      if (isNaN(obj)) {
	        return "nan";
	      }

	      return "number";

	    case "String":
	    case "Boolean":
	    case "Array":
	    case "Set":
	    case "Map":
	    case "Date":
	    case "RegExp":
	    case "Function":
	    case "Symbol":
	      return type.toLowerCase();

	    default:
	      return _typeof(obj);
	  }
	} // Safe object type checking

	function is(type, obj) {
	  return objectType(obj) === type;
	} // Based on Java's String.hashCode, a simple but not
	// rigorously collision resistant hashing function

	function generateHash(module, testName) {
	  var str = module + "\x1C" + testName;
	  var hash = 0;

	  for (var i = 0; i < str.length; i++) {
	    hash = (hash << 5) - hash + str.charCodeAt(i);
	    hash |= 0;
	  } // Convert the possibly negative integer hash code into an 8 character hex string, which isn't
	  // strictly necessary but increases user understanding that the id is a SHA-like hash


	  var hex = (0x100000000 + hash).toString(16);

	  if (hex.length < 8) {
	    hex = "0000000" + hex;
	  }

	  return hex.slice(-8);
	}

	// Authors: Philippe Rathé <prathe@gmail.com>, David Chan <david@troi.org>

	var equiv = (function () {
	  // Value pairs queued for comparison. Used for breadth-first processing order, recursion
	  // detection and avoiding repeated comparison (see below for details).
	  // Elements are { a: val, b: val }.
	  var pairs = [];

	  var getProto = Object.getPrototypeOf || function (obj) {
	    return obj.__proto__;
	  };

	  function useStrictEquality(a, b) {
	    // This only gets called if a and b are not strict equal, and is used to compare on
	    // the primitive values inside object wrappers. For example:
	    // `var i = 1;`
	    // `var j = new Number(1);`
	    // Neither a nor b can be null, as a !== b and they have the same type.
	    if (_typeof(a) === "object") {
	      a = a.valueOf();
	    }

	    if (_typeof(b) === "object") {
	      b = b.valueOf();
	    }

	    return a === b;
	  }

	  function compareConstructors(a, b) {
	    var protoA = getProto(a);
	    var protoB = getProto(b); // Comparing constructors is more strict than using `instanceof`

	    if (a.constructor === b.constructor) {
	      return true;
	    } // Ref #851
	    // If the obj prototype descends from a null constructor, treat it
	    // as a null prototype.


	    if (protoA && protoA.constructor === null) {
	      protoA = null;
	    }

	    if (protoB && protoB.constructor === null) {
	      protoB = null;
	    } // Allow objects with no prototype to be equivalent to
	    // objects with Object as their constructor.


	    if (protoA === null && protoB === Object.prototype || protoB === null && protoA === Object.prototype) {
	      return true;
	    }

	    return false;
	  }

	  function getRegExpFlags(regexp) {
	    return "flags" in regexp ? regexp.flags : regexp.toString().match(/[gimuy]*$/)[0];
	  }

	  function isContainer(val) {
	    return ["object", "array", "map", "set"].indexOf(objectType(val)) !== -1;
	  }

	  function breadthFirstCompareChild(a, b) {
	    // If a is a container not reference-equal to b, postpone the comparison to the
	    // end of the pairs queue -- unless (a, b) has been seen before, in which case skip
	    // over the pair.
	    if (a === b) {
	      return true;
	    }

	    if (!isContainer(a)) {
	      return typeEquiv(a, b);
	    }

	    if (pairs.every(function (pair) {
	      return pair.a !== a || pair.b !== b;
	    })) {
	      // Not yet started comparing this pair
	      pairs.push({
	        a: a,
	        b: b
	      });
	    }

	    return true;
	  }

	  var callbacks = {
	    "string": useStrictEquality,
	    "boolean": useStrictEquality,
	    "number": useStrictEquality,
	    "null": useStrictEquality,
	    "undefined": useStrictEquality,
	    "symbol": useStrictEquality,
	    "date": useStrictEquality,
	    "nan": function nan() {
	      return true;
	    },
	    "regexp": function regexp(a, b) {
	      return a.source === b.source && // Include flags in the comparison
	      getRegExpFlags(a) === getRegExpFlags(b);
	    },
	    // abort (identical references / instance methods were skipped earlier)
	    "function": function _function() {
	      return false;
	    },
	    "array": function array(a, b) {
	      var len = a.length;

	      if (len !== b.length) {
	        // Safe and faster
	        return false;
	      }

	      for (var i = 0; i < len; i++) {
	        // Compare non-containers; queue non-reference-equal containers
	        if (!breadthFirstCompareChild(a[i], b[i])) {
	          return false;
	        }
	      }

	      return true;
	    },
	    // Define sets a and b to be equivalent if for each element aVal in a, there
	    // is some element bVal in b such that aVal and bVal are equivalent. Element
	    // repetitions are not counted, so these are equivalent:
	    // a = new Set( [ {}, [], [] ] );
	    // b = new Set( [ {}, {}, [] ] );
	    "set": function set(a, b) {
	      if (a.size !== b.size) {
	        // This optimization has certain quirks because of the lack of
	        // repetition counting. For instance, adding the same
	        // (reference-identical) element to two equivalent sets can
	        // make them non-equivalent.
	        return false;
	      }

	      var outerEq = true;
	      a.forEach(function (aVal) {
	        // Short-circuit if the result is already known. (Using for...of
	        // with a break clause would be cleaner here, but it would cause
	        // a syntax error on older Javascript implementations even if
	        // Set is unused)
	        if (!outerEq) {
	          return;
	        }

	        var innerEq = false;
	        b.forEach(function (bVal) {
	          // Likewise, short-circuit if the result is already known
	          if (innerEq) {
	            return;
	          } // Swap out the global pairs list, as the nested call to
	          // innerEquiv will clobber its contents


	          var parentPairs = pairs;

	          if (innerEquiv(bVal, aVal)) {
	            innerEq = true;
	          } // Replace the global pairs list


	          pairs = parentPairs;
	        });

	        if (!innerEq) {
	          outerEq = false;
	        }
	      });
	      return outerEq;
	    },
	    // Define maps a and b to be equivalent if for each key-value pair (aKey, aVal)
	    // in a, there is some key-value pair (bKey, bVal) in b such that
	    // [ aKey, aVal ] and [ bKey, bVal ] are equivalent. Key repetitions are not
	    // counted, so these are equivalent:
	    // a = new Map( [ [ {}, 1 ], [ {}, 1 ], [ [], 1 ] ] );
	    // b = new Map( [ [ {}, 1 ], [ [], 1 ], [ [], 1 ] ] );
	    "map": function map(a, b) {
	      if (a.size !== b.size) {
	        // This optimization has certain quirks because of the lack of
	        // repetition counting. For instance, adding the same
	        // (reference-identical) key-value pair to two equivalent maps
	        // can make them non-equivalent.
	        return false;
	      }

	      var outerEq = true;
	      a.forEach(function (aVal, aKey) {
	        // Short-circuit if the result is already known. (Using for...of
	        // with a break clause would be cleaner here, but it would cause
	        // a syntax error on older Javascript implementations even if
	        // Map is unused)
	        if (!outerEq) {
	          return;
	        }

	        var innerEq = false;
	        b.forEach(function (bVal, bKey) {
	          // Likewise, short-circuit if the result is already known
	          if (innerEq) {
	            return;
	          } // Swap out the global pairs list, as the nested call to
	          // innerEquiv will clobber its contents


	          var parentPairs = pairs;

	          if (innerEquiv([bVal, bKey], [aVal, aKey])) {
	            innerEq = true;
	          } // Replace the global pairs list


	          pairs = parentPairs;
	        });

	        if (!innerEq) {
	          outerEq = false;
	        }
	      });
	      return outerEq;
	    },
	    "object": function object(a, b) {
	      if (compareConstructors(a, b) === false) {
	        return false;
	      }

	      var aProperties = [];
	      var bProperties = []; // Be strict: don't ensure hasOwnProperty and go deep

	      for (var i in a) {
	        // Collect a's properties
	        aProperties.push(i); // Skip OOP methods that look the same

	        if (a.constructor !== Object && typeof a.constructor !== "undefined" && typeof a[i] === "function" && typeof b[i] === "function" && a[i].toString() === b[i].toString()) {
	          continue;
	        } // Compare non-containers; queue non-reference-equal containers


	        if (!breadthFirstCompareChild(a[i], b[i])) {
	          return false;
	        }
	      }

	      for (var _i in b) {
	        // Collect b's properties
	        bProperties.push(_i);
	      } // Ensures identical properties name


	      return typeEquiv(aProperties.sort(), bProperties.sort());
	    }
	  };

	  function typeEquiv(a, b) {
	    var type = objectType(a); // Callbacks for containers will append to the pairs queue to achieve breadth-first
	    // search order. The pairs queue is also used to avoid reprocessing any pair of
	    // containers that are reference-equal to a previously visited pair (a special case
	    // this being recursion detection).
	    //
	    // Because of this approach, once typeEquiv returns a false value, it should not be
	    // called again without clearing the pair queue else it may wrongly report a visited
	    // pair as being equivalent.

	    return objectType(b) === type && callbacks[type](a, b);
	  }

	  function innerEquiv(a, b) {
	    // We're done when there's nothing more to compare
	    if (arguments.length < 2) {
	      return true;
	    } // Clear the global pair queue and add the top-level values being compared


	    pairs = [{
	      a: a,
	      b: b
	    }];

	    for (var i = 0; i < pairs.length; i++) {
	      var pair = pairs[i]; // Perform type-specific comparison on any pairs that are not strictly
	      // equal. For container types, that comparison will postpone comparison
	      // of any sub-container pair to the end of the pair queue. This gives
	      // breadth-first search order. It also avoids the reprocessing of
	      // reference-equal siblings, cousins etc, which can have a significant speed
	      // impact when comparing a container of small objects each of which has a
	      // reference to the same (singleton) large object.

	      if (pair.a !== pair.b && !typeEquiv(pair.a, pair.b)) {
	        return false;
	      }
	    } // ...across all consecutive argument pairs


	    return arguments.length === 2 || innerEquiv.apply(this, [].slice.call(arguments, 1));
	  }

	  return function () {
	    var result = innerEquiv.apply(void 0, arguments); // Release any retained objects

	    pairs.length = 0;
	    return result;
	  };
	})();

	/**
	 * Config object: Maintain internal state
	 * Later exposed as QUnit.config
	 * `config` initialized at top of scope
	 */

	var config = {
	  // The queue of tests to run
	  queue: [],
	  // Block until document ready
	  blocking: true,
	  // By default, run previously failed tests first
	  // very useful in combination with "Hide passed tests" checked
	  reorder: true,
	  // By default, modify document.title when suite is done
	  altertitle: true,
	  // HTML Reporter: collapse every test except the first failing test
	  // If false, all failing tests will be expanded
	  collapse: true,
	  // By default, scroll to top of the page when suite is done
	  scrolltop: true,
	  // Depth up-to which object will be dumped
	  maxDepth: 5,
	  // When enabled, all tests must call expect()
	  requireExpects: false,
	  // Placeholder for user-configurable form-exposed URL parameters
	  urlConfig: [],
	  // Set of all modules.
	  modules: [],
	  // The first unnamed module
	  currentModule: {
	    name: "",
	    tests: [],
	    childModules: [],
	    testsRun: 0,
	    testsIgnored: 0,
	    hooks: {
	      before: [],
	      beforeEach: [],
	      afterEach: [],
	      after: []
	    }
	  },
	  callbacks: {},
	  // The storage module to use for reordering tests
	  storage: localSessionStorage
	}; // take a predefined QUnit.config and extend the defaults

	var globalConfig = window$1 && window$1.QUnit && window$1.QUnit.config; // only extend the global config if there is no QUnit overload

	if (window$1 && window$1.QUnit && !window$1.QUnit.version) {
	  extend(config, globalConfig);
	} // Push a loose unnamed module to the modules collection


	config.modules.push(config.currentModule);

	var dump = (function () {
	  function quote(str) {
	    return "\"" + str.toString().replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
	  }

	  function literal(o) {
	    return o + "";
	  }

	  function join(pre, arr, post) {
	    var s = dump.separator();
	    var inner = dump.indent(1);

	    if (arr.join) {
	      arr = arr.join("," + s + inner);
	    }

	    if (!arr) {
	      return pre + post;
	    }

	    var base = dump.indent();
	    return [pre, inner + arr, base + post].join(s);
	  }

	  function array(arr, stack) {
	    if (dump.maxDepth && dump.depth > dump.maxDepth) {
	      return "[object Array]";
	    }

	    this.up();
	    var i = arr.length;
	    var ret = new Array(i);

	    while (i--) {
	      ret[i] = this.parse(arr[i], undefined, stack);
	    }

	    this.down();
	    return join("[", ret, "]");
	  }

	  function isArray(obj) {
	    return (//Native Arrays
	      toString.call(obj) === "[object Array]" || // NodeList objects
	      typeof obj.length === "number" && obj.item !== undefined && (obj.length ? obj.item(0) === obj[0] : obj.item(0) === null && obj[0] === undefined)
	    );
	  }

	  var reName = /^function (\w+)/;
	  var dump = {
	    // The objType is used mostly internally, you can fix a (custom) type in advance
	    parse: function parse(obj, objType, stack) {
	      stack = stack || [];
	      var objIndex = stack.indexOf(obj);

	      if (objIndex !== -1) {
	        return "recursion(".concat(objIndex - stack.length, ")");
	      }

	      objType = objType || this.typeOf(obj);
	      var parser = this.parsers[objType];

	      var parserType = _typeof(parser);

	      if (parserType === "function") {
	        stack.push(obj);
	        var res = parser.call(this, obj, stack);
	        stack.pop();
	        return res;
	      }

	      return parserType === "string" ? parser : this.parsers.error;
	    },
	    typeOf: function typeOf(obj) {
	      var type;

	      if (obj === null) {
	        type = "null";
	      } else if (typeof obj === "undefined") {
	        type = "undefined";
	      } else if (is("regexp", obj)) {
	        type = "regexp";
	      } else if (is("date", obj)) {
	        type = "date";
	      } else if (is("function", obj)) {
	        type = "function";
	      } else if (obj.setInterval !== undefined && obj.document !== undefined && obj.nodeType === undefined) {
	        type = "window";
	      } else if (obj.nodeType === 9) {
	        type = "document";
	      } else if (obj.nodeType) {
	        type = "node";
	      } else if (isArray(obj)) {
	        type = "array";
	      } else if (obj.constructor === Error.prototype.constructor) {
	        type = "error";
	      } else {
	        type = _typeof(obj);
	      }

	      return type;
	    },
	    separator: function separator() {
	      if (this.multiline) {
	        return this.HTML ? "<br />" : "\n";
	      } else {
	        return this.HTML ? "&#160;" : " ";
	      }
	    },
	    // Extra can be a number, shortcut for increasing-calling-decreasing
	    indent: function indent(extra) {
	      if (!this.multiline) {
	        return "";
	      }

	      var chr = this.indentChar;

	      if (this.HTML) {
	        chr = chr.replace(/\t/g, "   ").replace(/ /g, "&#160;");
	      }

	      return new Array(this.depth + (extra || 0)).join(chr);
	    },
	    up: function up(a) {
	      this.depth += a || 1;
	    },
	    down: function down(a) {
	      this.depth -= a || 1;
	    },
	    setParser: function setParser(name, parser) {
	      this.parsers[name] = parser;
	    },
	    // The next 3 are exposed so you can use them
	    quote: quote,
	    literal: literal,
	    join: join,
	    depth: 1,
	    maxDepth: config.maxDepth,
	    // This is the list of parsers, to modify them, use dump.setParser
	    parsers: {
	      window: "[Window]",
	      document: "[Document]",
	      error: function error(_error) {
	        return "Error(\"" + _error.message + "\")";
	      },
	      unknown: "[Unknown]",
	      "null": "null",
	      "undefined": "undefined",
	      "function": function _function(fn) {
	        var ret = "function"; // Functions never have name in IE

	        var name = "name" in fn ? fn.name : (reName.exec(fn) || [])[1];

	        if (name) {
	          ret += " " + name;
	        }

	        ret += "(";
	        ret = [ret, dump.parse(fn, "functionArgs"), "){"].join("");
	        return join(ret, dump.parse(fn, "functionCode"), "}");
	      },
	      array: array,
	      nodelist: array,
	      "arguments": array,
	      object: function object(map, stack) {
	        var ret = [];

	        if (dump.maxDepth && dump.depth > dump.maxDepth) {
	          return "[object Object]";
	        }

	        dump.up();
	        var keys = [];

	        for (var key in map) {
	          keys.push(key);
	        } // Some properties are not always enumerable on Error objects.


	        var nonEnumerableProperties = ["message", "name"];

	        for (var i in nonEnumerableProperties) {
	          var _key = nonEnumerableProperties[i];

	          if (_key in map && !inArray(_key, keys)) {
	            keys.push(_key);
	          }
	        }

	        keys.sort();

	        for (var _i = 0; _i < keys.length; _i++) {
	          var _key2 = keys[_i];
	          var val = map[_key2];
	          ret.push(dump.parse(_key2, "key") + ": " + dump.parse(val, undefined, stack));
	        }

	        dump.down();
	        return join("{", ret, "}");
	      },
	      node: function node(_node) {
	        var open = dump.HTML ? "&lt;" : "<";
	        var close = dump.HTML ? "&gt;" : ">";

	        var tag = _node.nodeName.toLowerCase();

	        var ret = open + tag;
	        var attrs = _node.attributes;

	        if (attrs) {
	          for (var i = 0, len = attrs.length; i < len; i++) {
	            var val = attrs[i].nodeValue; // IE6 includes all attributes in .attributes, even ones not explicitly
	            // set. Those have values like undefined, null, 0, false, "" or
	            // "inherit".

	            if (val && val !== "inherit") {
	              ret += " " + attrs[i].nodeName + "=" + dump.parse(val, "attribute");
	            }
	          }
	        }

	        ret += close; // Show content of TextNode or CDATASection

	        if (_node.nodeType === 3 || _node.nodeType === 4) {
	          ret += _node.nodeValue;
	        }

	        return ret + open + "/" + tag + close;
	      },
	      // Function calls it internally, it's the arguments part of the function
	      functionArgs: function functionArgs(fn) {
	        var l = fn.length;

	        if (!l) {
	          return "";
	        }

	        var args = new Array(l);

	        while (l--) {
	          // 97 is 'a'
	          args[l] = String.fromCharCode(97 + l);
	        }

	        return " " + args.join(", ") + " ";
	      },
	      // Object calls it internally, the key part of an item in a map
	      key: quote,
	      // Function calls it internally, it's the content of the function
	      functionCode: "[code]",
	      // Node calls it internally, it's a html attribute value
	      attribute: quote,
	      string: quote,
	      date: quote,
	      regexp: literal,
	      number: literal,
	      "boolean": literal,
	      symbol: function symbol(sym) {
	        return sym.toString();
	      }
	    },
	    // If true, entities are escaped ( <, >, \t, space and \n )
	    HTML: false,
	    // Indentation unit
	    indentChar: "  ",
	    // If true, items in a collection, are separated by a \n, else just a space.
	    multiline: true
	  };
	  return dump;
	})();

	var SuiteReport = /*#__PURE__*/function () {
	  function SuiteReport(name, parentSuite) {
	    _classCallCheck(this, SuiteReport);

	    this.name = name;
	    this.fullName = parentSuite ? parentSuite.fullName.concat(name) : [];
	    this.tests = [];
	    this.childSuites = [];

	    if (parentSuite) {
	      parentSuite.pushChildSuite(this);
	    }
	  }

	  _createClass(SuiteReport, [{
	    key: "start",
	    value: function start(recordTime) {
	      if (recordTime) {
	        this._startTime = performance.now();
	        var suiteLevel = this.fullName.length;
	        performance.mark("qunit_suite_".concat(suiteLevel, "_start"));
	      }

	      return {
	        name: this.name,
	        fullName: this.fullName.slice(),
	        tests: this.tests.map(function (test) {
	          return test.start();
	        }),
	        childSuites: this.childSuites.map(function (suite) {
	          return suite.start();
	        }),
	        testCounts: {
	          total: this.getTestCounts().total
	        }
	      };
	    }
	  }, {
	    key: "end",
	    value: function end(recordTime) {
	      if (recordTime) {
	        this._endTime = performance.now();
	        var suiteLevel = this.fullName.length;
	        var suiteName = this.fullName.join(" – ");
	        performance.mark("qunit_suite_".concat(suiteLevel, "_end"));
	        performance.measure(suiteLevel === 0 ? "QUnit Test Run" : "QUnit Test Suite: ".concat(suiteName), "qunit_suite_".concat(suiteLevel, "_start"), "qunit_suite_".concat(suiteLevel, "_end"));
	      }

	      return {
	        name: this.name,
	        fullName: this.fullName.slice(),
	        tests: this.tests.map(function (test) {
	          return test.end();
	        }),
	        childSuites: this.childSuites.map(function (suite) {
	          return suite.end();
	        }),
	        testCounts: this.getTestCounts(),
	        runtime: this.getRuntime(),
	        status: this.getStatus()
	      };
	    }
	  }, {
	    key: "pushChildSuite",
	    value: function pushChildSuite(suite) {
	      this.childSuites.push(suite);
	    }
	  }, {
	    key: "pushTest",
	    value: function pushTest(test) {
	      this.tests.push(test);
	    }
	  }, {
	    key: "getRuntime",
	    value: function getRuntime() {
	      return this._endTime - this._startTime;
	    }
	  }, {
	    key: "getTestCounts",
	    value: function getTestCounts() {
	      var counts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
	        passed: 0,
	        failed: 0,
	        skipped: 0,
	        todo: 0,
	        total: 0
	      };
	      counts = this.tests.reduce(function (counts, test) {
	        if (test.valid) {
	          counts[test.getStatus()]++;
	          counts.total++;
	        }

	        return counts;
	      }, counts);
	      return this.childSuites.reduce(function (counts, suite) {
	        return suite.getTestCounts(counts);
	      }, counts);
	    }
	  }, {
	    key: "getStatus",
	    value: function getStatus() {
	      var _this$getTestCounts = this.getTestCounts(),
	          total = _this$getTestCounts.total,
	          failed = _this$getTestCounts.failed,
	          skipped = _this$getTestCounts.skipped,
	          todo = _this$getTestCounts.todo;

	      if (failed) {
	        return "failed";
	      } else {
	        if (skipped === total) {
	          return "skipped";
	        } else if (todo === total) {
	          return "todo";
	        } else {
	          return "passed";
	        }
	      }
	    }
	  }]);

	  return SuiteReport;
	}();

	var moduleStack = [];

	function isParentModuleInQueue() {
	  var modulesInQueue = config.modules.map(function (module) {
	    return module.moduleId;
	  });
	  return moduleStack.some(function (module) {
	    return modulesInQueue.includes(module.moduleId);
	  });
	}

	function createModule(name, testEnvironment, modifiers) {
	  var parentModule = moduleStack.length ? moduleStack.slice(-1)[0] : null;
	  var moduleName = parentModule !== null ? [parentModule.name, name].join(" > ") : name;
	  var parentSuite = parentModule ? parentModule.suiteReport : globalSuite;
	  var skip = parentModule !== null && parentModule.skip || modifiers.skip;
	  var todo = parentModule !== null && parentModule.todo || modifiers.todo;
	  var module = {
	    name: moduleName,
	    parentModule: parentModule,
	    tests: [],
	    moduleId: generateHash(moduleName),
	    testsRun: 0,
	    testsIgnored: 0,
	    childModules: [],
	    suiteReport: new SuiteReport(name, parentSuite),
	    // Pass along `skip` and `todo` properties from parent module, in case
	    // there is one, to childs. And use own otherwise.
	    // This property will be used to mark own tests and tests of child suites
	    // as either `skipped` or `todo`.
	    skip: skip,
	    todo: skip ? false : todo,
	    ignored: modifiers.ignored || false
	  };
	  var env = {};

	  if (parentModule) {
	    parentModule.childModules.push(module);
	    extend(env, parentModule.testEnvironment);
	  }

	  extend(env, testEnvironment);
	  module.testEnvironment = env;
	  config.modules.push(module);
	  return module;
	}

	function processModule(name, options, executeNow) {
	  var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

	  if (objectType(options) === "function") {
	    executeNow = options;
	    options = undefined;
	  }

	  var module = createModule(name, options, modifiers); // Move any hooks to a 'hooks' object

	  var testEnvironment = module.testEnvironment;
	  var hooks = module.hooks = {};
	  setHookFromEnvironment(hooks, testEnvironment, "before");
	  setHookFromEnvironment(hooks, testEnvironment, "beforeEach");
	  setHookFromEnvironment(hooks, testEnvironment, "afterEach");
	  setHookFromEnvironment(hooks, testEnvironment, "after");
	  var moduleFns = {
	    before: setHookFunction(module, "before"),
	    beforeEach: setHookFunction(module, "beforeEach"),
	    afterEach: setHookFunction(module, "afterEach"),
	    after: setHookFunction(module, "after")
	  };
	  var currentModule = config.currentModule;

	  if (objectType(executeNow) === "function") {
	    moduleStack.push(module);
	    config.currentModule = module;
	    executeNow.call(module.testEnvironment, moduleFns);
	    moduleStack.pop();
	    module = module.parentModule || currentModule;
	  }

	  config.currentModule = module;

	  function setHookFromEnvironment(hooks, environment, name) {
	    var potentialHook = environment[name];
	    hooks[name] = typeof potentialHook === "function" ? [potentialHook] : [];
	    delete environment[name];
	  }

	  function setHookFunction(module, hookName) {
	    return function setHook(callback) {
	      module.hooks[hookName].push(callback);
	    };
	  }
	}

	var focused = false; // indicates that the "only" filter was used

	function module$1(name, options, executeNow) {
	  var ignored = focused && !isParentModuleInQueue();
	  processModule(name, options, executeNow, {
	    ignored: ignored
	  });
	}

	module$1.only = function () {
	  if (!focused) {
	    config.modules.length = 0;
	    config.queue.length = 0;
	  }

	  processModule.apply(void 0, arguments);
	  focused = true;
	};

	module$1.skip = function (name, options, executeNow) {
	  if (focused) {
	    return;
	  }

	  processModule(name, options, executeNow, {
	    skip: true
	  });
	};

	module$1.todo = function (name, options, executeNow) {
	  if (focused) {
	    return;
	  }

	  processModule(name, options, executeNow, {
	    todo: true
	  });
	};

	var LISTENERS = Object.create(null);
	var SUPPORTED_EVENTS = ["runStart", "suiteStart", "testStart", "assertion", "testEnd", "suiteEnd", "runEnd"];
	/**
	 * Emits an event with the specified data to all currently registered listeners.
	 * Callbacks will fire in the order in which they are registered (FIFO). This
	 * function is not exposed publicly; it is used by QUnit internals to emit
	 * logging events.
	 *
	 * @private
	 * @method emit
	 * @param {string} eventName
	 * @param {Object} data
	 * @return {void}
	 */

	function emit(eventName, data) {
	  if (objectType(eventName) !== "string") {
	    throw new TypeError("eventName must be a string when emitting an event");
	  } // Clone the callbacks in case one of them registers a new callback


	  var originalCallbacks = LISTENERS[eventName];
	  var callbacks = originalCallbacks ? _toConsumableArray(originalCallbacks) : [];

	  for (var i = 0; i < callbacks.length; i++) {
	    callbacks[i](data);
	  }
	}
	/**
	 * Registers a callback as a listener to the specified event.
	 *
	 * @public
	 * @method on
	 * @param {string} eventName
	 * @param {Function} callback
	 * @return {void}
	 */

	function on(eventName, callback) {
	  if (objectType(eventName) !== "string") {
	    throw new TypeError("eventName must be a string when registering a listener");
	  } else if (!inArray(eventName, SUPPORTED_EVENTS)) {
	    var events = SUPPORTED_EVENTS.join(", ");
	    throw new Error("\"".concat(eventName, "\" is not a valid event; must be one of: ").concat(events, "."));
	  } else if (objectType(callback) !== "function") {
	    throw new TypeError("callback must be a function when registering a listener");
	  }

	  if (!LISTENERS[eventName]) {
	    LISTENERS[eventName] = [];
	  } // Don't register the same callback more than once


	  if (!inArray(callback, LISTENERS[eventName])) {
	    LISTENERS[eventName].push(callback);
	  }
	}

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, basedir, module) {
		return module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			}
		}, fn(module, module.exports), module.exports;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	var promisePolyfill = createCommonjsModule(function (module) {
	  /*
	  https://github.com/taylorhakes/promise-polyfill/tree/8.2.0
	  
	  Copyright 2014 Taylor Hakes
	  Copyright 2014 Forbes Lindesay
	  
	  Permission is hereby granted, free of charge, to any person obtaining a copy
	  of this software and associated documentation files (the "Software"), to deal
	  in the Software without restriction, including without limitation the rights
	  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	  copies of the Software, and to permit persons to whom the Software is
	  furnished to do so, subject to the following conditions:
	  
	  The above copyright notice and this permission notice shall be included in
	  all copies or substantial portions of the Software.
	  
	  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	  THE SOFTWARE.
	  
	  -------
	  
	  Patches for use in QUnit:
	  
	  - 2021-01-09: Export as module only, don't change global scope as QUnit must not
	    affect the host context (e.g. people may test their application intentionally
	    with different or no polyfills and we must not affect that).
	  
	  - 2021-01-10: Avoid unconditional reference to setTimeout, which isn't supported
	    on SpiderMonkey (mozjs 68). Done by re-arranging the code so that we return early
	    (it has native support for Promise), instead of building an unused polyfill.
	  
	  - 2021-01-10: Add 'globalThis' to globalNS implementation to support SpiderMonkey.
	  
	  */
	  (function () {
	    /** @suppress {undefinedVars} */

	    var globalNS = function () {
	      // the only reliable means to get the global object is
	      // `Function('return this')()`
	      // However, this causes CSP violations in Chrome apps.
	      if (typeof globalThis !== 'undefined') {
	        return globalThis;
	      }

	      if (typeof self !== 'undefined') {
	        return self;
	      }

	      if (typeof window !== 'undefined') {
	        return window;
	      }

	      if (typeof commonjsGlobal !== 'undefined') {
	        return commonjsGlobal;
	      }

	      throw new Error('unable to locate global object');
	    }(); // Expose the polyfill if Promise is undefined or set to a
	    // non-function value. The latter can be due to a named HTMLElement
	    // being exposed by browsers for legacy reasons.
	    // https://github.com/taylorhakes/promise-polyfill/issues/114


	    if (typeof globalNS['Promise'] === 'function') {
	      module.exports = globalNS['Promise'];
	      return;
	    }
	    /**
	     * @this {Promise}
	     */


	    function finallyConstructor(callback) {
	      var constructor = this.constructor;
	      return this.then(function (value) {
	        // @ts-ignore
	        return constructor.resolve(callback()).then(function () {
	          return value;
	        });
	      }, function (reason) {
	        // @ts-ignore
	        return constructor.resolve(callback()).then(function () {
	          // @ts-ignore
	          return constructor.reject(reason);
	        });
	      });
	    }

	    function allSettled(arr) {
	      var P = this;
	      return new P(function (resolve, reject) {
	        if (!(arr && typeof arr.length !== 'undefined')) {
	          return reject(new TypeError(_typeof(arr) + ' ' + arr + ' is not iterable(cannot read property Symbol(Symbol.iterator))'));
	        }

	        var args = Array.prototype.slice.call(arr);
	        if (args.length === 0) return resolve([]);
	        var remaining = args.length;

	        function res(i, val) {
	          if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
	            var then = val.then;

	            if (typeof then === 'function') {
	              then.call(val, function (val) {
	                res(i, val);
	              }, function (e) {
	                args[i] = {
	                  status: 'rejected',
	                  reason: e
	                };

	                if (--remaining === 0) {
	                  resolve(args);
	                }
	              });
	              return;
	            }
	          }

	          args[i] = {
	            status: 'fulfilled',
	            value: val
	          };

	          if (--remaining === 0) {
	            resolve(args);
	          }
	        }

	        for (var i = 0; i < args.length; i++) {
	          res(i, args[i]);
	        }
	      });
	    } // Store setTimeout reference so promise-polyfill will be unaffected by
	    // other code modifying setTimeout (like sinon.useFakeTimers())


	    var setTimeoutFunc = setTimeout;

	    function isArray(x) {
	      return Boolean(x && typeof x.length !== 'undefined');
	    }

	    function noop() {} // Polyfill for Function.prototype.bind


	    function bind(fn, thisArg) {
	      return function () {
	        fn.apply(thisArg, arguments);
	      };
	    }
	    /**
	     * @constructor
	     * @param {Function} fn
	     */


	    function Promise(fn) {
	      if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
	      if (typeof fn !== 'function') throw new TypeError('not a function');
	      /** @type {!number} */

	      this._state = 0;
	      /** @type {!boolean} */

	      this._handled = false;
	      /** @type {Promise|undefined} */

	      this._value = undefined;
	      /** @type {!Array<!Function>} */

	      this._deferreds = [];
	      doResolve(fn, this);
	    }

	    function handle(self, deferred) {
	      while (self._state === 3) {
	        self = self._value;
	      }

	      if (self._state === 0) {
	        self._deferreds.push(deferred);

	        return;
	      }

	      self._handled = true;

	      Promise._immediateFn(function () {
	        var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;

	        if (cb === null) {
	          (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	          return;
	        }

	        var ret;

	        try {
	          ret = cb(self._value);
	        } catch (e) {
	          reject(deferred.promise, e);
	          return;
	        }

	        resolve(deferred.promise, ret);
	      });
	    }

	    function resolve(self, newValue) {
	      try {
	        // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	        if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');

	        if (newValue && (_typeof(newValue) === 'object' || typeof newValue === 'function')) {
	          var then = newValue.then;

	          if (newValue instanceof Promise) {
	            self._state = 3;
	            self._value = newValue;
	            finale(self);
	            return;
	          } else if (typeof then === 'function') {
	            doResolve(bind(then, newValue), self);
	            return;
	          }
	        }

	        self._state = 1;
	        self._value = newValue;
	        finale(self);
	      } catch (e) {
	        reject(self, e);
	      }
	    }

	    function reject(self, newValue) {
	      self._state = 2;
	      self._value = newValue;
	      finale(self);
	    }

	    function finale(self) {
	      if (self._state === 2 && self._deferreds.length === 0) {
	        Promise._immediateFn(function () {
	          if (!self._handled) {
	            Promise._unhandledRejectionFn(self._value);
	          }
	        });
	      }

	      for (var i = 0, len = self._deferreds.length; i < len; i++) {
	        handle(self, self._deferreds[i]);
	      }

	      self._deferreds = null;
	    }
	    /**
	     * @constructor
	     */


	    function Handler(onFulfilled, onRejected, promise) {
	      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	      this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	      this.promise = promise;
	    }
	    /**
	     * Take a potentially misbehaving resolver function and make sure
	     * onFulfilled and onRejected are only called once.
	     *
	     * Makes no guarantees about asynchrony.
	     */


	    function doResolve(fn, self) {
	      var done = false;

	      try {
	        fn(function (value) {
	          if (done) return;
	          done = true;
	          resolve(self, value);
	        }, function (reason) {
	          if (done) return;
	          done = true;
	          reject(self, reason);
	        });
	      } catch (ex) {
	        if (done) return;
	        done = true;
	        reject(self, ex);
	      }
	    }

	    Promise.prototype['catch'] = function (onRejected) {
	      return this.then(null, onRejected);
	    };

	    Promise.prototype.then = function (onFulfilled, onRejected) {
	      // @ts-ignore
	      var prom = new this.constructor(noop);
	      handle(this, new Handler(onFulfilled, onRejected, prom));
	      return prom;
	    };

	    Promise.prototype['finally'] = finallyConstructor;

	    Promise.all = function (arr) {
	      return new Promise(function (resolve, reject) {
	        if (!isArray(arr)) {
	          return reject(new TypeError('Promise.all accepts an array'));
	        }

	        var args = Array.prototype.slice.call(arr);
	        if (args.length === 0) return resolve([]);
	        var remaining = args.length;

	        function res(i, val) {
	          try {
	            if (val && (_typeof(val) === 'object' || typeof val === 'function')) {
	              var then = val.then;

	              if (typeof then === 'function') {
	                then.call(val, function (val) {
	                  res(i, val);
	                }, reject);
	                return;
	              }
	            }

	            args[i] = val;

	            if (--remaining === 0) {
	              resolve(args);
	            }
	          } catch (ex) {
	            reject(ex);
	          }
	        }

	        for (var i = 0; i < args.length; i++) {
	          res(i, args[i]);
	        }
	      });
	    };

	    Promise.allSettled = allSettled;

	    Promise.resolve = function (value) {
	      if (value && _typeof(value) === 'object' && value.constructor === Promise) {
	        return value;
	      }

	      return new Promise(function (resolve) {
	        resolve(value);
	      });
	    };

	    Promise.reject = function (value) {
	      return new Promise(function (resolve, reject) {
	        reject(value);
	      });
	    };

	    Promise.race = function (arr) {
	      return new Promise(function (resolve, reject) {
	        if (!isArray(arr)) {
	          return reject(new TypeError('Promise.race accepts an array'));
	        }

	        for (var i = 0, len = arr.length; i < len; i++) {
	          Promise.resolve(arr[i]).then(resolve, reject);
	        }
	      });
	    }; // Use polyfill for setImmediate for performance gains


	    Promise._immediateFn = // @ts-ignore
	    typeof setImmediate === 'function' && function (fn) {
	      // @ts-ignore
	      setImmediate(fn);
	    } || function (fn) {
	      setTimeoutFunc(fn, 0);
	    };

	    Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	      if (typeof console !== 'undefined' && console) {
	        console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	      }
	    };

	    module.exports = Promise;
	  })();
	});

	function registerLoggingCallbacks(obj) {
	  var callbackNames = ["begin", "done", "log", "testStart", "testDone", "moduleStart", "moduleDone"];

	  function registerLoggingCallback(key) {
	    var loggingCallback = function loggingCallback(callback) {
	      if (objectType(callback) !== "function") {
	        throw new Error("QUnit logging methods require a callback function as their first parameters.");
	      }

	      config.callbacks[key].push(callback);
	    };

	    return loggingCallback;
	  }

	  for (var i = 0, l = callbackNames.length; i < l; i++) {
	    var key = callbackNames[i]; // Initialize key collection of logging callback

	    if (objectType(config.callbacks[key]) === "undefined") {
	      config.callbacks[key] = [];
	    }

	    obj[key] = registerLoggingCallback(key);
	  }
	}
	function runLoggingCallbacks(key, args) {
	  var callbacks = config.callbacks[key]; // Handling 'log' callbacks separately. Unlike the other callbacks,
	  // the log callback is not controlled by the processing queue,
	  // but rather used by asserts. Hence to promisfy the 'log' callback
	  // would mean promisfying each step of a test

	  if (key === "log") {
	    callbacks.map(function (callback) {
	      return callback(args);
	    });
	    return;
	  } // ensure that each callback is executed serially


	  return callbacks.reduce(function (promiseChain, callback) {
	    return promiseChain.then(function () {
	      return promisePolyfill.resolve(callback(args));
	    });
	  }, promisePolyfill.resolve([]));
	}

	// Doesn't support IE9, it will return undefined on these browsers
	// See also https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/Stack
	var fileName = (sourceFromStacktrace(0) || "").replace(/(:\d+)+\)?/, "").replace(/.+\//, "");
	function extractStacktrace(e, offset) {
	  offset = offset === undefined ? 4 : offset;

	  if (e && e.stack) {
	    var stack = e.stack.split("\n");

	    if (/^error$/i.test(stack[0])) {
	      stack.shift();
	    }

	    if (fileName) {
	      var include = [];

	      for (var i = offset; i < stack.length; i++) {
	        if (stack[i].indexOf(fileName) !== -1) {
	          break;
	        }

	        include.push(stack[i]);
	      }

	      if (include.length) {
	        return include.join("\n");
	      }
	    }

	    return stack[offset];
	  }
	}
	function sourceFromStacktrace(offset) {
	  var error = new Error(); // Support: Safari <=7 only, IE <=10 - 11 only
	  // Not all browsers generate the `stack` property for `new Error()`, see also #636

	  if (!error.stack) {
	    try {
	      throw error;
	    } catch (err) {
	      error = err;
	    }
	  }

	  return extractStacktrace(error, offset);
	}

	var priorityCount = 0;
	var unitSampler; // This is a queue of functions that are tasks within a single test.
	// After tests are dequeued from config.queue they are expanded into
	// a set of tasks in this queue.

	var taskQueue = [];
	/**
	 * Advances the taskQueue to the next task. If the taskQueue is empty,
	 * process the testQueue
	 */

	function advance() {
	  advanceTaskQueue();

	  if (!taskQueue.length && !config.blocking && !config.current) {
	    advanceTestQueue();
	  }
	}
	/**
	 * Advances the taskQueue with an increased depth
	 */


	function advanceTaskQueue() {
	  var start = now();
	  config.depth = (config.depth || 0) + 1;
	  processTaskQueue(start);
	  config.depth--;
	}
	/**
	 * Process the first task on the taskQueue as a promise.
	 * Each task is a function returned by https://github.com/qunitjs/qunit/blob/master/src/test.js#L381
	 */


	function processTaskQueue(start) {
	  if (taskQueue.length && !config.blocking) {
	    var elapsedTime = now() - start;

	    if (!setTimeout$1 || config.updateRate <= 0 || elapsedTime < config.updateRate) {
	      var task = taskQueue.shift();
	      promisePolyfill.resolve(task()).then(function () {
	        if (!taskQueue.length) {
	          advance();
	        } else {
	          processTaskQueue(start);
	        }
	      });
	    } else {
	      setTimeout$1(advance);
	    }
	  }
	}
	/**
	 * Advance the testQueue to the next test to process. Call done() if testQueue completes.
	 */


	function advanceTestQueue() {
	  if (!config.blocking && !config.queue.length && config.depth === 0) {
	    done();
	    return;
	  }

	  var testTasks = config.queue.shift();
	  addToTaskQueue(testTasks());

	  if (priorityCount > 0) {
	    priorityCount--;
	  }

	  advance();
	}
	/**
	 * Enqueue the tasks for a test into the task queue.
	 * @param {Array} tasksArray
	 */


	function addToTaskQueue(tasksArray) {
	  taskQueue.push.apply(taskQueue, _toConsumableArray(tasksArray));
	}
	/**
	 * Return the number of tasks remaining in the task queue to be processed.
	 * @return {number}
	 */


	function taskQueueLength() {
	  return taskQueue.length;
	}
	/**
	 * Adds a test to the TestQueue for execution.
	 * @param {Function} testTasksFunc
	 * @param {boolean} prioritize
	 * @param {string} seed
	 */


	function addToTestQueue(testTasksFunc, prioritize, seed) {
	  if (prioritize) {
	    config.queue.splice(priorityCount++, 0, testTasksFunc);
	  } else if (seed) {
	    if (!unitSampler) {
	      unitSampler = unitSamplerGenerator(seed);
	    } // Insert into a random position after all prioritized items


	    var index = Math.floor(unitSampler() * (config.queue.length - priorityCount + 1));
	    config.queue.splice(priorityCount + index, 0, testTasksFunc);
	  } else {
	    config.queue.push(testTasksFunc);
	  }
	}
	/**
	 * Creates a seeded "sample" generator which is used for randomizing tests.
	 */


	function unitSamplerGenerator(seed) {
	  // 32-bit xorshift, requires only a nonzero seed
	  // https://excamera.com/sphinx/article-xorshift.html
	  var sample = parseInt(generateHash(seed), 16) || -1;
	  return function () {
	    sample ^= sample << 13;
	    sample ^= sample >>> 17;
	    sample ^= sample << 5; // ECMAScript has no unsigned number type

	    if (sample < 0) {
	      sample += 0x100000000;
	    }

	    return sample / 0x100000000;
	  };
	}
	/**
	 * This function is called when the ProcessingQueue is done processing all
	 * items. It handles emitting the final run events.
	 */


	function done() {
	  var storage = config.storage;
	  ProcessingQueue.finished = true;
	  var runtime = now() - config.started;
	  var passed = config.stats.all - config.stats.bad;

	  if (config.stats.testCount === 0) {
	    if (config.filter && config.filter.length) {
	      throw new Error("No tests matched the filter \"".concat(config.filter, "\"."));
	    }

	    if (config.module && config.module.length) {
	      throw new Error("No tests matched the module \"".concat(config.module, "\"."));
	    }

	    if (config.moduleId && config.moduleId.length) {
	      throw new Error("No tests matched the moduleId \"".concat(config.moduleId, "\"."));
	    }

	    if (config.testId && config.testId.length) {
	      throw new Error("No tests matched the testId \"".concat(config.testId, "\"."));
	    }

	    throw new Error("No tests were run.");
	  }

	  emit("runEnd", globalSuite.end(true));
	  runLoggingCallbacks("done", {
	    passed: passed,
	    failed: config.stats.bad,
	    total: config.stats.all,
	    runtime: runtime
	  }).then(function () {
	    // Clear own storage items if all tests passed
	    if (storage && config.stats.bad === 0) {
	      for (var i = storage.length - 1; i >= 0; i--) {
	        var key = storage.key(i);

	        if (key.indexOf("qunit-test-") === 0) {
	          storage.removeItem(key);
	        }
	      }
	    }
	  });
	}

	var ProcessingQueue = {
	  finished: false,
	  add: addToTestQueue,
	  advance: advance,
	  taskCount: taskQueueLength
	};

	var TestReport = /*#__PURE__*/function () {
	  function TestReport(name, suite, options) {
	    _classCallCheck(this, TestReport);

	    this.name = name;
	    this.suiteName = suite.name;
	    this.fullName = suite.fullName.concat(name);
	    this.runtime = 0;
	    this.assertions = [];
	    this.skipped = !!options.skip;
	    this.todo = !!options.todo;
	    this.valid = options.valid;
	    this._startTime = 0;
	    this._endTime = 0;
	    suite.pushTest(this);
	  }

	  _createClass(TestReport, [{
	    key: "start",
	    value: function start(recordTime) {
	      if (recordTime) {
	        this._startTime = performance.now();
	        performance.mark("qunit_test_start");
	      }

	      return {
	        name: this.name,
	        suiteName: this.suiteName,
	        fullName: this.fullName.slice()
	      };
	    }
	  }, {
	    key: "end",
	    value: function end(recordTime) {
	      if (recordTime) {
	        this._endTime = performance.now();

	        if (performance) {
	          performance.mark("qunit_test_end");
	          var testName = this.fullName.join(" – ");
	          performance.measure("QUnit Test: ".concat(testName), "qunit_test_start", "qunit_test_end");
	        }
	      }

	      return extend(this.start(), {
	        runtime: this.getRuntime(),
	        status: this.getStatus(),
	        errors: this.getFailedAssertions(),
	        assertions: this.getAssertions()
	      });
	    }
	  }, {
	    key: "pushAssertion",
	    value: function pushAssertion(assertion) {
	      this.assertions.push(assertion);
	    }
	  }, {
	    key: "getRuntime",
	    value: function getRuntime() {
	      return this._endTime - this._startTime;
	    }
	  }, {
	    key: "getStatus",
	    value: function getStatus() {
	      if (this.skipped) {
	        return "skipped";
	      }

	      var testPassed = this.getFailedAssertions().length > 0 ? this.todo : !this.todo;

	      if (!testPassed) {
	        return "failed";
	      } else if (this.todo) {
	        return "todo";
	      } else {
	        return "passed";
	      }
	    }
	  }, {
	    key: "getFailedAssertions",
	    value: function getFailedAssertions() {
	      return this.assertions.filter(function (assertion) {
	        return !assertion.passed;
	      });
	    }
	  }, {
	    key: "getAssertions",
	    value: function getAssertions() {
	      return this.assertions.slice();
	    } // Remove actual and expected values from assertions. This is to prevent
	    // leaking memory throughout a test suite.

	  }, {
	    key: "slimAssertions",
	    value: function slimAssertions() {
	      this.assertions = this.assertions.map(function (assertion) {
	        delete assertion.actual;
	        delete assertion.expected;
	        return assertion;
	      });
	    }
	  }]);

	  return TestReport;
	}();

	function Test(settings) {
	  this.expected = null;
	  this.assertions = [];
	  this.semaphore = 0;
	  this.module = config.currentModule;
	  this.steps = [];
	  this.timeout = undefined;
	  extend(this, settings); // If a module is skipped, all its tests and the tests of the child suites
	  // should be treated as skipped even if they are defined as `only` or `todo`.
	  // As for `todo` module, all its tests will be treated as `todo` except for
	  // tests defined as `skip` which will be left intact.
	  //
	  // So, if a test is defined as `todo` and is inside a skipped module, we should
	  // then treat that test as if was defined as `skip`.

	  if (this.module.skip) {
	    this.skip = true;
	    this.todo = false; // Skipped tests should be left intact
	  } else if (this.module.todo && !this.skip) {
	    this.todo = true;
	  }

	  if (!this.skip && typeof this.callback !== "function") {
	    var method = this.todo ? "QUnit.todo" : "QUnit.test";
	    throw new TypeError("You must provide a callback to ".concat(method, "(\"").concat(this.testName, "\")"));
	  } // No validation after this. Beyond this point, failures must be recorded as
	  // a completed test with errors, instead of early bail out.
	  // Otherwise, internals may be left in an inconsistent state.
	  // Ref https://github.com/qunitjs/qunit/issues/1514


	  ++Test.count;
	  this.errorForStack = new Error();
	  this.testReport = new TestReport(this.testName, this.module.suiteReport, {
	    todo: this.todo,
	    skip: this.skip,
	    valid: this.valid()
	  }); // Register unique strings

	  for (var i = 0, l = this.module.tests; i < l.length; i++) {
	    if (this.module.tests[i].name === this.testName) {
	      this.testName += " ";
	    }
	  }

	  this.testId = generateHash(this.module.name, this.testName);
	  this.module.tests.push({
	    name: this.testName,
	    testId: this.testId,
	    skip: !!this.skip
	  });

	  if (this.skip) {
	    // Skipped tests will fully ignore any sent callback
	    this.callback = function () {};

	    this.async = false;
	    this.expected = 0;
	  } else {
	    this.assert = new Assert(this);
	  }
	}
	Test.count = 0;

	function getNotStartedModules(startModule) {
	  var module = startModule;
	  var modules = [];

	  while (module && module.testsRun === 0) {
	    modules.push(module);
	    module = module.parentModule;
	  } // The above push modules from the child to the parent
	  // return a reversed order with the top being the top most parent module


	  return modules.reverse();
	}

	Test.prototype = {
	  // generating a stack trace can be expensive, so using a getter defers this until we need it
	  get stack() {
	    return extractStacktrace(this.errorForStack, 2);
	  },

	  before: function before() {
	    var _this = this;

	    var module = this.module;
	    var notStartedModules = getNotStartedModules(module); // ensure the callbacks are executed serially for each module

	    var callbackPromises = notStartedModules.reduce(function (promiseChain, startModule) {
	      return promiseChain.then(function () {
	        startModule.stats = {
	          all: 0,
	          bad: 0,
	          started: now()
	        };
	        emit("suiteStart", startModule.suiteReport.start(true));
	        return runLoggingCallbacks("moduleStart", {
	          name: startModule.name,
	          tests: startModule.tests
	        });
	      });
	    }, promisePolyfill.resolve([]));
	    return callbackPromises.then(function () {
	      config.current = _this;
	      _this.testEnvironment = extend({}, module.testEnvironment);
	      _this.started = now();
	      emit("testStart", _this.testReport.start(true));
	      return runLoggingCallbacks("testStart", {
	        name: _this.testName,
	        module: module.name,
	        testId: _this.testId,
	        previousFailure: _this.previousFailure
	      }).then(function () {
	        if (!config.pollution) {
	          saveGlobal();
	        }
	      });
	    });
	  },
	  run: function run() {
	    config.current = this;
	    this.callbackStarted = now();

	    if (config.notrycatch) {
	      runTest(this);
	      return;
	    }

	    try {
	      runTest(this);
	    } catch (e) {
	      this.pushFailure("Died on test #" + (this.assertions.length + 1) + " " + this.stack + ": " + (e.message || e), extractStacktrace(e, 0)); // Else next test will carry the responsibility

	      saveGlobal(); // Restart the tests if they're blocking

	      if (config.blocking) {
	        internalRecover(this);
	      }
	    }

	    function runTest(test) {
	      var promise = test.callback.call(test.testEnvironment, test.assert);
	      test.resolvePromise(promise); // If the test has a "lock" on it, but the timeout is 0, then we push a
	      // failure as the test should be synchronous.

	      if (test.timeout === 0 && test.semaphore !== 0) {
	        pushFailure("Test did not finish synchronously even though assert.timeout( 0 ) was used.", sourceFromStacktrace(2));
	      }
	    }
	  },
	  after: function after() {
	    checkPollution();
	  },
	  queueHook: function queueHook(hook, hookName, hookOwner) {
	    var _this2 = this;

	    var callHook = function callHook() {
	      var promise = hook.call(_this2.testEnvironment, _this2.assert);

	      _this2.resolvePromise(promise, hookName);
	    };

	    var runHook = function runHook() {
	      if (hookName === "before") {
	        if (hookOwner.testsRun !== 0) {
	          return;
	        }

	        _this2.preserveEnvironment = true;
	      } // The 'after' hook should only execute when there are not tests left and
	      // when the 'after' and 'finish' tasks are the only tasks left to process


	      if (hookName === "after" && !lastTestWithinModuleExecuted(hookOwner) && (config.queue.length > 0 || ProcessingQueue.taskCount() > 2)) {
	        return;
	      }

	      config.current = _this2;

	      if (config.notrycatch) {
	        callHook();
	        return;
	      }

	      try {
	        callHook();
	      } catch (error) {
	        _this2.pushFailure(hookName + " failed on " + _this2.testName + ": " + (error.message || error), extractStacktrace(error, 0));
	      }
	    };

	    return runHook;
	  },
	  // Currently only used for module level hooks, can be used to add global level ones
	  hooks: function hooks(handler) {
	    var hooks = [];

	    function processHooks(test, module) {
	      if (module.parentModule) {
	        processHooks(test, module.parentModule);
	      }

	      if (module.hooks[handler].length) {
	        for (var i = 0; i < module.hooks[handler].length; i++) {
	          hooks.push(test.queueHook(module.hooks[handler][i], handler, module));
	        }
	      }
	    } // Hooks are ignored on skipped tests


	    if (!this.skip) {
	      processHooks(this, this.module);
	    }

	    return hooks;
	  },
	  finish: function finish() {
	    config.current = this; // Release the test callback to ensure that anything referenced has been
	    // released to be garbage collected.

	    this.callback = undefined;

	    if (this.steps.length) {
	      var stepsList = this.steps.join(", ");
	      this.pushFailure("Expected assert.verifySteps() to be called before end of test " + "after using assert.step(). Unverified steps: ".concat(stepsList), this.stack);
	    }

	    if (config.requireExpects && this.expected === null) {
	      this.pushFailure("Expected number of assertions to be defined, but expect() was " + "not called.", this.stack);
	    } else if (this.expected !== null && this.expected !== this.assertions.length) {
	      this.pushFailure("Expected " + this.expected + " assertions, but " + this.assertions.length + " were run", this.stack);
	    } else if (this.expected === null && !this.assertions.length) {
	      this.pushFailure("Expected at least one assertion, but none were run - call " + "expect(0) to accept zero assertions.", this.stack);
	    }

	    var module = this.module;
	    var moduleName = module.name;
	    var testName = this.testName;
	    var skipped = !!this.skip;
	    var todo = !!this.todo;
	    var bad = 0;
	    var storage = config.storage;
	    this.runtime = now() - this.started;
	    config.stats.all += this.assertions.length;
	    config.stats.testCount += 1;
	    module.stats.all += this.assertions.length;

	    for (var i = 0; i < this.assertions.length; i++) {
	      if (!this.assertions[i].result) {
	        bad++;
	        config.stats.bad++;
	        module.stats.bad++;
	      }
	    }

	    if (skipped) {
	      incrementTestsIgnored(module);
	    } else {
	      incrementTestsRun(module);
	    } // Store result when possible


	    if (storage) {
	      if (bad) {
	        storage.setItem("qunit-test-" + moduleName + "-" + testName, bad);
	      } else {
	        storage.removeItem("qunit-test-" + moduleName + "-" + testName);
	      }
	    } // After emitting the js-reporters event we cleanup the assertion data to
	    // avoid leaking it. It is not used by the legacy testDone callbacks.


	    emit("testEnd", this.testReport.end(true));
	    this.testReport.slimAssertions();
	    var test = this;
	    return runLoggingCallbacks("testDone", {
	      name: testName,
	      module: moduleName,
	      skipped: skipped,
	      todo: todo,
	      failed: bad,
	      passed: this.assertions.length - bad,
	      total: this.assertions.length,
	      runtime: skipped ? 0 : this.runtime,
	      // HTML Reporter use
	      assertions: this.assertions,
	      testId: this.testId,

	      // Source of Test
	      // generating stack trace is expensive, so using a getter will help defer this until we need it
	      get source() {
	        return test.stack;
	      }

	    }).then(function () {
	      if (allTestsExecuted(module)) {
	        var completedModules = [module]; // Check if the parent modules, iteratively, are done. If that the case,
	        // we emit the `suiteEnd` event and trigger `moduleDone` callback.

	        var parent = module.parentModule;

	        while (parent && allTestsExecuted(parent)) {
	          completedModules.push(parent);
	          parent = parent.parentModule;
	        }

	        return completedModules.reduce(function (promiseChain, completedModule) {
	          return promiseChain.then(function () {
	            return logSuiteEnd(completedModule);
	          });
	        }, promisePolyfill.resolve([]));
	      }
	    }).then(function () {
	      config.current = undefined;
	    });

	    function logSuiteEnd(module) {
	      // Reset `module.hooks` to ensure that anything referenced in these hooks
	      // has been released to be garbage collected.
	      module.hooks = {};
	      emit("suiteEnd", module.suiteReport.end(true));
	      return runLoggingCallbacks("moduleDone", {
	        name: module.name,
	        tests: module.tests,
	        failed: module.stats.bad,
	        passed: module.stats.all - module.stats.bad,
	        total: module.stats.all,
	        runtime: now() - module.stats.started
	      });
	    }
	  },
	  preserveTestEnvironment: function preserveTestEnvironment() {
	    if (this.preserveEnvironment) {
	      this.module.testEnvironment = this.testEnvironment;
	      this.testEnvironment = extend({}, this.module.testEnvironment);
	    }
	  },
	  queue: function queue() {
	    var test = this;

	    if (!this.valid()) {
	      incrementTestsIgnored(this.module);
	      return;
	    }

	    function runTest() {
	      return [function () {
	        return test.before();
	      }].concat(_toConsumableArray(test.hooks("before")), [function () {
	        test.preserveTestEnvironment();
	      }], _toConsumableArray(test.hooks("beforeEach")), [function () {
	        test.run();
	      }], _toConsumableArray(test.hooks("afterEach").reverse()), _toConsumableArray(test.hooks("after").reverse()), [function () {
	        test.after();
	      }, function () {
	        return test.finish();
	      }]);
	    }

	    var previousFailCount = config.storage && +config.storage.getItem("qunit-test-" + this.module.name + "-" + this.testName); // Prioritize previously failed tests, detected from storage

	    var prioritize = config.reorder && !!previousFailCount;
	    this.previousFailure = !!previousFailCount;
	    ProcessingQueue.add(runTest, prioritize, config.seed); // If the queue has already finished, we manually process the new test

	    if (ProcessingQueue.finished) {
	      ProcessingQueue.advance();
	    }
	  },
	  pushResult: function pushResult(resultInfo) {
	    if (this !== config.current) {
	      var message = resultInfo && resultInfo.message || "";
	      var testName = this && this.testName || "";
	      var error = "Assertion occurred after test finished.\n" + "> Test: " + testName + "\n" + "> Message: " + message + "\n";
	      throw new Error(error);
	    } // Destructure of resultInfo = { result, actual, expected, message, negative }


	    var details = {
	      module: this.module.name,
	      name: this.testName,
	      result: resultInfo.result,
	      message: resultInfo.message,
	      actual: resultInfo.actual,
	      testId: this.testId,
	      negative: resultInfo.negative || false,
	      runtime: now() - this.started,
	      todo: !!this.todo
	    };

	    if (hasOwn.call(resultInfo, "expected")) {
	      details.expected = resultInfo.expected;
	    }

	    if (!resultInfo.result) {
	      var source = resultInfo.source || sourceFromStacktrace();

	      if (source) {
	        details.source = source;
	      }
	    }

	    this.logAssertion(details);
	    this.assertions.push({
	      result: !!resultInfo.result,
	      message: resultInfo.message
	    });
	  },
	  pushFailure: function pushFailure(message, source, actual) {
	    if (!(this instanceof Test)) {
	      throw new Error("pushFailure() assertion outside test context, was " + sourceFromStacktrace(2));
	    }

	    this.pushResult({
	      result: false,
	      message: message || "error",
	      actual: actual || null,
	      source: source
	    });
	  },

	  /**
	   * Log assertion details using both the old QUnit.log interface and
	   * QUnit.on( "assertion" ) interface.
	   *
	   * @private
	   */
	  logAssertion: function logAssertion(details) {
	    runLoggingCallbacks("log", details);
	    var assertion = {
	      passed: details.result,
	      actual: details.actual,
	      expected: details.expected,
	      message: details.message,
	      stack: details.source,
	      todo: details.todo
	    };
	    this.testReport.pushAssertion(assertion);
	    emit("assertion", assertion);
	  },
	  resolvePromise: function resolvePromise(promise, phase) {
	    if (promise != null) {
	      var _test = this;

	      var then = promise.then;

	      if (objectType(then) === "function") {
	        var resume = internalStop(_test);

	        if (config.notrycatch) {
	          then.call(promise, function () {
	            resume();
	          });
	        } else {
	          then.call(promise, function () {
	            resume();
	          }, function (error) {
	            var message = "Promise rejected " + (!phase ? "during" : phase.replace(/Each$/, "")) + " \"" + _test.testName + "\": " + (error && error.message || error);

	            _test.pushFailure(message, extractStacktrace(error, 0)); // Else next test will carry the responsibility


	            saveGlobal(); // Unblock

	            internalRecover(_test);
	          });
	        }
	      }
	    }
	  },
	  valid: function valid() {
	    var filter = config.filter;
	    var regexFilter = /^(!?)\/([\w\W]*)\/(i?$)/.exec(filter);
	    var module = config.module && config.module.toLowerCase();
	    var fullName = this.module.name + ": " + this.testName;

	    function moduleChainNameMatch(testModule) {
	      var testModuleName = testModule.name ? testModule.name.toLowerCase() : null;

	      if (testModuleName === module) {
	        return true;
	      } else if (testModule.parentModule) {
	        return moduleChainNameMatch(testModule.parentModule);
	      } else {
	        return false;
	      }
	    }

	    function moduleChainIdMatch(testModule) {
	      return inArray(testModule.moduleId, config.moduleId) || testModule.parentModule && moduleChainIdMatch(testModule.parentModule);
	    } // Internally-generated tests are always valid


	    if (this.callback && this.callback.validTest) {
	      return true;
	    }

	    if (config.moduleId && config.moduleId.length > 0 && !moduleChainIdMatch(this.module)) {
	      return false;
	    }

	    if (config.testId && config.testId.length > 0 && !inArray(this.testId, config.testId)) {
	      return false;
	    }

	    if (module && !moduleChainNameMatch(this.module)) {
	      return false;
	    }

	    if (!filter) {
	      return true;
	    }

	    return regexFilter ? this.regexFilter(!!regexFilter[1], regexFilter[2], regexFilter[3], fullName) : this.stringFilter(filter, fullName);
	  },
	  regexFilter: function regexFilter(exclude, pattern, flags, fullName) {
	    var regex = new RegExp(pattern, flags);
	    var match = regex.test(fullName);
	    return match !== exclude;
	  },
	  stringFilter: function stringFilter(filter, fullName) {
	    filter = filter.toLowerCase();
	    fullName = fullName.toLowerCase();
	    var include = filter.charAt(0) !== "!";

	    if (!include) {
	      filter = filter.slice(1);
	    } // If the filter matches, we need to honour include


	    if (fullName.indexOf(filter) !== -1) {
	      return include;
	    } // Otherwise, do the opposite


	    return !include;
	  }
	};
	function pushFailure() {
	  if (!config.current) {
	    throw new Error("pushFailure() assertion outside test context, in " + sourceFromStacktrace(2));
	  } // Gets current test obj


	  var currentTest = config.current;
	  return currentTest.pushFailure.apply(currentTest, arguments);
	}

	function saveGlobal() {
	  config.pollution = [];

	  if (config.noglobals) {
	    for (var key in global__default['default']) {
	      if (hasOwn.call(global__default['default'], key)) {
	        // In Opera sometimes DOM element ids show up here, ignore them
	        if (/^qunit-test-output/.test(key)) {
	          continue;
	        }

	        config.pollution.push(key);
	      }
	    }
	  }
	}

	function checkPollution() {
	  var old = config.pollution;
	  saveGlobal();
	  var newGlobals = diff(config.pollution, old);

	  if (newGlobals.length > 0) {
	    pushFailure("Introduced global variable(s): " + newGlobals.join(", "));
	  }

	  var deletedGlobals = diff(old, config.pollution);

	  if (deletedGlobals.length > 0) {
	    pushFailure("Deleted global variable(s): " + deletedGlobals.join(", "));
	  }
	}

	var focused$1 = false; // indicates that the "only" filter was used
	// Will be exposed as QUnit.test

	function test(testName, callback) {
	  if (focused$1 || config.currentModule.ignored) {
	    return;
	  }

	  var newTest = new Test({
	    testName: testName,
	    callback: callback
	  });
	  newTest.queue();
	}
	extend(test, {
	  todo: function todo(testName, callback) {
	    if (focused$1 || config.currentModule.ignored) {
	      return;
	    }

	    var newTest = new Test({
	      testName: testName,
	      callback: callback,
	      todo: true
	    });
	    newTest.queue();
	  },
	  skip: function skip(testName) {
	    if (focused$1 || config.currentModule.ignored) {
	      return;
	    }

	    var test = new Test({
	      testName: testName,
	      skip: true
	    });
	    test.queue();
	  },
	  only: function only(testName, callback) {
	    if (config.currentModule.ignored) {
	      return;
	    }

	    if (!focused$1) {
	      config.queue.length = 0;
	      focused$1 = true;
	    }

	    var newTest = new Test({
	      testName: testName,
	      callback: callback
	    });
	    newTest.queue();
	  }
	}); // Resets config.timeout with a new timeout duration.

	function resetTestTimeout(timeoutDuration) {
	  clearTimeout(config.timeout);
	  config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);
	} // Put a hold on processing and return a function that will release it.

	function internalStop(test) {
	  var released = false;
	  test.semaphore += 1;
	  config.blocking = true; // Set a recovery timeout, if so configured.

	  if (setTimeout$1) {
	    var timeoutDuration;

	    if (typeof test.timeout === "number") {
	      timeoutDuration = test.timeout;
	    } else if (typeof config.testTimeout === "number") {
	      timeoutDuration = config.testTimeout;
	    }

	    if (typeof timeoutDuration === "number" && timeoutDuration > 0) {
	      config.timeoutHandler = function (timeout) {
	        return function () {
	          config.timeout = null;
	          pushFailure("Test took longer than ".concat(timeout, "ms; test timed out."), sourceFromStacktrace(2));
	          released = true;
	          internalRecover(test);
	        };
	      };

	      clearTimeout(config.timeout);
	      config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);
	    }
	  }

	  return function resume() {
	    if (released) {
	      return;
	    }

	    released = true;
	    test.semaphore -= 1;
	    internalStart(test);
	  };
	} // Forcefully release all processing holds.

	function internalRecover(test) {
	  test.semaphore = 0;
	  internalStart(test);
	} // Release a processing hold, scheduling a resumption attempt if no holds remain.


	function internalStart(test) {
	  // If semaphore is non-numeric, throw error
	  if (isNaN(test.semaphore)) {
	    test.semaphore = 0;
	    pushFailure("Invalid value on test.semaphore", sourceFromStacktrace(2));
	    return;
	  } // Don't start until equal number of stop-calls


	  if (test.semaphore > 0) {
	    return;
	  } // Throw an Error if start is called more often than stop


	  if (test.semaphore < 0) {
	    test.semaphore = 0;
	    pushFailure("Tried to restart test while already started (test's semaphore was 0 already)", sourceFromStacktrace(2));
	    return;
	  } // Add a slight delay to allow more assertions etc.


	  if (setTimeout$1) {
	    clearTimeout(config.timeout);
	    config.timeout = setTimeout$1(function () {
	      if (test.semaphore > 0) {
	        return;
	      }

	      clearTimeout(config.timeout);
	      config.timeout = null;
	      begin();
	    });
	  } else {
	    begin();
	  }
	}

	function collectTests(module) {
	  var tests = [].concat(module.tests);

	  var modules = _toConsumableArray(module.childModules); // Do a breadth-first traversal of the child modules


	  while (modules.length) {
	    var nextModule = modules.shift();
	    tests.push.apply(tests, nextModule.tests);
	    modules.push.apply(modules, _toConsumableArray(nextModule.childModules));
	  }

	  return tests;
	} // This returns true after all executable and skippable tests
	// in a module have been proccessed, and informs 'suiteEnd'
	// and moduleDone().


	function allTestsExecuted(module) {
	  return module.testsRun + module.testsIgnored === collectTests(module).length;
	} // This returns true during the last executable non-skipped test
	// within a module, and informs the running of the 'after' hook
	// for a given module. This runs only once for a given module,
	// but must run during the last non-skipped test. When it runs,
	// there may be non-zero skipped tests left.


	function lastTestWithinModuleExecuted(module) {
	  return module.testsRun === collectTests(module).filter(function (test) {
	    return !test.skip;
	  }).length - 1;
	}

	function incrementTestsRun(module) {
	  module.testsRun++;

	  while (module = module.parentModule) {
	    module.testsRun++;
	  }
	}

	function incrementTestsIgnored(module) {
	  module.testsIgnored++;

	  while (module = module.parentModule) {
	    module.testsIgnored++;
	  }
	}

	var Assert = /*#__PURE__*/function () {
	  function Assert(testContext) {
	    _classCallCheck(this, Assert);

	    this.test = testContext;
	  } // Assert helpers


	  _createClass(Assert, [{
	    key: "timeout",
	    value: function timeout(duration) {
	      if (typeof duration !== "number") {
	        throw new Error("You must pass a number as the duration to assert.timeout");
	      }

	      this.test.timeout = duration; // If a timeout has been set, clear it and reset with the new duration

	      if (config.timeout) {
	        clearTimeout(config.timeout);
	        config.timeout = null;

	        if (config.timeoutHandler && this.test.timeout > 0) {
	          resetTestTimeout(this.test.timeout);
	        }
	      }
	    } // Documents a "step", which is a string value, in a test as a passing assertion

	  }, {
	    key: "step",
	    value: function step(message) {
	      var assertionMessage = message;
	      var result = !!message;
	      this.test.steps.push(message);

	      if (objectType(message) === "undefined" || message === "") {
	        assertionMessage = "You must provide a message to assert.step";
	      } else if (objectType(message) !== "string") {
	        assertionMessage = "You must provide a string value to assert.step";
	        result = false;
	      }

	      this.pushResult({
	        result: result,
	        message: assertionMessage
	      });
	    } // Verifies the steps in a test match a given array of string values

	  }, {
	    key: "verifySteps",
	    value: function verifySteps(steps, message) {
	      // Since the steps array is just string values, we can clone with slice
	      var actualStepsClone = this.test.steps.slice();
	      this.deepEqual(actualStepsClone, steps, message);
	      this.test.steps.length = 0;
	    } // Specify the number of expected assertions to guarantee that failed test
	    // (no assertions are run at all) don't slip through.

	  }, {
	    key: "expect",
	    value: function expect(asserts) {
	      if (arguments.length === 1) {
	        this.test.expected = asserts;
	      } else {
	        return this.test.expected;
	      }
	    } // Put a hold on processing and return a function that will release it a maximum of once.

	  }, {
	    key: "async",
	    value: function async(count) {
	      var test = this.test;
	      var popped = false,
	          acceptCallCount = count;

	      if (typeof acceptCallCount === "undefined") {
	        acceptCallCount = 1;
	      }

	      var resume = internalStop(test);
	      return function done() {
	        if (config.current !== test) {
	          throw Error("assert.async callback called after test finished.");
	        }

	        if (popped) {
	          test.pushFailure("Too many calls to the `assert.async` callback", sourceFromStacktrace(2));
	          return;
	        }

	        acceptCallCount -= 1;

	        if (acceptCallCount > 0) {
	          return;
	        }

	        popped = true;
	        resume();
	      };
	    } // Exports test.push() to the user API
	    // Alias of pushResult.

	  }, {
	    key: "push",
	    value: function push(result, actual, expected, message, negative) {
	      Logger.warn("assert.push is deprecated and will be removed in QUnit 3.0." + " Please use assert.pushResult instead (https://api.qunitjs.com/assert/pushResult).");
	      var currentAssert = this instanceof Assert ? this : config.current.assert;
	      return currentAssert.pushResult({
	        result: result,
	        actual: actual,
	        expected: expected,
	        message: message,
	        negative: negative
	      });
	    }
	  }, {
	    key: "pushResult",
	    value: function pushResult(resultInfo) {
	      // Destructure of resultInfo = { result, actual, expected, message, negative }
	      var assert = this;
	      var currentTest = assert instanceof Assert && assert.test || config.current; // Backwards compatibility fix.
	      // Allows the direct use of global exported assertions and QUnit.assert.*
	      // Although, it's use is not recommended as it can leak assertions
	      // to other tests from async tests, because we only get a reference to the current test,
	      // not exactly the test where assertion were intended to be called.

	      if (!currentTest) {
	        throw new Error("assertion outside test context, in " + sourceFromStacktrace(2));
	      }

	      if (!(assert instanceof Assert)) {
	        assert = currentTest.assert;
	      }

	      return assert.test.pushResult(resultInfo);
	    }
	  }, {
	    key: "ok",
	    value: function ok(result, message) {
	      if (!message) {
	        message = result ? "okay" : "failed, expected argument to be truthy, was: ".concat(dump.parse(result));
	      }

	      this.pushResult({
	        result: !!result,
	        actual: result,
	        expected: true,
	        message: message
	      });
	    }
	  }, {
	    key: "notOk",
	    value: function notOk(result, message) {
	      if (!message) {
	        message = !result ? "okay" : "failed, expected argument to be falsy, was: ".concat(dump.parse(result));
	      }

	      this.pushResult({
	        result: !result,
	        actual: result,
	        expected: false,
	        message: message
	      });
	    }
	  }, {
	    key: "true",
	    value: function _true(result, message) {
	      this.pushResult({
	        result: result === true,
	        actual: result,
	        expected: true,
	        message: message
	      });
	    }
	  }, {
	    key: "false",
	    value: function _false(result, message) {
	      this.pushResult({
	        result: result === false,
	        actual: result,
	        expected: false,
	        message: message
	      });
	    }
	  }, {
	    key: "equal",
	    value: function equal(actual, expected, message) {
	      // eslint-disable-next-line eqeqeq
	      var result = expected == actual;
	      this.pushResult({
	        result: result,
	        actual: actual,
	        expected: expected,
	        message: message
	      });
	    }
	  }, {
	    key: "notEqual",
	    value: function notEqual(actual, expected, message) {
	      // eslint-disable-next-line eqeqeq
	      var result = expected != actual;
	      this.pushResult({
	        result: result,
	        actual: actual,
	        expected: expected,
	        message: message,
	        negative: true
	      });
	    }
	  }, {
	    key: "propEqual",
	    value: function propEqual(actual, expected, message) {
	      actual = objectValues(actual);
	      expected = objectValues(expected);
	      this.pushResult({
	        result: equiv(actual, expected),
	        actual: actual,
	        expected: expected,
	        message: message
	      });
	    }
	  }, {
	    key: "notPropEqual",
	    value: function notPropEqual(actual, expected, message) {
	      actual = objectValues(actual);
	      expected = objectValues(expected);
	      this.pushResult({
	        result: !equiv(actual, expected),
	        actual: actual,
	        expected: expected,
	        message: message,
	        negative: true
	      });
	    }
	  }, {
	    key: "deepEqual",
	    value: function deepEqual(actual, expected, message) {
	      this.pushResult({
	        result: equiv(actual, expected),
	        actual: actual,
	        expected: expected,
	        message: message
	      });
	    }
	  }, {
	    key: "notDeepEqual",
	    value: function notDeepEqual(actual, expected, message) {
	      this.pushResult({
	        result: !equiv(actual, expected),
	        actual: actual,
	        expected: expected,
	        message: message,
	        negative: true
	      });
	    }
	  }, {
	    key: "strictEqual",
	    value: function strictEqual(actual, expected, message) {
	      this.pushResult({
	        result: expected === actual,
	        actual: actual,
	        expected: expected,
	        message: message
	      });
	    }
	  }, {
	    key: "notStrictEqual",
	    value: function notStrictEqual(actual, expected, message) {
	      this.pushResult({
	        result: expected !== actual,
	        actual: actual,
	        expected: expected,
	        message: message,
	        negative: true
	      });
	    }
	  }, {
	    key: "throws",
	    value: function throws(block, expected, message) {
	      var actual,
	          result = false;
	      var currentTest = this instanceof Assert && this.test || config.current; // 'expected' is optional unless doing string comparison

	      if (objectType(expected) === "string") {
	        if (message == null) {
	          message = expected;
	          expected = null;
	        } else {
	          throw new Error("throws/raises does not accept a string value for the expected argument.\n" + "Use a non-string object value (e.g. regExp) instead if it's necessary.");
	        }
	      }

	      currentTest.ignoreGlobalErrors = true;

	      try {
	        block.call(currentTest.testEnvironment);
	      } catch (e) {
	        actual = e;
	      }

	      currentTest.ignoreGlobalErrors = false;

	      if (actual) {
	        var expectedType = objectType(expected); // We don't want to validate thrown error

	        if (!expected) {
	          result = true; // Expected is a regexp
	        } else if (expectedType === "regexp") {
	          result = expected.test(errorString(actual)); // Log the string form of the regexp

	          expected = String(expected); // Expected is a constructor, maybe an Error constructor.
	          // Note the extra check on its prototype - this is an implicit
	          // requirement of "instanceof", else it will throw a TypeError.
	        } else if (expectedType === "function" && expected.prototype !== undefined && actual instanceof expected) {
	          result = true; // Expected is an Error object
	        } else if (expectedType === "object") {
	          result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message; // Log the string form of the Error object

	          expected = errorString(expected); // Expected is a validation function which returns true if validation passed
	        } else if (expectedType === "function" && expected.call({}, actual) === true) {
	          expected = null;
	          result = true;
	        }
	      }

	      currentTest.assert.pushResult({
	        result: result,
	        // undefined if it didn't throw
	        actual: actual && errorString(actual),
	        expected: expected,
	        message: message
	      });
	    }
	  }, {
	    key: "rejects",
	    value: function rejects(promise, expected, message) {
	      var result = false;
	      var currentTest = this instanceof Assert && this.test || config.current; // 'expected' is optional unless doing string comparison

	      if (objectType(expected) === "string") {
	        if (message === undefined) {
	          message = expected;
	          expected = undefined;
	        } else {
	          message = "assert.rejects does not accept a string value for the expected " + "argument.\nUse a non-string object value (e.g. validator function) instead " + "if necessary.";
	          currentTest.assert.pushResult({
	            result: false,
	            message: message
	          });
	          return;
	        }
	      }

	      var then = promise && promise.then;

	      if (objectType(then) !== "function") {
	        var _message = "The value provided to `assert.rejects` in " + "\"" + currentTest.testName + "\" was not a promise.";

	        currentTest.assert.pushResult({
	          result: false,
	          message: _message,
	          actual: promise
	        });
	        return;
	      }

	      var done = this.async();
	      return then.call(promise, function handleFulfillment() {
	        var message = "The promise returned by the `assert.rejects` callback in " + "\"" + currentTest.testName + "\" did not reject.";
	        currentTest.assert.pushResult({
	          result: false,
	          message: message,
	          actual: promise
	        });
	        done();
	      }, function handleRejection(actual) {
	        var expectedType = objectType(expected); // We don't want to validate

	        if (expected === undefined) {
	          result = true; // Expected is a regexp
	        } else if (expectedType === "regexp") {
	          result = expected.test(errorString(actual)); // Log the string form of the regexp

	          expected = String(expected); // Expected is a constructor, maybe an Error constructor
	        } else if (expectedType === "function" && actual instanceof expected) {
	          result = true; // Expected is an Error object
	        } else if (expectedType === "object") {
	          result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message; // Log the string form of the Error object

	          expected = errorString(expected); // Expected is a validation function which returns true if validation passed
	        } else {
	          if (expectedType === "function") {
	            result = expected.call({}, actual) === true;
	            expected = null; // Expected is some other invalid type
	          } else {
	            result = false;
	            message = "invalid expected value provided to `assert.rejects` " + "callback in \"" + currentTest.testName + "\": " + expectedType + ".";
	          }
	        }

	        currentTest.assert.pushResult({
	          result: result,
	          // leave rejection value of undefined as-is
	          actual: actual && errorString(actual),
	          expected: expected,
	          message: message
	        });
	        done();
	      });
	    }
	  }]);

	  return Assert;
	}(); // Provide an alternative to assert.throws(), for environments that consider throws a reserved word
	// Known to us are: Closure Compiler, Narwhal
	// eslint-disable-next-line dot-notation


	Assert.prototype.raises = Assert.prototype["throws"];
	/**
	 * Converts an error into a simple string for comparisons.
	 *
	 * @param {Error|Object} error
	 * @return {string}
	 */

	function errorString(error) {
	  var resultErrorString = error.toString(); // If the error wasn't a subclass of Error but something like
	  // an object literal with name and message properties...

	  if (resultErrorString.slice(0, 7) === "[object") {
	    // Based on https://es5.github.com/#x15.11.4.4
	    var name = error.name ? String(error.name) : "Error";
	    return error.message ? "".concat(name, ": ").concat(error.message) : name;
	  } else {
	    return resultErrorString;
	  }
	}

	/* global module, exports, define */
	function exportQUnit(QUnit) {
	  var exportedModule = false;

	  if (window$1 && document) {
	    // QUnit may be defined when it is preconfigured but then only QUnit and QUnit.config may be defined.
	    if (window$1.QUnit && window$1.QUnit.version) {
	      throw new Error("QUnit has already been defined.");
	    }

	    window$1.QUnit = QUnit;
	    exportedModule = true;
	  } // For Node.js


	  if (typeof module !== "undefined" && module && module.exports) {
	    module.exports = QUnit; // For consistency with CommonJS environments' exports

	    module.exports.QUnit = QUnit;
	    exportedModule = true;
	  } // For CommonJS with exports, but without module.exports, like Rhino


	  if (typeof exports !== "undefined" && exports) {
	    exports.QUnit = QUnit;
	    exportedModule = true;
	  } // For AMD


	  if (typeof define === "function" && define.amd) {
	    define(function () {
	      return QUnit;
	    });
	    QUnit.config.autostart = false;
	    exportedModule = true;
	  } // For Web/Service Workers


	  if (self$1 && self$1.WorkerGlobalScope && self$1 instanceof self$1.WorkerGlobalScope) {
	    self$1.QUnit = QUnit;
	    exportedModule = true;
	  } // For other environments, such as SpiderMonkey (mozjs) and other
	  // embedded JavaScript engines


	  if (!exportedModule) {
	    global__default['default'].QUnit = QUnit;
	  }
	}

	// error handling should be suppressed and false otherwise.
	// In this case, we will only suppress further error handling if the
	// "ignoreGlobalErrors" configuration option is enabled.

	function onError(error) {
	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  if (config.current) {
	    if (config.current.ignoreGlobalErrors) {
	      return true;
	    }

	    pushFailure.apply(void 0, [error.message, error.stacktrace || error.fileName + ":" + error.lineNumber].concat(args));
	  } else {
	    test("global failure", extend(function () {
	      pushFailure.apply(void 0, [error.message, error.stacktrace || error.fileName + ":" + error.lineNumber].concat(args));
	    }, {
	      validTest: true
	    }));
	  }

	  return false;
	}

	function onUnhandledRejection(reason) {
	  var resultInfo = {
	    result: false,
	    message: reason.message || "error",
	    actual: reason,
	    source: reason.stack || sourceFromStacktrace(3)
	  };
	  var currentTest = config.current;

	  if (currentTest) {
	    currentTest.assert.pushResult(resultInfo);
	  } else {
	    test("global failure", extend(function (assert) {
	      assert.pushResult(resultInfo);
	    }, {
	      validTest: true
	    }));
	  }
	}

	var QUnit = {};
	var globalSuite = new SuiteReport(); // The initial "currentModule" represents the global (or top-level) module that
	// is not explicitly defined by the user, therefore we add the "globalSuite" to
	// it since each module has a suiteReport associated with it.

	config.currentModule.suiteReport = globalSuite;
	var globalStartCalled = false;
	var runStarted = false; // Figure out if we're running the tests from a server or not

	QUnit.isLocal = window$1 && window$1.location && window$1.location.protocol === "file:"; // Expose the current QUnit version

	QUnit.version = "2.14.0";

	extend(QUnit, {
	  config: config,
	  dump: dump,
	  equiv: equiv,
	  is: is,
	  objectType: objectType,
	  on: on,
	  onError: onError,
	  onUnhandledRejection: onUnhandledRejection,
	  pushFailure: pushFailure,
	  assert: Assert.prototype,
	  module: module$1,
	  test: test,
	  // alias other test flavors for easy access
	  todo: test.todo,
	  skip: test.skip,
	  only: test.only,
	  start: function start(count) {
	    if (config.current) {
	      throw new Error("QUnit.start cannot be called inside a test context.");
	    }

	    var globalStartAlreadyCalled = globalStartCalled;
	    globalStartCalled = true;

	    if (runStarted) {
	      throw new Error("Called start() while test already started running");
	    }

	    if (globalStartAlreadyCalled || count > 1) {
	      throw new Error("Called start() outside of a test context too many times");
	    }

	    if (config.autostart) {
	      throw new Error("Called start() outside of a test context when " + "QUnit.config.autostart was true");
	    }

	    if (!config.pageLoaded) {
	      // The page isn't completely loaded yet, so we set autostart and then
	      // load if we're in Node or wait for the browser's load event.
	      config.autostart = true; // Starts from Node even if .load was not previously called. We still return
	      // early otherwise we'll wind up "beginning" twice.

	      if (!document) {
	        QUnit.load();
	      }

	      return;
	    }

	    scheduleBegin();
	  },
	  extend: function extend$1() {
	    Logger.warn("QUnit.extend is deprecated and will be removed in QUnit 3.0." + " Please use Object.assign instead."); // delegate to utility implementation, which does not warn and can be used elsewhere internally

	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    return extend.apply(this, args);
	  },
	  load: function load() {
	    config.pageLoaded = true; // Initialize the configuration options

	    extend(config, {
	      stats: {
	        all: 0,
	        bad: 0,
	        testCount: 0
	      },
	      started: 0,
	      updateRate: 1000,
	      autostart: true,
	      filter: ""
	    }, true);

	    if (!runStarted) {
	      config.blocking = false;

	      if (config.autostart) {
	        scheduleBegin();
	      }
	    }
	  },
	  stack: function stack(offset) {
	    offset = (offset || 0) + 2;
	    return sourceFromStacktrace(offset);
	  }
	});

	registerLoggingCallbacks(QUnit);

	function scheduleBegin() {
	  runStarted = true; // Add a slight delay to allow definition of more modules and tests.

	  if (setTimeout$1) {
	    setTimeout$1(function () {
	      begin();
	    });
	  } else {
	    begin();
	  }
	}

	function unblockAndAdvanceQueue() {
	  config.blocking = false;
	  ProcessingQueue.advance();
	}

	function begin() {
	  if (config.started) {
	    unblockAndAdvanceQueue();
	    return;
	  } // The test run hasn't officially begun yet
	  // Record the time of the test run's beginning


	  config.started = now(); // Delete the loose unnamed module if unused.

	  if (config.modules[0].name === "" && config.modules[0].tests.length === 0) {
	    config.modules.shift();
	  } // Avoid unnecessary information by not logging modules' test environments


	  var l = config.modules.length;
	  var modulesLog = [];

	  for (var i = 0; i < l; i++) {
	    modulesLog.push({
	      name: config.modules[i].name,
	      tests: config.modules[i].tests
	    });
	  } // The test run is officially beginning now


	  emit("runStart", globalSuite.start(true));
	  runLoggingCallbacks("begin", {
	    totalTests: Test.count,
	    modules: modulesLog
	  }).then(unblockAndAdvanceQueue);
	}
	exportQUnit(QUnit);

	(function () {
	  if (!window$1 || !document) {
	    return;
	  }

	  var config = QUnit.config,
	      hasOwn = Object.prototype.hasOwnProperty; // Stores fixture HTML for resetting later

	  function storeFixture() {
	    // Avoid overwriting user-defined values
	    if (hasOwn.call(config, "fixture")) {
	      return;
	    }

	    var fixture = document.getElementById("qunit-fixture");

	    if (fixture) {
	      config.fixture = fixture.cloneNode(true);
	    }
	  }

	  QUnit.begin(storeFixture); // Resets the fixture DOM element if available.

	  function resetFixture() {
	    if (config.fixture == null) {
	      return;
	    }

	    var fixture = document.getElementById("qunit-fixture");

	    var resetFixtureType = _typeof(config.fixture);

	    if (resetFixtureType === "string") {
	      // support user defined values for `config.fixture`
	      var newFixture = document.createElement("div");
	      newFixture.setAttribute("id", "qunit-fixture");
	      newFixture.innerHTML = config.fixture;
	      fixture.parentNode.replaceChild(newFixture, fixture);
	    } else {
	      var clonedFixture = config.fixture.cloneNode(true);
	      fixture.parentNode.replaceChild(clonedFixture, fixture);
	    }
	  }

	  QUnit.testStart(resetFixture);
	})();

	(function () {
	  // Only interact with URLs via window.location
	  var location = typeof window$1 !== "undefined" && window$1.location;

	  if (!location) {
	    return;
	  }

	  var urlParams = getUrlParams();
	  QUnit.urlParams = urlParams; // Match module/test by inclusion in an array

	  QUnit.config.moduleId = [].concat(urlParams.moduleId || []);
	  QUnit.config.testId = [].concat(urlParams.testId || []); // Exact case-insensitive match of the module name

	  QUnit.config.module = urlParams.module; // Regular expression or case-insenstive substring match against "moduleName: testName"

	  QUnit.config.filter = urlParams.filter; // Test order randomization

	  if (urlParams.seed === true) {
	    // Generate a random seed if the option is specified without a value
	    QUnit.config.seed = Math.random().toString(36).slice(2);
	  } else if (urlParams.seed) {
	    QUnit.config.seed = urlParams.seed;
	  } // Add URL-parameter-mapped config values with UI form rendering data


	  QUnit.config.urlConfig.push({
	    id: "hidepassed",
	    label: "Hide passed tests",
	    tooltip: "Only show tests and assertions that fail. Stored as query-strings."
	  }, {
	    id: "noglobals",
	    label: "Check for Globals",
	    tooltip: "Enabling this will test if any test introduces new properties on the " + "global object (`window` in Browsers). Stored as query-strings."
	  }, {
	    id: "notrycatch",
	    label: "No try-catch",
	    tooltip: "Enabling this will run tests outside of a try-catch block. Makes debugging " + "exceptions in IE reasonable. Stored as query-strings."
	  });
	  QUnit.begin(function () {
	    var i,
	        option,
	        urlConfig = QUnit.config.urlConfig;

	    for (i = 0; i < urlConfig.length; i++) {
	      // Options can be either strings or objects with nonempty "id" properties
	      option = QUnit.config.urlConfig[i];

	      if (typeof option !== "string") {
	        option = option.id;
	      }

	      if (QUnit.config[option] === undefined) {
	        QUnit.config[option] = urlParams[option];
	      }
	    }
	  });

	  function getUrlParams() {
	    var i, param, name, value;
	    var urlParams = Object.create(null);
	    var params = location.search.slice(1).split("&");
	    var length = params.length;

	    for (i = 0; i < length; i++) {
	      if (params[i]) {
	        param = params[i].split("=");
	        name = decodeQueryParam(param[0]); // Allow just a key to turn on a flag, e.g., test.html?noglobals

	        value = param.length === 1 || decodeQueryParam(param.slice(1).join("="));

	        if (name in urlParams) {
	          urlParams[name] = [].concat(urlParams[name], value);
	        } else {
	          urlParams[name] = value;
	        }
	      }
	    }

	    return urlParams;
	  }

	  function decodeQueryParam(param) {
	    return decodeURIComponent(param.replace(/\+/g, "%20"));
	  }
	})();

	var fuzzysort = createCommonjsModule(function (module) {

	  (function (root, UMD) {
	    if ( module.exports) module.exports = UMD();else root.fuzzysort = UMD();
	  })(commonjsGlobal, function UMD() {
	    function fuzzysortNew(instanceOptions) {
	      var fuzzysort = {
	        single: function (search, target, options) {
	          if (!search) return null;
	          if (!isObj(search)) search = fuzzysort.getPreparedSearch(search);
	          if (!target) return null;
	          if (!isObj(target)) target = fuzzysort.getPrepared(target);
	          var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
	          var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
	          return algorithm(search, target, search[0]); // var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991
	          // var result = algorithm(search, target, search[0])
	          // if(result === null) return null
	          // if(result.score < threshold) return null
	          // return result
	        },
	        go: function (search, targets, options) {
	          if (!search) return noResults;
	          search = fuzzysort.prepareSearch(search);
	          var searchLowerCode = search[0];
	          var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
	          var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
	          var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
	          var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
	          var resultsLen = 0;
	          var limitedCount = 0;
	          var targetsLen = targets.length; // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]
	          // options.keys

	          if (options && options.keys) {
	            var scoreFn = options.scoreFn || defaultScoreFn;
	            var keys = options.keys;
	            var keysLen = keys.length;

	            for (var i = targetsLen - 1; i >= 0; --i) {
	              var obj = targets[i];
	              var objResults = new Array(keysLen);

	              for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
	                var key = keys[keyI];
	                var target = getValue(obj, key);

	                if (!target) {
	                  objResults[keyI] = null;
	                  continue;
	                }

	                if (!isObj(target)) target = fuzzysort.getPrepared(target);
	                objResults[keyI] = algorithm(search, target, searchLowerCode);
	              }

	              objResults.obj = obj; // before scoreFn so scoreFn can use it

	              var score = scoreFn(objResults);
	              if (score === null) continue;
	              if (score < threshold) continue;
	              objResults.score = score;

	              if (resultsLen < limit) {
	                q.add(objResults);
	                ++resultsLen;
	              } else {
	                ++limitedCount;
	                if (score > q.peek().score) q.replaceTop(objResults);
	              }
	            } // options.key

	          } else if (options && options.key) {
	            var key = options.key;

	            for (var i = targetsLen - 1; i >= 0; --i) {
	              var obj = targets[i];
	              var target = getValue(obj, key);
	              if (!target) continue;
	              if (!isObj(target)) target = fuzzysort.getPrepared(target);
	              var result = algorithm(search, target, searchLowerCode);
	              if (result === null) continue;
	              if (result.score < threshold) continue; // have to clone result so duplicate targets from different obj can each reference the correct obj

	              result = {
	                target: result.target,
	                _targetLowerCodes: null,
	                _nextBeginningIndexes: null,
	                score: result.score,
	                indexes: result.indexes,
	                obj: obj
	              }; // hidden

	              if (resultsLen < limit) {
	                q.add(result);
	                ++resultsLen;
	              } else {
	                ++limitedCount;
	                if (result.score > q.peek().score) q.replaceTop(result);
	              }
	            } // no keys

	          } else {
	            for (var i = targetsLen - 1; i >= 0; --i) {
	              var target = targets[i];
	              if (!target) continue;
	              if (!isObj(target)) target = fuzzysort.getPrepared(target);
	              var result = algorithm(search, target, searchLowerCode);
	              if (result === null) continue;
	              if (result.score < threshold) continue;

	              if (resultsLen < limit) {
	                q.add(result);
	                ++resultsLen;
	              } else {
	                ++limitedCount;
	                if (result.score > q.peek().score) q.replaceTop(result);
	              }
	            }
	          }

	          if (resultsLen === 0) return noResults;
	          var results = new Array(resultsLen);

	          for (var i = resultsLen - 1; i >= 0; --i) results[i] = q.poll();

	          results.total = resultsLen + limitedCount;
	          return results;
	        },
	        goAsync: function (search, targets, options) {
	          var canceled = false;
	          var p = new Promise(function (resolve, reject) {
	            if (!search) return resolve(noResults);
	            search = fuzzysort.prepareSearch(search);
	            var searchLowerCode = search[0];
	            var q = fastpriorityqueue();
	            var iCurrent = targets.length - 1;
	            var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;
	            var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;
	            var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;
	            var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;
	            var resultsLen = 0;
	            var limitedCount = 0;

	            function step() {
	              if (canceled) return reject('canceled');
	              var startMs = Date.now(); // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]
	              // options.keys

	              if (options && options.keys) {
	                var scoreFn = options.scoreFn || defaultScoreFn;
	                var keys = options.keys;
	                var keysLen = keys.length;

	                for (; iCurrent >= 0; --iCurrent) {
	                  var obj = targets[iCurrent];
	                  var objResults = new Array(keysLen);

	                  for (var keyI = keysLen - 1; keyI >= 0; --keyI) {
	                    var key = keys[keyI];
	                    var target = getValue(obj, key);

	                    if (!target) {
	                      objResults[keyI] = null;
	                      continue;
	                    }

	                    if (!isObj(target)) target = fuzzysort.getPrepared(target);
	                    objResults[keyI] = algorithm(search, target, searchLowerCode);
	                  }

	                  objResults.obj = obj; // before scoreFn so scoreFn can use it

	                  var score = scoreFn(objResults);
	                  if (score === null) continue;
	                  if (score < threshold) continue;
	                  objResults.score = score;

	                  if (resultsLen < limit) {
	                    q.add(objResults);
	                    ++resultsLen;
	                  } else {
	                    ++limitedCount;
	                    if (score > q.peek().score) q.replaceTop(objResults);
	                  }

	                  if (iCurrent % 1000
	                  /*itemsPerCheck*/
	                  === 0) {
	                    if (Date.now() - startMs >= 10
	                    /*asyncInterval*/
	                    ) {
	                        isNode ? setImmediate(step) : setTimeout(step);
	                        return;
	                      }
	                  }
	                } // options.key

	              } else if (options && options.key) {
	                var key = options.key;

	                for (; iCurrent >= 0; --iCurrent) {
	                  var obj = targets[iCurrent];
	                  var target = getValue(obj, key);
	                  if (!target) continue;
	                  if (!isObj(target)) target = fuzzysort.getPrepared(target);
	                  var result = algorithm(search, target, searchLowerCode);
	                  if (result === null) continue;
	                  if (result.score < threshold) continue; // have to clone result so duplicate targets from different obj can each reference the correct obj

	                  result = {
	                    target: result.target,
	                    _targetLowerCodes: null,
	                    _nextBeginningIndexes: null,
	                    score: result.score,
	                    indexes: result.indexes,
	                    obj: obj
	                  }; // hidden

	                  if (resultsLen < limit) {
	                    q.add(result);
	                    ++resultsLen;
	                  } else {
	                    ++limitedCount;
	                    if (result.score > q.peek().score) q.replaceTop(result);
	                  }

	                  if (iCurrent % 1000
	                  /*itemsPerCheck*/
	                  === 0) {
	                    if (Date.now() - startMs >= 10
	                    /*asyncInterval*/
	                    ) {
	                        isNode ? setImmediate(step) : setTimeout(step);
	                        return;
	                      }
	                  }
	                } // no keys

	              } else {
	                for (; iCurrent >= 0; --iCurrent) {
	                  var target = targets[iCurrent];
	                  if (!target) continue;
	                  if (!isObj(target)) target = fuzzysort.getPrepared(target);
	                  var result = algorithm(search, target, searchLowerCode);
	                  if (result === null) continue;
	                  if (result.score < threshold) continue;

	                  if (resultsLen < limit) {
	                    q.add(result);
	                    ++resultsLen;
	                  } else {
	                    ++limitedCount;
	                    if (result.score > q.peek().score) q.replaceTop(result);
	                  }

	                  if (iCurrent % 1000
	                  /*itemsPerCheck*/
	                  === 0) {
	                    if (Date.now() - startMs >= 10
	                    /*asyncInterval*/
	                    ) {
	                        isNode ? setImmediate(step) : setTimeout(step);
	                        return;
	                      }
	                  }
	                }
	              }

	              if (resultsLen === 0) return resolve(noResults);
	              var results = new Array(resultsLen);

	              for (var i = resultsLen - 1; i >= 0; --i) results[i] = q.poll();

	              results.total = resultsLen + limitedCount;
	              resolve(results);
	            }

	            isNode ? setImmediate(step) : step();
	          });

	          p.cancel = function () {
	            canceled = true;
	          };

	          return p;
	        },
	        highlight: function (result, hOpen, hClose) {
	          if (result === null) return null;
	          if (hOpen === undefined) hOpen = '<b>';
	          if (hClose === undefined) hClose = '</b>';
	          var highlighted = '';
	          var matchesIndex = 0;
	          var opened = false;
	          var target = result.target;
	          var targetLen = target.length;
	          var matchesBest = result.indexes;

	          for (var i = 0; i < targetLen; ++i) {
	            var char = target[i];

	            if (matchesBest[matchesIndex] === i) {
	              ++matchesIndex;

	              if (!opened) {
	                opened = true;
	                highlighted += hOpen;
	              }

	              if (matchesIndex === matchesBest.length) {
	                highlighted += char + hClose + target.substr(i + 1);
	                break;
	              }
	            } else {
	              if (opened) {
	                opened = false;
	                highlighted += hClose;
	              }
	            }

	            highlighted += char;
	          }

	          return highlighted;
	        },
	        prepare: function (target) {
	          if (!target) return;
	          return {
	            target: target,
	            _targetLowerCodes: fuzzysort.prepareLowerCodes(target),
	            _nextBeginningIndexes: null,
	            score: null,
	            indexes: null,
	            obj: null
	          }; // hidden
	        },
	        prepareSlow: function (target) {
	          if (!target) return;
	          return {
	            target: target,
	            _targetLowerCodes: fuzzysort.prepareLowerCodes(target),
	            _nextBeginningIndexes: fuzzysort.prepareNextBeginningIndexes(target),
	            score: null,
	            indexes: null,
	            obj: null
	          }; // hidden
	        },
	        prepareSearch: function (search) {
	          if (!search) return;
	          return fuzzysort.prepareLowerCodes(search);
	        },
	        // Below this point is only internal code
	        // Below this point is only internal code
	        // Below this point is only internal code
	        // Below this point is only internal code
	        getPrepared: function (target) {
	          if (target.length > 999) return fuzzysort.prepare(target); // don't cache huge targets

	          var targetPrepared = preparedCache.get(target);
	          if (targetPrepared !== undefined) return targetPrepared;
	          targetPrepared = fuzzysort.prepare(target);
	          preparedCache.set(target, targetPrepared);
	          return targetPrepared;
	        },
	        getPreparedSearch: function (search) {
	          if (search.length > 999) return fuzzysort.prepareSearch(search); // don't cache huge searches

	          var searchPrepared = preparedSearchCache.get(search);
	          if (searchPrepared !== undefined) return searchPrepared;
	          searchPrepared = fuzzysort.prepareSearch(search);
	          preparedSearchCache.set(search, searchPrepared);
	          return searchPrepared;
	        },
	        algorithm: function (searchLowerCodes, prepared, searchLowerCode) {
	          var targetLowerCodes = prepared._targetLowerCodes;
	          var searchLen = searchLowerCodes.length;
	          var targetLen = targetLowerCodes.length;
	          var searchI = 0; // where we at

	          var targetI = 0; // where you at

	          var typoSimpleI = 0;
	          var matchesSimpleLen = 0; // very basic fuzzy match; to remove non-matching targets ASAP!
	          // walk through target. find sequential matches.
	          // if all chars aren't found then exit

	          for (;;) {
	            var isMatch = searchLowerCode === targetLowerCodes[targetI];

	            if (isMatch) {
	              matchesSimple[matchesSimpleLen++] = targetI;
	              ++searchI;
	              if (searchI === searchLen) break;
	              searchLowerCode = searchLowerCodes[typoSimpleI === 0 ? searchI : typoSimpleI === searchI ? searchI + 1 : typoSimpleI === searchI - 1 ? searchI - 1 : searchI];
	            }

	            ++targetI;

	            if (targetI >= targetLen) {
	              // Failed to find searchI
	              // Check for typo or exit
	              // we go as far as possible before trying to transpose
	              // then we transpose backwards until we reach the beginning
	              for (;;) {
	                if (searchI <= 1) return null; // not allowed to transpose first char

	                if (typoSimpleI === 0) {
	                  // we haven't tried to transpose yet
	                  --searchI;
	                  var searchLowerCodeNew = searchLowerCodes[searchI];
	                  if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char

	                  typoSimpleI = searchI;
	                } else {
	                  if (typoSimpleI === 1) return null; // reached the end of the line for transposing

	                  --typoSimpleI;
	                  searchI = typoSimpleI;
	                  searchLowerCode = searchLowerCodes[searchI + 1];
	                  var searchLowerCodeNew = searchLowerCodes[searchI];
	                  if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char
	                }

	                matchesSimpleLen = searchI;
	                targetI = matchesSimple[matchesSimpleLen - 1] + 1;
	                break;
	              }
	            }
	          }

	          var searchI = 0;
	          var typoStrictI = 0;
	          var successStrict = false;
	          var matchesStrictLen = 0;
	          var nextBeginningIndexes = prepared._nextBeginningIndexes;
	          if (nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
	          var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1]; // Our target string successfully matched all characters in sequence!
	          // Let's try a more advanced and strict test to improve the score
	          // only count it as a match if it's consecutive or a beginning character!

	          if (targetI !== targetLen) for (;;) {
	            if (targetI >= targetLen) {
	              // We failed to find a good spot for this search char, go back to the previous search char and force it forward
	              if (searchI <= 0) {
	                // We failed to push chars forward for a better match
	                // transpose, starting from the beginning
	                ++typoStrictI;
	                if (typoStrictI > searchLen - 2) break;
	                if (searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI + 1]) continue; // doesn't make sense to transpose a repeat char

	                targetI = firstPossibleI;
	                continue;
	              }

	              --searchI;
	              var lastMatch = matchesStrict[--matchesStrictLen];
	              targetI = nextBeginningIndexes[lastMatch];
	            } else {
	              var isMatch = searchLowerCodes[typoStrictI === 0 ? searchI : typoStrictI === searchI ? searchI + 1 : typoStrictI === searchI - 1 ? searchI - 1 : searchI] === targetLowerCodes[targetI];

	              if (isMatch) {
	                matchesStrict[matchesStrictLen++] = targetI;
	                ++searchI;

	                if (searchI === searchLen) {
	                  successStrict = true;
	                  break;
	                }

	                ++targetI;
	              } else {
	                targetI = nextBeginningIndexes[targetI];
	              }
	            }
	          }
	          {
	            // tally up the score & keep track of matches for highlighting later
	            if (successStrict) {
	              var matchesBest = matchesStrict;
	              var matchesBestLen = matchesStrictLen;
	            } else {
	              var matchesBest = matchesSimple;
	              var matchesBestLen = matchesSimpleLen;
	            }

	            var score = 0;
	            var lastTargetI = -1;

	            for (var i = 0; i < searchLen; ++i) {
	              var targetI = matchesBest[i]; // score only goes down if they're not consecutive

	              if (lastTargetI !== targetI - 1) score -= targetI;
	              lastTargetI = targetI;
	            }

	            if (!successStrict) {
	              score *= 1000;
	              if (typoSimpleI !== 0) score += -20;
	              /*typoPenalty*/
	            } else {
	              if (typoStrictI !== 0) score += -20;
	              /*typoPenalty*/
	            }

	            score -= targetLen - searchLen;
	            prepared.score = score;
	            prepared.indexes = new Array(matchesBestLen);

	            for (var i = matchesBestLen - 1; i >= 0; --i) prepared.indexes[i] = matchesBest[i];

	            return prepared;
	          }
	        },
	        algorithmNoTypo: function (searchLowerCodes, prepared, searchLowerCode) {
	          var targetLowerCodes = prepared._targetLowerCodes;
	          var searchLen = searchLowerCodes.length;
	          var targetLen = targetLowerCodes.length;
	          var searchI = 0; // where we at

	          var targetI = 0; // where you at

	          var matchesSimpleLen = 0; // very basic fuzzy match; to remove non-matching targets ASAP!
	          // walk through target. find sequential matches.
	          // if all chars aren't found then exit

	          for (;;) {
	            var isMatch = searchLowerCode === targetLowerCodes[targetI];

	            if (isMatch) {
	              matchesSimple[matchesSimpleLen++] = targetI;
	              ++searchI;
	              if (searchI === searchLen) break;
	              searchLowerCode = searchLowerCodes[searchI];
	            }

	            ++targetI;
	            if (targetI >= targetLen) return null; // Failed to find searchI
	          }

	          var searchI = 0;
	          var successStrict = false;
	          var matchesStrictLen = 0;
	          var nextBeginningIndexes = prepared._nextBeginningIndexes;
	          if (nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);
	          var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1]; // Our target string successfully matched all characters in sequence!
	          // Let's try a more advanced and strict test to improve the score
	          // only count it as a match if it's consecutive or a beginning character!

	          if (targetI !== targetLen) for (;;) {
	            if (targetI >= targetLen) {
	              // We failed to find a good spot for this search char, go back to the previous search char and force it forward
	              if (searchI <= 0) break; // We failed to push chars forward for a better match

	              --searchI;
	              var lastMatch = matchesStrict[--matchesStrictLen];
	              targetI = nextBeginningIndexes[lastMatch];
	            } else {
	              var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];

	              if (isMatch) {
	                matchesStrict[matchesStrictLen++] = targetI;
	                ++searchI;

	                if (searchI === searchLen) {
	                  successStrict = true;
	                  break;
	                }

	                ++targetI;
	              } else {
	                targetI = nextBeginningIndexes[targetI];
	              }
	            }
	          }
	          {
	            // tally up the score & keep track of matches for highlighting later
	            if (successStrict) {
	              var matchesBest = matchesStrict;
	              var matchesBestLen = matchesStrictLen;
	            } else {
	              var matchesBest = matchesSimple;
	              var matchesBestLen = matchesSimpleLen;
	            }

	            var score = 0;
	            var lastTargetI = -1;

	            for (var i = 0; i < searchLen; ++i) {
	              var targetI = matchesBest[i]; // score only goes down if they're not consecutive

	              if (lastTargetI !== targetI - 1) score -= targetI;
	              lastTargetI = targetI;
	            }

	            if (!successStrict) score *= 1000;
	            score -= targetLen - searchLen;
	            prepared.score = score;
	            prepared.indexes = new Array(matchesBestLen);

	            for (var i = matchesBestLen - 1; i >= 0; --i) prepared.indexes[i] = matchesBest[i];

	            return prepared;
	          }
	        },
	        prepareLowerCodes: function (str) {
	          var strLen = str.length;
	          var lowerCodes = []; // new Array(strLen)    sparse array is too slow

	          var lower = str.toLowerCase();

	          for (var i = 0; i < strLen; ++i) lowerCodes[i] = lower.charCodeAt(i);

	          return lowerCodes;
	        },
	        prepareBeginningIndexes: function (target) {
	          var targetLen = target.length;
	          var beginningIndexes = [];
	          var beginningIndexesLen = 0;
	          var wasUpper = false;
	          var wasAlphanum = false;

	          for (var i = 0; i < targetLen; ++i) {
	            var targetCode = target.charCodeAt(i);
	            var isUpper = targetCode >= 65 && targetCode <= 90;
	            var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;
	            var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;
	            wasUpper = isUpper;
	            wasAlphanum = isAlphanum;
	            if (isBeginning) beginningIndexes[beginningIndexesLen++] = i;
	          }

	          return beginningIndexes;
	        },
	        prepareNextBeginningIndexes: function (target) {
	          var targetLen = target.length;
	          var beginningIndexes = fuzzysort.prepareBeginningIndexes(target);
	          var nextBeginningIndexes = []; // new Array(targetLen)     sparse array is too slow

	          var lastIsBeginning = beginningIndexes[0];
	          var lastIsBeginningI = 0;

	          for (var i = 0; i < targetLen; ++i) {
	            if (lastIsBeginning > i) {
	              nextBeginningIndexes[i] = lastIsBeginning;
	            } else {
	              lastIsBeginning = beginningIndexes[++lastIsBeginningI];
	              nextBeginningIndexes[i] = lastIsBeginning === undefined ? targetLen : lastIsBeginning;
	            }
	          }

	          return nextBeginningIndexes;
	        },
	        cleanup: cleanup,
	        new: fuzzysortNew
	      };
	      return fuzzysort;
	    } // fuzzysortNew
	    // This stuff is outside fuzzysortNew, because it's shared with instances of fuzzysort.new()


	    var isNode = typeof commonjsRequire !== 'undefined' && typeof window === 'undefined'; // var MAX_INT = Number.MAX_SAFE_INTEGER
	    // var MIN_INT = Number.MIN_VALUE

	    var preparedCache = new Map();
	    var preparedSearchCache = new Map();
	    var noResults = [];
	    noResults.total = 0;
	    var matchesSimple = [];
	    var matchesStrict = [];

	    function cleanup() {
	      preparedCache.clear();
	      preparedSearchCache.clear();
	      matchesSimple = [];
	      matchesStrict = [];
	    }

	    function defaultScoreFn(a) {
	      var max = -9007199254740991;

	      for (var i = a.length - 1; i >= 0; --i) {
	        var result = a[i];
	        if (result === null) continue;
	        var score = result.score;
	        if (score > max) max = score;
	      }

	      if (max === -9007199254740991) return null;
	      return max;
	    } // prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]
	    // prop = 'key1.key2'        10ms
	    // prop = ['key1', 'key2']   27ms


	    function getValue(obj, prop) {
	      var tmp = obj[prop];
	      if (tmp !== undefined) return tmp;
	      var segs = prop;
	      if (!Array.isArray(prop)) segs = prop.split('.');
	      var len = segs.length;
	      var i = -1;

	      while (obj && ++i < len) obj = obj[segs[i]];

	      return obj;
	    }

	    function isObj(x) {
	      return typeof x === 'object';
	    } // faster as a function
	    // Hacked version of https://github.com/lemire/FastPriorityQueue.js


	    var fastpriorityqueue = function () {
	      var r = [],
	          o = 0,
	          e = {};

	      function n() {
	        for (var e = 0, n = r[e], c = 1; c < o;) {
	          var f = c + 1;
	          e = c, f < o && r[f].score < r[c].score && (e = f), r[e - 1 >> 1] = r[e], c = 1 + (e << 1);
	        }

	        for (var a = e - 1 >> 1; e > 0 && n.score < r[a].score; a = (e = a) - 1 >> 1) r[e] = r[a];

	        r[e] = n;
	      }

	      return e.add = function (e) {
	        var n = o;
	        r[o++] = e;

	        for (var c = n - 1 >> 1; n > 0 && e.score < r[c].score; c = (n = c) - 1 >> 1) r[n] = r[c];

	        r[n] = e;
	      }, e.poll = function () {
	        if (0 !== o) {
	          var e = r[0];
	          return r[0] = r[--o], n(), e;
	        }
	      }, e.peek = function (e) {
	        if (0 !== o) return r[0];
	      }, e.replaceTop = function (o) {
	        r[0] = o, n();
	      }, e;
	    };

	    var q = fastpriorityqueue(); // reuse this, except for async, it needs to make its own

	    return fuzzysortNew();
	  }); // UMD
	  // TODO: (performance) wasm version!?
	  // TODO: (performance) layout memory in an optimal way to go fast by avoiding cache misses
	  // TODO: (performance) preparedCache is a memory leak
	  // TODO: (like sublime) backslash === forwardslash
	  // TODO: (performance) i have no idea how well optizmied the allowing typos algorithm is

	});

	var stats = {
	  passedTests: 0,
	  failedTests: 0,
	  skippedTests: 0,
	  todoTests: 0
	}; // Escape text for attribute or text content.

	function escapeText(s) {
	  if (!s) {
	    return "";
	  }

	  s = s + ""; // Both single quotes and double quotes (for attributes)

	  return s.replace(/['"<>&]/g, function (s) {
	    switch (s) {
	      case "'":
	        return "&#039;";

	      case "\"":
	        return "&quot;";

	      case "<":
	        return "&lt;";

	      case ">":
	        return "&gt;";

	      case "&":
	        return "&amp;";
	    }
	  });
	}

	(function () {
	  // Don't load the HTML Reporter on non-browser environments
	  if (!window$1 || !document) {
	    return;
	  }

	  var config = QUnit.config,
	      hiddenTests = [],
	      collapseNext = false,
	      hasOwn = Object.prototype.hasOwnProperty,
	      unfilteredUrl = setUrl({
	    filter: undefined,
	    module: undefined,
	    moduleId: undefined,
	    testId: undefined
	  });

	  function addEvent(elem, type, fn) {
	    elem.addEventListener(type, fn, false);
	  }

	  function removeEvent(elem, type, fn) {
	    elem.removeEventListener(type, fn, false);
	  }

	  function addEvents(elems, type, fn) {
	    var i = elems.length;

	    while (i--) {
	      addEvent(elems[i], type, fn);
	    }
	  }

	  function hasClass(elem, name) {
	    return (" " + elem.className + " ").indexOf(" " + name + " ") >= 0;
	  }

	  function addClass(elem, name) {
	    if (!hasClass(elem, name)) {
	      elem.className += (elem.className ? " " : "") + name;
	    }
	  }

	  function toggleClass(elem, name, force) {
	    if (force || typeof force === "undefined" && !hasClass(elem, name)) {
	      addClass(elem, name);
	    } else {
	      removeClass(elem, name);
	    }
	  }

	  function removeClass(elem, name) {
	    var set = " " + elem.className + " "; // Class name may appear multiple times

	    while (set.indexOf(" " + name + " ") >= 0) {
	      set = set.replace(" " + name + " ", " ");
	    } // Trim for prettiness


	    elem.className = typeof set.trim === "function" ? set.trim() : set.replace(/^\s+|\s+$/g, "");
	  }

	  function id(name) {
	    return document.getElementById && document.getElementById(name);
	  }

	  function abortTests() {
	    var abortButton = id("qunit-abort-tests-button");

	    if (abortButton) {
	      abortButton.disabled = true;
	      abortButton.innerHTML = "Aborting...";
	    }

	    QUnit.config.queue.length = 0;
	    return false;
	  }

	  function interceptNavigation(ev) {
	    applyUrlParams();

	    if (ev && ev.preventDefault) {
	      ev.preventDefault();
	    }

	    return false;
	  }

	  function getUrlConfigHtml() {
	    var i,
	        j,
	        val,
	        escaped,
	        escapedTooltip,
	        selection = false,
	        urlConfig = config.urlConfig,
	        urlConfigHtml = "";

	    for (i = 0; i < urlConfig.length; i++) {
	      // Options can be either strings or objects with nonempty "id" properties
	      val = config.urlConfig[i];

	      if (typeof val === "string") {
	        val = {
	          id: val,
	          label: val
	        };
	      }

	      escaped = escapeText(val.id);
	      escapedTooltip = escapeText(val.tooltip);

	      if (!val.value || typeof val.value === "string") {
	        urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'><input id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' type='checkbox'" + (val.value ? " value='" + escapeText(val.value) + "'" : "") + (config[val.id] ? " checked='checked'" : "") + " title='" + escapedTooltip + "' />" + escapeText(val.label) + "</label>";
	      } else {
	        urlConfigHtml += "<label for='qunit-urlconfig-" + escaped + "' title='" + escapedTooltip + "'>" + val.label + ": </label><select id='qunit-urlconfig-" + escaped + "' name='" + escaped + "' title='" + escapedTooltip + "'><option></option>";

	        if (QUnit.is("array", val.value)) {
	          for (j = 0; j < val.value.length; j++) {
	            escaped = escapeText(val.value[j]);
	            urlConfigHtml += "<option value='" + escaped + "'" + (config[val.id] === val.value[j] ? (selection = true) && " selected='selected'" : "") + ">" + escaped + "</option>";
	          }
	        } else {
	          for (j in val.value) {
	            if (hasOwn.call(val.value, j)) {
	              urlConfigHtml += "<option value='" + escapeText(j) + "'" + (config[val.id] === j ? (selection = true) && " selected='selected'" : "") + ">" + escapeText(val.value[j]) + "</option>";
	            }
	          }
	        }

	        if (config[val.id] && !selection) {
	          escaped = escapeText(config[val.id]);
	          urlConfigHtml += "<option value='" + escaped + "' selected='selected' disabled='disabled'>" + escaped + "</option>";
	        }

	        urlConfigHtml += "</select>";
	      }
	    }

	    return urlConfigHtml;
	  } // Handle "click" events on toolbar checkboxes and "change" for select menus.
	  // Updates the URL with the new state of `config.urlConfig` values.


	  function toolbarChanged() {
	    var updatedUrl,
	        value,
	        tests,
	        field = this,
	        params = {}; // Detect if field is a select menu or a checkbox

	    if ("selectedIndex" in field) {
	      value = field.options[field.selectedIndex].value || undefined;
	    } else {
	      value = field.checked ? field.defaultValue || true : undefined;
	    }

	    params[field.name] = value;
	    updatedUrl = setUrl(params); // Check if we can apply the change without a page refresh

	    if ("hidepassed" === field.name && "replaceState" in window$1.history) {
	      QUnit.urlParams[field.name] = value;
	      config[field.name] = value || false;
	      tests = id("qunit-tests");

	      if (tests) {
	        var length = tests.children.length;
	        var children = tests.children;

	        if (field.checked) {
	          for (var i = 0; i < length; i++) {
	            var test = children[i];
	            var className = test ? test.className : "";
	            var classNameHasPass = className.indexOf("pass") > -1;
	            var classNameHasSkipped = className.indexOf("skipped") > -1;

	            if (classNameHasPass || classNameHasSkipped) {
	              hiddenTests.push(test);
	            }
	          }

	          var _iterator = _createForOfIteratorHelper(hiddenTests),
	              _step;

	          try {
	            for (_iterator.s(); !(_step = _iterator.n()).done;) {
	              var hiddenTest = _step.value;
	              tests.removeChild(hiddenTest);
	            }
	          } catch (err) {
	            _iterator.e(err);
	          } finally {
	            _iterator.f();
	          }
	        } else {
	          while ((test = hiddenTests.pop()) != null) {
	            tests.appendChild(test);
	          }
	        }
	      }

	      window$1.history.replaceState(null, "", updatedUrl);
	    } else {
	      window$1.location = updatedUrl;
	    }
	  }

	  function setUrl(params) {
	    var key,
	        arrValue,
	        i,
	        querystring = "?",
	        location = window$1.location;
	    params = extend(extend({}, QUnit.urlParams), params);

	    for (key in params) {
	      // Skip inherited or undefined properties
	      if (hasOwn.call(params, key) && params[key] !== undefined) {
	        // Output a parameter for each value of this key
	        // (but usually just one)
	        arrValue = [].concat(params[key]);

	        for (i = 0; i < arrValue.length; i++) {
	          querystring += encodeURIComponent(key);

	          if (arrValue[i] !== true) {
	            querystring += "=" + encodeURIComponent(arrValue[i]);
	          }

	          querystring += "&";
	        }
	      }
	    }

	    return location.protocol + "//" + location.host + location.pathname + querystring.slice(0, -1);
	  }

	  function applyUrlParams() {
	    var i,
	        selectedModules = [],
	        modulesList = id("qunit-modulefilter-dropdown-list").getElementsByTagName("input"),
	        filter = id("qunit-filter-input").value;

	    for (i = 0; i < modulesList.length; i++) {
	      if (modulesList[i].checked) {
	        selectedModules.push(modulesList[i].value);
	      }
	    }

	    window$1.location = setUrl({
	      filter: filter === "" ? undefined : filter,
	      moduleId: selectedModules.length === 0 ? undefined : selectedModules,
	      // Remove module and testId filter
	      module: undefined,
	      testId: undefined
	    });
	  }

	  function toolbarUrlConfigContainer() {
	    var urlConfigContainer = document.createElement("span");
	    urlConfigContainer.innerHTML = getUrlConfigHtml();
	    addClass(urlConfigContainer, "qunit-url-config");
	    addEvents(urlConfigContainer.getElementsByTagName("input"), "change", toolbarChanged);
	    addEvents(urlConfigContainer.getElementsByTagName("select"), "change", toolbarChanged);
	    return urlConfigContainer;
	  }

	  function abortTestsButton() {
	    var button = document.createElement("button");
	    button.id = "qunit-abort-tests-button";
	    button.innerHTML = "Abort";
	    addEvent(button, "click", abortTests);
	    return button;
	  }

	  function toolbarLooseFilter() {
	    var filter = document.createElement("form"),
	        label = document.createElement("label"),
	        input = document.createElement("input"),
	        button = document.createElement("button");
	    addClass(filter, "qunit-filter");
	    label.innerHTML = "Filter: ";
	    input.type = "text";
	    input.value = config.filter || "";
	    input.name = "filter";
	    input.id = "qunit-filter-input";
	    button.innerHTML = "Go";
	    label.appendChild(input);
	    filter.appendChild(label);
	    filter.appendChild(document.createTextNode(" "));
	    filter.appendChild(button);
	    addEvent(filter, "submit", interceptNavigation);
	    return filter;
	  }

	  function moduleListHtml(modules) {
	    var i,
	        checked,
	        html = "";

	    for (i = 0; i < modules.length; i++) {
	      if (modules[i].name !== "") {
	        checked = config.moduleId.indexOf(modules[i].moduleId) > -1;
	        html += "<li><label class='clickable" + (checked ? " checked" : "") + "'><input type='checkbox' " + "value='" + modules[i].moduleId + "'" + (checked ? " checked='checked'" : "") + " />" + escapeText(modules[i].name) + "</label></li>";
	      }
	    }

	    return html;
	  }

	  function toolbarModuleFilter() {
	    var commit,
	        reset,
	        moduleFilter = document.createElement("form"),
	        label = document.createElement("label"),
	        moduleSearch = document.createElement("input"),
	        dropDown = document.createElement("div"),
	        actions = document.createElement("span"),
	        applyButton = document.createElement("button"),
	        resetButton = document.createElement("button"),
	        allModulesLabel = document.createElement("label"),
	        allCheckbox = document.createElement("input"),
	        dropDownList = document.createElement("ul"),
	        dirty = false;
	    moduleSearch.id = "qunit-modulefilter-search";
	    moduleSearch.autocomplete = "off";
	    addEvent(moduleSearch, "input", searchInput);
	    addEvent(moduleSearch, "input", searchFocus);
	    addEvent(moduleSearch, "focus", searchFocus);
	    addEvent(moduleSearch, "click", searchFocus);
	    config.modules.forEach(function (module) {
	      return module.namePrepared = fuzzysort.prepare(module.name);
	    });
	    label.id = "qunit-modulefilter-search-container";
	    label.innerHTML = "Module: ";
	    label.appendChild(moduleSearch);
	    applyButton.textContent = "Apply";
	    applyButton.style.display = "none";
	    resetButton.textContent = "Reset";
	    resetButton.type = "reset";
	    resetButton.style.display = "none";
	    allCheckbox.type = "checkbox";
	    allCheckbox.checked = config.moduleId.length === 0;
	    allModulesLabel.className = "clickable";

	    if (config.moduleId.length) {
	      allModulesLabel.className = "checked";
	    }

	    allModulesLabel.appendChild(allCheckbox);
	    allModulesLabel.appendChild(document.createTextNode("All modules"));
	    actions.id = "qunit-modulefilter-actions";
	    actions.appendChild(applyButton);
	    actions.appendChild(resetButton);
	    actions.appendChild(allModulesLabel);
	    commit = actions.firstChild;
	    reset = commit.nextSibling;
	    addEvent(commit, "click", applyUrlParams);
	    dropDownList.id = "qunit-modulefilter-dropdown-list";
	    dropDownList.innerHTML = moduleListHtml(config.modules);
	    dropDown.id = "qunit-modulefilter-dropdown";
	    dropDown.style.display = "none";
	    dropDown.appendChild(actions);
	    dropDown.appendChild(dropDownList);
	    addEvent(dropDown, "change", selectionChange);
	    selectionChange();
	    moduleFilter.id = "qunit-modulefilter";
	    moduleFilter.appendChild(label);
	    moduleFilter.appendChild(dropDown);
	    addEvent(moduleFilter, "submit", interceptNavigation);
	    addEvent(moduleFilter, "reset", function () {
	      // Let the reset happen, then update styles
	      window$1.setTimeout(selectionChange);
	    }); // Enables show/hide for the dropdown

	    function searchFocus() {
	      if (dropDown.style.display !== "none") {
	        return;
	      }

	      dropDown.style.display = "block";
	      addEvent(document, "click", hideHandler);
	      addEvent(document, "keydown", hideHandler); // Hide on Escape keydown or outside-container click

	      function hideHandler(e) {
	        var inContainer = moduleFilter.contains(e.target);

	        if (e.keyCode === 27 || !inContainer) {
	          if (e.keyCode === 27 && inContainer) {
	            moduleSearch.focus();
	          }

	          dropDown.style.display = "none";
	          removeEvent(document, "click", hideHandler);
	          removeEvent(document, "keydown", hideHandler);
	          moduleSearch.value = "";
	          searchInput();
	        }
	      }
	    }

	    function filterModules(searchText) {
	      if (searchText === "") {
	        return config.modules;
	      }

	      return fuzzysort.go(searchText, config.modules, {
	        key: "namePrepared",
	        threshold: -10000
	      }).map(function (module) {
	        return module.obj;
	      });
	    } // Processes module search box input


	    var searchInputTimeout;

	    function searchInput() {
	      window$1.clearTimeout(searchInputTimeout);
	      searchInputTimeout = window$1.setTimeout(function () {
	        var searchText = moduleSearch.value.toLowerCase(),
	            filteredModules = filterModules(searchText);
	        dropDownList.innerHTML = moduleListHtml(filteredModules);
	      }, 200);
	    } // Processes selection changes


	    function selectionChange(evt) {
	      var i,
	          item,
	          checkbox = evt && evt.target || allCheckbox,
	          modulesList = dropDownList.getElementsByTagName("input"),
	          selectedNames = [];
	      toggleClass(checkbox.parentNode, "checked", checkbox.checked);
	      dirty = false;

	      if (checkbox.checked && checkbox !== allCheckbox) {
	        allCheckbox.checked = false;
	        removeClass(allCheckbox.parentNode, "checked");
	      }

	      for (i = 0; i < modulesList.length; i++) {
	        item = modulesList[i];

	        if (!evt) {
	          toggleClass(item.parentNode, "checked", item.checked);
	        } else if (checkbox === allCheckbox && checkbox.checked) {
	          item.checked = false;
	          removeClass(item.parentNode, "checked");
	        }

	        dirty = dirty || item.checked !== item.defaultChecked;

	        if (item.checked) {
	          selectedNames.push(item.parentNode.textContent);
	        }
	      }

	      commit.style.display = reset.style.display = dirty ? "" : "none";
	      moduleSearch.placeholder = selectedNames.join(", ") || allCheckbox.parentNode.textContent;
	      moduleSearch.title = "Type to filter list. Current selection:\n" + (selectedNames.join("\n") || allCheckbox.parentNode.textContent);
	    }

	    return moduleFilter;
	  }

	  function toolbarFilters() {
	    var toolbarFilters = document.createElement("span");
	    toolbarFilters.id = "qunit-toolbar-filters";
	    toolbarFilters.appendChild(toolbarLooseFilter());
	    toolbarFilters.appendChild(toolbarModuleFilter());
	    return toolbarFilters;
	  }

	  function appendToolbar() {
	    var toolbar = id("qunit-testrunner-toolbar");

	    if (toolbar) {
	      toolbar.appendChild(toolbarUrlConfigContainer());
	      toolbar.appendChild(toolbarFilters());
	      toolbar.appendChild(document.createElement("div")).className = "clearfix";
	    }
	  }

	  function appendHeader() {
	    var header = id("qunit-header");

	    if (header) {
	      header.innerHTML = "<a href='" + escapeText(unfilteredUrl) + "'>" + header.innerHTML + "</a> ";
	    }
	  }

	  function appendBanner() {
	    var banner = id("qunit-banner");

	    if (banner) {
	      banner.className = "";
	    }
	  }

	  function appendTestResults() {
	    var tests = id("qunit-tests"),
	        result = id("qunit-testresult"),
	        controls;

	    if (result) {
	      result.parentNode.removeChild(result);
	    }

	    if (tests) {
	      tests.innerHTML = "";
	      result = document.createElement("p");
	      result.id = "qunit-testresult";
	      result.className = "result";
	      tests.parentNode.insertBefore(result, tests);
	      result.innerHTML = "<div id=\"qunit-testresult-display\">Running...<br />&#160;</div>" + "<div id=\"qunit-testresult-controls\"></div>" + "<div class=\"clearfix\"></div>";
	      controls = id("qunit-testresult-controls");
	    }

	    if (controls) {
	      controls.appendChild(abortTestsButton());
	    }
	  }

	  function appendFilteredTest() {
	    var testId = QUnit.config.testId;

	    if (!testId || testId.length <= 0) {
	      return "";
	    }

	    return "<div id='qunit-filteredTest'>Rerunning selected tests: " + escapeText(testId.join(", ")) + " <a id='qunit-clearFilter' href='" + escapeText(unfilteredUrl) + "'>Run all tests</a></div>";
	  }

	  function appendUserAgent() {
	    var userAgent = id("qunit-userAgent");

	    if (userAgent) {
	      userAgent.innerHTML = "";
	      userAgent.appendChild(document.createTextNode("QUnit " + QUnit.version + "; " + navigator.userAgent));
	    }
	  }

	  function appendInterface() {
	    var qunit = id("qunit"); // For compat with QUnit 1.2, and to support fully custom theme HTML,
	    // we will use any existing elements if no id="qunit" element exists.
	    //
	    // Note that we don't fail or fallback to creating it ourselves,
	    // because not having id="qunit" (and not having the below elements)
	    // simply means QUnit acts headless, allowing users to use their own
	    // reporters, or for a test runner to listen for events directly without
	    // having the HTML reporter actively render anything.

	    if (qunit) {
	      qunit.setAttribute("role", "main"); // Since QUnit 1.3, these are created automatically if the page
	      // contains id="qunit".

	      qunit.innerHTML = "<h1 id='qunit-header'>" + escapeText(document.title) + "</h1>" + "<h2 id='qunit-banner'></h2>" + "<div id='qunit-testrunner-toolbar' role='navigation'></div>" + appendFilteredTest() + "<h2 id='qunit-userAgent'></h2>" + "<ol id='qunit-tests'></ol>";
	    }

	    appendHeader();
	    appendBanner();
	    appendTestResults();
	    appendUserAgent();
	    appendToolbar();
	  }

	  function appendTest(name, testId, moduleName) {
	    var title,
	        rerunTrigger,
	        testBlock,
	        assertList,
	        tests = id("qunit-tests");

	    if (!tests) {
	      return;
	    }

	    title = document.createElement("strong");
	    title.innerHTML = getNameHtml(name, moduleName);
	    rerunTrigger = document.createElement("a");
	    rerunTrigger.innerHTML = "Rerun";
	    rerunTrigger.href = setUrl({
	      testId: testId
	    });
	    testBlock = document.createElement("li");
	    testBlock.appendChild(title);
	    testBlock.appendChild(rerunTrigger);
	    testBlock.id = "qunit-test-output-" + testId;
	    assertList = document.createElement("ol");
	    assertList.className = "qunit-assert-list";
	    testBlock.appendChild(assertList);
	    tests.appendChild(testBlock);
	  } // HTML Reporter initialization and load


	  QUnit.begin(function () {
	    // Initialize QUnit elements
	    appendInterface();
	  });
	  QUnit.done(function (details) {
	    var banner = id("qunit-banner"),
	        tests = id("qunit-tests"),
	        abortButton = id("qunit-abort-tests-button"),
	        totalTests = stats.passedTests + stats.skippedTests + stats.todoTests + stats.failedTests,
	        html = [totalTests, " tests completed in ", details.runtime, " milliseconds, with ", stats.failedTests, " failed, ", stats.skippedTests, " skipped, and ", stats.todoTests, " todo.<br />", "<span class='passed'>", details.passed, "</span> assertions of <span class='total'>", details.total, "</span> passed, <span class='failed'>", details.failed, "</span> failed."].join(""),
	        test,
	        assertLi,
	        assertList; // Update remaining tests to aborted

	    if (abortButton && abortButton.disabled) {
	      html = "Tests aborted after " + details.runtime + " milliseconds.";

	      for (var i = 0; i < tests.children.length; i++) {
	        test = tests.children[i];

	        if (test.className === "" || test.className === "running") {
	          test.className = "aborted";
	          assertList = test.getElementsByTagName("ol")[0];
	          assertLi = document.createElement("li");
	          assertLi.className = "fail";
	          assertLi.innerHTML = "Test aborted.";
	          assertList.appendChild(assertLi);
	        }
	      }
	    }

	    if (banner && (!abortButton || abortButton.disabled === false)) {
	      banner.className = stats.failedTests ? "qunit-fail" : "qunit-pass";
	    }

	    if (abortButton) {
	      abortButton.parentNode.removeChild(abortButton);
	    }

	    if (tests) {
	      id("qunit-testresult-display").innerHTML = html;
	    }

	    if (config.altertitle && document.title) {
	      // Show ✖ for good, ✔ for bad suite result in title
	      // use escape sequences in case file gets loaded with non-utf-8
	      // charset
	      document.title = [stats.failedTests ? "\u2716" : "\u2714", document.title.replace(/^[\u2714\u2716] /i, "")].join(" ");
	    } // Scroll back to top to show results


	    if (config.scrolltop && window$1.scrollTo) {
	      window$1.scrollTo(0, 0);
	    }
	  });

	  function getNameHtml(name, module) {
	    var nameHtml = "";

	    if (module) {
	      nameHtml = "<span class='module-name'>" + escapeText(module) + "</span>: ";
	    }

	    nameHtml += "<span class='test-name'>" + escapeText(name) + "</span>";
	    return nameHtml;
	  }

	  function getProgressHtml(runtime, stats, total) {
	    var completed = stats.passedTests + stats.skippedTests + stats.todoTests + stats.failedTests;
	    return ["<br />", completed, " / ", total, " tests completed in ", runtime, " milliseconds, with ", stats.failedTests, " failed, ", stats.skippedTests, " skipped, and ", stats.todoTests, " todo."].join("");
	  }

	  QUnit.testStart(function (details) {
	    var running, bad;
	    appendTest(details.name, details.testId, details.module);
	    running = id("qunit-testresult-display");

	    if (running) {
	      addClass(running, "running");
	      bad = QUnit.config.reorder && details.previousFailure;
	      running.innerHTML = [bad ? "Rerunning previously failed test: <br />" : "Running: <br />", getNameHtml(details.name, details.module), getProgressHtml(now() - config.started, stats, Test.count)].join("");
	    }
	  });

	  function stripHtml(string) {
	    // Strip tags, html entity and whitespaces
	    return string.replace(/<\/?[^>]+(>|$)/g, "").replace(/&quot;/g, "").replace(/\s+/g, "");
	  }

	  QUnit.log(function (details) {
	    var assertList,
	        assertLi,
	        message,
	        expected,
	        actual,
	        diff,
	        showDiff = false,
	        testItem = id("qunit-test-output-" + details.testId);

	    if (!testItem) {
	      return;
	    }

	    message = escapeText(details.message) || (details.result ? "okay" : "failed");
	    message = "<span class='test-message'>" + message + "</span>";
	    message += "<span class='runtime'>@ " + details.runtime + " ms</span>"; // The pushFailure doesn't provide details.expected
	    // when it calls, it's implicit to also not show expected and diff stuff
	    // Also, we need to check details.expected existence, as it can exist and be undefined

	    if (!details.result && hasOwn.call(details, "expected")) {
	      if (details.negative) {
	        expected = "NOT " + QUnit.dump.parse(details.expected);
	      } else {
	        expected = QUnit.dump.parse(details.expected);
	      }

	      actual = QUnit.dump.parse(details.actual);
	      message += "<table><tr class='test-expected'><th>Expected: </th><td><pre>" + escapeText(expected) + "</pre></td></tr>";

	      if (actual !== expected) {
	        message += "<tr class='test-actual'><th>Result: </th><td><pre>" + escapeText(actual) + "</pre></td></tr>";

	        if (typeof details.actual === "number" && typeof details.expected === "number") {
	          if (!isNaN(details.actual) && !isNaN(details.expected)) {
	            showDiff = true;
	            diff = details.actual - details.expected;
	            diff = (diff > 0 ? "+" : "") + diff;
	          }
	        } else if (typeof details.actual !== "boolean" && typeof details.expected !== "boolean") {
	          diff = QUnit.diff(expected, actual); // don't show diff if there is zero overlap

	          showDiff = stripHtml(diff).length !== stripHtml(expected).length + stripHtml(actual).length;
	        }

	        if (showDiff) {
	          message += "<tr class='test-diff'><th>Diff: </th><td><pre>" + diff + "</pre></td></tr>";
	        }
	      } else if (expected.indexOf("[object Array]") !== -1 || expected.indexOf("[object Object]") !== -1) {
	        message += "<tr class='test-message'><th>Message: </th><td>" + "Diff suppressed as the depth of object is more than current max depth (" + QUnit.config.maxDepth + ").<p>Hint: Use <code>QUnit.dump.maxDepth</code> to " + " run with a higher max depth or <a href='" + escapeText(setUrl({
	          maxDepth: -1
	        })) + "'>" + "Rerun</a> without max depth.</p></td></tr>";
	      } else {
	        message += "<tr class='test-message'><th>Message: </th><td>" + "Diff suppressed as the expected and actual results have an equivalent" + " serialization</td></tr>";
	      }

	      if (details.source) {
	        message += "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + "</pre></td></tr>";
	      }

	      message += "</table>"; // This occurs when pushFailure is set and we have an extracted stack trace
	    } else if (!details.result && details.source) {
	      message += "<table>" + "<tr class='test-source'><th>Source: </th><td><pre>" + escapeText(details.source) + "</pre></td></tr>" + "</table>";
	    }

	    assertList = testItem.getElementsByTagName("ol")[0];
	    assertLi = document.createElement("li");
	    assertLi.className = details.result ? "pass" : "fail";
	    assertLi.innerHTML = message;
	    assertList.appendChild(assertLi);
	  });
	  QUnit.testDone(function (details) {
	    var testTitle,
	        time,
	        testItem,
	        assertList,
	        status,
	        good,
	        bad,
	        testCounts,
	        skipped,
	        sourceName,
	        tests = id("qunit-tests");

	    if (!tests) {
	      return;
	    }

	    testItem = id("qunit-test-output-" + details.testId);
	    removeClass(testItem, "running");

	    if (details.failed > 0) {
	      status = "failed";
	    } else if (details.todo) {
	      status = "todo";
	    } else {
	      status = details.skipped ? "skipped" : "passed";
	    }

	    assertList = testItem.getElementsByTagName("ol")[0];
	    good = details.passed;
	    bad = details.failed; // This test passed if it has no unexpected failed assertions

	    var testPassed = details.failed > 0 ? details.todo : !details.todo;

	    if (testPassed) {
	      // Collapse the passing tests
	      addClass(assertList, "qunit-collapsed");
	    } else if (config.collapse) {
	      if (!collapseNext) {
	        // Skip collapsing the first failing test
	        collapseNext = true;
	      } else {
	        // Collapse remaining tests
	        addClass(assertList, "qunit-collapsed");
	      }
	    } // The testItem.firstChild is the test name


	    testTitle = testItem.firstChild;
	    testCounts = bad ? "<b class='failed'>" + bad + "</b>, " + "<b class='passed'>" + good + "</b>, " : "";
	    testTitle.innerHTML += " <b class='counts'>(" + testCounts + details.assertions.length + ")</b>";

	    if (details.skipped) {
	      stats.skippedTests++;
	      testItem.className = "skipped";
	      skipped = document.createElement("em");
	      skipped.className = "qunit-skipped-label";
	      skipped.innerHTML = "skipped";
	      testItem.insertBefore(skipped, testTitle);
	    } else {
	      addEvent(testTitle, "click", function () {
	        toggleClass(assertList, "qunit-collapsed");
	      });
	      testItem.className = testPassed ? "pass" : "fail";

	      if (details.todo) {
	        var todoLabel = document.createElement("em");
	        todoLabel.className = "qunit-todo-label";
	        todoLabel.innerHTML = "todo";
	        testItem.className += " todo";
	        testItem.insertBefore(todoLabel, testTitle);
	      }

	      time = document.createElement("span");
	      time.className = "runtime";
	      time.innerHTML = details.runtime + " ms";
	      testItem.insertBefore(time, assertList);

	      if (!testPassed) {
	        stats.failedTests++;
	      } else if (details.todo) {
	        stats.todoTests++;
	      } else {
	        stats.passedTests++;
	      }
	    } // Show the source of the test when showing assertions


	    if (details.source) {
	      sourceName = document.createElement("p");
	      sourceName.innerHTML = "<strong>Source: </strong>" + escapeText(details.source);
	      addClass(sourceName, "qunit-source");

	      if (testPassed) {
	        addClass(sourceName, "qunit-collapsed");
	      }

	      addEvent(testTitle, "click", function () {
	        toggleClass(sourceName, "qunit-collapsed");
	      });
	      testItem.appendChild(sourceName);
	    }

	    if (config.hidepassed && (status === "passed" || details.skipped)) {
	      // use removeChild instead of remove because of support
	      hiddenTests.push(testItem);
	      tests.removeChild(testItem);
	    }
	  }); // Avoid readyState issue with phantomjs
	  // Ref: #818

	  var usingPhantom = function (p) {
	    return p && p.version && p.version.major > 0;
	  }(window$1.phantom);

	  if (usingPhantom) {
	    console$1.warn("Support for PhantomJS is deprecated and will be removed in QUnit 3.0.");
	  }

	  if (!usingPhantom && document.readyState === "complete") {
	    QUnit.load();
	  } else {
	    addEvent(window$1, "load", QUnit.load);
	  } // Wrap window.onerror. We will call the original window.onerror to see if
	  // the existing handler fully handles the error; if not, we will call the
	  // QUnit.onError function.


	  var originalWindowOnError = window$1.onerror; // Cover uncaught exceptions
	  // Returning true will suppress the default browser handler,
	  // returning false will let it run.

	  window$1.onerror = function (message, fileName, lineNumber, columnNumber, errorObj) {
	    var ret = false;

	    if (originalWindowOnError) {
	      for (var _len = arguments.length, args = new Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {
	        args[_key - 5] = arguments[_key];
	      }

	      ret = originalWindowOnError.call.apply(originalWindowOnError, [this, message, fileName, lineNumber, columnNumber, errorObj].concat(args));
	    } // Treat return value as window.onerror itself does,
	    // Only do our handling if not suppressed.


	    if (ret !== true) {
	      var error = {
	        message: message,
	        fileName: fileName,
	        lineNumber: lineNumber
	      }; // According to
	      // https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror,
	      // most modern browsers support an errorObj argument; use that to
	      // get a full stack trace if it's available.

	      if (errorObj && errorObj.stack) {
	        error.stacktrace = extractStacktrace(errorObj, 0);
	      }

	      ret = QUnit.onError(error);
	    }

	    return ret;
	  }; // Listen for unhandled rejections, and call QUnit.onUnhandledRejection


	  window$1.addEventListener("unhandledrejection", function (event) {
	    QUnit.onUnhandledRejection(event.reason);
	  });
	})();

	/*
	 * This file is a modified version of google-diff-match-patch's JavaScript implementation
	 * (https://code.google.com/p/google-diff-match-patch/source/browse/trunk/javascript/diff_match_patch_uncompressed.js),
	 * modifications are licensed as more fully set forth in LICENSE.txt.
	 *
	 * The original source of google-diff-match-patch is attributable and licensed as follows:
	 *
	 * Copyright 2006 Google Inc.
	 * https://code.google.com/p/google-diff-match-patch/
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 * https://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 *
	 * More Info:
	 *  https://code.google.com/p/google-diff-match-patch/
	 *
	 * Usage: QUnit.diff(expected, actual)
	 *
	 */

	QUnit.diff = function () {
	  function DiffMatchPatch() {} //  DIFF FUNCTIONS

	  /**
	   * The data structure representing a diff is an array of tuples:
	   * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
	   * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
	   */


	  var DIFF_DELETE = -1,
	      DIFF_INSERT = 1,
	      DIFF_EQUAL = 0,
	      hasOwn = Object.prototype.hasOwnProperty;
	  /**
	   * Find the differences between two texts.  Simplifies the problem by stripping
	   * any common prefix or suffix off the texts before diffing.
	   * @param {string} text1 Old string to be diffed.
	   * @param {string} text2 New string to be diffed.
	   * @param {boolean=} optChecklines Optional speedup flag. If present and false,
	   *     then don't run a line-level diff first to identify the changed areas.
	   *     Defaults to true, which does a faster, slightly less optimal diff.
	   * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
	   */

	  DiffMatchPatch.prototype.DiffMain = function (text1, text2, optChecklines) {
	    var deadline, checklines, commonlength, commonprefix, commonsuffix, diffs; // The diff must be complete in up to 1 second.

	    deadline = new Date().getTime() + 1000; // Check for null inputs.

	    if (text1 === null || text2 === null) {
	      throw new Error("Null input. (DiffMain)");
	    } // Check for equality (speedup).


	    if (text1 === text2) {
	      if (text1) {
	        return [[DIFF_EQUAL, text1]];
	      }

	      return [];
	    }

	    if (typeof optChecklines === "undefined") {
	      optChecklines = true;
	    }

	    checklines = optChecklines; // Trim off common prefix (speedup).

	    commonlength = this.diffCommonPrefix(text1, text2);
	    commonprefix = text1.substring(0, commonlength);
	    text1 = text1.substring(commonlength);
	    text2 = text2.substring(commonlength); // Trim off common suffix (speedup).

	    commonlength = this.diffCommonSuffix(text1, text2);
	    commonsuffix = text1.substring(text1.length - commonlength);
	    text1 = text1.substring(0, text1.length - commonlength);
	    text2 = text2.substring(0, text2.length - commonlength); // Compute the diff on the middle block.

	    diffs = this.diffCompute(text1, text2, checklines, deadline); // Restore the prefix and suffix.

	    if (commonprefix) {
	      diffs.unshift([DIFF_EQUAL, commonprefix]);
	    }

	    if (commonsuffix) {
	      diffs.push([DIFF_EQUAL, commonsuffix]);
	    }

	    this.diffCleanupMerge(diffs);
	    return diffs;
	  };
	  /**
	   * Reduce the number of edits by eliminating operationally trivial equalities.
	   * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
	   */


	  DiffMatchPatch.prototype.diffCleanupEfficiency = function (diffs) {
	    var changes, equalities, equalitiesLength, lastequality, pointer, preIns, preDel, postIns, postDel;
	    changes = false;
	    equalities = []; // Stack of indices where equalities are found.

	    equalitiesLength = 0; // Keeping our own length var is faster in JS.

	    /** @type {?string} */

	    lastequality = null; // Always equal to diffs[equalities[equalitiesLength - 1]][1]

	    pointer = 0; // Index of current position.
	    // Is there an insertion operation before the last equality.

	    preIns = false; // Is there a deletion operation before the last equality.

	    preDel = false; // Is there an insertion operation after the last equality.

	    postIns = false; // Is there a deletion operation after the last equality.

	    postDel = false;

	    while (pointer < diffs.length) {
	      // Equality found.
	      if (diffs[pointer][0] === DIFF_EQUAL) {
	        if (diffs[pointer][1].length < 4 && (postIns || postDel)) {
	          // Candidate found.
	          equalities[equalitiesLength++] = pointer;
	          preIns = postIns;
	          preDel = postDel;
	          lastequality = diffs[pointer][1];
	        } else {
	          // Not a candidate, and can never become one.
	          equalitiesLength = 0;
	          lastequality = null;
	        }

	        postIns = postDel = false; // An insertion or deletion.
	      } else {
	        if (diffs[pointer][0] === DIFF_DELETE) {
	          postDel = true;
	        } else {
	          postIns = true;
	        }
	        /*
	         * Five types to be split:
	         * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>
	         * <ins>A</ins>X<ins>C</ins><del>D</del>
	         * <ins>A</ins><del>B</del>X<ins>C</ins>
	         * <ins>A</del>X<ins>C</ins><del>D</del>
	         * <ins>A</ins><del>B</del>X<del>C</del>
	         */


	        if (lastequality && (preIns && preDel && postIns && postDel || lastequality.length < 2 && preIns + preDel + postIns + postDel === 3)) {
	          // Duplicate record.
	          diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]); // Change second copy to insert.

	          diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;
	          equalitiesLength--; // Throw away the equality we just deleted;

	          lastequality = null;

	          if (preIns && preDel) {
	            // No changes made which could affect previous entry, keep going.
	            postIns = postDel = true;
	            equalitiesLength = 0;
	          } else {
	            equalitiesLength--; // Throw away the previous equality.

	            pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;
	            postIns = postDel = false;
	          }

	          changes = true;
	        }
	      }

	      pointer++;
	    }

	    if (changes) {
	      this.diffCleanupMerge(diffs);
	    }
	  };
	  /**
	   * Convert a diff array into a pretty HTML report.
	   * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
	   * @param {integer} string to be beautified.
	   * @return {string} HTML representation.
	   */


	  DiffMatchPatch.prototype.diffPrettyHtml = function (diffs) {
	    var op,
	        data,
	        x,
	        html = [];

	    for (x = 0; x < diffs.length; x++) {
	      op = diffs[x][0]; // Operation (insert, delete, equal)

	      data = diffs[x][1]; // Text of change.

	      switch (op) {
	        case DIFF_INSERT:
	          html[x] = "<ins>" + escapeText(data) + "</ins>";
	          break;

	        case DIFF_DELETE:
	          html[x] = "<del>" + escapeText(data) + "</del>";
	          break;

	        case DIFF_EQUAL:
	          html[x] = "<span>" + escapeText(data) + "</span>";
	          break;
	      }
	    }

	    return html.join("");
	  };
	  /**
	   * Determine the common prefix of two strings.
	   * @param {string} text1 First string.
	   * @param {string} text2 Second string.
	   * @return {number} The number of characters common to the start of each
	   *     string.
	   */


	  DiffMatchPatch.prototype.diffCommonPrefix = function (text1, text2) {
	    var pointermid, pointermax, pointermin, pointerstart; // Quick check for common null cases.

	    if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
	      return 0;
	    } // Binary search.
	    // Performance analysis: https://neil.fraser.name/news/2007/10/09/


	    pointermin = 0;
	    pointermax = Math.min(text1.length, text2.length);
	    pointermid = pointermax;
	    pointerstart = 0;

	    while (pointermin < pointermid) {
	      if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {
	        pointermin = pointermid;
	        pointerstart = pointermin;
	      } else {
	        pointermax = pointermid;
	      }

	      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
	    }

	    return pointermid;
	  };
	  /**
	   * Determine the common suffix of two strings.
	   * @param {string} text1 First string.
	   * @param {string} text2 Second string.
	   * @return {number} The number of characters common to the end of each string.
	   */


	  DiffMatchPatch.prototype.diffCommonSuffix = function (text1, text2) {
	    var pointermid, pointermax, pointermin, pointerend; // Quick check for common null cases.

	    if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {
	      return 0;
	    } // Binary search.
	    // Performance analysis: https://neil.fraser.name/news/2007/10/09/


	    pointermin = 0;
	    pointermax = Math.min(text1.length, text2.length);
	    pointermid = pointermax;
	    pointerend = 0;

	    while (pointermin < pointermid) {
	      if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {
	        pointermin = pointermid;
	        pointerend = pointermin;
	      } else {
	        pointermax = pointermid;
	      }

	      pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
	    }

	    return pointermid;
	  };
	  /**
	   * Find the differences between two texts.  Assumes that the texts do not
	   * have any common prefix or suffix.
	   * @param {string} text1 Old string to be diffed.
	   * @param {string} text2 New string to be diffed.
	   * @param {boolean} checklines Speedup flag.  If false, then don't run a
	   *     line-level diff first to identify the changed areas.
	   *     If true, then run a faster, slightly less optimal diff.
	   * @param {number} deadline Time when the diff should be complete by.
	   * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
	   * @private
	   */


	  DiffMatchPatch.prototype.diffCompute = function (text1, text2, checklines, deadline) {
	    var diffs, longtext, shorttext, i, hm, text1A, text2A, text1B, text2B, midCommon, diffsA, diffsB;

	    if (!text1) {
	      // Just add some text (speedup).
	      return [[DIFF_INSERT, text2]];
	    }

	    if (!text2) {
	      // Just delete some text (speedup).
	      return [[DIFF_DELETE, text1]];
	    }

	    longtext = text1.length > text2.length ? text1 : text2;
	    shorttext = text1.length > text2.length ? text2 : text1;
	    i = longtext.indexOf(shorttext);

	    if (i !== -1) {
	      // Shorter text is inside the longer text (speedup).
	      diffs = [[DIFF_INSERT, longtext.substring(0, i)], [DIFF_EQUAL, shorttext], [DIFF_INSERT, longtext.substring(i + shorttext.length)]]; // Swap insertions for deletions if diff is reversed.

	      if (text1.length > text2.length) {
	        diffs[0][0] = diffs[2][0] = DIFF_DELETE;
	      }

	      return diffs;
	    }

	    if (shorttext.length === 1) {
	      // Single character string.
	      // After the previous speedup, the character can't be an equality.
	      return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
	    } // Check to see if the problem can be split in two.


	    hm = this.diffHalfMatch(text1, text2);

	    if (hm) {
	      // A half-match was found, sort out the return data.
	      text1A = hm[0];
	      text1B = hm[1];
	      text2A = hm[2];
	      text2B = hm[3];
	      midCommon = hm[4]; // Send both pairs off for separate processing.

	      diffsA = this.DiffMain(text1A, text2A, checklines, deadline);
	      diffsB = this.DiffMain(text1B, text2B, checklines, deadline); // Merge the results.

	      return diffsA.concat([[DIFF_EQUAL, midCommon]], diffsB);
	    }

	    if (checklines && text1.length > 100 && text2.length > 100) {
	      return this.diffLineMode(text1, text2, deadline);
	    }

	    return this.diffBisect(text1, text2, deadline);
	  };
	  /**
	   * Do the two texts share a substring which is at least half the length of the
	   * longer text?
	   * This speedup can produce non-minimal diffs.
	   * @param {string} text1 First string.
	   * @param {string} text2 Second string.
	   * @return {Array.<string>} Five element Array, containing the prefix of
	   *     text1, the suffix of text1, the prefix of text2, the suffix of
	   *     text2 and the common middle.  Or null if there was no match.
	   * @private
	   */


	  DiffMatchPatch.prototype.diffHalfMatch = function (text1, text2) {
	    var longtext, shorttext, dmp, text1A, text2B, text2A, text1B, midCommon, hm1, hm2, hm;
	    longtext = text1.length > text2.length ? text1 : text2;
	    shorttext = text1.length > text2.length ? text2 : text1;

	    if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
	      return null; // Pointless.
	    }

	    dmp = this; // 'this' becomes 'window' in a closure.

	    /**
	     * Does a substring of shorttext exist within longtext such that the substring
	     * is at least half the length of longtext?
	     * Closure, but does not reference any external variables.
	     * @param {string} longtext Longer string.
	     * @param {string} shorttext Shorter string.
	     * @param {number} i Start index of quarter length substring within longtext.
	     * @return {Array.<string>} Five element Array, containing the prefix of
	     *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
	     *     of shorttext and the common middle.  Or null if there was no match.
	     * @private
	     */

	    function diffHalfMatchI(longtext, shorttext, i) {
	      var seed, j, bestCommon, prefixLength, suffixLength, bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB; // Start with a 1/4 length substring at position i as a seed.

	      seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
	      j = -1;
	      bestCommon = "";

	      while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {
	        prefixLength = dmp.diffCommonPrefix(longtext.substring(i), shorttext.substring(j));
	        suffixLength = dmp.diffCommonSuffix(longtext.substring(0, i), shorttext.substring(0, j));

	        if (bestCommon.length < suffixLength + prefixLength) {
	          bestCommon = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);
	          bestLongtextA = longtext.substring(0, i - suffixLength);
	          bestLongtextB = longtext.substring(i + prefixLength);
	          bestShorttextA = shorttext.substring(0, j - suffixLength);
	          bestShorttextB = shorttext.substring(j + prefixLength);
	        }
	      }

	      if (bestCommon.length * 2 >= longtext.length) {
	        return [bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB, bestCommon];
	      } else {
	        return null;
	      }
	    } // First check if the second quarter is the seed for a half-match.


	    hm1 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 4)); // Check again based on the third quarter.

	    hm2 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 2));

	    if (!hm1 && !hm2) {
	      return null;
	    } else if (!hm2) {
	      hm = hm1;
	    } else if (!hm1) {
	      hm = hm2;
	    } else {
	      // Both matched.  Select the longest.
	      hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
	    } // A half-match was found, sort out the return data.


	    if (text1.length > text2.length) {
	      text1A = hm[0];
	      text1B = hm[1];
	      text2A = hm[2];
	      text2B = hm[3];
	    } else {
	      text2A = hm[0];
	      text2B = hm[1];
	      text1A = hm[2];
	      text1B = hm[3];
	    }

	    midCommon = hm[4];
	    return [text1A, text1B, text2A, text2B, midCommon];
	  };
	  /**
	   * Do a quick line-level diff on both strings, then rediff the parts for
	   * greater accuracy.
	   * This speedup can produce non-minimal diffs.
	   * @param {string} text1 Old string to be diffed.
	   * @param {string} text2 New string to be diffed.
	   * @param {number} deadline Time when the diff should be complete by.
	   * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
	   * @private
	   */


	  DiffMatchPatch.prototype.diffLineMode = function (text1, text2, deadline) {
	    var a, diffs, linearray, pointer, countInsert, countDelete, textInsert, textDelete, j; // Scan the text on a line-by-line basis first.

	    a = this.diffLinesToChars(text1, text2);
	    text1 = a.chars1;
	    text2 = a.chars2;
	    linearray = a.lineArray;
	    diffs = this.DiffMain(text1, text2, false, deadline); // Convert the diff back to original text.

	    this.diffCharsToLines(diffs, linearray); // Eliminate freak matches (e.g. blank lines)

	    this.diffCleanupSemantic(diffs); // Rediff any replacement blocks, this time character-by-character.
	    // Add a dummy entry at the end.

	    diffs.push([DIFF_EQUAL, ""]);
	    pointer = 0;
	    countDelete = 0;
	    countInsert = 0;
	    textDelete = "";
	    textInsert = "";

	    while (pointer < diffs.length) {
	      switch (diffs[pointer][0]) {
	        case DIFF_INSERT:
	          countInsert++;
	          textInsert += diffs[pointer][1];
	          break;

	        case DIFF_DELETE:
	          countDelete++;
	          textDelete += diffs[pointer][1];
	          break;

	        case DIFF_EQUAL:
	          // Upon reaching an equality, check for prior redundancies.
	          if (countDelete >= 1 && countInsert >= 1) {
	            // Delete the offending records and add the merged ones.
	            diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert);
	            pointer = pointer - countDelete - countInsert;
	            a = this.DiffMain(textDelete, textInsert, false, deadline);

	            for (j = a.length - 1; j >= 0; j--) {
	              diffs.splice(pointer, 0, a[j]);
	            }

	            pointer = pointer + a.length;
	          }

	          countInsert = 0;
	          countDelete = 0;
	          textDelete = "";
	          textInsert = "";
	          break;
	      }

	      pointer++;
	    }

	    diffs.pop(); // Remove the dummy entry at the end.

	    return diffs;
	  };
	  /**
	   * Find the 'middle snake' of a diff, split the problem in two
	   * and return the recursively constructed diff.
	   * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
	   * @param {string} text1 Old string to be diffed.
	   * @param {string} text2 New string to be diffed.
	   * @param {number} deadline Time at which to bail if not yet complete.
	   * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
	   * @private
	   */


	  DiffMatchPatch.prototype.diffBisect = function (text1, text2, deadline) {
	    var text1Length, text2Length, maxD, vOffset, vLength, v1, v2, x, delta, front, k1start, k1end, k2start, k2end, k2Offset, k1Offset, x1, x2, y1, y2, d, k1, k2; // Cache the text lengths to prevent multiple calls.

	    text1Length = text1.length;
	    text2Length = text2.length;
	    maxD = Math.ceil((text1Length + text2Length) / 2);
	    vOffset = maxD;
	    vLength = 2 * maxD;
	    v1 = new Array(vLength);
	    v2 = new Array(vLength); // Setting all elements to -1 is faster in Chrome & Firefox than mixing
	    // integers and undefined.

	    for (x = 0; x < vLength; x++) {
	      v1[x] = -1;
	      v2[x] = -1;
	    }

	    v1[vOffset + 1] = 0;
	    v2[vOffset + 1] = 0;
	    delta = text1Length - text2Length; // If the total number of characters is odd, then the front path will collide
	    // with the reverse path.

	    front = delta % 2 !== 0; // Offsets for start and end of k loop.
	    // Prevents mapping of space beyond the grid.

	    k1start = 0;
	    k1end = 0;
	    k2start = 0;
	    k2end = 0;

	    for (d = 0; d < maxD; d++) {
	      // Bail out if deadline is reached.
	      if (new Date().getTime() > deadline) {
	        break;
	      } // Walk the front path one step.


	      for (k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
	        k1Offset = vOffset + k1;

	        if (k1 === -d || k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1]) {
	          x1 = v1[k1Offset + 1];
	        } else {
	          x1 = v1[k1Offset - 1] + 1;
	        }

	        y1 = x1 - k1;

	        while (x1 < text1Length && y1 < text2Length && text1.charAt(x1) === text2.charAt(y1)) {
	          x1++;
	          y1++;
	        }

	        v1[k1Offset] = x1;

	        if (x1 > text1Length) {
	          // Ran off the right of the graph.
	          k1end += 2;
	        } else if (y1 > text2Length) {
	          // Ran off the bottom of the graph.
	          k1start += 2;
	        } else if (front) {
	          k2Offset = vOffset + delta - k1;

	          if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {
	            // Mirror x2 onto top-left coordinate system.
	            x2 = text1Length - v2[k2Offset];

	            if (x1 >= x2) {
	              // Overlap detected.
	              return this.diffBisectSplit(text1, text2, x1, y1, deadline);
	            }
	          }
	        }
	      } // Walk the reverse path one step.


	      for (k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
	        k2Offset = vOffset + k2;

	        if (k2 === -d || k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1]) {
	          x2 = v2[k2Offset + 1];
	        } else {
	          x2 = v2[k2Offset - 1] + 1;
	        }

	        y2 = x2 - k2;

	        while (x2 < text1Length && y2 < text2Length && text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)) {
	          x2++;
	          y2++;
	        }

	        v2[k2Offset] = x2;

	        if (x2 > text1Length) {
	          // Ran off the left of the graph.
	          k2end += 2;
	        } else if (y2 > text2Length) {
	          // Ran off the top of the graph.
	          k2start += 2;
	        } else if (!front) {
	          k1Offset = vOffset + delta - k2;

	          if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] !== -1) {
	            x1 = v1[k1Offset];
	            y1 = vOffset + x1 - k1Offset; // Mirror x2 onto top-left coordinate system.

	            x2 = text1Length - x2;

	            if (x1 >= x2) {
	              // Overlap detected.
	              return this.diffBisectSplit(text1, text2, x1, y1, deadline);
	            }
	          }
	        }
	      }
	    } // Diff took too long and hit the deadline or
	    // number of diffs equals number of characters, no commonality at all.


	    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
	  };
	  /**
	   * Given the location of the 'middle snake', split the diff in two parts
	   * and recurse.
	   * @param {string} text1 Old string to be diffed.
	   * @param {string} text2 New string to be diffed.
	   * @param {number} x Index of split point in text1.
	   * @param {number} y Index of split point in text2.
	   * @param {number} deadline Time at which to bail if not yet complete.
	   * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.
	   * @private
	   */


	  DiffMatchPatch.prototype.diffBisectSplit = function (text1, text2, x, y, deadline) {
	    var text1a, text1b, text2a, text2b, diffs, diffsb;
	    text1a = text1.substring(0, x);
	    text2a = text2.substring(0, y);
	    text1b = text1.substring(x);
	    text2b = text2.substring(y); // Compute both diffs serially.

	    diffs = this.DiffMain(text1a, text2a, false, deadline);
	    diffsb = this.DiffMain(text1b, text2b, false, deadline);
	    return diffs.concat(diffsb);
	  };
	  /**
	   * Reduce the number of edits by eliminating semantically trivial equalities.
	   * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
	   */


	  DiffMatchPatch.prototype.diffCleanupSemantic = function (diffs) {
	    var changes, equalities, equalitiesLength, lastequality, pointer, lengthInsertions2, lengthDeletions2, lengthInsertions1, lengthDeletions1, deletion, insertion, overlapLength1, overlapLength2;
	    changes = false;
	    equalities = []; // Stack of indices where equalities are found.

	    equalitiesLength = 0; // Keeping our own length var is faster in JS.

	    /** @type {?string} */

	    lastequality = null; // Always equal to diffs[equalities[equalitiesLength - 1]][1]

	    pointer = 0; // Index of current position.
	    // Number of characters that changed prior to the equality.

	    lengthInsertions1 = 0;
	    lengthDeletions1 = 0; // Number of characters that changed after the equality.

	    lengthInsertions2 = 0;
	    lengthDeletions2 = 0;

	    while (pointer < diffs.length) {
	      if (diffs[pointer][0] === DIFF_EQUAL) {
	        // Equality found.
	        equalities[equalitiesLength++] = pointer;
	        lengthInsertions1 = lengthInsertions2;
	        lengthDeletions1 = lengthDeletions2;
	        lengthInsertions2 = 0;
	        lengthDeletions2 = 0;
	        lastequality = diffs[pointer][1];
	      } else {
	        // An insertion or deletion.
	        if (diffs[pointer][0] === DIFF_INSERT) {
	          lengthInsertions2 += diffs[pointer][1].length;
	        } else {
	          lengthDeletions2 += diffs[pointer][1].length;
	        } // Eliminate an equality that is smaller or equal to the edits on both
	        // sides of it.


	        if (lastequality && lastequality.length <= Math.max(lengthInsertions1, lengthDeletions1) && lastequality.length <= Math.max(lengthInsertions2, lengthDeletions2)) {
	          // Duplicate record.
	          diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]); // Change second copy to insert.

	          diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT; // Throw away the equality we just deleted.

	          equalitiesLength--; // Throw away the previous equality (it needs to be reevaluated).

	          equalitiesLength--;
	          pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1; // Reset the counters.

	          lengthInsertions1 = 0;
	          lengthDeletions1 = 0;
	          lengthInsertions2 = 0;
	          lengthDeletions2 = 0;
	          lastequality = null;
	          changes = true;
	        }
	      }

	      pointer++;
	    } // Normalize the diff.


	    if (changes) {
	      this.diffCleanupMerge(diffs);
	    } // Find any overlaps between deletions and insertions.
	    // e.g: <del>abcxxx</del><ins>xxxdef</ins>
	    //   -> <del>abc</del>xxx<ins>def</ins>
	    // e.g: <del>xxxabc</del><ins>defxxx</ins>
	    //   -> <ins>def</ins>xxx<del>abc</del>
	    // Only extract an overlap if it is as big as the edit ahead or behind it.


	    pointer = 1;

	    while (pointer < diffs.length) {
	      if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {
	        deletion = diffs[pointer - 1][1];
	        insertion = diffs[pointer][1];
	        overlapLength1 = this.diffCommonOverlap(deletion, insertion);
	        overlapLength2 = this.diffCommonOverlap(insertion, deletion);

	        if (overlapLength1 >= overlapLength2) {
	          if (overlapLength1 >= deletion.length / 2 || overlapLength1 >= insertion.length / 2) {
	            // Overlap found.  Insert an equality and trim the surrounding edits.
	            diffs.splice(pointer, 0, [DIFF_EQUAL, insertion.substring(0, overlapLength1)]);
	            diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlapLength1);
	            diffs[pointer + 1][1] = insertion.substring(overlapLength1);
	            pointer++;
	          }
	        } else {
	          if (overlapLength2 >= deletion.length / 2 || overlapLength2 >= insertion.length / 2) {
	            // Reverse overlap found.
	            // Insert an equality and swap and trim the surrounding edits.
	            diffs.splice(pointer, 0, [DIFF_EQUAL, deletion.substring(0, overlapLength2)]);
	            diffs[pointer - 1][0] = DIFF_INSERT;
	            diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlapLength2);
	            diffs[pointer + 1][0] = DIFF_DELETE;
	            diffs[pointer + 1][1] = deletion.substring(overlapLength2);
	            pointer++;
	          }
	        }

	        pointer++;
	      }

	      pointer++;
	    }
	  };
	  /**
	   * Determine if the suffix of one string is the prefix of another.
	   * @param {string} text1 First string.
	   * @param {string} text2 Second string.
	   * @return {number} The number of characters common to the end of the first
	   *     string and the start of the second string.
	   * @private
	   */


	  DiffMatchPatch.prototype.diffCommonOverlap = function (text1, text2) {
	    var text1Length, text2Length, textLength, best, length, pattern, found; // Cache the text lengths to prevent multiple calls.

	    text1Length = text1.length;
	    text2Length = text2.length; // Eliminate the null case.

	    if (text1Length === 0 || text2Length === 0) {
	      return 0;
	    } // Truncate the longer string.


	    if (text1Length > text2Length) {
	      text1 = text1.substring(text1Length - text2Length);
	    } else if (text1Length < text2Length) {
	      text2 = text2.substring(0, text1Length);
	    }

	    textLength = Math.min(text1Length, text2Length); // Quick check for the worst case.

	    if (text1 === text2) {
	      return textLength;
	    } // Start by looking for a single character match
	    // and increase length until no match is found.
	    // Performance analysis: https://neil.fraser.name/news/2010/11/04/


	    best = 0;
	    length = 1;

	    while (true) {
	      pattern = text1.substring(textLength - length);
	      found = text2.indexOf(pattern);

	      if (found === -1) {
	        return best;
	      }

	      length += found;

	      if (found === 0 || text1.substring(textLength - length) === text2.substring(0, length)) {
	        best = length;
	        length++;
	      }
	    }
	  };
	  /**
	   * Split two texts into an array of strings.  Reduce the texts to a string of
	   * hashes where each Unicode character represents one line.
	   * @param {string} text1 First string.
	   * @param {string} text2 Second string.
	   * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}
	   *     An object containing the encoded text1, the encoded text2 and
	   *     the array of unique strings.
	   *     The zeroth element of the array of unique strings is intentionally blank.
	   * @private
	   */


	  DiffMatchPatch.prototype.diffLinesToChars = function (text1, text2) {
	    var lineArray, lineHash, chars1, chars2;
	    lineArray = []; // E.g. lineArray[4] === 'Hello\n'

	    lineHash = {}; // E.g. lineHash['Hello\n'] === 4
	    // '\x00' is a valid character, but various debuggers don't like it.
	    // So we'll insert a junk entry to avoid generating a null character.

	    lineArray[0] = "";
	    /**
	     * Split a text into an array of strings.  Reduce the texts to a string of
	     * hashes where each Unicode character represents one line.
	     * Modifies linearray and linehash through being a closure.
	     * @param {string} text String to encode.
	     * @return {string} Encoded string.
	     * @private
	     */

	    function diffLinesToCharsMunge(text) {
	      var chars, lineStart, lineEnd, lineArrayLength, line;
	      chars = ""; // Walk the text, pulling out a substring for each line.
	      // text.split('\n') would would temporarily double our memory footprint.
	      // Modifying text would create many large strings to garbage collect.

	      lineStart = 0;
	      lineEnd = -1; // Keeping our own length variable is faster than looking it up.

	      lineArrayLength = lineArray.length;

	      while (lineEnd < text.length - 1) {
	        lineEnd = text.indexOf("\n", lineStart);

	        if (lineEnd === -1) {
	          lineEnd = text.length - 1;
	        }

	        line = text.substring(lineStart, lineEnd + 1);
	        lineStart = lineEnd + 1;

	        if (hasOwn.call(lineHash, line)) {
	          chars += String.fromCharCode(lineHash[line]);
	        } else {
	          chars += String.fromCharCode(lineArrayLength);
	          lineHash[line] = lineArrayLength;
	          lineArray[lineArrayLength++] = line;
	        }
	      }

	      return chars;
	    }

	    chars1 = diffLinesToCharsMunge(text1);
	    chars2 = diffLinesToCharsMunge(text2);
	    return {
	      chars1: chars1,
	      chars2: chars2,
	      lineArray: lineArray
	    };
	  };
	  /**
	   * Rehydrate the text in a diff from a string of line hashes to real lines of
	   * text.
	   * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
	   * @param {!Array.<string>} lineArray Array of unique strings.
	   * @private
	   */


	  DiffMatchPatch.prototype.diffCharsToLines = function (diffs, lineArray) {
	    var x, chars, text, y;

	    for (x = 0; x < diffs.length; x++) {
	      chars = diffs[x][1];
	      text = [];

	      for (y = 0; y < chars.length; y++) {
	        text[y] = lineArray[chars.charCodeAt(y)];
	      }

	      diffs[x][1] = text.join("");
	    }
	  };
	  /**
	   * Reorder and merge like edit sections.  Merge equalities.
	   * Any edit section can move as long as it doesn't cross an equality.
	   * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.
	   */


	  DiffMatchPatch.prototype.diffCleanupMerge = function (diffs) {
	    var pointer, countDelete, countInsert, textInsert, textDelete, commonlength, changes, diffPointer, position;
	    diffs.push([DIFF_EQUAL, ""]); // Add a dummy entry at the end.

	    pointer = 0;
	    countDelete = 0;
	    countInsert = 0;
	    textDelete = "";
	    textInsert = "";

	    while (pointer < diffs.length) {
	      switch (diffs[pointer][0]) {
	        case DIFF_INSERT:
	          countInsert++;
	          textInsert += diffs[pointer][1];
	          pointer++;
	          break;

	        case DIFF_DELETE:
	          countDelete++;
	          textDelete += diffs[pointer][1];
	          pointer++;
	          break;

	        case DIFF_EQUAL:
	          // Upon reaching an equality, check for prior redundancies.
	          if (countDelete + countInsert > 1) {
	            if (countDelete !== 0 && countInsert !== 0) {
	              // Factor out any common prefixes.
	              commonlength = this.diffCommonPrefix(textInsert, textDelete);

	              if (commonlength !== 0) {
	                if (pointer - countDelete - countInsert > 0 && diffs[pointer - countDelete - countInsert - 1][0] === DIFF_EQUAL) {
	                  diffs[pointer - countDelete - countInsert - 1][1] += textInsert.substring(0, commonlength);
	                } else {
	                  diffs.splice(0, 0, [DIFF_EQUAL, textInsert.substring(0, commonlength)]);
	                  pointer++;
	                }

	                textInsert = textInsert.substring(commonlength);
	                textDelete = textDelete.substring(commonlength);
	              } // Factor out any common suffixies.


	              commonlength = this.diffCommonSuffix(textInsert, textDelete);

	              if (commonlength !== 0) {
	                diffs[pointer][1] = textInsert.substring(textInsert.length - commonlength) + diffs[pointer][1];
	                textInsert = textInsert.substring(0, textInsert.length - commonlength);
	                textDelete = textDelete.substring(0, textDelete.length - commonlength);
	              }
	            } // Delete the offending records and add the merged ones.


	            if (countDelete === 0) {
	              diffs.splice(pointer - countInsert, countDelete + countInsert, [DIFF_INSERT, textInsert]);
	            } else if (countInsert === 0) {
	              diffs.splice(pointer - countDelete, countDelete + countInsert, [DIFF_DELETE, textDelete]);
	            } else {
	              diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert, [DIFF_DELETE, textDelete], [DIFF_INSERT, textInsert]);
	            }

	            pointer = pointer - countDelete - countInsert + (countDelete ? 1 : 0) + (countInsert ? 1 : 0) + 1;
	          } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
	            // Merge this equality with the previous one.
	            diffs[pointer - 1][1] += diffs[pointer][1];
	            diffs.splice(pointer, 1);
	          } else {
	            pointer++;
	          }

	          countInsert = 0;
	          countDelete = 0;
	          textDelete = "";
	          textInsert = "";
	          break;
	      }
	    }

	    if (diffs[diffs.length - 1][1] === "") {
	      diffs.pop(); // Remove the dummy entry at the end.
	    } // Second pass: look for single edits surrounded on both sides by equalities
	    // which can be shifted sideways to eliminate an equality.
	    // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC


	    changes = false;
	    pointer = 1; // Intentionally ignore the first and last element (don't need checking).

	    while (pointer < diffs.length - 1) {
	      if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
	        diffPointer = diffs[pointer][1];
	        position = diffPointer.substring(diffPointer.length - diffs[pointer - 1][1].length); // This is a single edit surrounded by equalities.

	        if (position === diffs[pointer - 1][1]) {
	          // Shift the edit over the previous equality.
	          diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
	          diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
	          diffs.splice(pointer - 1, 1);
	          changes = true;
	        } else if (diffPointer.substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {
	          // Shift the edit over the next equality.
	          diffs[pointer - 1][1] += diffs[pointer + 1][1];
	          diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
	          diffs.splice(pointer + 1, 1);
	          changes = true;
	        }
	      }

	      pointer++;
	    } // If shifts were made, the diff needs reordering and another shift sweep.


	    if (changes) {
	      this.diffCleanupMerge(diffs);
	    }
	  };

	  return function (o, n) {
	    var diff, output, text;
	    diff = new DiffMatchPatch();
	    output = diff.DiffMain(o, n);
	    diff.diffCleanupEfficiency(output);
	    text = diff.diffPrettyHtml(output);
	    return text;
	  };
	}();

}((function() { return this; }())));

QUnit.notifications = function( options ) {
  "use strict";

  options         = options         || {};
  options.icons   = options.icons   || {};
  options.timeout = options.timeout || 4000;
  options.titles  = options.titles  || { passed: "Passed!", failed: "Failed!" };
  options.bodies  = options.bodies  || {
    passed: "{{passed}} of {{total}} passed",
    failed: "{{passed}} passed. {{failed}} failed."
  };

  var renderBody = function( body, details ) {
    [ "passed", "failed", "total", "runtime" ].forEach( function( type ) {
      body = body.replace( "{{" + type + "}}", details[ type ] );
    } );

    return body;
  };

  function generateQueryString( params ) {
    var key,
      querystring = "?";

    params = QUnit.extend( QUnit.extend( {}, QUnit.urlParams ), params );

    for ( key in params ) {
      if ( params.hasOwnProperty( key ) ) {
        if ( params[ key ] === undefined ) {
          continue;
        }
        querystring += encodeURIComponent( key );
        if ( params[ key ] !== true ) {
          querystring += "=" + encodeURIComponent( params[ key ] );
        }
        querystring += "&";
      }
    }
    return location.protocol + "//" + location.host +
      location.pathname + querystring.slice( 0, -1 );
  }

  if ( window.Notification ) {
    QUnit.done( function( details ) {
      var title,
          _options = {},
          notification;

      if ( window.Notification && QUnit.urlParams.notifications ) {
        if ( details.failed === 0 ) {
          title = options.titles.passed;
          _options.body = renderBody( options.bodies.passed, details );

          if ( options.icons.passed ) {
            _options.icon = options.icons.passed;
          }
        } else {
          title = options.titles.failed;
          _options.body = renderBody( options.bodies.failed, details );

          if ( options.icons.failed ) {
            _options.icon = options.icons.failed;
          }
        }

        notification = new window.Notification( title, _options );

        setTimeout( function() {
          notification.close();
        }, options.timeout );
      }
    } );

    QUnit.begin( function() {
      var toolbar      = document.getElementById( "qunit-testrunner-toolbar" );
      if ( !toolbar ) { return; }

      var notification = document.createElement( "input" ),
          label        = document.createElement( "label" ),
          disableCheckbox = function() {
            notification.checked = false;
            notification.disabled = true;
            label.style.opacity = 0.5;
            label.title = notification.title = "Note: Notifications have been " +
              "disabled in this browser.";
          };

      notification.type = "checkbox";
      notification.id   = "qunit-notifications";

      label.innerHTML = "Notifications";
      label.for = "qunit-notifications";
      label.title = "Show notifications.";
      if ( window.Notification.permission === "denied" ) {
        disableCheckbox();
      } else if ( QUnit.urlParams.notifications ) {
        notification.checked = true;
      }

      notification.addEventListener( "click", function( event ) {
        if ( event.target.checked ) {
          if ( window.Notification.permission === "granted" ) {
            window.location = generateQueryString( { notifications: true } );
          } else if ( window.Notification.permission === "denied" ) {
            disableCheckbox();
          } else {
            window.Notification.requestPermission( function( permission ) {
              if ( permission === "denied" ) {
                disableCheckbox();
              } else {
                window.location = generateQueryString( { notifications: true } );
              }
            } );
          }
        } else {
          window.location = generateQueryString( { notifications: undefined } );
        }
      }, false );

      toolbar.appendChild( notification );
      toolbar.appendChild( label );
   } );
  }
};

/* globals jQuery, QUnit */

(function() {
  QUnit.config.urlConfig.push({ id: 'nocontainer', label: 'Hide container'});
  QUnit.config.urlConfig.push({ id: 'nolint', label: 'Disable Linting'});
  QUnit.config.urlConfig.push({ id: 'dockcontainer', label: 'Dock container'});
  QUnit.config.urlConfig.push({ id: 'devmode', label: 'Development mode' });

  QUnit.config.testTimeout = QUnit.urlParams.devmode ? null : 60000; //Default Test Timeout 60 Seconds

  if (QUnit.notifications) {
    QUnit.notifications({
      icons: {
        passed: '/assets/passed.png',
        failed: '/assets/failed.png'
      }
    });
  }

  function ready(fn) {
    if (typeof jQuery === 'function') {
      jQuery(document).ready(fn);
      return;
    }

    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var testContainer = document.getElementById('ember-testing-container');
    if (!testContainer) { return; }

    var params = QUnit.urlParams;

    var containerVisibility = params.nocontainer ? 'hidden' : 'visible';
    var containerPosition = (params.dockcontainer || params.devmode) ? 'absolute' : 'relative';

    if (params.devmode) {
      testContainer.className = ' full-screen';
    }

    testContainer.style.visibility = containerVisibility;
    testContainer.style.position = containerPosition;
  });
})();

/* globals jQuery, QUnit, require, requirejs */

(function() {
  function ready(fn) {
    if (typeof jQuery === 'function') {
      jQuery(document).ready(fn);
      return;
    }

    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
  
  var autostart = QUnit.config.autostart !== false;
  QUnit.config.autostart = false;

  ready(function() {
    var QUnitAdapter = require('ember-qunit').QUnitAdapter;
    Ember.Test.adapter = QUnitAdapter.create();

    var testLoaderModulePath = 'ember-cli-test-loader/test-support/index';

    if (!requirejs.entries[testLoaderModulePath]) {
      testLoaderModulePath = 'ember-cli/test-loader';
    }

    var TestLoaderModule = require(testLoaderModulePath);
    var TestLoader = TestLoaderModule['default'];
    var addModuleExcludeMatcher = TestLoaderModule['addModuleExcludeMatcher'];
    var addModuleIncludeMatcher = TestLoaderModule['addModuleIncludeMatcher'];

    function excludeModule(moduleName) {
      return QUnit.urlParams.nolint &&
        moduleName.match(/\.(jshint|lint-test)$/);
    }

    function includeModule(moduleName) {
      return moduleName.match(/\.jshint$/);
    }

    if (addModuleExcludeMatcher && addModuleIncludeMatcher) {
      addModuleExcludeMatcher(excludeModule);
      addModuleIncludeMatcher(includeModule);
    } else {
      TestLoader.prototype.shouldLoadModule = function shouldLoadModule(moduleName) {
        return (moduleName.match(/[-_]test$/) || includeModule(moduleName)) && !excludeModule(moduleName);
      };
    }

    var moduleLoadFailures = [];

    TestLoader.prototype.moduleLoadFailure = function(moduleName, error) {
      moduleLoadFailures.push(error);

      QUnit.module('TestLoader Failures');
      QUnit.test(moduleName + ': could not be loaded', function() {
        throw error;
      });
    };

    QUnit.done(function() {
      if (moduleLoadFailures.length) {
        throw new Error('\n' + moduleLoadFailures.join('\n'));
      }
    });

    setTimeout(function() {
      TestLoader.load();

      if (autostart) {
        QUnit.start();
      }
    }, 250);
  });

})();

define('ember-cli-test-loader/test-support/index', ['exports'], function (exports) {
  /* globals requirejs, require */
  "use strict";

  exports.addModuleIncludeMatcher = addModuleIncludeMatcher;
  exports.addModuleExcludeMatcher = addModuleExcludeMatcher;
  exports['default'] = TestLoader;
  var moduleIncludeMatchers = [];
  var moduleExcludeMatchers = [];

  function addModuleIncludeMatcher(fn) {
    moduleIncludeMatchers.push(fn);
  }

  ;

  function addModuleExcludeMatcher(fn) {
    moduleExcludeMatchers.push(fn);
  }

  ;

  function checkMatchers(matchers, moduleName) {
    var matcher;

    for (var i = 0, l = matchers.length; i < l; i++) {
      matcher = matchers[i];

      if (matcher(moduleName)) {
        return true;
      }
    }

    return false;
  }
  function TestLoader() {
    this._didLogMissingUnsee = false;
  }

  ;

  TestLoader.prototype = {
    shouldLoadModule: function shouldLoadModule(moduleName) {
      return moduleName.match(/[-_]test$/);
    },

    listModules: function listModules() {
      return Object.keys(requirejs.entries);
    },

    listTestModules: function listTestModules() {
      var moduleNames = this.listModules();
      var testModules = [];
      var moduleName;

      for (var i = 0; i < moduleNames.length; i++) {
        moduleName = moduleNames[i];

        if (checkMatchers(moduleExcludeMatchers, moduleName)) {
          continue;
        }

        if (checkMatchers(moduleIncludeMatchers, moduleName) || this.shouldLoadModule(moduleName)) {
          testModules.push(moduleName);
        }
      }

      return testModules;
    },

    loadModules: function loadModules() {
      var testModules = this.listTestModules();
      var testModule;

      for (var i = 0; i < testModules.length; i++) {
        testModule = testModules[i];
        this.require(testModule);
        this.unsee(testModule);
      }
    }
  };

  TestLoader.prototype.require = function (moduleName) {
    try {
      require(moduleName);
    } catch (e) {
      this.moduleLoadFailure(moduleName, e);
    }
  };

  TestLoader.prototype.unsee = function (moduleName) {
    if (typeof require.unsee === 'function') {
      require.unsee(moduleName);
    } else if (!this._didLogMissingUnsee) {
      this._didLogMissingUnsee = true;
      if (typeof console !== 'undefined') {
        console.warn('unable to require.unsee, please upgrade loader.js to >= v3.3.0');
      }
    }
  };

  TestLoader.prototype.moduleLoadFailure = function (moduleName, error) {
    console.error('Error loading: ' + moduleName, error.stack);
  };

  TestLoader.load = function () {
    new TestLoader().loadModules();
  };
});
define('ember-qunit', ['exports', 'ember-qunit/module-for', 'ember-qunit/module-for-component', 'ember-qunit/module-for-model', 'ember-qunit/adapter', 'ember-test-helpers', 'qunit'], function (exports, _emberQunitModuleFor, _emberQunitModuleForComponent, _emberQunitModuleForModel, _emberQunitAdapter, _emberTestHelpers, _qunit) {
  'use strict';

  Object.defineProperty(exports, 'module', {
    enumerable: true,
    get: function get() {
      return _qunit.module;
    }
  });
  Object.defineProperty(exports, 'test', {
    enumerable: true,
    get: function get() {
      return _qunit.test;
    }
  });
  Object.defineProperty(exports, 'skip', {
    enumerable: true,
    get: function get() {
      return _qunit.skip;
    }
  });
  Object.defineProperty(exports, 'only', {
    enumerable: true,
    get: function get() {
      return _qunit.only;
    }
  });
  Object.defineProperty(exports, 'todo', {
    enumerable: true,
    get: function get() {
      return _qunit.todo;
    }
  });
  exports.moduleFor = _emberQunitModuleFor['default'];
  exports.moduleForComponent = _emberQunitModuleForComponent['default'];
  exports.moduleForModel = _emberQunitModuleForModel['default'];
  exports.setResolver = _emberTestHelpers.setResolver;
  exports.QUnitAdapter = _emberQunitAdapter['default'];
});
define('ember-qunit/adapter', ['exports', 'ember', 'qunit'], function (exports, _ember, _qunit) {
  'use strict';

  function unhandledRejectionAssertion(current, error) {
    var message = undefined,
        source = undefined;

    if (typeof error === 'object' && error !== null) {
      message = error.message;
      source = error.stack;
    } else if (typeof error === "string") {
      message = error;
      source = "unknown source";
    } else {
      message = "unhandledRejection occured, but it had no message";
      source = "unknown source";
    }

    current.pushResult({
      result: false,
      actual: false,
      expected: true,
      message: message,
      source: source
    });
  }

  exports['default'] = _ember['default'].Test.Adapter.extend({
    init: function init() {
      this.doneCallbacks = [];
    },

    asyncStart: function asyncStart() {
      this.doneCallbacks.push(_qunit['default'].config.current ? _qunit['default'].config.current.assert.async() : null);
    },

    asyncEnd: function asyncEnd() {
      var done = this.doneCallbacks.pop();
      // This can be null if asyncStart() was called outside of a test
      if (done) {
        done();
      }
    },

    exception: function exception(error) {
      unhandledRejectionAssertion(_qunit['default'].config.current, error);
    }
  });
});
define('ember-qunit/module-for-component', ['exports', 'ember-qunit/qunit-module', 'ember-test-helpers'], function (exports, _emberQunitQunitModule, _emberTestHelpers) {
  'use strict';

  exports['default'] = moduleForComponent;

  function moduleForComponent(name, description, callbacks) {
    (0, _emberQunitQunitModule.createModule)(_emberTestHelpers.TestModuleForComponent, name, description, callbacks);
  }
});
define('ember-qunit/module-for-model', ['exports', 'ember-qunit/qunit-module', 'ember-test-helpers'], function (exports, _emberQunitQunitModule, _emberTestHelpers) {
  'use strict';

  exports['default'] = moduleForModel;

  function moduleForModel(name, description, callbacks) {
    (0, _emberQunitQunitModule.createModule)(_emberTestHelpers.TestModuleForModel, name, description, callbacks);
  }
});
define('ember-qunit/module-for', ['exports', 'ember-qunit/qunit-module', 'ember-test-helpers'], function (exports, _emberQunitQunitModule, _emberTestHelpers) {
  'use strict';

  exports['default'] = moduleFor;

  function moduleFor(name, description, callbacks) {
    (0, _emberQunitQunitModule.createModule)(_emberTestHelpers.TestModule, name, description, callbacks);
  }
});
define('ember-qunit/qunit-module', ['exports', 'ember', 'qunit'], function (exports, _ember, _qunit) {
  'use strict';

  exports.createModule = createModule;

  function noop() {}

  function callbackFor(name, callbacks) {
    if (typeof callbacks !== 'object') {
      return noop;
    }
    if (!callbacks) {
      return noop;
    }

    var callback = noop;

    if (callbacks[name]) {
      callback = callbacks[name];
      delete callbacks[name];
    }

    return callback;
  }

  function createModule(Constructor, name, description, callbacks) {
    if (!callbacks && typeof description === 'object') {
      callbacks = description;
      description = name;
    }

    var _before = callbackFor('before', callbacks);
    var _beforeEach = callbackFor('beforeEach', callbacks);
    var _afterEach = callbackFor('afterEach', callbacks);
    var _after = callbackFor('after', callbacks);

    var module;
    var moduleName = typeof description === 'string' ? description : name;

    (0, _qunit.module)(moduleName, {
      before: function before() {
        // storing this in closure scope to avoid exposing these
        // private internals to the test context
        module = new Constructor(name, description, callbacks);
        return _before.apply(this, arguments);
      },

      beforeEach: function beforeEach() {
        var _module2,
            _this = this,
            _arguments = arguments;

        // provide the test context to the underlying module
        module.setContext(this);

        return (_module2 = module).setup.apply(_module2, arguments).then(function () {
          return _beforeEach.apply(_this, _arguments);
        });
      },

      afterEach: function afterEach() {
        var _arguments2 = arguments;

        var result = _afterEach.apply(this, arguments);
        return _ember['default'].RSVP.resolve(result).then(function () {
          var _module3;

          return (_module3 = module).teardown.apply(_module3, _arguments2);
        });
      },

      after: function after() {
        try {
          return _after.apply(this, arguments);
        } finally {
          _after = _afterEach = _before = _beforeEach = callbacks = module = null;
        }
      }
    });
  }
});
define('ember-test-helpers', ['exports', 'ember', 'ember-test-helpers/test-module', 'ember-test-helpers/test-module-for-acceptance', 'ember-test-helpers/test-module-for-integration', 'ember-test-helpers/test-module-for-component', 'ember-test-helpers/test-module-for-model', 'ember-test-helpers/test-context', 'ember-test-helpers/test-resolver'], function (exports, _ember, _emberTestHelpersTestModule, _emberTestHelpersTestModuleForAcceptance, _emberTestHelpersTestModuleForIntegration, _emberTestHelpersTestModuleForComponent, _emberTestHelpersTestModuleForModel, _emberTestHelpersTestContext, _emberTestHelpersTestResolver) {
  'use strict';

  _ember['default'].testing = true;

  exports.TestModule = _emberTestHelpersTestModule['default'];
  exports.TestModuleForAcceptance = _emberTestHelpersTestModuleForAcceptance['default'];
  exports.TestModuleForIntegration = _emberTestHelpersTestModuleForIntegration['default'];
  exports.TestModuleForComponent = _emberTestHelpersTestModuleForComponent['default'];
  exports.TestModuleForModel = _emberTestHelpersTestModuleForModel['default'];
  exports.getContext = _emberTestHelpersTestContext.getContext;
  exports.setContext = _emberTestHelpersTestContext.setContext;
  exports.unsetContext = _emberTestHelpersTestContext.unsetContext;
  exports.setResolver = _emberTestHelpersTestResolver.setResolver;
});
define('ember-test-helpers/-legacy-overrides', ['exports', 'ember', 'ember-test-helpers/has-ember-version'], function (exports, _ember, _emberTestHelpersHasEmberVersion) {
  'use strict';

  exports.preGlimmerSetupIntegrationForComponent = preGlimmerSetupIntegrationForComponent;

  function preGlimmerSetupIntegrationForComponent() {
    var module = this;
    var context = this.context;

    this.actionHooks = {};

    context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');
    context.actions = module.actionHooks;

    (this.registry || this.container).register('component:-test-holder', _ember['default'].Component.extend());

    context.render = function (template) {
      // in case `this.render` is called twice, make sure to teardown the first invocation
      module.teardownComponent();

      if (!template) {
        throw new Error("in a component integration test you must pass a template to `render()`");
      }
      if (_ember['default'].isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = _ember['default'].Handlebars.compile(template);
      }
      module.component = module.container.lookupFactory('component:-test-holder').create({
        layout: template
      });

      module.component.set('context', context);
      module.component.set('controller', context);

      _ember['default'].run(function () {
        module.component.appendTo('#ember-testing');
      });

      context._element = module.component.element;
    };

    context.$ = function () {
      return module.component.$.apply(module.component, arguments);
    };

    context.set = function (key, value) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].set(context, key, value);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].setProperties(context, hash);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return _ember['default'].get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return _ember['default'].getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error("integration testing template received unexpected action " + actionName);
      }
      hook.apply(module, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      module.teardownComponent();
    };
  }
});
define('ember-test-helpers/abstract-test-module', ['exports', 'ember-test-helpers/wait', 'ember-test-helpers/test-context', 'ember'], function (exports, _emberTestHelpersWait, _emberTestHelpersTestContext, _ember) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  // calling this `merge` here because we cannot
  // actually assume it is like `Object.assign`
  // with > 2 args
  var merge = _ember['default'].assign || _ember['default'].merge;

  var _default = (function () {
    function _default(name, options) {
      _classCallCheck(this, _default);

      this.context = undefined;
      this.name = name;
      this.callbacks = options || {};

      this.initSetupSteps();
      this.initTeardownSteps();
    }

    _createClass(_default, [{
      key: 'setup',
      value: function setup(assert) {
        var _this = this;

        return this.invokeSteps(this.setupSteps, this, assert).then(function () {
          _this.contextualizeCallbacks();
          return _this.invokeSteps(_this.contextualizedSetupSteps, _this.context, assert);
        });
      }
    }, {
      key: 'teardown',
      value: function teardown(assert) {
        var _this2 = this;

        return this.invokeSteps(this.contextualizedTeardownSteps, this.context, assert).then(function () {
          return _this2.invokeSteps(_this2.teardownSteps, _this2, assert);
        }).then(function () {
          _this2.cache = null;
          _this2.cachedCalls = null;
        });
      }
    }, {
      key: 'initSetupSteps',
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: 'invokeSteps',
      value: function invokeSteps(steps, context, assert) {
        steps = steps.slice();

        function nextStep() {
          var step = steps.shift();
          if (step) {
            // guard against exceptions, for example missing components referenced from needs.
            return new _ember['default'].RSVP.Promise(function (resolve) {
              resolve(step.call(context, assert));
            }).then(nextStep);
          } else {
            return _ember['default'].RSVP.resolve();
          }
        }
        return nextStep();
      }
    }, {
      key: 'contextualizeCallbacks',
      value: function contextualizeCallbacks() {}
    }, {
      key: 'initTeardownSteps',
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownTestElements);
        this.teardownSteps.push(this.teardownAJAXListeners);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: 'setupTestElements',
      value: function setupTestElements() {
        var testEl = document.querySelector('#ember-testing');
        if (!testEl) {
          var element = document.createElement('div');
          element.setAttribute('id', 'ember-testing');

          document.body.appendChild(element);
          this.fixtureResetValue = '';
        } else {
          this.fixtureResetValue = testEl.innerHTML;
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext(options) {
        var context = this.getContext();

        merge(context, {
          dispatcher: null,
          inject: {}
        });
        merge(context, options);

        this.setToString();
        (0, _emberTestHelpersTestContext.setContext)(context);
        this.context = context;
      }
    }, {
      key: 'setContext',
      value: function setContext(context) {
        this.context = context;
      }
    }, {
      key: 'getContext',
      value: function getContext() {
        if (this.context) {
          return this.context;
        }

        return this.context = (0, _emberTestHelpersTestContext.getContext)() || {};
      }
    }, {
      key: 'setToString',
      value: function setToString() {
        var _this3 = this;

        this.context.toString = function () {
          if (_this3.subjectName) {
            return 'test context for: ' + _this3.subjectName;
          }

          if (_this3.name) {
            return 'test context for: ' + _this3.name;
          }
        };
      }
    }, {
      key: 'setupAJAXListeners',
      value: function setupAJAXListeners() {
        (0, _emberTestHelpersWait._setupAJAXHooks)();
      }
    }, {
      key: 'teardownAJAXListeners',
      value: function teardownAJAXListeners() {
        (0, _emberTestHelpersWait._teardownAJAXHooks)();
      }
    }, {
      key: 'teardownTestElements',
      value: function teardownTestElements() {
        document.getElementById('ember-testing').innerHTML = this.fixtureResetValue;

        // Ember 2.0.0 removed Ember.View as public API, so only do this when
        // Ember.View is present
        if (_ember['default'].View && _ember['default'].View.views) {
          _ember['default'].View.views = {};
        }
      }
    }, {
      key: 'teardownContext',
      value: function teardownContext() {
        var context = this.context;
        this.context = undefined;
        (0, _emberTestHelpersTestContext.unsetContext)();

        if (context && context.dispatcher && !context.dispatcher.isDestroyed) {
          _ember['default'].run(function () {
            context.dispatcher.destroy();
          });
        }
      }
    }]);

    return _default;
  })();

  exports['default'] = _default;
});
define('ember-test-helpers/build-registry', ['exports', 'require', 'ember'], function (exports, _require, _ember) {
  /* globals global, self, requirejs */

  'use strict';

  function exposeRegistryMethodsWithoutDeprecations(container) {
    var methods = ['register', 'unregister', 'resolve', 'normalize', 'typeInjection', 'injection', 'factoryInjection', 'factoryTypeInjection', 'has', 'options', 'optionsForType'];

    function exposeRegistryMethod(container, method) {
      if (method in container) {
        container[method] = function () {
          return container._registry[method].apply(container._registry, arguments);
        };
      }
    }

    for (var i = 0, l = methods.length; i < l; i++) {
      exposeRegistryMethod(container, methods[i]);
    }
  }

  var Owner = (function () {
    if (_ember['default']._RegistryProxyMixin && _ember['default']._ContainerProxyMixin) {
      return _ember['default'].Object.extend(_ember['default']._RegistryProxyMixin, _ember['default']._ContainerProxyMixin);
    }

    return _ember['default'].Object.extend();
  })();

  exports['default'] = function (resolver) {
    var fallbackRegistry, registry, container;
    var namespace = _ember['default'].Object.create({
      Resolver: { create: function create() {
          return resolver;
        } }
    });

    function register(name, factory) {
      var thingToRegisterWith = registry || container;

      if (!(container.factoryFor ? container.factoryFor(name) : container.lookupFactory(name))) {
        thingToRegisterWith.register(name, factory);
      }
    }

    if (_ember['default'].Application.buildRegistry) {
      fallbackRegistry = _ember['default'].Application.buildRegistry(namespace);
      fallbackRegistry.register('component-lookup:main', _ember['default'].ComponentLookup);

      registry = new _ember['default'].Registry({
        fallback: fallbackRegistry
      });

      if (_ember['default'].ApplicationInstance && _ember['default'].ApplicationInstance.setupRegistry) {
        _ember['default'].ApplicationInstance.setupRegistry(registry);
      }

      // these properties are set on the fallback registry by `buildRegistry`
      // and on the primary registry within the ApplicationInstance constructor
      // but we need to manually recreate them since ApplicationInstance's are not
      // exposed externally
      registry.normalizeFullName = fallbackRegistry.normalizeFullName;
      registry.makeToString = fallbackRegistry.makeToString;
      registry.describe = fallbackRegistry.describe;

      var owner = Owner.create({
        __registry__: registry,
        __container__: null
      });

      container = registry.container({ owner: owner });
      owner.__container__ = container;

      exposeRegistryMethodsWithoutDeprecations(container);
    } else {
      container = _ember['default'].Application.buildContainer(namespace);
      container.register('component-lookup:main', _ember['default'].ComponentLookup);
    }

    // Ember 1.10.0 did not properly add `view:toplevel` or `view:default`
    // to the registry in Ember.Application.buildRegistry :(
    //
    // Ember 2.0.0 removed Ember.View as public API, so only do this when
    // Ember.View is present
    if (_ember['default'].View) {
      register('view:toplevel', _ember['default'].View.extend());
    }

    // Ember 2.0.0 removed Ember._MetamorphView from the Ember global, so only
    // do this when present
    if (_ember['default']._MetamorphView) {
      register('view:default', _ember['default']._MetamorphView);
    }

    var globalContext = typeof global === 'object' && global || self;
    if (requirejs.entries['ember-data/setup-container']) {
      // ember-data is a proper ember-cli addon since 2.3; if no 'import
      // 'ember-data'' is present somewhere in the tests, there is also no `DS`
      // available on the globalContext and hence ember-data wouldn't be setup
      // correctly for the tests; that's why we import and call setupContainer
      // here; also see https://github.com/emberjs/data/issues/4071 for context
      var setupContainer = (0, _require['default'])('ember-data/setup-container')['default'];
      setupContainer(registry || container);
    } else if (globalContext.DS) {
      var DS = globalContext.DS;
      if (DS._setupContainer) {
        DS._setupContainer(registry || container);
      } else {
        register('transform:boolean', DS.BooleanTransform);
        register('transform:date', DS.DateTransform);
        register('transform:number', DS.NumberTransform);
        register('transform:string', DS.StringTransform);
        register('serializer:-default', DS.JSONSerializer);
        register('serializer:-rest', DS.RESTSerializer);
        register('adapter:-rest', DS.RESTAdapter);
      }
    }

    return {
      registry: registry,
      container: container
    };
  };
});
define('ember-test-helpers/has-ember-version', ['exports', 'ember'], function (exports, _ember) {
  'use strict';

  exports['default'] = hasEmberVersion;

  function hasEmberVersion(major, minor) {
    var numbers = _ember['default'].VERSION.split('-')[0].split('.');
    var actualMajor = parseInt(numbers[0], 10);
    var actualMinor = parseInt(numbers[1], 10);
    return actualMajor > major || actualMajor === major && actualMinor >= minor;
  }
});
define("ember-test-helpers/test-context", ["exports"], function (exports) {
  "use strict";

  exports.setContext = setContext;
  exports.getContext = getContext;
  exports.unsetContext = unsetContext;
  var __test_context__;

  function setContext(context) {
    __test_context__ = context;
  }

  function getContext() {
    return __test_context__;
  }

  function unsetContext() {
    __test_context__ = undefined;
  }
});
define('ember-test-helpers/test-module-for-acceptance', ['exports', 'ember-test-helpers/abstract-test-module', 'ember', 'ember-test-helpers/test-context'], function (exports, _emberTestHelpersAbstractTestModule, _ember, _emberTestHelpersTestContext) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _default = (function (_AbstractTestModule) {
    _inherits(_default, _AbstractTestModule);

    function _default() {
      _classCallCheck(this, _default);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(_default, [{
      key: 'setupContext',
      value: function setupContext() {
        _get(Object.getPrototypeOf(_default.prototype), 'setupContext', this).call(this, { application: this.createApplication() });
      }
    }, {
      key: 'teardownContext',
      value: function teardownContext() {
        _ember['default'].run(function () {
          (0, _emberTestHelpersTestContext.getContext)().application.destroy();
        });

        _get(Object.getPrototypeOf(_default.prototype), 'teardownContext', this).call(this);
      }
    }, {
      key: 'createApplication',
      value: function createApplication() {
        var _callbacks = this.callbacks;
        var Application = _callbacks.Application;
        var config = _callbacks.config;

        var application = undefined;

        _ember['default'].run(function () {
          application = Application.create(config);
          application.setupForTesting();
          application.injectTestHelpers();
        });

        return application;
      }
    }]);

    return _default;
  })(_emberTestHelpersAbstractTestModule['default']);

  exports['default'] = _default;
});
define('ember-test-helpers/test-module-for-component', ['exports', 'ember-test-helpers/test-module', 'ember', 'ember-test-helpers/has-ember-version', 'ember-test-helpers/-legacy-overrides'], function (exports, _emberTestHelpersTestModule, _ember, _emberTestHelpersHasEmberVersion, _emberTestHelpersLegacyOverrides) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  exports.setupComponentIntegrationTest = _setupComponentIntegrationTest;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var ACTION_KEY = undefined;
  if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
    ACTION_KEY = 'actions';
  } else {
    ACTION_KEY = '_actions';
  }

  var isPreGlimmer = !(0, _emberTestHelpersHasEmberVersion['default'])(1, 13);

  var getOwner = _ember['default'].getOwner;

  var _default = (function (_TestModule) {
    _inherits(_default, _TestModule);

    function _default(componentName, description, callbacks) {
      _classCallCheck(this, _default);

      // Allow `description` to be omitted
      if (!callbacks && typeof description === 'object') {
        callbacks = description;
        description = null;
      } else if (!callbacks) {
        callbacks = {};
      }

      var integrationOption = callbacks.integration;
      var hasNeeds = Array.isArray(callbacks.needs);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, 'component:' + componentName, description, callbacks);

      this.componentName = componentName;

      if (hasNeeds || callbacks.unit || integrationOption === false) {
        this.isUnitTest = true;
      } else if (integrationOption) {
        this.isUnitTest = false;
      } else {
        _ember['default'].deprecate("the component:" + componentName + " test module is implicitly running in unit test mode, " + "which will change to integration test mode by default in an upcoming version of " + "ember-test-helpers. Add `unit: true` or a `needs:[]` list to explicitly opt in to unit " + "test mode.", false, { id: 'ember-test-helpers.test-module-for-component.test-type', until: '0.6.0' });
        this.isUnitTest = true;
      }

      if (!this.isUnitTest && !this.isLegacy) {
        callbacks.integration = true;
      }

      if (this.isUnitTest || this.isLegacy) {
        this.setupSteps.push(this.setupComponentUnitTest);
      } else {
        this.callbacks.subject = function () {
          throw new Error("component integration tests do not support `subject()`. Instead, render the component as if it were HTML: `this.render('<my-component foo=true>');`. For more information, read: http://guides.emberjs.com/v2.2.0/testing/testing-components/");
        };
        this.setupSteps.push(this.setupComponentIntegrationTest);
        this.teardownSteps.unshift(this.teardownComponent);
      }

      if (_ember['default'].View && _ember['default'].View.views) {
        this.setupSteps.push(this._aliasViewRegistry);
        this.teardownSteps.unshift(this._resetViewRegistry);
      }
    }

    _createClass(_default, [{
      key: 'initIntegration',
      value: function initIntegration(options) {
        this.isLegacy = options.integration === 'legacy';
        this.isIntegration = options.integration !== 'legacy';
      }
    }, {
      key: '_aliasViewRegistry',
      value: function _aliasViewRegistry() {
        this._originalGlobalViewRegistry = _ember['default'].View.views;
        var viewRegistry = this.container.lookup('-view-registry:main');

        if (viewRegistry) {
          _ember['default'].View.views = viewRegistry;
        }
      }
    }, {
      key: '_resetViewRegistry',
      value: function _resetViewRegistry() {
        _ember['default'].View.views = this._originalGlobalViewRegistry;
      }
    }, {
      key: 'setupComponentUnitTest',
      value: function setupComponentUnitTest() {
        var _this = this;
        var resolver = this.resolver;
        var context = this.context;

        var layoutName = 'template:components/' + this.componentName;

        var layout = resolver.resolve(layoutName);

        var thingToRegisterWith = this.registry || this.container;
        if (layout) {
          thingToRegisterWith.register(layoutName, layout);
          thingToRegisterWith.injection(this.subjectName, 'layout', layoutName);
        }

        context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
        context.dispatcher.setup({}, '#ember-testing');

        context._element = null;

        this.callbacks.render = function () {
          var subject;

          _ember['default'].run(function () {
            subject = context.subject();
            subject.appendTo('#ember-testing');
          });

          context._element = subject.element;

          _this.teardownSteps.unshift(function () {
            _ember['default'].run(function () {
              _ember['default'].tryInvoke(subject, 'destroy');
            });
          });
        };

        this.callbacks.append = function () {
          _ember['default'].deprecate('this.append() is deprecated. Please use this.render() or this.$() instead.', false, { id: 'ember-test-helpers.test-module-for-component.append', until: '0.6.0' });
          return context.$();
        };

        context.$ = function () {
          this.render();
          var subject = this.subject();

          return subject.$.apply(subject, arguments);
        };
      }
    }, {
      key: 'setupComponentIntegrationTest',
      value: function setupComponentIntegrationTest() {
        if (isPreGlimmer) {
          return _emberTestHelpersLegacyOverrides.preGlimmerSetupIntegrationForComponent.apply(this, arguments);
        } else {
          return _setupComponentIntegrationTest.apply(this, arguments);
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext() {
        _get(Object.getPrototypeOf(_default.prototype), 'setupContext', this).call(this);

        // only setup the injection if we are running against a version
        // of Ember that has `-view-registry:main` (Ember >= 1.12)
        if (this.container.factoryFor ? this.container.factoryFor('-view-registry:main') : this.container.lookupFactory('-view-registry:main')) {
          (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
        }

        if (!this.isUnitTest && !this.isLegacy) {
          this.context.factory = function () {};
        }
      }
    }, {
      key: 'teardownComponent',
      value: function teardownComponent() {
        var component = this.component;
        if (component) {
          _ember['default'].run(component, 'destroy');
          this.component = null;
        }
      }
    }]);

    return _default;
  })(_emberTestHelpersTestModule['default']);

  exports['default'] = _default;

  function _setupComponentIntegrationTest() {
    var module = this;
    var context = this.context;

    this.actionHooks = context[ACTION_KEY] = {};
    context.dispatcher = this.container.lookup('event_dispatcher:main') || _ember['default'].EventDispatcher.create();
    context.dispatcher.setup({}, '#ember-testing');

    var hasRendered = false;
    var OutletView = module.container.factoryFor ? module.container.factoryFor('view:-outlet') : module.container.lookupFactory('view:-outlet');
    var OutletTemplate = module.container.lookup('template:-outlet');
    var toplevelView = module.component = OutletView.create();
    var hasOutletTemplate = !!OutletTemplate;
    var outletState = {
      render: {
        owner: getOwner ? getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'application',
        controller: module.context,
        ViewClass: undefined,
        template: OutletTemplate
      },

      outlets: {}
    };

    var element = document.getElementById('ember-testing');
    var templateId = 0;

    if (hasOutletTemplate) {
      _ember['default'].run(function () {
        toplevelView.setOutletState(outletState);
      });
    }

    context.render = function (template) {
      if (!template) {
        throw new Error("in a component integration test you must pass a template to `render()`");
      }
      if (_ember['default'].isArray(template)) {
        template = template.join('');
      }
      if (typeof template === 'string') {
        template = _ember['default'].Handlebars.compile(template);
      }

      var templateFullName = 'template:-undertest-' + ++templateId;
      this.registry.register(templateFullName, template);
      var stateToRender = {
        owner: getOwner ? getOwner(module.container) : undefined,
        into: undefined,
        outlet: 'main',
        name: 'index',
        controller: module.context,
        ViewClass: undefined,
        template: module.container.lookup(templateFullName),
        outlets: {}
      };

      if (hasOutletTemplate) {
        stateToRender.name = 'index';
        outletState.outlets.main = { render: stateToRender, outlets: {} };
      } else {
        stateToRender.name = 'application';
        outletState = { render: stateToRender, outlets: {} };
      }

      _ember['default'].run(function () {
        toplevelView.setOutletState(outletState);
      });

      if (!hasRendered) {
        _ember['default'].run(module.component, 'appendTo', '#ember-testing');
        hasRendered = true;
      }

      // ensure the element is based on the wrapping toplevel view
      // Ember still wraps the main application template with a
      // normal tagged view
      context._element = element = document.querySelector('#ember-testing > .ember-view');
    };

    context.$ = function (selector) {
      // emulates Ember internal behavor of `this.$` in a component
      // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
      return selector ? _ember['default'].$(selector, element) : _ember['default'].$(element);
    };

    context.set = function (key, value) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].set(context, key, value);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.setProperties = function (hash) {
      var ret = _ember['default'].run(function () {
        return _ember['default'].setProperties(context, hash);
      });

      if ((0, _emberTestHelpersHasEmberVersion['default'])(2, 0)) {
        return ret;
      }
    };

    context.get = function (key) {
      return _ember['default'].get(context, key);
    };

    context.getProperties = function () {
      var args = Array.prototype.slice.call(arguments);
      return _ember['default'].getProperties(context, args);
    };

    context.on = function (actionName, handler) {
      module.actionHooks[actionName] = handler;
    };

    context.send = function (actionName) {
      var hook = module.actionHooks[actionName];
      if (!hook) {
        throw new Error("integration testing template received unexpected action " + actionName);
      }
      hook.apply(module.context, Array.prototype.slice.call(arguments, 1));
    };

    context.clearRender = function () {
      _ember['default'].run(function () {
        toplevelView.setOutletState({
          render: {
            owner: module.container,
            into: undefined,
            outlet: 'main',
            name: 'application',
            controller: module.context,
            ViewClass: undefined,
            template: undefined
          },
          outlets: {}
        });
      });
    };
  }
});
define('ember-test-helpers/test-module-for-integration', ['exports', 'ember', 'ember-test-helpers/abstract-test-module', 'ember-test-helpers/test-resolver', 'ember-test-helpers/build-registry', 'ember-test-helpers/has-ember-version', 'ember-test-helpers/-legacy-overrides', 'ember-test-helpers/test-module-for-component'], function (exports, _ember, _emberTestHelpersAbstractTestModule, _emberTestHelpersTestResolver, _emberTestHelpersBuildRegistry, _emberTestHelpersHasEmberVersion, _emberTestHelpersLegacyOverrides, _emberTestHelpersTestModuleForComponent) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var isPreGlimmer = !(0, _emberTestHelpersHasEmberVersion['default'])(1, 13);

  var _default = (function (_AbstractTestModule) {
    _inherits(_default, _AbstractTestModule);

    function _default() {
      _classCallCheck(this, _default);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).apply(this, arguments);
      this.resolver = this.callbacks.resolver || (0, _emberTestHelpersTestResolver.getResolver)();
    }

    _createClass(_default, [{
      key: 'initSetupSteps',
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContainer);
        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);
        this.setupSteps.push(this.setupComponentIntegrationTest);

        if (_ember['default'].View && _ember['default'].View.views) {
          this.setupSteps.push(this._aliasViewRegistry);
        }

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: 'initTeardownSteps',
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownContainer);
        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownAJAXListeners);
        this.teardownSteps.push(this.teardownComponent);

        if (_ember['default'].View && _ember['default'].View.views) {
          this.teardownSteps.push(this._resetViewRegistry);
        }

        this.teardownSteps.push(this.teardownTestElements);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: 'setupContainer',
      value: function setupContainer() {
        var resolver = this.resolver;
        var items = (0, _emberTestHelpersBuildRegistry['default'])(resolver);

        this.container = items.container;
        this.registry = items.registry;

        if ((0, _emberTestHelpersHasEmberVersion['default'])(1, 13)) {
          var thingToRegisterWith = this.registry || this.container;
          var router = resolver.resolve('router:main');
          router = router || _ember['default'].Router.extend();
          thingToRegisterWith.register('router:main', router);
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext() {
        var subjectName = this.subjectName;
        var container = this.container;

        var factory = function factory() {
          return container.factoryFor ? container.factoryFor(subjectName) : container.lookupFactory(subjectName);
        };

        _get(Object.getPrototypeOf(_default.prototype), 'setupContext', this).call(this, {
          container: this.container,
          registry: this.registry,
          factory: factory,
          register: function register() {
            var target = this.registry || this.container;
            return target.register.apply(target, arguments);
          }
        });

        var context = this.context;

        if (_ember['default'].setOwner) {
          _ember['default'].setOwner(context, this.container.owner);
        }

        if (_ember['default'].inject) {
          var keys = (Object.keys || _ember['default'].keys)(_ember['default'].inject);
          keys.forEach(function (typeName) {
            context.inject[typeName] = function (name, opts) {
              var alias = opts && opts.as || name;
              _ember['default'].run(function () {
                _ember['default'].set(context, alias, context.container.lookup(typeName + ':' + name));
              });
            };
          });
        }

        // only setup the injection if we are running against a version
        // of Ember that has `-view-registry:main` (Ember >= 1.12)
        if (this.container.factoryFor ? this.container.factoryFor('-view-registry:main') : this.container.lookupFactory('-view-registry:main')) {
          (this.registry || this.container).injection('component', '_viewRegistry', '-view-registry:main');
        }
      }
    }, {
      key: 'setupComponentIntegrationTest',
      value: function setupComponentIntegrationTest() {
        if (isPreGlimmer) {
          return _emberTestHelpersLegacyOverrides.preGlimmerSetupIntegrationForComponent.apply(this, arguments);
        } else {
          return _emberTestHelpersTestModuleForComponent.setupComponentIntegrationTest.apply(this, arguments);
        }
      }
    }, {
      key: 'teardownComponent',
      value: function teardownComponent() {
        var component = this.component;
        if (component) {
          _ember['default'].run(function () {
            component.destroy();
          });
        }
      }
    }, {
      key: 'teardownContainer',
      value: function teardownContainer() {
        var container = this.container;
        _ember['default'].run(function () {
          container.destroy();
        });
      }

      // allow arbitrary named factories, like rspec let
    }, {
      key: 'contextualizeCallbacks',
      value: function contextualizeCallbacks() {
        var callbacks = this.callbacks;
        var context = this.context;

        this.cache = this.cache || {};
        this.cachedCalls = this.cachedCalls || {};

        var keys = (Object.keys || _ember['default'].keys)(callbacks);
        var keysLength = keys.length;

        if (keysLength) {
          for (var i = 0; i < keysLength; i++) {
            this._contextualizeCallback(context, keys[i], context);
          }
        }
      }
    }, {
      key: '_contextualizeCallback',
      value: function _contextualizeCallback(context, key, callbackContext) {
        var _this = this;
        var callbacks = this.callbacks;
        var factory = context.factory;

        context[key] = function (options) {
          if (_this.cachedCalls[key]) {
            return _this.cache[key];
          }

          var result = callbacks[key].call(callbackContext, options, factory());

          _this.cache[key] = result;
          _this.cachedCalls[key] = true;

          return result;
        };
      }
    }, {
      key: '_aliasViewRegistry',
      value: function _aliasViewRegistry() {
        this._originalGlobalViewRegistry = _ember['default'].View.views;
        var viewRegistry = this.container.lookup('-view-registry:main');

        if (viewRegistry) {
          _ember['default'].View.views = viewRegistry;
        }
      }
    }, {
      key: '_resetViewRegistry',
      value: function _resetViewRegistry() {
        _ember['default'].View.views = this._originalGlobalViewRegistry;
      }
    }]);

    return _default;
  })(_emberTestHelpersAbstractTestModule['default']);

  exports['default'] = _default;
});
define('ember-test-helpers/test-module-for-model', ['exports', 'require', 'ember-test-helpers/test-module', 'ember'], function (exports, _require, _emberTestHelpersTestModule, _ember) {
  /* global DS, requirejs */ // added here to prevent an import from erroring when ED is not present

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _default = (function (_TestModule) {
    _inherits(_default, _TestModule);

    function _default(modelName, description, callbacks) {
      _classCallCheck(this, _default);

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, 'model:' + modelName, description, callbacks);

      this.modelName = modelName;

      this.setupSteps.push(this.setupModel);
    }

    _createClass(_default, [{
      key: 'setupModel',
      value: function setupModel() {
        var container = this.container;
        var defaultSubject = this.defaultSubject;
        var callbacks = this.callbacks;
        var modelName = this.modelName;

        var adapterFactory = container.factoryFor ? container.factoryFor('adapter:application') : container.lookupFactory('adapter:application');
        if (!adapterFactory) {
          if (requirejs.entries['ember-data/adapters/json-api']) {
            adapterFactory = (0, _require['default'])('ember-data/adapters/json-api')['default'];
          }

          // when ember-data/adapters/json-api is provided via ember-cli shims
          // using Ember Data 1.x the actual JSONAPIAdapter isn't found, but the
          // above require statement returns a bizzaro object with only a `default`
          // property (circular reference actually)
          if (!adapterFactory || !adapterFactory.create) {
            adapterFactory = DS.JSONAPIAdapter || DS.FixtureAdapter;
          }

          var thingToRegisterWith = this.registry || this.container;
          thingToRegisterWith.register('adapter:application', adapterFactory);
        }

        callbacks.store = function () {
          var container = this.container;
          return container.lookup('service:store') || container.lookup('store:main');
        };

        if (callbacks.subject === defaultSubject) {
          callbacks.subject = function (options) {
            var container = this.container;

            return _ember['default'].run(function () {
              var store = container.lookup('service:store') || container.lookup('store:main');
              return store.createRecord(modelName, options);
            });
          };
        }
      }
    }]);

    return _default;
  })(_emberTestHelpersTestModule['default']);

  exports['default'] = _default;
});
define('ember-test-helpers/test-module', ['exports', 'ember', 'ember-test-helpers/abstract-test-module', 'ember-test-helpers/test-resolver', 'ember-test-helpers/build-registry', 'ember-test-helpers/has-ember-version'], function (exports, _ember, _emberTestHelpersAbstractTestModule, _emberTestHelpersTestResolver, _emberTestHelpersBuildRegistry, _emberTestHelpersHasEmberVersion) {
  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var _default = (function (_AbstractTestModule) {
    _inherits(_default, _AbstractTestModule);

    function _default(subjectName, description, callbacks) {
      _classCallCheck(this, _default);

      // Allow `description` to be omitted, in which case it should
      // default to `subjectName`
      if (!callbacks && typeof description === 'object') {
        callbacks = description;
        description = subjectName;
      }

      _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).call(this, description || subjectName, callbacks);

      this.subjectName = subjectName;
      this.description = description || subjectName;
      this.resolver = this.callbacks.resolver || (0, _emberTestHelpersTestResolver.getResolver)();

      if (this.callbacks.integration && this.callbacks.needs) {
        throw new Error("cannot declare 'integration: true' and 'needs' in the same module");
      }

      if (this.callbacks.integration) {
        this.initIntegration(callbacks);
        delete callbacks.integration;
      }

      this.initSubject();
      this.initNeeds();
    }

    _createClass(_default, [{
      key: 'initIntegration',
      value: function initIntegration(options) {
        if (options.integration === 'legacy') {
          throw new Error('`integration: \'legacy\'` is only valid for component tests.');
        }
        this.isIntegration = true;
      }
    }, {
      key: 'initSubject',
      value: function initSubject() {
        this.callbacks.subject = this.callbacks.subject || this.defaultSubject;
      }
    }, {
      key: 'initNeeds',
      value: function initNeeds() {
        this.needs = [this.subjectName];
        if (this.callbacks.needs) {
          this.needs = this.needs.concat(this.callbacks.needs);
          delete this.callbacks.needs;
        }
      }
    }, {
      key: 'initSetupSteps',
      value: function initSetupSteps() {
        this.setupSteps = [];
        this.contextualizedSetupSteps = [];

        if (this.callbacks.beforeSetup) {
          this.setupSteps.push(this.callbacks.beforeSetup);
          delete this.callbacks.beforeSetup;
        }

        this.setupSteps.push(this.setupContainer);
        this.setupSteps.push(this.setupContext);
        this.setupSteps.push(this.setupTestElements);
        this.setupSteps.push(this.setupAJAXListeners);

        if (this.callbacks.setup) {
          this.contextualizedSetupSteps.push(this.callbacks.setup);
          delete this.callbacks.setup;
        }
      }
    }, {
      key: 'initTeardownSteps',
      value: function initTeardownSteps() {
        this.teardownSteps = [];
        this.contextualizedTeardownSteps = [];

        if (this.callbacks.teardown) {
          this.contextualizedTeardownSteps.push(this.callbacks.teardown);
          delete this.callbacks.teardown;
        }

        this.teardownSteps.push(this.teardownSubject);
        this.teardownSteps.push(this.teardownContainer);
        this.teardownSteps.push(this.teardownContext);
        this.teardownSteps.push(this.teardownTestElements);
        this.teardownSteps.push(this.teardownAJAXListeners);

        if (this.callbacks.afterTeardown) {
          this.teardownSteps.push(this.callbacks.afterTeardown);
          delete this.callbacks.afterTeardown;
        }
      }
    }, {
      key: 'setupContainer',
      value: function setupContainer() {
        if (this.isIntegration || this.isLegacy) {
          this._setupIntegratedContainer();
        } else {
          this._setupIsolatedContainer();
        }
      }
    }, {
      key: 'setupContext',
      value: function setupContext() {
        var subjectName = this.subjectName;
        var container = this.container;

        var factory = function factory() {
          return container.factoryFor ? container.factoryFor(subjectName) : container.lookupFactory(subjectName);
        };

        _get(Object.getPrototypeOf(_default.prototype), 'setupContext', this).call(this, {
          container: this.container,
          registry: this.registry,
          factory: factory,
          register: function register() {
            var target = this.registry || this.container;
            return target.register.apply(target, arguments);
          }
        });

        if (_ember['default'].setOwner) {
          _ember['default'].setOwner(this.context, this.container.owner);
        }

        this.setupInject();
      }
    }, {
      key: 'setupInject',
      value: function setupInject() {
        var module = this;
        var context = this.context;

        if (_ember['default'].inject) {
          var keys = (Object.keys || _ember['default'].keys)(_ember['default'].inject);

          keys.forEach(function (typeName) {
            context.inject[typeName] = function (name, opts) {
              var alias = opts && opts.as || name;
              _ember['default'].run(function () {
                _ember['default'].set(context, alias, module.container.lookup(typeName + ':' + name));
              });
            };
          });
        }
      }
    }, {
      key: 'teardownSubject',
      value: function teardownSubject() {
        var subject = this.cache.subject;

        if (subject) {
          _ember['default'].run(function () {
            _ember['default'].tryInvoke(subject, 'destroy');
          });
        }
      }
    }, {
      key: 'teardownContainer',
      value: function teardownContainer() {
        var container = this.container;
        _ember['default'].run(function () {
          container.destroy();
        });
      }
    }, {
      key: 'defaultSubject',
      value: function defaultSubject(options, factory) {
        return factory.create(options);
      }

      // allow arbitrary named factories, like rspec let
    }, {
      key: 'contextualizeCallbacks',
      value: function contextualizeCallbacks() {
        var callbacks = this.callbacks;
        var context = this.context;

        this.cache = this.cache || {};
        this.cachedCalls = this.cachedCalls || {};

        var keys = (Object.keys || _ember['default'].keys)(callbacks);
        var keysLength = keys.length;

        if (keysLength) {
          var deprecatedContext = this._buildDeprecatedContext(this, context);
          for (var i = 0; i < keysLength; i++) {
            this._contextualizeCallback(context, keys[i], deprecatedContext);
          }
        }
      }
    }, {
      key: '_contextualizeCallback',
      value: function _contextualizeCallback(context, key, callbackContext) {
        var _this = this;
        var callbacks = this.callbacks;
        var factory = context.factory;

        context[key] = function (options) {
          if (_this.cachedCalls[key]) {
            return _this.cache[key];
          }

          var result = callbacks[key].call(callbackContext, options, factory());

          _this.cache[key] = result;
          _this.cachedCalls[key] = true;

          return result;
        };
      }

      /*
        Builds a version of the passed in context that contains deprecation warnings
        for accessing properties that exist on the module.
      */
    }, {
      key: '_buildDeprecatedContext',
      value: function _buildDeprecatedContext(module, context) {
        var deprecatedContext = Object.create(context);

        var keysForDeprecation = Object.keys(module);

        for (var i = 0, l = keysForDeprecation.length; i < l; i++) {
          this._proxyDeprecation(module, deprecatedContext, keysForDeprecation[i]);
        }

        return deprecatedContext;
      }

      /*
        Defines a key on an object to act as a proxy for deprecating the original.
      */
    }, {
      key: '_proxyDeprecation',
      value: function _proxyDeprecation(obj, proxy, key) {
        if (typeof proxy[key] === 'undefined') {
          Object.defineProperty(proxy, key, {
            get: function get() {
              _ember['default'].deprecate('Accessing the test module property "' + key + '" from a callback is deprecated.', false, { id: 'ember-test-helpers.test-module.callback-context', until: '0.6.0' });
              return obj[key];
            }
          });
        }
      }
    }, {
      key: '_setupContainer',
      value: function _setupContainer(isolated) {
        var resolver = this.resolver;

        var items = (0, _emberTestHelpersBuildRegistry['default'])(!isolated ? resolver : Object.create(resolver, {
          resolve: {
            value: function value() {}
          }
        }));

        this.container = items.container;
        this.registry = items.registry;

        if ((0, _emberTestHelpersHasEmberVersion['default'])(1, 13)) {
          var thingToRegisterWith = this.registry || this.container;
          var router = resolver.resolve('router:main');
          router = router || _ember['default'].Router.extend();
          thingToRegisterWith.register('router:main', router);
        }
      }
    }, {
      key: '_setupIsolatedContainer',
      value: function _setupIsolatedContainer() {
        var resolver = this.resolver;
        this._setupContainer(true);

        var thingToRegisterWith = this.registry || this.container;

        for (var i = this.needs.length; i > 0; i--) {
          var fullName = this.needs[i - 1];
          var normalizedFullName = resolver.normalize(fullName);
          thingToRegisterWith.register(fullName, resolver.resolve(normalizedFullName));
        }

        if (!this.registry) {
          this.container.resolver = function () {};
        }
      }
    }, {
      key: '_setupIntegratedContainer',
      value: function _setupIntegratedContainer() {
        this._setupContainer();
      }
    }]);

    return _default;
  })(_emberTestHelpersAbstractTestModule['default']);

  exports['default'] = _default;
});
define('ember-test-helpers/test-resolver', ['exports'], function (exports) {
  'use strict';

  exports.setResolver = setResolver;
  exports.getResolver = getResolver;
  var __resolver__;

  function setResolver(resolver) {
    __resolver__ = resolver;
  }

  function getResolver() {
    if (__resolver__ == null) {
      throw new Error('you must set a resolver with `testResolver.set(resolver)`');
    }

    return __resolver__;
  }
});
define('ember-test-helpers/wait', ['exports', 'ember'], function (exports, _ember) {
  /* globals self */

  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports._teardownAJAXHooks = _teardownAJAXHooks;
  exports._setupAJAXHooks = _setupAJAXHooks;
  exports['default'] = wait;

  var jQuery = _ember['default'].$;

  var requests;
  function incrementAjaxPendingRequests(_, xhr) {
    requests.push(xhr);
  }

  function decrementAjaxPendingRequests(_, xhr) {
    for (var i = 0; i < requests.length; i++) {
      if (xhr === requests[i]) {
        requests.splice(i, 1);
      }
    }
  }

  function _teardownAJAXHooks() {
    if (!jQuery) {
      return;
    }

    jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
  }

  function _setupAJAXHooks() {
    requests = [];

    if (!jQuery) {
      return;
    }

    jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }

  var _internalCheckWaiters;
  if (_ember['default'].__loader.registry['ember-testing/test/waiters']) {
    _internalCheckWaiters = _ember['default'].__loader.require('ember-testing/test/waiters').checkWaiters;
  }

  function checkWaiters() {
    if (_internalCheckWaiters) {
      return _internalCheckWaiters();
    } else if (_ember['default'].Test.waiters) {
      if (_ember['default'].Test.waiters.any(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var context = _ref2[0];
        var callback = _ref2[1];
        return !callback.call(context);
      })) {
        return true;
      }
    }

    return false;
  }

  function wait(_options) {
    var options = _options || {};
    var waitForTimers = options.hasOwnProperty('waitForTimers') ? options.waitForTimers : true;
    var waitForAJAX = options.hasOwnProperty('waitForAJAX') ? options.waitForAJAX : true;
    var waitForWaiters = options.hasOwnProperty('waitForWaiters') ? options.waitForWaiters : true;

    return new _ember['default'].RSVP.Promise(function (resolve) {
      var watcher = self.setInterval(function () {
        if (waitForTimers && (_ember['default'].run.hasScheduledTimers() || _ember['default'].run.currentRunLoop)) {
          return;
        }

        if (waitForAJAX && requests && requests.length > 0) {
          return;
        }

        if (waitForWaiters && checkWaiters()) {
          return;
        }

        // Stop polling
        self.clearInterval(watcher);

        // Synchronously resolve the promise
        _ember['default'].run(null, resolve);
      }, 10);
    });
  }
});
define("qunit", ["exports"], function (exports) {
  /* globals QUnit */

  "use strict";

  var _module = QUnit.module;
  exports.module = _module;
  var test = QUnit.test;
  exports.test = test;
  var skip = QUnit.skip;
  exports.skip = skip;
  var only = QUnit.only;
  exports.only = only;
  var todo = QUnit.todo;

  exports.todo = todo;
  exports["default"] = QUnit;
});
/* jshint ignore:start */

runningTests = true;

if (window.Testem) {
  window.Testem.hookIntoTestFramework();
}



/* jshint ignore:end */
//# sourceMappingURL=test-support.map

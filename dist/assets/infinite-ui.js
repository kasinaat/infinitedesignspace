"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('infinite-ui/app', ['exports', 'ember', 'infinite-ui/resolver', 'ember-load-initializers', 'infinite-ui/config/environment'], function (exports, _ember, _infiniteUiResolver, _emberLoadInitializers, _infiniteUiConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _infiniteUiConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _infiniteUiConfigEnvironment['default'].podModulePrefix,
    Resolver: _infiniteUiResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _infiniteUiConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('infinite-ui/helpers/app-version', ['exports', 'ember', 'infinite-ui/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _ember, _infiniteUiConfigEnvironment, _emberCliAppVersionUtilsRegexp) {
  exports.appVersion = appVersion;
  var version = _infiniteUiConfigEnvironment['default'].APP.version;

  function appVersion(_) {
    var hash = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (hash.hideSha) {
      return version.match(_emberCliAppVersionUtilsRegexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_emberCliAppVersionUtilsRegexp.shaRegExp)[0];
    }

    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('infinite-ui/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('infinite-ui/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('infinite-ui/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'infinite-ui/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _infiniteUiConfigEnvironment) {
  var _config$APP = _infiniteUiConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('infinite-ui/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('infinite-ui/initializers/data-adapter', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('infinite-ui/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data'], function (exports, _emberDataSetupContainer, _emberData) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    ```app/services/store.js
    import DS from 'ember-data';
  
    export default DS.Store.extend({
      adapter: 'custom'
    });
    ```
  
    ```app/controllers/posts.js
    import { Controller } from '@ember/controller';
  
    export default Controller.extend({
      // ...
    });
  
    When the application is initialized, `ApplicationStore` will automatically be
    instantiated, and the instance of `PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('infinite-ui/initializers/export-application-global', ['exports', 'ember', 'infinite-ui/config/environment'], function (exports, _ember, _infiniteUiConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_infiniteUiConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _infiniteUiConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_infiniteUiConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('infinite-ui/initializers/injectStore', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('infinite-ui/initializers/store', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('infinite-ui/initializers/transforms', ['exports'], function (exports) {
  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define("infinite-ui/instance-initializers/ember-data", ["exports", "ember-data/initialize-store-service"], function (exports, _emberDataInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataInitializeStoreService["default"]
  };
});
define('infinite-ui/pods/application/controller', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = _ember['default'].Controller.extend({
        actions: {
            scrollToHome: function scrollToHome(id) {
                $('html, body').animate({
                    scrollTop: $("#" + id).offset().top
                }, 1000);
            }
        }
    });
});
define('infinite-ui/pods/application/route', ['exports', 'ember'], function (exports, _ember) {
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var StickyNavigation = (function () {
		function StickyNavigation() {
			var _this = this;

			_classCallCheck(this, StickyNavigation);

			this.currentId = null;
			this.currentTab = null;
			this.tabContainerHeight = 70;
			var self = this;
			$('.et-hero-tab').click(function () {
				self.onTabClick(event, $(this));
			});
			$(window).scroll(function () {
				_this.onScroll();
			});
			$(window).resize(function () {
				_this.onResize();
			});
		}

		_createClass(StickyNavigation, [{
			key: 'onTabClick',
			value: function onTabClick(event, element) {
				event.preventDefault();
				var scrollTop = $(element.attr('href')).offset().top - this.tabContainerHeight + 1;
				$('html, body').animate({ scrollTop: scrollTop }, 600);
			}
		}, {
			key: 'onScroll',
			value: function onScroll() {
				this.checkTabContainerPosition();
				this.findCurrentTabSelector();
			}
		}, {
			key: 'onResize',
			value: function onResize() {
				if (this.currentId) {
					this.setSliderCss();
				}
			}
		}, {
			key: 'checkTabContainerPosition',
			value: function checkTabContainerPosition() {
				var offset = $('.et-hero-tabs').offset().top + $('.et-hero-tabs').height() - this.tabContainerHeight;
				if ($(window).scrollTop() > offset) {
					$('.et-hero-tabs-container').addClass('et-hero-tabs-container--top');
				} else {
					$('.et-hero-tabs-container').removeClass('et-hero-tabs-container--top');
				}
			}
		}, {
			key: 'findCurrentTabSelector',
			value: function findCurrentTabSelector(element) {
				var newCurrentId = undefined;
				var newCurrentTab = undefined;
				var self = this;
				$('.et-hero-tab').each(function () {
					var id = $(this).attr('href');
					var offsetTop = $(id).offset().top - self.tabContainerHeight;
					var offsetBottom = $(id).offset().top + $(id).height() - self.tabContainerHeight;
					if ($(window).scrollTop() > offsetTop && $(window).scrollTop() < offsetBottom) {
						newCurrentId = id;
						newCurrentTab = $(this);
					}
				});
				if (this.currentId != newCurrentId || this.currentId === null) {
					this.currentId = newCurrentId;
					this.currentTab = newCurrentTab;
					this.setSliderCss();
				}
			}
		}, {
			key: 'setSliderCss',
			value: function setSliderCss() {
				var width = 0;
				var left = 0;
				if (this.currentTab) {
					width = this.currentTab.css('width');
					left = this.currentTab.offset().left;
				}
				$('.et-hero-tab-slider').css('width', width);
				$('.et-hero-tab-slider').css('left', left);
			}
		}]);

		return StickyNavigation;
	})();

	new StickyNavigation();

	exports['default'] = _ember['default'].Route.extend({});
});
define("infinite-ui/pods/application/template", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "wj59bEus", "block": "{\"statements\":[[\"open-element\",\"body\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"comment\",\" Hero \"],[\"text\",\"\\n  \"],[\"open-element\",\"section\",[]],[\"static-attr\",\"class\",\"et-hero-tabs\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\" \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"bg\"],[\"static-attr\",\"src\",\"images/logo.png\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"company-landing\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"INFINTE DESIGN SPACE\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"Architecture | Interior | Graphic Design\"],[\"close-element\"],[\"text\",\"   \\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"mouse_scroll\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"scrollToHome\",\"tab-home\"]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"mouse\"],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"wheel\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"m_scroll_arrows unu\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"m_scroll_arrows doi\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\\t\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"m_scroll_arrows trei\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\t\\t\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"section\",[]],[\"static-attr\",\"class\",\"et-hero-tabs-container\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"et-hero-tab\"],[\"static-attr\",\"href\",\"#tab-home\"],[\"flush-element\"],[\"text\",\"Home\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"et-hero-tab\"],[\"static-attr\",\"href\",\"#tab-projects\"],[\"flush-element\"],[\"text\",\"Projects\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"et-hero-tab\"],[\"static-attr\",\"href\",\"#tab-services\"],[\"flush-element\"],[\"text\",\"Services\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"et-hero-tab\"],[\"static-attr\",\"href\",\"#tab-about\"],[\"flush-element\"],[\"text\",\"About\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"et-hero-tab\"],[\"static-attr\",\"href\",\"#tab-contact\"],[\"flush-element\"],[\"text\",\"Contact Us\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"et-hero-tab-slider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"comment\",\" Main \"],[\"text\",\"\\n  \"],[\"open-element\",\"main\",[]],[\"static-attr\",\"class\",\"et-main\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"section\",[]],[\"static-attr\",\"class\",\"et-slide\"],[\"static-attr\",\"id\",\"tab-home\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-6 typewriter\"],[\"flush-element\"],[\"text\",\"\\n               \"],[\"open-element\",\"h2\",[]],[\"static-attr\",\"class\",\"company-banner\"],[\"flush-element\"],[\"text\",\"We are \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"company-title-bold\"],[\"flush-element\"],[\"text\",\"Infinite Design Space\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-sm-6 company-summary\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"company-title\"],[\"flush-element\"],[\"text\",\"Infinite Design Space\"],[\"close-element\"],[\"text\",\" is one of the leading architectural firms located at the heart of the Tirupur City.\\n            \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"section\",[]],[\"static-attr\",\"class\",\"et-slide\"],[\"static-attr\",\"id\",\"tab-projects\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Flexbox\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"something about flexbox\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"section\",[]],[\"static-attr\",\"class\",\"et-slide\"],[\"static-attr\",\"id\",\"tab-services\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"React\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"something about react\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"section\",[]],[\"static-attr\",\"class\",\"et-slide\"],[\"static-attr\",\"id\",\"tab-about\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Angular\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"something about angular\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"section\",[]],[\"static-attr\",\"class\",\"et-slide\"],[\"static-attr\",\"id\",\"tab-contact\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"h1\",[]],[\"flush-element\"],[\"text\",\"Other\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"something about other\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "infinite-ui/pods/application/template.hbs" } });
});
define('infinite-ui/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('infinite-ui/router', ['exports', 'ember', 'infinite-ui/config/environment'], function (exports, _ember, _infiniteUiConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _infiniteUiConfigEnvironment['default'].locationType,
    rootURL: _infiniteUiConfigEnvironment['default'].rootURL
  });

  Router.map(function () {});

  exports['default'] = Router;
});
define('infinite-ui/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('infinite-ui/config/environment', ['ember'], function(Ember) {
  var prefix = 'infinite-ui';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("infinite-ui/app")["default"].create({"name":"infinite-ui","version":"0.0.0+4745338a"});
}

/* jshint ignore:end */
//# sourceMappingURL=infinite-ui.map

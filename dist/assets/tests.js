'use strict';

define('infinite-ui/tests/app.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass jshint.');
  });
});
define('infinite-ui/tests/helpers/destroy-app', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = destroyApp;

  function destroyApp(application) {
    _ember['default'].run(application, 'destroy');
  }
});
define('infinite-ui/tests/helpers/destroy-app.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/destroy-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass jshint.');
  });
});
define('infinite-ui/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'ember', 'infinite-ui/tests/helpers/start-app', 'infinite-ui/tests/helpers/destroy-app'], function (exports, _qunit, _ember, _infiniteUiTestsHelpersStartApp, _infiniteUiTestsHelpersDestroyApp) {
  var Promise = _ember['default'].RSVP.Promise;

  exports['default'] = function (name) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _infiniteUiTestsHelpersStartApp['default'])();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },

      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return Promise.resolve(afterEach).then(function () {
          return (0, _infiniteUiTestsHelpersDestroyApp['default'])(_this.application);
        });
      }
    });
  };
});
define('infinite-ui/tests/helpers/module-for-acceptance.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/module-for-acceptance.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass jshint.');
  });
});
define('infinite-ui/tests/helpers/resolver', ['exports', 'infinite-ui/resolver', 'infinite-ui/config/environment'], function (exports, _infiniteUiResolver, _infiniteUiConfigEnvironment) {

  var resolver = _infiniteUiResolver['default'].create();

  resolver.namespace = {
    modulePrefix: _infiniteUiConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _infiniteUiConfigEnvironment['default'].podModulePrefix
  };

  exports['default'] = resolver;
});
define('infinite-ui/tests/helpers/resolver.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/resolver.js should pass jshint.');
  });
});
define('infinite-ui/tests/helpers/start-app', ['exports', 'ember', 'infinite-ui/app', 'infinite-ui/config/environment'], function (exports, _ember, _infiniteUiApp, _infiniteUiConfigEnvironment) {
  exports['default'] = startApp;

  function startApp(attrs) {
    var application = undefined;

    var attributes = _ember['default'].merge({}, _infiniteUiConfigEnvironment['default'].APP);
    attributes = _ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    _ember['default'].run(function () {
      application = _infiniteUiApp['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }
});
define('infinite-ui/tests/helpers/start-app.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | helpers/start-app.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass jshint.');
  });
});
define('infinite-ui/tests/pods/about/route.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | pods/about/route.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'pods/about/route.js should pass jshint.');
  });
});
define('infinite-ui/tests/pods/application/controller.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | pods/application/controller.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'pods/application/controller.js should pass jshint.');
  });
});
define('infinite-ui/tests/pods/application/route.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | pods/application/route.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(false, 'pods/application/route.js should pass jshint.\npods/application/route.js: line 57, col 29, Expected \'!==\' and instead saw \'!=\'.\npods/application/route.js: line 44, col 28, \'element\' is defined but never used.\npods/application/route.js: line 80, col 42, \'model\' is defined but never used.\npods/application/route.js: line 10, col 9, \'$\' is not defined.\npods/application/route.js: line 11, col 36, \'$\' is not defined.\npods/application/route.js: line 13, col 9, \'$\' is not defined.\npods/application/route.js: line 14, col 9, \'$\' is not defined.\npods/application/route.js: line 19, col 25, \'$\' is not defined.\npods/application/route.js: line 20, col 9, \'$\' is not defined.\npods/application/route.js: line 35, col 22, \'$\' is not defined.\npods/application/route.js: line 35, col 56, \'$\' is not defined.\npods/application/route.js: line 36, col 12, \'$\' is not defined.\npods/application/route.js: line 37, col 13, \'$\' is not defined.\npods/application/route.js: line 40, col 13, \'$\' is not defined.\npods/application/route.js: line 48, col 9, \'$\' is not defined.\npods/application/route.js: line 49, col 22, \'$\' is not defined.\npods/application/route.js: line 50, col 29, \'$\' is not defined.\npods/application/route.js: line 51, col 32, \'$\' is not defined.\npods/application/route.js: line 51, col 53, \'$\' is not defined.\npods/application/route.js: line 52, col 16, \'$\' is not defined.\npods/application/route.js: line 52, col 53, \'$\' is not defined.\npods/application/route.js: line 54, col 33, \'$\' is not defined.\npods/application/route.js: line 71, col 9, \'$\' is not defined.\npods/application/route.js: line 72, col 9, \'$\' is not defined.\npods/application/route.js: line 85, col 13, \'$\' is not defined.\npods/application/route.js: line 86, col 13, \'$\' is not defined.\npods/application/route.js: line 90, col 13, \'$\' is not defined.\npods/application/route.js: line 91, col 28, \'$\' is not defined.\npods/application/route.js: line 3, col 7, \'StickyNavigation\' is defined but never used.\n\n29 errors');
  });
});
define('infinite-ui/tests/pods/contact/route.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | pods/contact/route.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'pods/contact/route.js should pass jshint.');
  });
});
define('infinite-ui/tests/pods/home/route.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | pods/home/route.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'pods/home/route.js should pass jshint.');
  });
});
define('infinite-ui/tests/pods/projects/route.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | pods/projects/route.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'pods/projects/route.js should pass jshint.');
  });
});
define('infinite-ui/tests/pods/services/route.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | pods/services/route.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'pods/services/route.js should pass jshint.');
  });
});
define('infinite-ui/tests/resolver.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | resolver.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass jshint.');
  });
});
define('infinite-ui/tests/router.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | router.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass jshint.');
  });
});
define('infinite-ui/tests/test-helper', ['exports', 'infinite-ui/tests/helpers/resolver', 'ember-qunit'], function (exports, _infiniteUiTestsHelpersResolver, _emberQunit) {

  (0, _emberQunit.setResolver)(_infiniteUiTestsHelpersResolver['default']);
});
define('infinite-ui/tests/test-helper.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | test-helper.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass jshint.');
  });
});
define('infinite-ui/tests/transitions.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | transitions.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'transitions.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/application/route-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:application', 'Unit | Route | application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('infinite-ui/tests/unit/application/route-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/application/route-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/application/route-test.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/pods/about/route-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:about', 'Unit | Route | about', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('infinite-ui/tests/unit/pods/about/route-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/pods/about/route-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/pods/about/route-test.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/pods/application/controller-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('controller:application', 'Unit | Controller | application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  // Replace this with your real tests.
  (0, _emberQunit.test)('it exists', function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });
});
define('infinite-ui/tests/unit/pods/application/controller-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/pods/application/controller-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/pods/application/controller-test.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/pods/application/route-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:application', 'Unit | Route | application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('infinite-ui/tests/unit/pods/application/route-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/pods/application/route-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/pods/application/route-test.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/pods/contact/route-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:contact', 'Unit | Route | contact', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('infinite-ui/tests/unit/pods/contact/route-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/pods/contact/route-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/pods/contact/route-test.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/pods/home/route-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:home', 'Unit | Route | home', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('infinite-ui/tests/unit/pods/home/route-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/pods/home/route-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/pods/home/route-test.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/pods/projects/route-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:projects', 'Unit | Route | projects', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('infinite-ui/tests/unit/pods/projects/route-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/pods/projects/route-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/pods/projects/route-test.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/pods/services/route-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:services', 'Unit | Route | services', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('infinite-ui/tests/unit/pods/services/route-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/pods/services/route-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/pods/services/route-test.js should pass jshint.');
  });
});
define('infinite-ui/tests/unit/routes/application-test', ['exports', 'ember-qunit'], function (exports, _emberQunit) {

  (0, _emberQunit.moduleFor)('route:application', 'Unit | Route | application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
  });

  (0, _emberQunit.test)('it exists', function (assert) {
    var route = this.subject();
    assert.ok(route);
  });
});
define('infinite-ui/tests/unit/routes/application-test.jshint.lint-test', ['exports'], function (exports) {
  'use strict';

  QUnit.module('JSHint | unit/routes/application-test.js');
  QUnit.test('should pass jshint', function (assert) {
    assert.expect(1);
    assert.ok(true, 'unit/routes/application-test.js should pass jshint.');
  });
});
/* jshint ignore:start */

require('infinite-ui/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;

/* jshint ignore:end */
//# sourceMappingURL=tests.map

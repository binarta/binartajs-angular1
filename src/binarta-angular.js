(function () {
    angular.module('binartajs-angular1', ['web.storage'])
        .provider('binarta', [BinartaProvider])
        .factory('binartaGatewaysAreInitialised', ['$q', GatewaysAreInitialisedFactory])
        .factory('binartaConfigIsInitialised', ['$q', 'binartaGatewaysAreInitialised', ConfigIsInitialisedFactory])
        .factory('binartaCachesAreInitialised', ['$q', 'binartaConfigIsInitialised', CachesAreInitialisedFactory])
        .factory('binartaIsInitialised', ['$q', 'binarta', 'binartaGatewaysAreInitialised', 'binartaConfigIsInitialised', 'binartaCachesAreInitialised', IsInitialisedFactory])
        .component('binContentHeader', new ContentHeaderComponent())
        .component('binViolations', new ViolationsComponent());

    function BinartaProvider() {
        this.ui = new UI();

        var factory = new BinartajsFactory();
        factory.addUI(this.ui);
        this.addSubSystems = factory.addSubSystems;

        this.$get = ['localStorage', 'sessionStorage', function (localStorage, sessionStorage) {
            var binartajs = factory.create();
            binartajs.localStorage = localStorage;
            binartajs.sessionStorage = sessionStorage;
            return binartajs;
        }]
    }

    function GatewaysAreInitialisedFactory($q) {
        return $q.defer();
    }

    function ConfigIsInitialisedFactory($q, gatewaysAreInitialised) {
        var d = $q.defer();
        return {resolve: d.resolve, promise: $q.all([gatewaysAreInitialised.promise, d.promise])};
    }

    function CachesAreInitialisedFactory($q, configIsInitialised) {
        var d = $q.defer();
        return {resolve: d.resolve, promise: $q.all([configIsInitialised.promise, d.promise])};
    }

    function IsInitialisedFactory($q, binarta, gatewaysAreInitialised, configIsInitialised, cachesAreInitialised) {
        var d = $q.defer();
        $q.all([gatewaysAreInitialised.promise, configIsInitialised.promise, cachesAreInitialised.promise]).then(function () {
            d.resolve(binarta);
        });
        return d.promise;
    }

    function UI() {

    }

    function ContentHeaderComponent() {
        this.bindings = {
            titleKey: '@',
            subTitleKey: '@'
        };
        this.controller = ['binarta', ContentHeaderController];
        this.templateUrl = 'bin-all-content-header.html'
    }

    function ContentHeaderController(binarta) {
        this.$onInit = function () {
            this.inverted = binarta.invertedHeaderTitles;
        }
    }

    function ViolationsComponent() {
        this.bindings = {
            src: '<',
            fadeAfter: '@',
            codePrefix: '@'
        };
        this.controller = ['$timeout', ViolationsController];
        this.templateUrl = 'bin-all-violations.html';
    }

    function ViolationsController($timeout) {
        var ctrl = this;
        var promise;

        this.$onChanges = function () {
            if (ctrl.src) {
                if (promise) $timeout.cancel(promise);
                promise = $timeout(function () {
                    ctrl.src = [];
                }, ctrl.fadeAfter);
            }
        }
    }
})();

var binComponentControllerExtenders = [];
function binComponentController(ConcreteController) {
    function Handlers() {
        var handlers = [];
        var released = false;

        this.add = function (h) {
            released ? h() : handlers.push(h);
        };

        this.release = function () {
            released = true;
            handlers.forEach(function (h) {
                h();
            });
        }
    }

    function AbstractController() {
        var $ctrl = this;

        var onInitHandlers = new Handlers();
        var onDestroyHandlers = new Handlers();

        $ctrl.addInitHandler = function (h) {
            onInitHandlers.add(h);
        };

        $ctrl.$onInit = function () {
            onInitHandlers.release();
        };

        $ctrl.addDestroyHandler = function (h) {
            onDestroyHandlers.add(h);
        };

        $ctrl.$onDestroy = function () {
            onDestroyHandlers.release();
        };

        binComponentControllerExtenders.forEach(function (extend) {
            extend($ctrl);
        });

        ConcreteController.apply($ctrl, arguments);
    }

    return AbstractController;
}

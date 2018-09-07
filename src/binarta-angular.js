(function () {
    angular.module('binartajs-angular1', ['web.storage'])
        .provider('binarta', [BinartaProvider])
        .factory('binartaGatewaysAreInitialised', ['$q', GatewaysAreInitialisedFactory])
        .factory('binartaConfigIsInitialised', ['$q', 'binartaGatewaysAreInitialised', ConfigIsInitialisedFactory])
        .factory('binartaCachesAreInitialised', ['$q', 'binartaConfigIsInitialised', CachesAreInitialisedFactory])
        .factory('binartaIsInitialised', ['$q', 'binarta', 'binartaGatewaysAreInitialised', 'binartaConfigIsInitialised', 'binartaCachesAreInitialised', IsInitialisedFactory])
        .component('binContentHeader', new ContentHeaderComponent())
        .component('binViolations', new ViolationsComponent())
        .component('binPlatformSignature', new PlatformSignatureComponent())
        .component('binContactAddress', new BinContactAddressComponent())
        .component('binContactPhone', new BinContactPhoneComponent())
        .component('binContactPhoneInfo', new BinContactPhoneInfoComponent())
        .component('binContactEmail', new BinContactEmailComponent())
        .directive('binAffix', ['binAffix', binAffixDirective])
        .service('binAffix', ['$window', '$document', BinAffixService]);

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

    function PlatformSignatureComponent() {
        this.templateUrl = 'bin-all-platform-signature.html';

        this.bindings = {
            mode: '@'
        };

        this.controller = ['$document', 'binarta', binComponentController(function ($document, binarta) {
            var $ctrl = this;

            $ctrl.config.public.find('platform.brand', setSignature);

            $ctrl.getModeClass = function () {
                return 'bin-platform-signature' + ($ctrl.mode ? '-' + $ctrl.mode : '');
            };

            function setSignature(name) {
                $ctrl.signature = name || 'binarta';
                setWebAuthorMetaTag($ctrl.signature);
            }

            function setWebAuthorMetaTag(signature) {
                var head = $document.find('head');
                var metaName = 'web_author';
                var result = head.find('meta[name="' + metaName + '"]');
                if (result.length == 0) head.prepend('<meta name="' + metaName + '" content="' + capitalize(signature) + '">');
            }

            function capitalize(signature) {
                return signature.charAt(0).toUpperCase() + signature.slice(1);
            }
        })];
    }

    function BinContactAddressComponent() {
        this.template = '<span i18n code="contact.address" editor="input">' +
            '<a ng-href="//maps.google.com/maps?q={{var|binEncodeUriComponent}}" target="_blank" ng-bind="var"></a>' +
            '</span>';
    }

    function BinContactPhoneComponent() {
        this.template = '<span i18n code="contact.phone" editor="input"><a ng-href="tel:{{var}}" ng-bind="var"></a></span>';
    }

    function BinContactPhoneInfoComponent() {
        this.template = '<span i18n code="contact.phone.info" editor="input" ng-bind="var"></span>';
    }

    function BinContactEmailComponent() {
        this.template = '<span bin-config key="application.email" scope="public" input-type="email">' +
            '<a ng-href="mailto:{{config.value}}" ng-bind="config.value"></a>' +
            '</span>';
    }

    function binAffixDirective(affix) {
        return {
            restrict: 'C',
            scope: {},
            link: function ($scope, els) {
                var handle = affix.new(els[0]);
                $scope.$on('destroy', handle.disconnect);
            }
        }
    }

    function BinAffixService($window, $document) {
        var self = this;

        self.new = function (el) {
            return new Handle(el);
        };

        function Handle(el) {
            var handle = this;

            handle.connect = function () {
                $document.on('scroll', handle.withAnimationFrame);
            };
            handle.connect();

            handle.disconnect = function () {
                $document.off('scroll', handle.withAnimationFrame);
            };

            handle.withAnimationFrame = function () {
                if ($window.requestAnimationFrame) $window.requestAnimationFrame(handle.withScrollIndex);
                else handle.withScrollIndex();
            };

            handle.withScrollIndex = function () {
                handle.on(el.parentElement.getBoundingClientRect().top);
            };

            handle.on = function (idx) {
                idx < 0 ? el.classList.add('affix') : el.classList.remove('affix');
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

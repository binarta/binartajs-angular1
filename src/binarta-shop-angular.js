(function () {
    angular.module('binarta-shopjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-shopjs-gateways-angular1'
    ])
        .provider('shop', ['binartaShopGatewayProvider', ShopProvider])
        .service('CheckoutController.decorator', CheckoutControllerDecorator)
        .controller('CheckoutController', ['binarta', 'CheckoutController.decorator', 'i18nLocation', '$location', CheckoutController])
        .config(['binartaProvider', 'shopProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
        .run(['shop', WireAngularDependencies])
        .run(['binarta', 'CheckoutController.decorator', InstallCheckpointListener])
        .run(['binarta', 'CheckoutController.decorator', InstallSummarySupport]);

    function ShopProvider(provider) {
        this.shop = new BinartaShopjs();
        this.shop.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.shop;
        }]
    }

    function CheckoutControllerDecorator() {
        var decorators = [];

        this.add = function (it) {
            decorators.push(it);
        };

        this.decorate = function (ctrl) {
            decorators.forEach(function(it) {
                it(ctrl);
            });
        }
    }

    function CheckoutController(binarta, decorator, i18nLocation, $location) {
        var self = this;
        decorator.decorate(self);

        this.status = binarta.shop.checkout.status;

        this.$onInit = function () {
            try {
                var p = /.*\/checkout\/([\w-]+)/.exec($location.path());
                if (p)
                    binarta.shop.checkout.jumpTo(p[1]);
            } catch (ignored) {
            }
        };

        this.start = function () {
            if (self.status() != 'idle')
                i18nLocation.path('/checkout/' + self.status());
        };
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, shopProvider) {
        binarta.addSubSystems({shop: shopProvider.shop});
    }

    function WireAngularDependencies() {
    }

    function InstallCheckpointListener(binarta, decorator) {
        decorator.add(function (ctrl) {
            ctrl.checkpointListener = new CheckpointListener(binarta, ctrl);
        });

        function CheckpointListener(binarta, ctrl) {
            this.success = function () {
                binarta.shop.checkout.retry();
                ctrl.start();
            }
        }
    }

    function InstallSummarySupport(binarta, decorator) {
        decorator.add(function(ctrl) {
            ctrl.confirm = function() {
                binarta.shop.checkout.confirm(function() {
                    ctrl.start();
                });
            };

            ctrl.violationReport = function() {
                return binarta.shop.checkout.violationReport();
            }
        });
    }

    function InstallRoutes($routeProvider) {
        $routeProvider
            .when('/checkout/start', {
                templateUrl: 'bin-checkout-start.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/authentication-required', {
                templateUrl: 'bin-checkout-authentication-required.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/summary', {
                templateUrl: 'bin-checkout-summary.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/completed', {
                templateUrl: 'bin-checkout-completed.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/start', {
                templateUrl: 'bin-checkout-start.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/authentication-required', {
                templateUrl: 'bin-checkout-authentication-required.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/summary', {
                templateUrl: 'bin-checkout-summary.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/completed', {
                templateUrl: 'bin-checkout-completed.html',
                controller: 'CheckoutController as checkout'
            });
    }
})();
(function () {
    angular.module('binarta-shopjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-shopjs-gateways-angular1'
    ])
        .provider('shop', ['binartaShopGatewayProvider', ShopProvider])
        .component('binBasket', new BasketComponent())
        .controller('BinartaBasketController', ['binarta', 'viewport', BinartaBasketController])
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

    function BasketComponent() {
        this.bindings = {
            order: '<',
            mode: '@'
        };
        this.controller = 'BinartaBasketController';
        this.templateUrl = 'bin-shop-basket.html';
    }

    function BinartaBasketController(binarta, viewport) {
        var self = this;
        this.viewport = viewport;

        this.$onInit = function () {
            binarta.shop.previewOrder(this.order, function (order) {
                console.log('preview(' + JSON.stringify(order) + ')');
                self.preview = order;
            })
        }
    }

    function CheckoutControllerDecorator() {
        var decorators = [];

        this.add = function (it) {
            decorators.push(it);
        };

        this.decorate = function (ctrl) {
            decorators.forEach(function (it) {
                it(ctrl);
            });
        }
    }

    function CheckoutController(binarta, decorator, i18nLocation, $location) {
        var self = this;
        var cache = {};
        decorator.decorate(self);

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

        this.status = binarta.shop.checkout.status;

        this.order = function () {
            if (!cache.order)
                cache.order = binarta.shop.checkout.context().order;
            return cache.order;
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
        decorator.add(function (ctrl) {
            ctrl.confirm = function () {
                console.log('CheckoutController.confirm()');
                binarta.shop.checkout.confirm(function () {
                    ctrl.start();
                });
            };

            ctrl.violationReport = function () {
                return binarta.shop.checkout.violationReport();
            }
        });
    }

    function InstallRoutes($routeProvider) {
        $routeProvider
            .when('/checkout/start', {
                templateUrl: 'bin-shop-checkout-start.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/authentication-required', {
                templateUrl: 'bin-shop-checkout-authentication-required.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/summary', {
                templateUrl: 'bin-shop-checkout-summary.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/setup-payment-provider', {
                templateUrl: 'bin-shop-checkout-setup-payment-provider.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/completed', {
                templateUrl: 'bin-shop-checkout-completed.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/start', {
                templateUrl: 'bin-shop-checkout-start.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/authentication-required', {
                templateUrl: 'bin-shop-checkout-authentication-required.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/summary', {
                templateUrl: 'bin-shop-checkout-summary.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/setup-payment-provider', {
                templateUrl: 'bin-shop-checkout-setup-payment-provider.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/completed', {
                templateUrl: 'bin-shop-checkout-completed.html',
                controller: 'CheckoutController as checkout'
            });
    }
})();
(function () {
    angular.module('binarta-shopjs-angular1', [
        'ngRoute',
        'binartajs-angular1'
    ])
        .provider('shop', [ShopProvider])
        .controller('CheckoutController', ['binarta', 'i18nLocation', '$location', CheckoutController])
        .config(['binartaProvider', 'shopProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
        .run(['shop', WireAngularDependencies]);

    function ShopProvider(provider) {
        this.shop = new BinartaShopjs();
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.shop;
        }]
    }

    function CheckoutController(binarta, i18nLocation, $location) {
        var self = this;
        
        this.checkpointListener = new CheckpointListener();
        this.status = binarta.shop.checkout.status;

        this.$onInit = function() {
            try {
                var p = /.*\/checkout\/([\w-]+)/.exec($location.path());
                if(p)
                    binarta.shop.checkout.jumpTo(p[1]);
            } catch(ignored) {
            }
        };

        this.start = function() {
            if(self.status() != 'idle')
                i18nLocation.path('/checkout/' + self.status());
        };

        function CheckpointListener() {
            this.success = function() {
                binarta.shop.checkout.retry();
                self.start();
            }
        }
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, shopProvider) {
        binarta.addSubSystems({shop: shopProvider.shop});
    }

    function WireAngularDependencies() {
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
            .when('/:locale/checkout/completed', {
                templateUrl: 'bin-checkout-completed.html',
                controller: 'CheckoutController as checkout'
            });
    }
})();
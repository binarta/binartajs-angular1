(function () {
    angular.module('binarta-shopjs-angular1', [
        'ngRoute',
        'binartajs-angular1'//,
        // 'binarta-checkpointjs-gateways-angular1'
    ])
        .provider('shop', [/*'binartaCheckpointGatewayProvider', */ShopProvider])
        .controller('CheckoutController', ['binarta', 'i18nLocation', CheckoutController])
        .config(['binartaProvider', 'shopProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
        .run(['shop', WireAngularDependencies]);

    function ShopProvider(provider) {
        this.shop = new BinartaShopjs();
        // this.checkpoint.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.shop;
        }]
    }

    function CheckoutController(binarta, i18nLocation) {
        var self = this;
        
        this.status = binarta.shop.checkout.status;

        this.start = function() {
            if(self.status() != 'idle')
                i18nLocation.path('/checkout/' + self.status());
        }
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, shopProvider) {
        binarta.addSubSystems({shop: shopProvider.shop});
        // binarta.ui.approveBillingAgreement = shopProvider.ui.approveBillingAgreement;
    }

    function WireAngularDependencies() {
    }

    function InstallRoutes($routeProvider) {
        $routeProvider
            .when('/checkout2', {
                templateUrl: 'bin-checkout-flow.html',
                controller: 'CheckoutController as checkout',
                reloadOnSearch: false
            })
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
            .when('/:locale/checkout2', {
                templateUrl: 'bin-checkout-flow.html',
                controller: 'CheckoutController as checkout',
                reloadOnSearch: false
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
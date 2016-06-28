(function () {
    angular.module('binarta-shopjs-angular1', [
        'ngRoute',
        'binartajs-angular1'//,
        // 'binarta-checkpointjs-gateways-angular1'
    ])
        .provider('shop', [/*'binartaCheckpointGatewayProvider', */ShopProvider])
        .controller('CheckoutController', ['binarta', CheckoutController])
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

    function CheckoutController(binarta) {
        this.status = binarta.shop.checkout.status;
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
                templateUrl: 'checkout-flow.html',
                controller: 'CheckoutController as checkout',
                reloadOnSearch: false
            })
            .when('/:locale/checkout2', {
                templateUrl: 'checkout-flow.html',
                controller: 'CheckoutController as checkout',
                reloadOnSearch: false
            });
    }
})();
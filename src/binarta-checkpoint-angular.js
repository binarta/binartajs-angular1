(function () {
    angular.module('binarta-checkpointjs-angular1', [
            'binartajs-angular1',
            'binarta-checkpointjs-gateways-angular1'
        ])
        .provider('checkpoint', ['binartaCheckpointGatewayProvider', CheckpointProvider])
        .controller('SetupBillingAgreementController', ['$scope', 'binarta', SetupBillingAgreementController])
        .config(['binartaProvider', 'checkpointProvider', ExtendBinarta])
        .run(['checkpoint', WireAngularDependencies]);

    function CheckpointProvider(provider) {
        this.checkpoint = new BinartaCheckpointjs();
        this.checkpoint.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.checkpoint;
        }]
    }

    function UI() {
        var self = this;

        this.approveBillingAgreement = function(args) {
            console.log(JSON.stringify(args));
            self.location.url(args.url);
            self.window.location = args.url;
        }
    }

    function SetupBillingAgreementController($scope, binarta) {
        this.status = binarta.checkpoint.profile.billing.isComplete() ? '???' : 'incomplete';

        this.submit = function() {
            binarta.checkpoint.profile.billing.initiate(this.paymentProvider);
        }
    }

    function ExtendBinarta(binarta, checkpointProvider) {
        binarta.addSubSystems({checkpoint: checkpointProvider.checkpoint});
        binarta.ui.approveBillingAgreement = checkpointProvider.ui.approveBillingAgreement;
    }

    function WireAngularDependencies() {
    }
})();
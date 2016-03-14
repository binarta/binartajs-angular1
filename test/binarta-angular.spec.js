(function () {
    var ui;

    describe('binartajs-angular', function () {
        var binarta;

        beforeEach(function() {
            ui = new UI();
        });
        beforeEach(module('binartajs-angular1-spec'));
        beforeEach(inject(function (_binarta_) {
            binarta = _binarta_;
        }));

        describe('binarta-checkpointjs-angular1', function() {
            it('binarta is extended with checkpoint', function () {
                expect(binarta.checkpoint).toBeDefined();
            });

            describe('SetupBillingAgreementController', function() {
                var ctrl, $scope;

                beforeEach(inject(function($controller, $rootScope) {
                    $scope = $rootScope.$new();
                    ctrl = $controller('SetupBillingAgreementController', {
                        $scope: $scope
                    })
                }));

                it('exposes the fact billing details are incomplete', function() {
                    expect(ctrl.status).toEqual('incomplete');
                });

                it('initiate billing agreement redirects to external approval url', inject(function($window) {
                    ctrl.paymentProvider = 'p';
                    ctrl.submit();
                    expect($window.location).toEqual('http://p/billing/agreement?token=t');
                }));
            });

            describe('CancelBillingAgreementController', function() {
                var ctrl;

                beforeEach(inject(function($controller) {
                    ctrl = $controller('CancelBillingAgreementController');
                }));

                it('on execute cancel billing agreement', inject(function($location) {
                    ctrl.execute();
                    expect(ui.receivedCanceledBillingAgreementRequest).toBeTruthy();
                }));
            });
        });
    });

    installBackendStrategy('inmem');
    angular.module('binartajs-angular1-spec', ['binarta-checkpointjs-angular1', 'binarta-checkpointjs-gateways-angular1'])
        .service('$window', MockWindow)
        .config(ExtendBinarta);

    function MockWindow() {
    }

    function ExtendBinarta(binartaProvider) {
        binartaProvider.ui.canceledBillingAgreement = ui.canceledBillingAgreement;
    }

    function UI() {
        var self = this;

        this.canceledBillingAgreement = function() {
            self.receivedCanceledBillingAgreementRequest = true;
        }
    }

    function installBackendStrategy(strategy) {
        angular.module('binarta-checkpointjs-gateways-angular1', ['binarta-checkpointjs-' + strategy + '-angular1'])
            .provider('binartaCheckpointGateway', [strategy + 'BinartaCheckpointGatewayProvider', proxy]);

        function proxy(gateway) {
            return gateway;
        }
    }
})();
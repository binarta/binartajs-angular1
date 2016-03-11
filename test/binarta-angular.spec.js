(function () {
    describe('binartajs-angular', function () {
        var binarta;

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
        });
    });

    installBackendStrategy('inmem');
    angular.module('binartajs-angular1-spec', ['binarta-checkpointjs-angular1', 'binarta-checkpointjs-gateways-angular1'])
        .service('$window', MockWindow);

    function MockWindow() {
    }

    function installBackendStrategy(strategy) {
        angular.module('binarta-checkpointjs-gateways-angular1', ['binarta-checkpointjs-' + strategy + '-angular1'])
            .provider('binartaCheckpointGateway', [strategy + 'BinartaCheckpointGatewayProvider', proxy]);

        function proxy(gateway) {
            return gateway;
        }
    }
})();
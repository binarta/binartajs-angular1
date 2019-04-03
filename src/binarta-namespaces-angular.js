(function () {
    angular.module('binarta-namespacesjs-angular1', [
        'binartajs-angular1',
        'binarta-checkpointjs-angular1',
        'binarta-namespacesjs-tpls-angular1'
    ])
        .provider('binNamespaces', [NamespacesProvider])
        .component('binNamespaceAdd', new AddNamespaceComponent())
        .config(['binartaProvider', 'binNamespacesProvider', ExtendBinarta]);

    function NamespacesProvider() {
        this.namespaces = new BinartaNamespacesjs();
        this.$get = [function () {
            return {};
        }];
    }

    function AddNamespaceComponent() {
        this.bindings = {
            templateUrl: '@'
        };
        this.templateUrl = 'bin-namespaces-add-component.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            $ctrl.observables = [{
                toObserver: function () {
                    return binarta.namespaces.add.observe($ctrl.hooks);
                }
            }];
            $ctrl.hooks = {
                reseller: function () {
                    $ctrl.mode = 'reseller';
                },
                disabled: function () {
                    $ctrl.mode = 'personal';
                }
            };

            $ctrl.hooks.disabled();
        })];
    }

    function ExtendBinarta(binarta, namespacesProvider) {
        binarta.addSubSystems({namespaces: namespacesProvider.namespaces});
    }
})();
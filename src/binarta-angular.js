(function() {
    angular.module('binartajs-angular1', [])
        .provider('binarta', BinartaProvider);

    function BinartaProvider() {
        var factory = new BinartajsFactory();

        this.addUI = factory.addUI;
        this.addSubSystems = factory.addSubSystems;

        this.$get = function() {
            return factory.create();
        }
    }
})();

(function () {
    angular.module('binarta-catalogjs-angular1', [
        'binartajs-angular1'
    ])
        .provider('binCatalogjs', [CatalogProvider])
        .config(['binartaProvider', 'binCatalogjsProvider', ExtendBinarta]);

    function CatalogProvider() {
        this.catalog = new BinartaCatalogjs();
        this.$get = [function () {
            return {};
        }];
    }

    function ExtendBinarta(binarta, provider) {
        binarta.addSubSystems({catalog: provider.catalog});
    }
})();
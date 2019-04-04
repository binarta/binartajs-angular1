(function () {
    angular.module('binarta-i18njs-angular1', [
        'binartajs-angular1'
    ])
        .provider('binI18n', [I18nProvider])
        .config(['binartaProvider', 'binI18nProvider', ExtendBinarta])
        .run(['binI18n', WireAngularDependencies]);

    function I18nProvider() {
        this.i18n = new BinartaI18njs();
        this.$get = [function () {
            return this.i18n;
        }];
    }

    function ExtendBinarta(binarta, provider) {
        binarta.addSubSystems({i18n: provider.i18n});
    }

    function WireAngularDependencies() {
    }
})();
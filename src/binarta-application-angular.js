(function () {
    angular.module('binarta-applicationjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-applicationjs-gateways-angular1'
    ])
        .provider('application', ['binartaApplicationGatewayProvider', ApplicationProvider])
        .config(['binartaProvider', 'applicationProvider', ExtendBinarta])
        .factory('extendBinartaApplication', ['binartaApplicationExternalLocaleIsSet.deferred', '$location', ExtendBinartaApplicationFactory])
        .factory('binartaApplicationExternalLocaleIsSet.deferred', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationRefresh', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationCachesAreInitialised.deferred', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationIsInitialised.deferred', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationConfigIsInitialised', ['$q', 'binartaApplicationExternalLocaleIsSet.deferred', 'binartaApplicationRefresh', IsConfigInitialisedFactory])
        .factory('binartaApplicationCachesAreInitialised', ['binartaApplicationCachesAreInitialised.deferred', AreCachesInitialisedFactory])
        .factory('binartaApplicationIsInitialised', ['binartaApplicationIsInitialised.deferred', IsApplicationInitialisedFactory])
        .directive('binHref', ['application', BinHrefDirectiveFactory])
        .run(['application', WireAngularDependencies])
        .run(['$rootScope', 'application', ResolveExternalLocaleFromRoute])
        .run([
            'binartaGatewaysAreInitialised',
            'binartaConfigIsInitialised',
            'binartaApplicationRefresh',
            'binartaApplicationCachesAreInitialised.deferred',
            'binartaApplicationIsInitialised.deferred',
            'application',
            InitCaches
        ]);

    function ApplicationProvider(provider) {
        this.application = new BinartaApplicationjs();
        this.application.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', 'extendBinartaApplication', function ($window, $location, extend) {
            this.ui.window = $window;
            this.ui.location = $location;
            extend(this.application);
            return this.application;
        }]
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, applicationProvider) {
        binarta.addSubSystems({application: applicationProvider.application});
    }

    function ExtendBinartaApplicationFactory(externalLocaleD, $location) {
        function ExternalLocaleListener(app) {
            var listener = this;

            this.setExternalLocale = function (locale) {
                app.eventRegistry.remove(listener);
                externalLocaleD.resolve();
            }
        }

        return function (app) {
            var externalLocale;

            app.eventRegistry.add(new ExternalLocaleListener(app));

            app.externalLocale = function () {
                return externalLocale;
            };

            app.setExternalLocale = function (locale) {
                externalLocale = locale;
                app.eventRegistry.forEach(function (l) {
                    l.notify('setExternalLocale', locale);
                });
            };

            app.unlocalizedPath = function () {
                var locale = app.externalLocale();
                var path = $location.path();
                return locale ? path.replace('/' + locale, '') : path;
            }
        }
    }

    function BinHrefDirectiveFactory(application) {
        return {
            restrict: 'A',
            link: function ($scope, els, attrs) {
                var a = els[0];
                if(a.nodeName == 'A') {
                    var listener = new ExternalLocaleListener();
                    application.eventRegistry.add(listener);
                    listener.setExternalLocale(application.externalLocale());
                    $scope.$on('$destroy', function() {
                        application.eventRegistry.remove(listener);
                    });
                } else throw new Error('bin-href attribute is only supported on anchor elements!');

                function ExternalLocaleListener() {
                    this.setExternalLocale = function(locale) {
                        a.href = '/#!' + (locale ? '/' + locale : '') + attrs.binHref;
                    }
                }
            }
        };
    }

    function WireAngularDependencies() {
    }

    function ResolveExternalLocaleFromRoute($rootScope, application) {
        $rootScope.$on('$routeChangeStart', function (evt, n) {
            application.setExternalLocale(n.params.locale);
        });
    }

    function InitCaches(gatewaysAreInitialised, configIsInitialised, refreshD, cachesD, applicationD, application) {
        gatewaysAreInitialised.promise.then(function () {
            application.refresh(function () {
                refreshD.resolve();
                applicationD.resolve();
            });
        });

        configIsInitialised.promise.then(cachesD.resolve);
    }

    function IsInitialisedDeferredFactory($q) {
        return $q.defer();
    }

    function IsConfigInitialisedFactory($q, externalLocaleD, refreshD) {
        return $q.all([externalLocaleD.promise, refreshD.promise]);
    }

    function AreCachesInitialisedFactory(d) {
        return d.promise;
    }

    function IsApplicationInitialisedFactory(d) {
        return d.promise;
    }
})();
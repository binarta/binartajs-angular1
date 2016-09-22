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
        .factory('binartaApplicationAdhesiveReadingInitialised', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationCachesAreInitialised.deferred', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationIsInitialised.deferred', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationConfigIsInitialised', ['$q', 'binartaApplicationExternalLocaleIsSet.deferred', 'binartaApplicationRefresh', IsConfigInitialisedFactory])
        .factory('binartaApplicationCachesAreInitialised', ['binartaApplicationCachesAreInitialised.deferred', AreCachesInitialisedFactory])
        .factory('binartaApplicationIsInitialised', ['binartaApplicationIsInitialised.deferred', IsApplicationInitialisedFactory])
        .directive('binHref', ['application', BinHrefDirectiveFactory])
        .directive('binDhref', ['application', BinDhrefDirectiveFactory])
        .run(['application', WireAngularDependencies])
        .run(['$rootScope', 'application', InstallRouteChangeListeners])
        .run([
            'binartaGatewaysAreInitialised',
            'binartaApplicationRefresh',
            'binartaApplicationIsInitialised.deferred',
            'application',
            InitConfig
        ])
        .run([
            '$q',
            'binartaConfigIsInitialised',
            'binartaApplicationCachesAreInitialised.deferred',
            'binartaApplicationAdhesiveReadingInitialised',
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
            var externalLocale = -1;

            app.eventRegistry.add(new ExternalLocaleListener(app));

            app.externalLocale = function () {
                return externalLocale == -1 ? undefined : externalLocale;
            };

            app.setExternalLocale = function (locale) {
                var changed = externalLocale != locale;
                externalLocale = locale;
                if(changed)
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

    function DefaultBinHrefDirective(application, attributeName) {
        var directive = this;

        this.attributeName = attributeName || 'binHref';
        this.restrict = 'A';

        this.link = function ($scope, els, attrs) {
            directive.linkWithContext($scope, els, attrs, {});
        };

        this.linkWithContext = function ($scope, els, attrs, ctx) {
            var a = els[0];
            if (a.nodeName == 'A') {
                var listener = new ExternalLocaleListener(a, ctx);
                application.eventRegistry.add(listener);
                $scope.$on('$destroy', function () {
                    application.eventRegistry.remove(listener);
                });
                ctx.href = attrs[directive.attributeName];
                ctx.locale = application.externalLocale();
                directive.apply(a, ctx);
            } else throw new Error('bin-href attribute is only supported on anchor elements!');

            function ExternalLocaleListener(a, ctx) {
                this.setExternalLocale = function (locale) {
                    ctx.locale = locale;
                    directive.apply(a, ctx);
                }
            }
        };

        this.apply = function (a, ctx) {
            a.href = '/#!' + (ctx.locale ? '/' + ctx.locale : '') + ctx.href;
        }
    }

    function BinHrefDirectiveFactory(application) {
        return new DefaultBinHrefDirective(application);
    }

    function BinDhrefDirectiveFactory(application) {
        var directive = new DefaultBinHrefDirective(application, 'binDhref');
        var superLinkWithContext = directive.linkWithContext;
        directive.linkWithContext = function ($scope, els, attrs, ctx) {
            superLinkWithContext($scope, els, attrs, ctx);
            attrs.$observe('binDhref', function (href) {
                ctx.href = href;
                directive.apply(els[0], ctx);
            });
        };
        return directive;
    }

    function WireAngularDependencies() {
    }

    function InstallRouteChangeListeners($rootScope, application) {
        $rootScope.$on('$routeChangeStart', function (evt, n) {
            application.setExternalLocale(n.params.locale);
            application.adhesiveReading.read(application.unlocalizedPath());
        });
    }

    function InitConfig(gatewaysAreInitialised, refreshD, applicationD, application) {
        gatewaysAreInitialised.promise.then(function () {
            application.refresh(function () {
                refreshD.resolve();
                applicationD.resolve();
            });
        });
    }

    function InitCaches($q, configIsInitialised, cachesD, adhesiveReadingD, application) {
        var listener = new AdhesiveReadingListener();
        application.adhesiveReading.eventRegistry.add(listener);

        function AdhesiveReadingListener() {
            var listener = this;

            this.stop = function() {
                application.adhesiveReading.eventRegistry.remove(listener);
                adhesiveReadingD.resolve();
            }
        }

        configIsInitialised.promise.then(function() {
            $q.all([adhesiveReadingD.promise]).then(cachesD.resolve)
        });
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
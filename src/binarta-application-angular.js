(function () {
    var binarta;

    angular.module('binarta-applicationjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-applicationjs-gateways-angular1'
    ])
        .provider('application', ['binartaApplicationGatewayProvider', ApplicationProvider])
        .config(['binartaProvider', 'applicationProvider', ExtendBinarta])
        .factory('binartaReadRouteOnLocaleChange', AlwaysReadRouteOnLocaleChange)
        .factory('extendBinartaApplication', ['binartaApplicationExternalLocaleIsSet.deferred', '$location', 'binartaReadRouteOnLocaleChange', ExtendBinartaApplicationFactory])
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
        this.$get = ['$window', '$location', 'extendBinartaApplication', 'localStorage', 'sessionStorage', function ($window, $location, extend, localStorage, sessionStorage) {
            this.application.localStorage = localStorage;
            this.application.sessionStorage = sessionStorage;
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

    function AlwaysReadRouteOnLocaleChange() {
        return true;
    }

    function ExtendBinartaApplicationFactory(externalLocaleD, $location, readRouteOnLocaleChange) {
        function ExternalLocaleListener(app) {
            var listener = this;

            this.setLocale = function (locale) {
                app.eventRegistry.remove(listener);
                externalLocaleD.resolve();
            }
        }

        function ApplicationInitializer(app) {
            this.setLocale = function (locale) {
                if(readRouteOnLocaleChange) {
                    app.adhesiveReading.readRoute();
                }
            };

            this.applyLocale = function (locale) {
                $location.path('/' + locale + app.unlocalizedPath());
            };

            this.unlocalized = function () {
                $location.path(app.unlocalizedPath());
            };
        }

        return function (app) {
            app.eventRegistry.add(new ExternalLocaleListener(app));

            app.unlocalizedPath = function () {
                var locale = app.localeForPresentation();
                var path = $location.path();
                return locale ? path.replace('/' + locale, '') : path;
            };

            app.adhesiveReading.readRoute = function () {
                app.adhesiveReading.read(app.unlocalizedPath());
            };

            app.eventRegistry.add(new ApplicationInitializer(app));
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
                ctx.locale = application.localeForPresentation();
                directive.apply(a, ctx);
            } else throw new Error('bin-href attribute is only supported on anchor elements!');

            function ExternalLocaleListener(a, ctx) {
                this.setLocaleForPresentation = function (locale) {
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

    function WireAngularDependencies(application) {
        binarta = application.binarta;
    }

    function InstallRouteChangeListeners($rootScope, application) {
        $rootScope.$on('$routeChangeStart', function (evt, n) {
            if(n.redirectTo == undefined)
                application.setLocaleForPresentation(n.params.locale);
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

            this.stop = function () {
                application.adhesiveReading.eventRegistry.remove(listener);
                adhesiveReadingD.resolve();
            }
        }

        configIsInitialised.promise.then(function () {
            $q.all([adhesiveReadingD.promise]).then(cachesD.resolve);
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

    binComponentControllerExtenders.push(function ($ctrl) {
        $ctrl.config = new ComponentControllerConfig($ctrl);
    });

    function ComponentControllerPublicConfig($ctrl) {
        var self = this;

        self.observe = function (k, cb) {
            binarta.schedule(function () {
                $ctrl.addDestroyHandler(binarta.application.config.observePublic(k, cb).disconnect);
            });
        }
    }

    function ComponentControllerConfig($ctrl) {
        var config = this;

        config.public = new ComponentControllerPublicConfig($ctrl);
    }
})();
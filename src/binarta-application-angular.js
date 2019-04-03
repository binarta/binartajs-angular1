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
        .directive('binHref', ['$location', 'application', BinHrefDirectiveFactory])
        .directive('binDhref', ['$location', 'application', BinDhrefDirectiveFactory])
        .directive('binApplicationLock', ['binarta', 'application', ApplicationLockDirective])
        .component('cookiePermissionGranted', new CookiePermissionGrantedComponent())
        .component('binDns', new DNSComponent())
        .run(['application', WireAngularDependencies])
        .run(['$rootScope', 'application', '$location', InstallRouteChangeListeners])
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
        this.speak = 'Moooooo!';
        this.application = new BinartaApplicationjs();
        this.application.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', 'extendBinartaApplication', 'localStorage', 'sessionStorage', function ($window, $location, extend, localStorage, sessionStorage) {
            this.application.window = $window;
            this.application.localStorage = localStorage;
            this.application.sessionStorage = sessionStorage;
            this.ui.window = $window;
            this.ui.location = $location;
            extend(this.application);
            this.application.cookies.permission.evaluate();
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
            var self = this;

            this.applyLocale = function (locale) {
                $location.path('/' + locale + app.unlocalizedPath());
            };

            this.unlocalized = function () {
                $location.path(app.unlocalizedPath());
            };
        }

        return function (app) {
            app.eventRegistry.add(new ExternalLocaleListener(app));

            var localeSelected = false;
            app.localeSelected = function () {
                localeSelected = true;
            };
            app.isLocaleSelected = function () {
                return localeSelected;
            };

            app.unlocalizedPath = function () {
                var locale = app.localeForPresentation();
                var path = $location.path();
                return locale ? path.replace('/' + locale, '') : path;
            };

            var initializer = new ApplicationInitializer(app);
            app.eventRegistry.add(initializer);
        }
    }

    function DefaultBinHrefDirective($location, application, attributeName) {
        var directive = this,
            hashbang = '#!';

        this.attributeName = attributeName || 'binHref';
        this.restrict = 'A';

        this.link = function ($scope, els, attrs) {
            directive.linkWithContext($scope, els, attrs, {});
        };

        this.linkWithContext = function ($scope, els, attrs, ctx) {
            var a = els[0];
            if (a.nodeName === 'A') {
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
            var hashbangPrefix = shouldRetainHashbang() ? '/' + hashbang : '';
            var localePrefix = application.primaryLanguage() === ctx.locale ? '' : (ctx.locale ? '/' + ctx.locale : '');
            a.href = hashbangPrefix + localePrefix + ctx.href;
        };

        function shouldRetainHashbang() {
            return $location.absUrl().indexOf(hashbang) !== -1;
        }
    }

    function BinHrefDirectiveFactory($location, application) {
        return new DefaultBinHrefDirective($location, application);
    }

    function BinDhrefDirectiveFactory($location, application) {
        var directive = new DefaultBinHrefDirective($location, application, 'binDhref');
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

    function ApplicationLockDirective(binarta, app) {
        return {
            restrict: 'E',
            scope: true,
            link: function (scope) {
                scope.$lock = {status: app.lock.status};

                function applyLockStatus() {
                    scope.$lock.status = app.lock.status;
                }

                applyLockStatus();

                scope.$on('$destroy', app.eventRegistry.observe({
                    viewing: applyLockStatus,
                    editing: applyLockStatus
                }).disconnect);
            }
        }
    }

    function CookiePermissionGrantedComponent() {
        this.templateUrl = 'bin-all-cookie-notice.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            function updateStatus() {
                $ctrl.status = binarta.application.cookies.permission.status;
            }

            $ctrl.addInitHandler(updateStatus);

            $ctrl.grant = function () {
                binarta.application.cookies.permission.grant();
                updateStatus();
            };

            $ctrl.revoke = function () {
                binarta.application.cookies.permission.revoke();
                updateStatus();
            }
        })];
    }

    function DNSComponent() {
        this.templateUrl = 'bin-all-dns-component.html';
        this.bindings = {
            containerTemplate: '@'
        };
        this.controller = ['binarta', binComponentController(function () {
            var $ctrl = this;

            $ctrl.templateUrl = 'bin-all-dns-component-widget.html';
            $ctrl.i18n = {
                title: 'bin.dns.component.title'
            };

            $ctrl.observables = [{
                toObserver: function () {
                    return binarta.application.dns.observe({
                        status: function (it) {
                            $ctrl.working = it == 'working';
                            $ctrl.violationReport = undefined;
                        },
                        disabled: function () {
                            $ctrl.disabled = true;
                        },
                        records: function (it) {
                            $ctrl.records = it;
                        },
                        rejected: function (it) {
                            $ctrl.violationReport = it;
                        }
                    });
                }
            }];
            $ctrl.addInitHandler(function () {
                $ctrl.containerTemplate = $ctrl.containerTemplate || 'bin-all-dns-component-container-default.html';
                reset();
            });

            $ctrl.submit = function () {
                $ctrl[$ctrl.status]();
            };

            $ctrl.add = function () {
                $ctrl.records.push({
                    id: toNextIdx(),
                    type: $ctrl.draft.type,
                    name: $ctrl.draft.name,
                    values: toArray($ctrl.draft.values)
                });
                reset();
            };

            function toNextIdx() {
                return $ctrl.records.reduce(function(p, c) {
                    return c.id > p ? c.id : p;
                }, -1) + 1;
            }

            function reset() {
                $ctrl.draft = {};
                $ctrl.status = 'add';
            }

            function toArray(it) {
                return it.split(/[\r\n]+/);
            }

            $ctrl.remove = function (record) {
                $ctrl.records = $ctrl.records.filter(not(byTypeAndName(record)));
            };

            function byTypeAndName(x) {
                return function (y) {
                    return x.type == y.type && x.name == y.name
                }
            }

            function not(predicate) {
                return function (it) {
                    return !predicate(it);
                }
            }

            $ctrl.modify = function (record) {
                $ctrl.status = 'update';
                $ctrl.draft = {
                    type: record.type,
                    name: record.name,
                    values: record.values.join('\n')
                };
            };

            $ctrl.update = function () {
                var it = $ctrl.records.filter(byTypeAndName($ctrl.draft))[0];
                it.values = toArray($ctrl.draft.values);
                reset();
            };

            $ctrl.save = function () {
                binarta.application.dns.save($ctrl.records);
            };

            $ctrl.clear = reset;
        })];
    }

    function WireAngularDependencies(application) {
        binarta = application.binarta;
    }

    function InstallRouteChangeListeners($rootScope, application, $location) {
        $rootScope.$on('$routeChangeStart', function (evt, n) {
            if (n.redirectTo == undefined) {
                application.setLocaleForPresentation(n.params.locale);
            }
        });
    }

    function InitConfig(gatewaysAreInitialised, refreshD, applicationD, application) {
        gatewaysAreInitialised.promise.then(function () {
            var onRefresh = function () {
                refreshD.resolve();
                applicationD.resolve();
            };
            if (application.isRefreshed())
                onRefresh();
            else
                application.refresh(onRefresh());
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
        $ctrl.lock = new ComponentControllerLock($ctrl);
    });

    function ComponentControllerLock($ctrl) {
        var self = this;

        self.addHandler = function (it) {
            if (binarta.application.lock.status == 'open')
                it.viewing();
            else if (binarta.application.lock.status == 'closed')
                it.editing();
            var l = binarta.application.eventRegistry.observe(it);
            $ctrl.addDestroyHandler(function () {
                l.disconnect();
            });
        }
    }

    function ComponentControllerPublicConfig($ctrl) {
        var self = this;

        self.observe = function (k, cb) {
            binarta.schedule(function () {
                $ctrl.addDestroyHandler(binarta.application.config.observePublic(k, cb).disconnect);
            });
        };

        self.find = function (k, cb) {
            binarta.schedule(function () {
                binarta.application.config.findPublic(k, cb);
            });
        };
    }

    function ComponentControllerConfig($ctrl) {
        var config = this;

        config.public = new ComponentControllerPublicConfig($ctrl);
    }
})();
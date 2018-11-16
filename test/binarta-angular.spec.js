(function () {
    var ui;

    describe('binartajs-angular', function () {
        var binarta, $window, $document, $rootScope, $compile, $location, $routeParams, $ctrl, localStorage,
            sessionStorage, config;

        beforeEach(function () {
            ui = new UI();
        });
        beforeEach(module('binartajs-angular1-spec'));
        beforeEach(inject(function (_binarta_, _$window_, _$document_, _$rootScope_, _$compile_, _$location_, _$routeParams_, _localStorage_, _sessionStorage_, _config_) {
            binarta = _binarta_;
            $window = _$window_;
            $document = _$document_;
            $rootScope = _$rootScope_;
            $compile = _$compile_;
            $location = _$location_;
            $routeParams = _$routeParams_;
            localStorage = _localStorage_;
            sessionStorage = _sessionStorage_;
            config = _config_;

            binarta.checkpoint.profile.signout();
            binarta.shop.basket.clear();
        }));

        afterEach(function () {
            binarta.application.gateway.clear();
            localStorage.removeItem('locale');
            localStorage.removeItem('binartaJSPaymentProvider');
            localStorage.removeItem('cookiesAccepted');
            sessionStorage.removeItem('locale');
            sessionStorage.removeItem('binartaJSAwaitingConfirmationWithPaymentProvider');
            sessionStorage.removeItem('binartaJSSetupBillingAgreementReturnUrl');
            sessionStorage.removeItem('binartaJSAwaitingConfirmationWithPaymentProvider');
        });

        describe('binarta is initialised promise', function () {
            var initialisedBinarta, $rootScope, binartaIsInitialised, binartaGatewaysAreInitialised,
                binartaConfigIsInitialised, binartaCachesAreInitialised;

            beforeEach(inject(function (_$rootScope_, _binartaIsInitialised_, _binartaGatewaysAreInitialised_, _binartaConfigIsInitialised_, _binartaCachesAreInitialised_) {
                $rootScope = _$rootScope_;
                binartaIsInitialised = _binartaIsInitialised_;
                binartaGatewaysAreInitialised = _binartaGatewaysAreInitialised_;
                binartaConfigIsInitialised = _binartaConfigIsInitialised_;
                binartaCachesAreInitialised = _binartaCachesAreInitialised_;

                binartaIsInitialised.then(function (binarta) {
                    initialisedBinarta = binarta;
                });
            }));

            it('does not resolve when only gateways are initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                $rootScope.$digest();
                expect(initialisedBinarta).toBeUndefined();
            });

            it('does not resolve when only config is initialised', function () {
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(initialisedBinarta).toBeUndefined();
            });

            it('does not resolve when only gateways and config are initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(initialisedBinarta).toBeUndefined();
            });

            it('resolves when gateways and config and caches are initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                binartaCachesAreInitialised.resolve();
                $rootScope.$digest();
                expect(initialisedBinarta).toEqual(binarta);
            });

            it('config is initialised promise does not resolve when gateways are not initialised', function () {
                var spy = jasmine.createSpy('spy');
                binartaConfigIsInitialised.promise.then(spy);
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(spy).not.toHaveBeenCalled();
            });

            it('caches are initialised promise does not resolve when gateways are not initialised', function () {
                var spy = jasmine.createSpy('spy');
                binartaCachesAreInitialised.promise.then(spy);
                binartaCachesAreInitialised.resolve();
                $rootScope.$digest();
                expect(spy).not.toHaveBeenCalled();
            });

            it('caches are initialised promise does not resolve when config is not initialised', function () {
                var spy = jasmine.createSpy('spy');
                binartaCachesAreInitialised.promise.then(spy);
                binartaGatewaysAreInitialised.resolve();
                binartaCachesAreInitialised.resolve();
                $rootScope.$digest();
                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe('binContentHeader component', function () {
            var $ctrl;

            beforeEach(inject(function ($componentController) {
                $ctrl = $componentController('binContentHeader');
            }));

            it('titles are not inverted by default', function () {
                $ctrl.$onInit();
                expect($ctrl.inverted).toBeFalsy();
            });

            it('titles can be inverted by setting the inverted header titles flage on binarta', function () {
                binarta.invertedHeaderTitles = true;
                $ctrl.$onInit();
                expect($ctrl.inverted).toBeTruthy();
            });
        });

        describe('binViolations component', function () {
            var ctrl, timeout;

            beforeEach(inject(function (_$timeout_, $componentController) {
                ctrl = $componentController('binViolations');
                ctrl.fadeAfter = 100;
                timeout = _$timeout_;
            }));

            it('given there are no violations then onChanges does nothing', function () {
                ctrl.$onChanges();
                timeout.verifyNoPendingTasks();
            });

            describe('given there are violations', function () {
                beforeEach(function () {
                    ctrl.src = ['violation'];
                    ctrl.$onChanges();
                });

                describe('and timeout has not been reached', function () {
                    beforeEach(function () {
                        timeout.flush(ctrl.fadeAfter - 1);
                    });

                    it('then violations do not fade away', function () {
                        expect(ctrl.src).toEqual(['violation']);
                    });

                    it('then fade away is cancelled', function () {
                        ctrl.$onChanges();
                        timeout.flush(ctrl.fadeAfter - 1);
                        expect(ctrl.src).toEqual(['violation']);
                    });

                    it('then cancelled fade away completes after the timeout', function () {
                        ctrl.$onChanges();
                        timeout.flush(ctrl.fadeAfter);
                        timeout.verifyNoPendingTasks();
                    });
                });

                it('violations fade away once the timeout has been reached', function () {
                    timeout.flush(ctrl.fadeAfter);
                    expect(ctrl.src).toEqual([]);
                });
            });
        });

        describe('binPlatformSignature component', function () {
            var ctrl, $document, headSpy, metaSpy;

            beforeEach(inject(function ($componentController, _$document_) {
                $document = _$document_;
                headSpy = jasmine.createSpyObj('head', ['find', 'prepend']);
                headSpy.find.and.returnValue([]);
                $document.find = jasmine.createSpy('find').and.returnValue(headSpy);
                ctrl = $componentController('binPlatformSignature');
            }));

            function triggerBinartaSchedule() {
                binarta.application.adhesiveReading.read('-');
            }

            it('use Binarta signature by default', function () {
                triggerBinartaSchedule();
                expect(ctrl.signature).toEqual('binarta');
            });

            it('use brand-name from config', function () {
                binarta.application.config.cache('platform.brand', 'websters');
                triggerBinartaSchedule();
                expect(ctrl.signature).toEqual('websters');
            });

            describe('when metadata tag web_author does not exist', function () {
                beforeEach(function () {
                    triggerBinartaSchedule();
                });

                it('search for meta tag', function () {
                    expect(headSpy.find).toHaveBeenCalledWith('meta[name="web_author"]');
                });

                it('web_author meta tag is placed in head', function () {
                    expect(headSpy.prepend).toHaveBeenCalledWith('<meta name="web_author" content="Binarta">');
                });
            });

            describe('when metadata tag web_author already exist', function () {
                beforeEach(function () {
                    headSpy.find.and.returnValue([{}]);
                    triggerBinartaSchedule();
                });

                it('do nothing', function () {
                    expect(headSpy.prepend).not.toHaveBeenCalled();
                });
            });
        });

        describe('bin-affix class', function () {
            var handle, el, classes;

            beforeEach(inject(function (binAffix) {
                classes = [];
                el = {
                    parentElement: {
                        getBoundingClientRect: function () {
                            return {top: 'p'};
                        }
                    },
                    classList: {
                        add: function (it) {
                            classes.push(it);
                        },
                        remove: function () {
                            classes = [];
                        }
                    }
                };
                handle = binAffix.new(el);
            }));

            it('add affix class to element when scroll idx moves below 0', function () {
                handle.on(-1);
                expect(classes).toEqual(['affix']);
            });

            it('remove affix class to element when scroll idx moves to 0', function () {
                classes = ['affix'];
                handle.on(0);
                expect(classes).toEqual([]);
            });

            it('remove affix class to element when scroll idx moves above 0', function () {
                classes = ['affix'];
                handle.on(1);
                expect(classes).toEqual([]);
            });

            it('given $window does not support animation frames when callback is executed then execute in current thread', function () {
                handle.withScrollIndex = jasmine.createSpy();
                handle.withAnimationFrame();
                expect(handle.withScrollIndex).toHaveBeenCalled();
            });

            describe('given $window supports request animation frame when callback is executed', function () {
                beforeEach(function () {
                    $window.requestAnimationFrame = jasmine.createSpy();
                    handle.withScrollIndex = jasmine.createSpy();
                    handle.withAnimationFrame();
                });

                it('then animation frame is requested', function () {
                    expect($window.requestAnimationFrame).toHaveBeenCalled();
                });

                it('then execute in animation frame', function () {
                    $window.requestAnimationFrame.calls.mostRecent().args[0]();
                    expect(handle.withScrollIndex).toHaveBeenCalled();
                });
            });

            it('with scroll index fetches the scroll index from the element and executes the callback', function () {
                handle.on = jasmine.createSpy();
                handle.withScrollIndex();
                expect(handle.on).toHaveBeenCalledWith('p');
            });
        });

        describe('component controller decorator', function () {
            var spy1, spy2;

            beforeEach(inject(function ($controller) {
                $ctrl = $controller('TestComponentController'); // Mind how this controller has been declared
                spy1 = jasmine.createSpy('spy1');
                spy2 = jasmine.createSpy('spy2');
            }));

            it('installs an $onInit function on the controller', function () {
                $ctrl.$onInit();
            });

            it('$onInit executes one or more init handlers', function () {
                $ctrl.addInitHandler(spy1);
                $ctrl.addInitHandler(spy2);

                $ctrl.$onInit();

                expect(spy1).toHaveBeenCalled();
                expect(spy2).toHaveBeenCalled();
            });

            it('init handlers added after $onInit executed are still invoked', function () {
                $ctrl.$onInit();
                $ctrl.addInitHandler(spy1);
                expect(spy1).toHaveBeenCalled();
            });

            it('installs an $onDestroy function on the controller', function () {
                $ctrl.$onDestroy();
            });

            it('$onDestroy executes one or more destroy handlers', function () {
                $ctrl.addDestroyHandler(spy1);
                $ctrl.addDestroyHandler(spy2);

                $ctrl.$onDestroy();

                expect(spy1).toHaveBeenCalled();
                expect(spy2).toHaveBeenCalled();
            });

            it('destroy handlers added after $onDestroy executed are still invoked', function () {
                $ctrl.$onDestroy();
                $ctrl.addDestroyHandler(spy1);
                expect(spy1).toHaveBeenCalled();
            });
        });

        describe('binarta-applicationjs-angular1', function () {
            var $rootScope, binartaApplicationRefresh, binartaApplicationAdhesiveReadingInitialised,
                binartaApplicationConfigIsInitialised, binartaApplicationCachesAreInitialised,
                binartaApplicationIsInitialised, binartaGatewaysAreInitialised, binartaConfigIsInitialised;
            var isApplicationRefreshedListener, isAdhesiveReadingInitialisedListener,
                isApplicationConfigInitialisedListener, areApplicationCachesInitialisedListener,
                applicationIsInitialisedListener;

            beforeEach(inject(function (_$rootScope_, _binartaApplicationRefresh_, _binartaApplicationAdhesiveReadingInitialised_, _binartaApplicationConfigIsInitialised_, _binartaApplicationCachesAreInitialised_, _binartaApplicationIsInitialised_, _binartaGatewaysAreInitialised_, _binartaConfigIsInitialised_) {
                $rootScope = _$rootScope_;
                binartaApplicationRefresh = _binartaApplicationRefresh_;
                binartaApplicationAdhesiveReadingInitialised = _binartaApplicationAdhesiveReadingInitialised_;
                binartaApplicationConfigIsInitialised = _binartaApplicationConfigIsInitialised_;
                binartaApplicationCachesAreInitialised = _binartaApplicationCachesAreInitialised_;
                binartaApplicationIsInitialised = _binartaApplicationIsInitialised_;
                binartaGatewaysAreInitialised = _binartaGatewaysAreInitialised_;
                binartaConfigIsInitialised = _binartaConfigIsInitialised_;

                isApplicationRefreshedListener = jasmine.createSpy('is-application-refreshed');
                binartaApplicationRefresh.promise.then(isApplicationRefreshedListener);

                isAdhesiveReadingInitialisedListener = jasmine.createSpy('is-adhesive-reading-initialised');
                binartaApplicationAdhesiveReadingInitialised.promise.then(isAdhesiveReadingInitialisedListener);

                isApplicationConfigInitialisedListener = jasmine.createSpy('is-application-config-initialised');
                binartaApplicationConfigIsInitialised.then(isApplicationConfigInitialisedListener);

                areApplicationCachesInitialisedListener = jasmine.createSpy('are-application-caches-initialised');
                binartaApplicationCachesAreInitialised.then(areApplicationCachesInitialisedListener);

                applicationIsInitialisedListener = jasmine.createSpy('is-application-initialised');
                binartaApplicationIsInitialised.then(applicationIsInitialisedListener);
            }));

            it('application config is not initialised before the binarta gateways are initialised', function () {
                expect(isApplicationConfigInitialisedListener).not.toHaveBeenCalled();
            });

            it('when binarta gateways are initialised then application config is not yet initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                $rootScope.$digest();
                expect(isApplicationConfigInitialisedListener).not.toHaveBeenCalled();
            });

            it('when binarta gateways are initialised then application refresh is completed', function () {
                binartaGatewaysAreInitialised.resolve();
                $rootScope.$digest();
                expect(isApplicationRefreshedListener).toHaveBeenCalled();
            });

            describe('when binarta gateways are initialised and an application profile was manually loaded then skip application refresh', function () {
                beforeEach(function () {
                    binarta.application.setProfile({name: 'test-application-profile'});
                    binarta.application.gateway = {
                        clear: function () {
                        }
                    };
                    binartaGatewaysAreInitialised.resolve();
                    $rootScope.$digest();
                });

                it('and application refresh listener is resolved', function () {
                    expect(isApplicationRefreshedListener).toHaveBeenCalled();
                });

                it('and application is initialised listener is resolved', function () {
                    expect(applicationIsInitialisedListener).toHaveBeenCalled();
                });
            });

            it('application caches are not initialised before the binarta config is initialised', function () {
                expect(areApplicationCachesInitialisedListener).not.toHaveBeenCalled();
            });

            it('when binarta gateways and config are initialised then application caches are not yet initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(areApplicationCachesInitialisedListener).not.toHaveBeenCalled();
            });

            it('when binarta gateways and config are initialised then application is also initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(applicationIsInitialisedListener).toHaveBeenCalled();
            });

            it('external locale is undefined when not specified on route params', function () {
                $rootScope.$broadcast('$routeChangeStart', {params: {}});
                $rootScope.$digest();
                expect(binarta.application.localeForPresentation()).toBeUndefined();
            });

            it('external locale matches the value from route params', function () {
                $rootScope.$broadcast('$routeChangeStart', {params: {locale: 'en'}});
                $rootScope.$digest();
                expect(binarta.application.localeForPresentation()).toEqual('en');
            });

            it('external locale matches changes in route params', function () {
                $rootScope.$broadcast('$routeChangeStart', {params: {locale: 'en'}});
                $rootScope.$broadcast('$routeChangeStart', {params: {locale: 'nl'}});
                $rootScope.$digest();
                expect(binarta.application.localeForPresentation()).toEqual('nl');
            });

            it('resolving locale uninstalls the external locale listener used to resolve an internal promise for tracking configuration completion', function () {
                binarta.application.setLocale('-');
                var uninstalled = true;
                binarta.application.eventRegistry.forEach(function (l) {
                    if (l.constructor.name == 'ExternalLocaleListener')
                        uninstalled = false;
                });
                expect(uninstalled).toBeTruthy();
            });

            it('resolving external locale is not enough to resolve application config', function () {
                $rootScope.$broadcast('$routeChangeStart', {params: {}});
                $rootScope.$digest();
                expect(isApplicationConfigInitialisedListener).not.toHaveBeenCalled();
            });

            it('when gateways and external locale are resolved then application config also resolves', function () {
                binarta.application.setLocale('-');
                binartaGatewaysAreInitialised.resolve();
                $rootScope.$digest();
                expect(isApplicationConfigInitialisedListener).toHaveBeenCalled();
            });

            it('unlocalized path when no external locale is specified', function () {
                $location.path('/');
                expect(binarta.application.unlocalizedPath()).toEqual('/');
            });

            it('unlocalized path with external locale specified', function () {
                $location.path('/en/');
                binarta.application.setLocaleForPresentation('en');
                expect(binarta.application.unlocalizedPath()).toEqual('/');
            });

            describe('locale helper', function () {
                beforeEach(function () {
                    $location.path('/');
                });

                it('given neither the primary language and the external locale have been set yet then the application locale is still undefined', function () {
                    expect(binarta.application.locale()).toBeUndefined();
                });

                it('given the primary language is set but the external locale has not been set yet then the application locale is still undefined', function () {
                    setPrimaryLanguage(undefined);
                    expect(binarta.application.locale()).toBeUndefined();
                });

                it('given the external locale is set but the primary language has not been set yet then the application locale is still undefined', function () {
                    setLocaleForPresentation(undefined);
                    expect(binarta.application.locale()).toBeUndefined();
                });

                describe('given both the primary language and the external locale are undefined', function () {
                    beforeEach(function () {
                        setPrimaryLanguage(undefined);
                        setLocaleForPresentation(undefined);
                    });

                    it('then set the application locale to default', function () {
                        expect(binarta.application.locale()).toEqual('default');
                    });

                    it('then application caches are initialised', function () {
                        binartaConfigIsInitialised.resolve();
                        $rootScope.$digest();
                        expect(isAdhesiveReadingInitialisedListener).toHaveBeenCalled();
                        expect(areApplicationCachesInitialisedListener).toHaveBeenCalled();
                    });
                });

                it('given the primary language is set then route redirects are ignored to prevent endless digest loops', function () {
                    setPrimaryLanguage('en');
                    $rootScope.$broadcast('$routeChangeStart', {redirectTo: '-', params: {}});
                    expect($location.path()).toEqual('/');
                });

                describe('given the primary language is set and the external locale is undefined', function () {
                    beforeEach(function () {
                        setPrimaryLanguage('en');
                        setLocaleForPresentation(undefined);
                    });

                    it('then stay on unlocalized path', function () {
                        expect($location.path()).toEqual('/');
                    });

                    it('then application caches are initialised', function () {
                        binartaConfigIsInitialised.resolve();
                        $rootScope.$digest();
                        expect(isAdhesiveReadingInitialisedListener).toHaveBeenCalled();
                        expect(areApplicationCachesInitialisedListener).toHaveBeenCalled();
                    });
                });

                describe('given the external locale is set and the primary language is undefined', function () {
                    beforeEach(function () {
                        $location.path('/en/');
                        setPrimaryLanguage(undefined);
                        setLocaleForPresentation('en');
                    });

                    it('then redirect to the unlocalized path', function () {
                        expect($location.path()).toEqual('/');
                    });

                    it('then application caches are not initialised', function () {
                        binartaConfigIsInitialised.resolve();
                        $rootScope.$digest();
                        expect(isAdhesiveReadingInitialisedListener).not.toHaveBeenCalled();
                        expect(areApplicationCachesInitialisedListener).not.toHaveBeenCalled();
                    });
                });

                describe('given the primary language and the external locale match', function () {
                    beforeEach(function () {
                        $location.path('/en/');
                        setPrimaryLanguage('en');
                        setLocaleForPresentation('en');
                    });

                    it('then the path remains unchanged', function () {
                        expect($location.path()).toEqual('/en/');
                    });

                    it('then the locale is set to default', function () {
                        expect(binarta.application.locale()).toEqual('default');
                    });

                    it('then application caches are initialised', function () {
                        binartaConfigIsInitialised.resolve();
                        $rootScope.$digest();
                        expect(isAdhesiveReadingInitialisedListener).toHaveBeenCalled();
                        expect(areApplicationCachesInitialisedListener).toHaveBeenCalled();
                    });
                });

                describe('when the external locale is not one of the supported languages', function () {
                    beforeEach(function () {
                        $location.path('/fr/');
                        setPrimaryLanguage('en');
                        setLocaleForPresentation('fr');
                    });

                    it('then redirect to the primary language', function () {
                        expect($location.path()).toEqual('/en/');
                    });

                    it('then application caches are not initialised', function () {
                        binartaConfigIsInitialised.resolve();
                        $rootScope.$digest();
                        expect(isAdhesiveReadingInitialisedListener).not.toHaveBeenCalled();
                        expect(areApplicationCachesInitialisedListener).not.toHaveBeenCalled();
                    });
                });

                describe('given the primary language and the external locale do not match', function () {
                    beforeEach(function () {
                        $location.path('/fr/');
                        setSupportedLanguages(['en', 'fr']);
                        setLocaleForPresentation('fr');
                    });

                    it('then the path remains unchanged', function () {
                        expect($location.path()).toEqual('/fr/');
                    });

                    it('then the locale is set to match the external locale', function () {
                        expect(binarta.application.locale()).toEqual('fr');
                    });

                    it('then application caches are initialised', function () {
                        binartaConfigIsInitialised.resolve();
                        $rootScope.$digest();
                        expect(isAdhesiveReadingInitialisedListener).toHaveBeenCalled();
                        expect(areApplicationCachesInitialisedListener).toHaveBeenCalled();
                    });
                });

                describe('given both the primary language and the external locale are set', function () {
                    var spy;

                    beforeEach(function () {
                        spy = jasmine.createSpyObj('spy', ['start']);
                        binarta.application.adhesiveReading.eventRegistry.add(spy);

                        $location.path('/en/');
                        setSupportedLanguages(['en', 'fr']);
                        setLocaleForPresentation('en');
                    });

                    it('when setting the external locale to the same value then adhesive reading is not executed', function () {
                        setLocaleForPresentation('en');
                        expect(spy.start).toHaveBeenCalledTimes(1);
                    });

                    it('when setting the external locale to a different value then adhesive reading is executed', function () {
                        setLocaleForPresentation('fr');
                        expect(spy.start).toHaveBeenCalledTimes(2);
                    });

                    it('when removing language support for a language not matching the external locale then adhesive reading is not executed', function () {
                        setSupportedLanguages(['en']);
                        expect(spy.start).toHaveBeenCalledTimes(1);
                    });

                    it('when removing language support for a language matching the external locale then redirect to the primary language', function () {
                        setPrimaryLanguage('fr');
                        binarta.application.refreshEvents();
                        expect($location.path()).toEqual('/fr/');
                    });
                });
            });

            it('when binarta gateways and config are initialised and initial adhesive reading section is read then application caches are initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                binarta.application.adhesiveReading.read('-');
                $rootScope.$digest();
                expect(areApplicationCachesInitialisedListener).toHaveBeenCalled();
            });

            it('when initial adhesive reading section is read the adhesive reading listener is uninstalled', function () {
                binarta.application.adhesiveReading.read('-');
                expectAdhesiveReadingListenerUninstalled('AdhesiveReadingListener');
            });

            describe('<a bin-href="?"></a>', function () {
                var a;

                beforeEach(function () {
                    binarta.application.setProfile({supportedLanguages: ['en', 'fr']});
                    binarta.application.setLocaleForPresentation(undefined);
                });

                afterEach(function () {
                    if (a)
                        a.remove();
                });

                it('only applies to anchor elements', function () {
                    expect(function () {
                        $compile('<div bin-href="/"></div>')($rootScope.$new());
                        $rootScope.$digest();
                    }).toThrowError('bin-href attribute is only supported on anchor elements!');
                });

                it('remains unchanged when no external locale is specified', function () {
                    a = $compile('<a bin-href="/"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');
                });

                it('limited expression support', function () {
                    a = $compile('<a bin-href="/{{\'x\'}}"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/x');
                });

                it('expression updates do not modify the underlying href', function () {
                    var $scope = $rootScope.$new();
                    $scope.x = 'a';
                    a = $compile('<a bin-href="/{{x}}"></a>')($scope)[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/a');

                    $scope.x = 'b';
                    $rootScope.$digest();
                    expectHref(a).toEqual('/a');
                });

                it('remains unchanged when external locale matches primary language', function () {
                    binarta.application.setLocaleForPresentation('en');
                    a = $compile('<a bin-href="/"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');
                });

                it('prepends external local when external locale is specified', function () {
                    binarta.application.setLocaleForPresentation('fr');
                    a = $compile('<a bin-href="/"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/fr/');
                });

                it('when external locale is updated so does the href', function () {
                    a = $compile('<a bin-href="/"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');

                    binarta.application.setLocaleForPresentation('fr');
                    $rootScope.$digest();
                    expectHref(a).toEqual('/fr/');
                });

                describe('when current path contains a hashbang (#!)', function () {
                    beforeEach(function () {
                        $location.absUrl = function () {
                            return 'http://test/#!/';
                        };
                    });

                    it('retain hashbang in href', function () {
                        a = $compile('<a bin-href="/"></a>')($rootScope.$new())[0];
                        $rootScope.$digest();
                        expectHref(a).toEqual('/#!/');
                    });
                });

                it('when $scope is destroyed changes to the external locale are no longer picked up', function () {
                    var $scope = $rootScope.$new();
                    a = $compile('<a bin-href="/"></a>')($scope)[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');

                    $scope.$destroy();
                    $rootScope.$digest();

                    binarta.application.setLocaleForPresentation('en');
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');
                });
            });

            describe('<a bin-dhref="?"></a>', function () {
                var a;

                beforeEach(function () {
                    binarta.application.setProfile({supportedLanguages: ['en', 'fr']});
                    binarta.application.setLocaleForPresentation(undefined);
                });

                afterEach(function () {
                    if (a)
                        a.remove();
                });

                it('only applies to anchor elements', function () {
                    expect(function () {
                        $compile('<div bin-dhref="/"></div>')($rootScope.$new());
                        $rootScope.$digest();
                    }).toThrowError('bin-href attribute is only supported on anchor elements!');
                });

                it('remains unchanged when no external locale is specified', function () {
                    a = $compile('<a bin-dhref="/"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');
                });

                it('limited expression support', function () {
                    a = $compile('<a bin-dhref="/{{\'x\'}}"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/x');
                });

                it('expression updates modify the underlying href', function () {
                    var $scope = $rootScope.$new();
                    $scope.x = 'a';
                    a = $compile('<a bin-dhref="/{{x}}"></a>')($scope)[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/a');

                    $scope.x = 'b';
                    $rootScope.$digest();
                    expectHref(a).toEqual('/b');
                });

                it('remains unchanged when external local matches primary language', function () {
                    binarta.application.setLocaleForPresentation('en');
                    a = $compile('<a bin-dhref="/"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');
                });

                it('prepends external local when external locale is specified', function () {
                    binarta.application.setLocaleForPresentation('fr');
                    a = $compile('<a bin-dhref="/"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/fr/');
                });

                it('when external locale is updated so does the href', function () {
                    a = $compile('<a bin-dhref="/"></a>')($rootScope.$new())[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');

                    binarta.application.setLocaleForPresentation('fr');
                    $rootScope.$digest();
                    expectHref(a).toEqual('/fr/');
                });

                describe('when current path contains a hashbang (#!)', function () {
                    beforeEach(function () {
                        $location.absUrl = function () {
                            return 'http://test/#!/';
                        };
                    });

                    it('retain hashbang in href', function () {
                        a = $compile('<a bin-dhref="/"></a>')($rootScope.$new())[0];
                        $rootScope.$digest();
                        expectHref(a).toEqual('/#!/');
                    });
                });

                it('when $scope is destroyed changes to the external locale are no longer picked up', function () {
                    var $scope = $rootScope.$new();
                    a = $compile('<a bin-dhref="/"></a>')($scope)[0];
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');

                    $scope.$destroy();
                    $rootScope.$digest();

                    binarta.application.setLocaleForPresentation('en');
                    $rootScope.$digest();
                    expectHref(a).toEqual('/');
                });
            });

            describe('<cookie-permission-granted/>', function () {
                beforeEach(inject(function ($componentController) {
                    $ctrl = $componentController('cookiePermissionGranted', undefined, {});
                    $ctrl.$onInit();
                }));

                it('exposes cookie permission status', function () {
                    expect($ctrl.status).toEqual('permission-required');
                });

                it('grant permission', function () {
                    $ctrl.grant();
                    expect($ctrl.status).toEqual('permission-granted');
                });

                it('revoke permission', function () {
                    $ctrl.revoke();
                    expect($ctrl.status).toEqual('permission-revoked');
                });
            });

            describe('component controller decorator', function () {
                var spy;

                beforeEach(inject(function ($controller) {
                    spy = jasmine.createSpy('-');
                    $ctrl = $controller('TestComponentController'); // Mind how this controller has been declared
                }));

                it('is wired with angular dependencies', inject(function (dependencyA, dependencyB) {
                    expect($ctrl.constructorArguments[0]).toEqual(dependencyA);
                    expect($ctrl.constructorArguments[1]).toEqual(dependencyB);
                }));

                it('exposes custom attributes', function () {
                    expect($ctrl.customAttribute).toEqual('custom-attribute');
                });

                describe('given an add init handler', function () {
                    beforeEach(function () {
                        $ctrl.addInitHandler(function () {
                            $ctrl.message = 'Hello World!';
                        });
                    });

                    it('which is executed $onInit()', function () {
                        $ctrl.$onInit();
                        expect($ctrl.message).toEqual('Hello World!');
                    });

                    it('which is specific to the controller instance', inject(function ($controller) {
                        var $ctrl2 = $controller('TestComponentController');
                        $ctrl.$onInit();
                        expect($ctrl2.message).toBeUndefined();
                    }));

                    it('other controller instance can install their own init handlers', inject(function ($controller) {
                        var $ctrl2 = $controller('TestComponentController');
                        $ctrl2.addInitHandler(function () {
                            $ctrl2.message = 'Hello Joe!';
                        });
                        $ctrl2.$onInit();
                        expect($ctrl2.message).toEqual('Hello Joe!');
                    }));
                });

                describe('given an add destroy handler', function () {
                    beforeEach(function () {
                        $ctrl.addDestroyHandler(function () {
                            $ctrl.message = 'Hello World!';
                        });
                    });

                    it('which is executed $onDestroy()', function () {
                        $ctrl.$onDestroy();
                        expect($ctrl.message).toEqual('Hello World!');
                    });

                    it('which is specific to the controller instance', inject(function ($controller) {
                        var $ctrl2 = $controller('TestComponentController');
                        $ctrl.$onDestroy();
                        expect($ctrl2.message).toBeUndefined();
                    }));

                    it('other controller instance can install their own init handlers', inject(function ($controller) {
                        var $ctrl2 = $controller('TestComponentController');
                        $ctrl2.addDestroyHandler(function () {
                            $ctrl2.message = 'Hello Joe!';
                        });
                        $ctrl2.$onDestroy();
                        expect($ctrl2.message).toEqual('Hello Joe!');
                    }));
                });

                describe('observing public config', function () {
                    beforeEach(function () {
                        binarta.application.gateway.addSectionData({type: 'config', key: 'k'});
                        binarta.application.gateway.addPublicConfig({id: 'k', value: 'v'});
                        binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger

                        $ctrl.config.public.observe('k', spy);
                    });

                    it('triggers immediately with current known config value', function () {
                        expect(spy).toHaveBeenCalledWith('v')
                    });

                    it('triggers for updates', function () {
                        binarta.application.config.cache('k', '-');
                        expect(spy).toHaveBeenCalledWith('-')
                    });

                    it('disconnects $onDestroy', function () {
                        $ctrl.$onDestroy();
                        binarta.application.config.cache('k', '-');
                        expect(spy).not.toHaveBeenCalledWith('-')
                    });
                });

                describe('find public config', function () {
                    describe('with known value', function () {
                        beforeEach(function () {
                            binarta.application.gateway.addPublicConfig({id: 'k', value: 'v'});
                            binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                            $ctrl.config.public.find('k', spy);
                        });

                        it('triggers immediately with current known config value', function () {
                            expect(spy).toHaveBeenCalledWith('v')
                        });
                    });

                    describe('with unknown value', function () {
                        beforeEach(function () {
                            binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                            $ctrl.config.public.find('k', spy);
                        });

                        it('triggers immediately with current known config value', function () {
                            expect(spy).toHaveBeenCalledWith('')
                        });
                    });
                });

                describe('observe application lock', function () {
                    var spy;

                    beforeEach(function () {
                        spy = jasmine.createSpyObj('handler', ['editing', 'viewing']);
                    });

                    it('triggers viewing when lock is currently open', function () {
                        $ctrl.lock.addHandler(spy);
                        expect(spy.viewing).toHaveBeenCalled();
                    });

                    it('triggers editing when lock is currently closed', function () {
                        binarta.application.lock.reserve();
                        $ctrl.lock.addHandler(spy);
                        expect(spy.editing).toHaveBeenCalled();
                    });

                    it('triggers editing when lock is closed', function () {
                        $ctrl.lock.addHandler(spy);
                        binarta.application.lock.reserve();
                        expect(spy.viewing).toHaveBeenCalled();
                    });

                    it('triggers viewing when lock is released', function () {
                        $ctrl.lock.addHandler(spy);
                        binarta.application.lock.reserve();
                        binarta.application.lock.release();
                        expect(spy.viewing.calls.count()).toEqual(2);
                    });

                    it('no events are received after the controller has been destroyed', function () {
                        $ctrl.lock.addHandler(spy);
                        $ctrl.$onDestroy();
                        binarta.application.lock.reserve();
                        expect(spy.editing).not.toHaveBeenCalled();
                    });
                });

                describe('<bin-application-lock/>', function () {
                    var template;

                    beforeEach(function () {
                        template = '<bin-application-lock>' +
                            '<div ng-if="$lock.status == \'open\'">open</div>' +
                            '<div ng-if="$lock.status == \'closed\'">closed</div>' +
                            '</bin-application-lock>';
                    });

                    it('render based on open lock', function () {
                        var doc = $compile(template)($rootScope.$new());
                        $rootScope.$digest();
                        expect(doc.html().replace(/<!--[\s\S]*?-->/g, '')).toEqual('<div ng-if="$lock.status == \'open\'" class="ng-scope">open</div>');
                    });

                    it('render based on closed lock', function () {
                        binarta.application.lock.reserve();
                        var doc = $compile(template)($rootScope.$new());
                        $rootScope.$digest();
                        expect(doc.html().replace(/<!--[\s\S]*?-->/g, '')).toEqual('<div ng-if="$lock.status == \'closed\'" class="ng-scope">closed</div>');
                    });
                });
            });

            function expectHref(a) {
                return expect(a.href.replace(/^http:\/\/[^\/]+\//, '/'));
            }

            function setPrimaryLanguage(locale) {
                setSupportedLanguages(locale ? [locale] : [])
            }

            function setSupportedLanguages(languages) {
                if (languages.length > 0)
                    binarta.application.gateway.updateApplicationProfile({supportedLanguages: languages});
                binartaGatewaysAreInitialised.resolve();
                $rootScope.$digest();
            }

            function setLocaleForPresentation(locale) {
                $rootScope.$broadcast('$routeChangeStart', {params: {locale: locale}});
            }
        });

        describe('binarta-mediajs-angular1', function () {
            describe('images sub module', function () {
                beforeEach(function () {
                    config.namespace = 'N';
                    $location.path('/en/');
                    binarta.application.setLocaleForPresentation('en');
                });

                it('toURL is decorated to add the section parameter', function () {
                    expect(binarta.media.images.toURL({
                        path: 'bg.img',
                        width: 200
                    })).toEqual('bg.img?width=200&section=/');
                });

                it('toRelativeURL creates a valid relative image url', function () {
                    expect(binarta.media.images.toRelativeURL({
                        path: 'bg.img',
                        width: 200
                    })).toEqual('image/N/bg.img?width=200&section=/');
                });
            });
        });

        describe('binarta-checkpointjs-angular1', function () {
            var db;

            beforeEach(inject(function (binartaCheckpointGateway) {
                db = binartaCheckpointGateway;
            }));

            it('binarta is extended with checkpoint', function () {
                expect(binarta.checkpoint).toBeDefined();
            });

            it('on profile refresh is authenticated', function () {
                binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                binarta.checkpoint.profile.refresh();
                expect(binarta.checkpoint.profile.isAuthenticated()).toEqual(true);
            });

            describe('CheckpointController', function () {
                var ctrl;

                beforeEach(inject(function ($controller, config) {
                    config.recaptchaPublicKey = 'recaptcha-public-key';
                    ctrl = $controller('CheckpointController');
                }));

                it('submit is not supported before an operation mode is chosen', function () {
                    expect(ctrl.submit).toThrowError('checkpoint.submit.requires.an.operation.mode.to.be.selected')
                });

                it('while no operation mode is selected the system is in idle state', function () {
                    expect(ctrl.status()).toEqual('idle');
                });

                describe('when initialised for signin', function () {
                    beforeEach(function () {
                        ctrl.mode = 'signin';
                        ctrl.$onInit();
                    });

                    it('then system is still in idle state', function () {
                        expect(ctrl.status()).toEqual('idle');
                    });

                    it('then form submission with invalid credentials is rejected', function () {
                        ctrl.username = '-';
                        ctrl.password = '-';
                        ctrl.submit();
                        expect(ctrl.status()).toEqual('rejected');
                        expect(ctrl.violationReport()).toEqual('credentials.mismatch');
                    });

                    it('then form submission with valid credentials is accepted', function () {
                        db.register({username: 'valid', password: 'credentials'}, new ExpectSuccessResponse());

                        ctrl.username = 'valid';
                        ctrl.password = 'credentials';
                        ctrl.submit();

                        expect(ctrl.status()).toEqual('authenticated');
                    });

                    it('then form submission with valid credentials triggers an optional event listener', function () {
                        db.register({username: 'valid', password: 'credentials'}, new ExpectSuccessResponse());
                        var listener = jasmine.createSpyObj('listener', ['success']);

                        ctrl.listener = listener;
                        ctrl.username = 'valid';
                        ctrl.password = 'credentials';
                        ctrl.submit();

                        expect(listener.success).toHaveBeenCalled();
                    });

                    it('then controller can be switched to registration mode', function () {
                        ctrl.switchToRegistrationMode();
                        expect(ctrl.mode).toEqual('registration');
                    });

                    it('switching to registration mode resets input', function () {
                        ctrl.email = 'e';
                        ctrl.username = 'u';
                        ctrl.password = 'p';
                        ctrl.company = 'c';
                        ctrl.vat = 'v';
                        ctrl.captcha = 'c';

                        ctrl.switchToRegistrationMode();

                        expect(ctrl.email).toBeUndefined();
                        expect(ctrl.username).toBeUndefined();
                        expect(ctrl.password).toBeUndefined();
                        expect(ctrl.company).toBeUndefined();
                        expect(ctrl.vat).toBeUndefined();
                        expect(ctrl.captcha).toBeUndefined();
                    });
                });

                describe('when initialised for registration', function () {
                    beforeEach(function () {
                        ctrl.mode = 'registration';
                        ctrl.$onInit();
                    });

                    it('should expose the public recaptcha key', function () {
                        expect(ctrl.recaptchaPublicKey).toEqual(config.recaptchaPublicKey);
                    });

                    it('then system is still in idle state', function () {
                        expect(ctrl.status()).toEqual('idle');
                    });

                    it('then form submission with invalid credentials is rejected', function () {
                        ctrl.password = 'invalid';
                        ctrl.submit();
                        expect(ctrl.status()).toEqual('rejected');
                        expect(ctrl.violationReport()).toEqual({password: ['invalid']});
                    });

                    it('then form submission with valid credentials is accepted', function () {
                        ctrl.email = 'valid';
                        ctrl.password = 'credentials';
                        ctrl.submit();
                        expect(ctrl.status()).toEqual('registered');
                    });

                    it('then form submission with valid credentials triggers an optional event listener', function () {
                        var listener = jasmine.createSpyObj('listener', ['success']);

                        ctrl.listener = listener;
                        ctrl.email = 'valid';
                        ctrl.password = 'credentials';
                        ctrl.submit();

                        expect(listener.success).toHaveBeenCalled();
                    });

                    it('then controller can be switched to signin mode', function () {
                        ctrl.switchToSigninMode();
                        expect(ctrl.mode).toEqual('signin');
                    });

                    it('switching to signin mode resets input', function () {
                        ctrl.email = 'e';
                        ctrl.username = 'u';
                        ctrl.password = 'p';
                        ctrl.company = 'c';
                        ctrl.vat = 'v';
                        ctrl.captcha = 'c';

                        ctrl.switchToSigninMode();

                        expect(ctrl.email).toBeUndefined();
                        expect(ctrl.username).toBeUndefined();
                        expect(ctrl.password).toBeUndefined();
                        expect(ctrl.company).toBeUndefined();
                        expect(ctrl.vat).toBeUndefined();
                        expect(ctrl.captcha).toBeUndefined();
                    });

                    it('should remove the recaptcha key when switching to signin mode', function () {
                        ctrl.switchToSigninMode();

                        expect(ctrl.recaptchaPublicKey).toBeUndefined();
                    })
                });
            });

            describe('component controller decorator', function () {
                var spy;

                beforeEach(inject(function ($controller) {
                    spy = jasmine.createSpyObj('handler', ['gained', 'lost']);
                    $ctrl = $controller('TestComponentController'); // Mind how this controller has been declared
                }));

                describe('observing permission changes', function () {
                    it('since we are signed out the permission handler is not executed', function () {
                        $ctrl.profile.addWithPermissionHandler('p1', spy);
                        expect(spy.gained).not.toHaveBeenCalled()
                    });

                    it('when we sign in without the requested permission the handler is not executed', function () {
                        $ctrl.profile.addWithPermissionHandler('?', spy);
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        binarta.checkpoint.profile.refresh();
                        expect(spy.gained).not.toHaveBeenCalled()
                    });

                    it('when we sign in with the requested permission the handler is executed', function () {
                        $ctrl.profile.addWithPermissionHandler('p1', spy);
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        binarta.checkpoint.profile.refresh();
                        expect(spy.gained).toHaveBeenCalled()
                    });

                    it('when we are already signed in with the requested permission the handler is executed', function () {
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        binarta.checkpoint.profile.refresh();
                        $ctrl.profile.addWithPermissionHandler('p1', spy);
                        expect(spy.gained).toHaveBeenCalled()
                    });

                    it('when the controller is destroyed and we gain the requested permission afterwards then the handler is not executed', function () {
                        $ctrl.profile.addWithPermissionHandler('p1', spy);
                        $ctrl.$onDestroy();
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        binarta.checkpoint.profile.refresh();
                        expect(spy.gained).not.toHaveBeenCalled()
                    });

                    it('when we sign out the handler is executed', function () {
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        binarta.checkpoint.profile.refresh();
                        $ctrl.profile.addWithPermissionHandler('p1', spy);
                        binarta.checkpoint.profile.signout();
                        expect(spy.lost).toHaveBeenCalled()
                    });
                });
            })
        });

        describe('binarta-publisherjs-angular1', function () {
            beforeEach(function () {
                binarta.publisher.db = jasmine.createSpyObj('db', ['findAllPublishedBlogsForLocale', 'findAllBlogsInDraftForLocale']);
            });

            describe('<bin-blog-feed/>', function () {
                beforeEach(inject(function ($componentController) {
                    $ctrl = $componentController('binBlogFeed', null, {});
                }));

                it('load an initial set of published blog posts when the component initialises and binarta has initialised', function () {
                    $ctrl.$onInit();
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                    expect(binarta.publisher.db.findAllPublishedBlogsForLocale).toHaveBeenCalled();
                });

                describe('$onInit', function () {
                    beforeEach(function () {
                        binarta.publisher.db = {
                            findAllPublishedBlogsForLocale: function (request, response) {
                                response.success([{id: 'x'}, {id: 'y'}]);
                            }
                        };
                        $ctrl.$onInit();
                        binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                    });

                    it('initially loaded posts are exposed', function () {
                        expect($ctrl.posts).toEqual([{id: 'x', uri: '/blog/post/x'}, {id: 'y', uri: '/blog/post/y'}]);
                    });

                    it('status is exposed', function () {
                        expect($ctrl.status).toEqual('no-more');
                    });

                    it('append additional posts', function () {
                        binarta.publisher.db = {
                            findAllPublishedBlogsForLocale: function (request, response) {
                                response.success([{id: 'z'}]);
                            }
                        };
                        $ctrl.more();
                        expect($ctrl.posts).toEqual([{id: 'x', uri: '/blog/post/x'}, {
                            id: 'y',
                            uri: '/blog/post/y'
                        }, {id: 'z', uri: '/blog/post/z'}]);
                    });
                });

                it('posts can be limited to a custom max', inject(function ($componentController) {
                    binarta.publisher.db = {
                        findAllPublishedBlogsForLocale: function (request) {
                            expect(request.subset).toEqual({offset: 0, max: 3});
                        }
                    };
                    $ctrl = $componentController('binBlogFeed', null, {max: 3});
                    $ctrl.$onInit();
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                }));

                it('posts can be limited to a custom max will convert string to number', inject(function ($componentController) {
                    binarta.publisher.db = {
                        findAllPublishedBlogsForLocale: function (request) {
                            expect(request.subset).toEqual({offset: 0, max: 3});
                        }
                    };
                    $ctrl = $componentController('binBlogFeed', null, {max: '3'});
                    $ctrl.$onInit();
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                }));

                it('posts can be limited to a custom count', inject(function ($componentController) {
                    binarta.publisher.db = {
                        findAllPublishedBlogsForLocale: function (request) {
                            expect(request.subset).toEqual({offset: 0, max: 3});
                        }
                    };
                    $ctrl = $componentController('binBlogFeed', null, {count: 3});
                    $ctrl.$onInit();
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                }));

                it('posts can be limited to a custom count will convert string to number', inject(function ($componentController) {
                    binarta.publisher.db = {
                        findAllPublishedBlogsForLocale: function (request) {
                            expect(request.subset).toEqual({offset: 0, max: 3});
                        }
                    };
                    $ctrl = $componentController('binBlogFeed', null, {count: '3'});
                    $ctrl.$onInit();
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                }));
            });

            describe('<bin-blog-drafts/>', function () {
                beforeEach(inject(function ($componentController) {
                    $ctrl = $componentController('binBlogDraftFeed', null, {});
                }));

                it('load an initial set of published blog posts when the component initialises and binarta has initialised', function () {
                    $ctrl.$onInit();
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                    expect(binarta.publisher.db.findAllBlogsInDraftForLocale).toHaveBeenCalled();
                });

                describe('$onInit', function () {
                    beforeEach(function () {
                        binarta.publisher.db = {
                            findAllBlogsInDraftForLocale: function (request, response) {
                                response.success([{id: 'x'}, {id: 'y'}]);
                            }
                        };
                        $ctrl.$onInit();
                        binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                    });

                    it('initially loaded posts are exposed', function () {
                        expect($ctrl.posts).toEqual([{id: 'x', uri: '/blog/post/x'}, {id: 'y', uri: '/blog/post/y'}]);
                    });

                    it('status is exposed', function () {
                        expect($ctrl.status).toEqual('no-more');
                    });

                    it('append additional posts', function () {
                        binarta.publisher.db = {
                            findAllBlogsInDraftForLocale: function (request, response) {
                                response.success([{id: 'z'}]);
                            }
                        };
                        $ctrl.more();
                        expect($ctrl.posts).toEqual([{id: 'x', uri: '/blog/post/x'}, {
                            id: 'y',
                            uri: '/blog/post/y'
                        }, {id: 'z', uri: '/blog/post/z'}]);
                    });
                });

                it('posts can be limited to a custom count', inject(function ($componentController) {
                    binarta.publisher.db = {
                        findAllBlogsInDraftForLocale: function (request) {
                            expect(request.subset).toEqual({offset: 0, max: 3});
                        }
                    };
                    $ctrl = $componentController('binBlogDraftFeed', null, {count: 3});
                    $ctrl.$onInit();
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                }));

                it('posts can be limited to a custom count will convert string to number', inject(function ($componentController) {
                    binarta.publisher.db = {
                        findAllBlogsInDraftForLocale: function (request) {
                            expect(request.subset).toEqual({offset: 0, max: 3});
                        }
                    };
                    $ctrl = $componentController('binBlogDraftFeed', null, {count: '3'});
                    $ctrl.$onInit();
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                }));
            });

            describe('<bin-blog-post/>', function () {
                beforeEach(inject(function ($componentController) {
                    $ctrl = $componentController('binBlogPost', null, {
                        post: 'post',
                        templateUrl: 'template-url'
                    });
                }));

                it('bindings', function () {
                    expect($ctrl.post).toEqual('post');
                    expect($ctrl.templateUrl).toEqual('template-url');
                });
            });

            describe('<bin-add-blog-post/>', function () {
                beforeEach(inject(function ($componentController) {
                    $ctrl = $componentController('binAddBlogPost', null, {});
                }));

                it('is initially in disabled status', function () {
                    expect($ctrl.status).toEqual('disabled');
                });

                it('in disabled status adding a draft is ignored', function () {
                    binarta.publisher.db = {
                        add: function () {
                            throw new Error();
                        }
                    };
                    $ctrl.add();
                });

                describe('when user has permission to add blog posts', function () {
                    beforeEach(function () {
                        $ctrl.$onInit();
                        binarta.checkpoint.gateway.addPermission('new.blog.post');
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        binarta.checkpoint.profile.refresh();
                    });

                    it('remain in disabled status as the application lock is still open', function () {
                        expect($ctrl.status).toEqual('disabled');
                    });

                    describe('and application lock is acquired', function () {
                        beforeEach(function () {
                            binarta.application.lock.reserve();
                        });

                        it('enter idle status', function () {
                            expect($ctrl.status).toEqual('idle');
                        });

                        it('return to disabled status on signout', function () {
                            binarta.checkpoint.profile.signout();
                            expect($ctrl.status).toEqual('disabled');
                        });

                        it('return to disabled status when the application lock is released', function () {
                            binarta.application.lock.release();
                            expect($ctrl.status).toEqual('disabled');
                        });

                        it('in idle status adding a draft is possible', function () {
                            binarta.publisher.db = jasmine.createSpyObj('db', ['add']);
                            $ctrl.add();
                            expect(binarta.publisher.db.add).toHaveBeenCalled();
                        });

                        describe('while adding a draft', function () {
                            beforeEach(function () {
                                binarta.publisher.db = jasmine.createSpyObj('db', ['add']);
                                $ctrl.add();
                            });

                            it('we are in drafting status', function () {
                                expect($ctrl.status).toEqual('drafting');
                            });

                            it('adding a draft is ignored', function () {
                                binarta.publisher.db = {
                                    add: function () {
                                        throw new Error();
                                    }
                                };
                                $ctrl.add();
                            });
                        });

                        describe('when draft is created', function () {
                            beforeEach(function () {
                                binarta.publisher.db = {
                                    add: function (request, response) {
                                        response.success('/id');
                                    }
                                };
                                $ctrl.add();
                            });

                            it('we return to idle status', function () {
                                expect($ctrl.status).toEqual('idle');
                            });

                            it('we redirect to the detail page', function () {
                                expect($location.path()).toEqual('/blog/post/id');
                            });
                        });
                    });
                });

                describe('when the application lock is acquired', function () {
                    beforeEach(function () {
                        binarta.application.lock.reserve();
                    });

                    it('remain in disabled status as the user still needs permission', function () {
                        expect($ctrl.status).toEqual('disabled');
                    });

                    it('enter idle status when permission is gained', function () {
                        $ctrl.$onInit();
                        binarta.checkpoint.gateway.addPermission('new.blog.post');
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                        binarta.checkpoint.profile.refresh();
                        expect($ctrl.status).toEqual('idle');
                    });
                });
            });

            describe('<bin-display-blog-post/>', function () {
                beforeEach(inject(function ($componentController) {
                    $ctrl = $componentController('binDisplayBlogPost', null, {});
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                }));

                it('when blog post is unknown redirect to blog overview', function () {
                    binarta.publisher.db = {
                        get: function (request, response) {
                            response.notFound();
                        }
                    };
                    $ctrl.$onInit();
                    expect($location.path()).toEqual('/blog');
                });

                it('passes bound id to db', function () {
                    binarta.publisher.db = {
                        get: function (request, response) {
                            expect(request.id).toEqual('b');
                        }
                    };
                    $ctrl.id = 'b';
                    $ctrl.$onInit();
                });

                describe('when blog post is known', function () {
                    var post;

                    beforeEach(function () {
                        post = {id: 'p'};
                        binarta.publisher.db = {
                            get: function (request, response) {
                                response.success(post);
                            }
                        };
                        $ctrl.$onInit();
                    });

                    it('enters idle status', function () {
                        expect($ctrl.status).toEqual('idle');
                    });

                    it('expose post on controller', function () {
                        expect($ctrl.post).toEqual(post);
                    });

                    describe('when post is in draft', function () {
                        beforeEach(function () {
                            post.status = 'draft';
                        });

                        describe('and user has permission to publish blog posts', function () {
                            beforeEach(function () {
                                binarta.checkpoint.gateway.addPermission('publish.blog.post');
                                binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                                binarta.checkpoint.profile.refresh();
                            });

                            it('remain non publishable as the application lock is still open', function () {
                                expect($ctrl.status).toEqual('idle');
                            });

                            describe('and application lock is acquired', function () {
                                beforeEach(function () {
                                    binarta.application.lock.reserve();
                                });

                                it('become publishable', function () {
                                    expect($ctrl.status).toEqual('publishable');
                                });

                                it('return to non publishable on signout', function () {
                                    binarta.checkpoint.profile.signout();
                                    expect($ctrl.status).toEqual('idle');
                                });

                                it('return to non publishable when the application lock is released', function () {
                                    binarta.application.lock.release();
                                    expect($ctrl.status).toEqual('idle');
                                });

                                it('publishing passes timestamp to db', function () {
                                    binarta.publisher.db = {
                                        publish: function (request) {
                                            expect(request.id).toEqual('p');
                                            expect(request.timestamp).toEqual('t');
                                        }
                                    };
                                    $ctrl.publish();
                                });

                                it('deleting invokes the db', function () {
                                    binarta.publisher.db = jasmine.createSpyObj('db', ['delete']);
                                    $ctrl.delete();
                                    expect(binarta.publisher.db.delete).toHaveBeenCalled();
                                });

                                it('when delete succeeds redirect to blog feed', function () {
                                    binarta.publisher.db = {
                                        delete: function (request, response) {
                                            response.success();
                                        }
                                    };
                                    $ctrl.delete();
                                    expect($location.path()).toEqual('/blog');
                                });
                            });
                        });

                        describe('and user has permission to withdraw blog posts', function () {
                            beforeEach(function () {
                                binarta.checkpoint.gateway.addPermission('withdraw.blog.post');
                                binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                                binarta.checkpoint.profile.refresh();
                            });

                            it('remain non withdrawable as the application lock is still open', function () {
                                expect($ctrl.status).toEqual('idle');
                            });

                            it('and application lock is acquired then remain publishable as post is still a draft', function () {
                                binarta.application.lock.reserve();
                                expect($ctrl.status).toEqual('publishable');
                            });
                        })
                    });

                    describe('when post is published', function () {
                        beforeEach(function () {
                            post.status = 'published';
                        });

                        describe('and user has permission to withdraw blog posts', function () {
                            beforeEach(function () {
                                binarta.checkpoint.gateway.addPermission('withdraw.blog.post');
                                binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                                binarta.checkpoint.profile.refresh();
                            });

                            it('remain non withdrawable as the application lock is still open', function () {
                                expect($ctrl.status).toEqual('idle');
                            });

                            describe('and application lock is acquired', function () {
                                beforeEach(function () {
                                    binarta.application.lock.reserve();
                                });

                                it('become withdrawable', function () {
                                    expect($ctrl.status).toEqual('withdrawable');
                                });

                                it('return to non withdrawable on signout', function () {
                                    binarta.checkpoint.profile.signout();
                                    expect($ctrl.status).toEqual('idle');
                                });

                                it('return to non withdrawable when the application lock is released', function () {
                                    binarta.application.lock.release();
                                    expect($ctrl.status).toEqual('idle');
                                });

                                it('withdrawing calls db', function () {
                                    binarta.publisher.db = {
                                        withdraw: function (request) {
                                            expect(request.id).toEqual('p');
                                        }
                                    };
                                    $ctrl.withdraw();
                                });
                            });
                        });

                        describe('and user has permission to publish blog posts', function () {
                            beforeEach(function () {
                                binarta.checkpoint.gateway.addPermission('publish.blog.post');
                                binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                                binarta.checkpoint.profile.refresh();
                            });

                            it('remain non publishable as the application lock is still open', function () {
                                expect($ctrl.status).toEqual('idle');
                            });

                            it('and application lock is acquired then remain withdrawable as post is already published', function () {
                                binarta.application.lock.reserve();
                                expect($ctrl.status).toEqual('withdrawable');
                            });
                        })
                    })
                });

                describe('<bin-display-blog-title/>', function () {
                    var template;

                    beforeEach(inject(function ($templateCache) {
                        binarta.publisher.db = {
                            get: function (request, response) {
                                response.success({id: 'i', title: 't'});
                            }
                        };
                        $templateCache.put('bin-test', '<bin-display-blog-title></bin-display-blog-title>');
                        template = '<bin-display-blog-post template="bin-test"></bin-display-blog-post>';
                    }));

                    it('when application lock is open render a read only blog title', inject(function () {
                        var document = $compile(template)($rootScope.$new());
                        $rootScope.$digest();
                        expect(document.html()
                            .replace(/<!--[\s\S]*?-->/g, '')
                            .replace(/<bin-edit>[\s\S]*?<\/bin-edit>/g, '')
                            .replace(/<ng-include[\s\S]*?>/g, '')
                            .replace(/<\/ng-include[\s\S]*?>/g, '')
                        ).toEqual('<bin-display-blog-title class="ng-scope ng-isolate-scope">' +
                            '<bin-application-lock class="ng-scope">' +
                            '<span ng-if="$lock.status == \'open\'" ng-bind="$ctrl.parent.post.title" class="ng-binding ng-scope">t</span>' +
                            '</bin-application-lock>' +
                            '</bin-display-blog-title>');
                    }));

                    it('when application lock is closed render a modifiable blog title', inject(function () {
                        binarta.application.lock.reserve();
                        var document = $compile(template)($rootScope.$new());
                        $rootScope.$digest();
                        expect(document.html()
                            .replace(/<!--[\s\S]*?-->/g, '')
                            .replace(/<bin-edit>[\s\S]*?<\/bin-edit>/g, '')
                            .replace(/<ng-include[\s\S]*?>/g, '')
                            .replace(/<\/ng-include[\s\S]*?>/g, '')
                        ).toEqual('<bin-display-blog-title class="ng-scope ng-isolate-scope">' +
                            '<bin-application-lock class="ng-scope">' +
                            '<i18n ng-if="$lock.status == \'closed\' &amp;&amp; $ctrl.parent.post.id" code="i" ng-bind="var" class="ng-binding ng-scope"></i18n>' +
                            '</bin-application-lock>' +
                            '</bin-display-blog-title>');
                    }));
                });

                describe('<bin-display-blog-lead/>', function () {
                    var template;

                    beforeEach(inject(function ($templateCache) {
                        binarta.publisher.db = {
                            get: function (request, response) {
                                response.success({id: 'i', lead: 'l'});
                            }
                        };
                        $templateCache.put('bin-test', '<bin-display-blog-lead></bin-display-blog-lead>');
                        template = '<bin-display-blog-post template="bin-test"></bin-display-blog-post>';
                    }));

                    it('when application lock is open render a read only blog lead', inject(function () {
                        var document = $compile(template)($rootScope.$new());
                        $rootScope.$digest();
                        expect(document.html()
                            .replace(/<!--[\s\S]*?-->/g, '')
                            .replace(/<bin-edit>[\s\S]*?<\/bin-edit>/g, '')
                            .replace(/<ng-include[\s\S]*?>/g, '')
                            .replace(/<\/ng-include[\s\S]*?>/g, '')
                        ).toEqual('<bin-display-blog-lead class="ng-scope ng-isolate-scope">' +
                            '<bin-application-lock class="ng-scope">' +
                            '<span ng-if="$lock.status == \'open\'" ng-bind-html="$ctrl.parent.post.lead|trust" class="ng-binding ng-scope">l</span>' +
                            '</bin-application-lock>' +
                            '</bin-display-blog-lead>');
                    }));

                    it('when application lock is closed render a modifiable blog lead', inject(function () {
                        binarta.application.lock.reserve();
                        var document = $compile(template)($rootScope.$new());
                        $rootScope.$digest();
                        expect(document.html()
                            .replace(/<!--[\s\S]*?-->/g, '')
                            .replace(/<bin-edit>[\s\S]*?<\/bin-edit>/g, '')
                            .replace(/<ng-include[\s\S]*?>/g, '')
                            .replace(/<\/ng-include[\s\S]*?>/g, '')
                        ).toEqual('<bin-display-blog-lead class="ng-scope ng-isolate-scope">' +
                            '<bin-application-lock class="ng-scope">' +
                            '<i18n ng-if="$lock.status == \'closed\' &amp;&amp; $ctrl.parent.post.id" code="i.lead" editor="full" ng-bind-html="var|trust" class="ng-binding ng-scope"></i18n>' +
                            '</bin-application-lock>' +
                            '</bin-display-blog-lead>');
                    }));
                });

                describe('<bin-display-blog-body/>', function () {
                    var template;

                    beforeEach(inject(function ($templateCache) {
                        binarta.publisher.db = {
                            get: function (request, response) {
                                response.success({id: 'i', body: 'b'});
                            }
                        };
                        $templateCache.put('bin-test', '<bin-display-blog-body></bin-display-blog-body>');
                        template = '<bin-display-blog-post template="bin-test"></bin-display-blog-post>';
                    }));

                    it('when application lock is open render a read only blog body', inject(function () {
                        var document = $compile(template)($rootScope.$new());
                        $rootScope.$digest();
                        expect(document.html()
                            .replace(/<!--[\s\S]*?-->/g, '')
                            .replace(/<bin-edit>[\s\S]*?<\/bin-edit>/g, '')
                            .replace(/<ng-include[\s\S]*?>/g, '')
                            .replace(/<\/ng-include[\s\S]*?>/g, '')
                        ).toEqual('<bin-display-blog-body class="ng-scope ng-isolate-scope">' +
                            '<bin-application-lock class="ng-scope">' +
                            '<span ng-if="$lock.status == \'open\'" ng-bind-html="$ctrl.parent.post.body|trust" class="ng-binding ng-scope">b</span>' +
                            '</bin-application-lock>' +
                            '</bin-display-blog-body>');
                    }));

                    it('when application lock is closed render a modifiable blog body', inject(function () {
                        binarta.application.lock.reserve();
                        var document = $compile(template)($rootScope.$new());
                        $rootScope.$digest();
                        expect(document.html()
                            .replace(/<!--[\s\S]*?-->/g, '')
                            .replace(/<bin-edit>[\s\S]*?<\/bin-edit>/g, '')
                            .replace(/<ng-include[\s\S]*?>/g, '')
                            .replace(/<\/ng-include[\s\S]*?>/g, '')
                        ).toEqual('<bin-display-blog-body class="ng-scope ng-isolate-scope">' +
                            '<bin-application-lock class="ng-scope">' +
                            '<i18n ng-if="$lock.status == \'closed\' &amp;&amp; $ctrl.parent.post.id" code="i.body" editor="full-media" ng-bind-html="var|trust" class="ng-binding ng-scope"></i18n>' +
                            '</bin-application-lock>' +
                            '</bin-display-blog-body>');
                    }));
                });
            });

            describe('/blog', function () {
                var config;

                beforeEach(inject(['$controller', 'BinSearchBlogPostsRouteController.config', function ($controller, _config_) {
                    $ctrl = $controller('BinSearchBlogPostsRouteController', {});
                    config = _config_;
                }]));

                it('exposes template names', function () {
                    expect($ctrl.decoratorTemplate).toEqual('bin-all-route-decorator.html');
                    expect($ctrl.pageTemplate).toEqual('bin-publisher-blog-search-route.html');
                    // expect($ctrl.template).toEqual('bin-publisher-display-search-post-details.html');
                });

                it('the decorator template can be overridden', inject(function ($controller) {
                    config.decoratorTemplate = 't';
                    expect($controller('BinSearchBlogPostsRouteController', {}).decoratorTemplate).toEqual('t');
                }));

                // it('the template can be overridden', inject(function ($controller) {
                //     config.template = 't';
                //     expect($controller('BinSearchBlogPostsRouteController', {}).template).toEqual('t');
                // }));
            });

            describe('/blog/post/:id', function () {
                var config;

                beforeEach(inject(['$routeParams', '$controller', 'BinDisplayBlogPostRouteController.config', function ($routeParams, $controller, _config_) {
                    $routeParams.part1 = 'blog';
                    $routeParams.part2 = 'id';
                    $ctrl = $controller('BinDisplayBlogPostRouteController', {});
                    config = _config_;
                }]));

                it('exposes id', function () {
                    expect($ctrl.id).toEqual('/blog/id');
                });

                it('exposes template names', function () {
                    expect($ctrl.decoratorTemplate).toEqual('bin-all-route-decorator.html');
                    expect($ctrl.pageTemplate).toEqual('bin-publisher-blog-post-route.html');
                    expect($ctrl.template).toEqual('bin-publisher-display-blog-post-details.html');
                });

                it('the decorator template can be overridden', inject(function ($controller) {
                    config.decoratorTemplate = 't';
                    expect($controller('BinDisplayBlogPostRouteController', {}).decoratorTemplate).toEqual('t');
                }));

                it('the template can be overridden', inject(function ($controller) {
                    config.template = 't';
                    expect($controller('BinDisplayBlogPostRouteController', {}).template).toEqual('t');
                }));
            });
        });

        describe('binarta-shopjs-angular1', function () {
            beforeEach(inject(function (binartaGatewaysAreInitialised) {
                binarta.application.gateway.updateApplicationProfile({availablePaymentMethods: ['payment-method']});
                binartaGatewaysAreInitialised.resolve();
                $rootScope.$digest();
            }));

            it('binarta is extended with shop', function () {
                expect(binarta.shop).toBeDefined();
            });

            describe('CheckoutController', function () {
                var ctrl;

                beforeEach(inject(function ($controller, $rootScope) {
                    ctrl = $controller('CheckoutController', {$scope: $rootScope.$new()});
                }));

                it('exposes the checkout status', function () {
                    expect(ctrl.status()).toEqual(binarta.shop.checkout.status());
                });

                it('exposes the checkout order', function () {
                    expect(ctrl.order()).toEqual(binarta.shop.checkout.context().order);
                });

                it('the checkout order is cached after the initial lookup', function () {
                    binarta.shop.checkout.persist({order: 'x'});
                    ctrl.order();
                    binarta.shop.checkout.persist({order: 'y'});
                    expect(ctrl.order()).toEqual('x');
                });

                it('starting while idle has no effect', function () {
                    $location.path('/checkout/start');
                    ctrl.start();
                    expect($location.path()).toEqual('/checkout/start');
                });

                it('starting while started redirects to the appropriate route', function () {
                    binarta.shop.checkout.start({}, ['authentication-required']);
                    $location.path('/checkout/start');
                    ctrl.start();
                    expect($location.path()).toEqual('/checkout/authentication-required');
                });

                it('retry authentication-required using checkpoint listener', function () {
                    binarta.shop.checkout.start({}, ['authentication-required', 'completed']);
                    binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    binarta.checkpoint.profile.refresh();

                    ctrl.checkpointListener.success();

                    expect(ctrl.status()).toEqual('completed');
                    expect($location.path()).toEqual('/checkout/completed');
                });

                describe('restoring checkout state from location', function () {
                    it('ignore non checkout locations', function () {
                        $location.path('/');
                        ctrl.$onInit();
                        expect(binarta.shop.checkout.status()).toEqual('idle');
                    });

                    it('ignore unknown states', function () {
                        $location.path('/checkout/unknown');
                        ctrl.$onInit();
                        expect(binarta.shop.checkout.status()).toEqual('idle');
                    });

                    it('simple state', function () {
                        $location.path('/checkout/completed');
                        ctrl.$onInit();
                        expect(binarta.shop.checkout.status()).toEqual('completed');
                    });

                    it('state with dashes', function () {
                        $location.path('/checkout/authentication-required');
                        ctrl.$onInit();
                        expect(binarta.shop.checkout.status()).toEqual('authentication-required');
                    });
                });

                it('supports decorators', inject(['$controller', '$rootScope', 'CheckoutController.decorator', function ($controller, $rootScope, decorator) {
                    decorator.add(function (ctrl) {
                        ctrl.decoratedAttribute = 'd';
                    });
                    expect($controller('CheckoutController', {$scope: $rootScope.$new()}).decoratedAttribute).toEqual('d');
                }]));

                describe('on address selection step', function () {
                    beforeEach(function () {
                        binarta.shop.checkout.start({}, ['address-selection', 'completed']);
                        ctrl.$onInit();
                    });

                    it('set billing address updates the exposed addresses context', function () {
                        ctrl.setBillingAddress({label: 'b', addressee: 'a'});
                        expect(ctrl.addresses.billing).toEqual({label: 'b', addressee: 'a'});
                    });

                    it('set shipping address updates the exposed addresses context', function () {
                        ctrl.setShippingAddress({label: 's', addressee: 'a'});
                        expect(ctrl.addresses.shipping).toEqual({label: 's', addressee: 'a'});
                    });

                    it('when selecting addresses then proceed to next step', function () {
                        ctrl.addresses.billing = {label: 'b', addressee: 'a'};
                        ctrl.selectAddresses();
                        expect($location.path()).toEqual('/checkout/completed');
                    });

                    it('when no address is selected then is awaiting selection flag is set to true', function () {
                        expect(ctrl.isAwaitingSelection()).toBeTruthy();
                    });

                    it('when billing address is selected then is awaiting selection flag is set to false', function () {
                        ctrl.setBillingAddress({label: 'b', addressee: 'a'});
                        expect(ctrl.isAwaitingSelection()).toBeFalsy();
                    });

                    it('when shipping address is selected then is awaiting selection flag is set to true', function () {
                        ctrl.setShippingAddress({label: 's', addressee: 'a'});
                        expect(ctrl.isAwaitingSelection()).toBeTruthy();
                    });
                });

                it('on address selection step addresses can be preselected', inject(function ($controller, $rootScope) {
                    binarta.shop.checkout.start({
                        billing: {label: 'b', addressee: 'a'},
                        shipping: {label: 's', addressee: 'a'}
                    }, ['address-selection', 'completed']);

                    var ctrl = $controller('CheckoutController', {$scope: $rootScope.$new()});

                    expect(ctrl.addresses.billing).toEqual({label: 'b', addressee: 'a'});
                    expect(ctrl.addresses.shipping).toEqual({label: 's', addressee: 'a'});
                }));

                describe('on summary step', function () {
                    beforeEach(function () {
                        binarta.shop.checkout.start({items: []}, ['summary', 'completed']);
                    });

                    it('expose payment provider', function () {
                        expect(ctrl.getPaymentProvider()).toEqual('payment-method');
                    });

                    it('step set payment provider', function () {
                        ctrl.setPaymentProvider('payment-provider');
                        expect(ctrl.order().provider).toEqual('payment-provider');
                    });

                    it('setting a coupon code on checkout resets the order cache on the controller', function () {
                        ctrl.$onInit();
                        ctrl.order(); // populate cache
                        binarta.shop.checkout.setCouponCode('coupon-code'); // resets cache
                        expect(ctrl.order().coupon).toEqual('coupon-code');
                    });
                });

                it('on summary step order confirmation can be rejected', function () {
                    binarta.shop.checkout.start({provider: 'with-insufficient-funds'}, ['summary', 'completed']);

                    ctrl.confirm();

                    expect(ctrl.status()).toEqual('summary');
                    expect(ctrl.violationReport()).toEqual('violation-report');
                });

                it('on summary step order confirmation success', function () {
                    binarta.shop.checkout.start({provider: 'with-sufficient-funds'}, ['summary', 'completed']);

                    ctrl.confirm();

                    expect(ctrl.status()).toEqual('completed');
                    expect($location.path()).toEqual('/checkout/completed');
                });

                it('on setup payment provider retry will redeliver the order and proceed to next step', function () {
                    binarta.shop.checkout.start({provider: 'with-sufficient-funds'}, ['setup-payment-provider', 'completed']);

                    ctrl.retry();

                    expect(ctrl.status()).toEqual('completed');
                    expect($location.path()).toEqual('/checkout/completed');
                });

                it('on payment step payment confirmation can be rejected', function () {
                    binarta.shop.checkout.start({}, ['payment', 'completed']);

                    $location.search({token: 'invalid'});
                    ctrl.confirmPayment();

                    expect(ctrl.status()).toEqual('payment');
                    expect(ctrl.violationReport()).toEqual({token: ['invalid']});
                });

                it('on payment step payment confirmation success', function () {
                    binarta.shop.checkout.start({}, ['payment', 'completed']);

                    $location.search({token: '-'});
                    ctrl.confirmPayment();

                    expect(ctrl.status()).toEqual('completed');
                    expect($location.path()).toEqual('/checkout/completed');
                    expect($location.search()).toEqual({});
                });

                it('on payment step cancel the payment', function () {
                    binarta.shop.checkout.start({}, ['payment', 'completed']);

                    ctrl.cancelPayment();

                    expect(ctrl.status()).toEqual('summary');
                    expect($location.path()).toEqual('/checkout/summary');
                });

                it('expose previous step details', function () {
                    binarta.shop.checkout.start({}, ['summary', 'payment', 'completed']);
                    binarta.shop.checkout.next();
                    expect(ctrl.hasPreviousStep()).toBeTruthy();
                    expect(ctrl.previousStep()).toEqual('summary');
                });
            });

            describe('CheckoutRoadmapController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    binarta.shop.checkout.start({}, ['summary', 'completed']);
                    ctrl = $controller('CheckoutRoadmapController');
                    ctrl.$onInit();
                }));

                it('exposes current roadmap', function () {
                    expect(ctrl.roadmap).toEqual([
                        {name: 'summary', locked: false, unlocked: true},
                        {name: 'completed', locked: true, unlocked: false}
                    ]);
                });

                it('exposes current step', function () {
                    expect(ctrl.currentStep).toEqual('summary');
                });
            });

            describe('<bin-basket/>', function () {
                var ctrl;

                beforeEach(inject(function ($componentController) {
                    ctrl = $componentController('binBasket', undefined, {});
                    ctrl.name = 'ctrl1';
                }));

                it('exposes the viewport', inject(function (viewport) {
                    expect(ctrl.viewport).toEqual(viewport);
                }));

                describe('in summary mode', function () {
                    beforeEach(function () {
                        ctrl.mode = 'summary';
                        ctrl.order = {items: [{id: 'i', quantity: 1}]};
                        ctrl.$onInit();
                    });

                    it('exposes the previewed order', function () {
                        expect(ctrl.preview).toEqual(ctrl.order);
                    });

                    it('on changes repopulate preview', function () {
                        ctrl.preview = undefined;
                        ctrl.$onChanges();
                        expect(ctrl.preview).toEqual(ctrl.order);
                    });

                    it('a regular order is not considered to be discounted', function () {
                        expect(ctrl.isDiscounted()).toBeFalsy();
                    });

                    it('an order with coupon code is considered to be discounted', function () {
                        ctrl.order.coupon = '-';
                        expect(ctrl.isDiscounted()).toBeTruthy();
                    });
                });

                describe('in detailed mode', function () {
                    beforeEach(function () {
                        ctrl.mode = 'detailed';
                        binarta.shop.basket.add({
                            item: {id: 'i', price: 100, quantity: 1}
                        });
                        ctrl.$onInit();
                    });

                    it('exposes the previewed order', function () {
                        expect(ctrl.preview.items[0].id).toEqual('i');
                        expect(ctrl.preview.items[0].quantity).toEqual(1);
                    });

                    it('on changes do not update preview', function () {
                        ctrl.preview = '-';
                        ctrl.$onChanges();
                        expect(ctrl.preview).toEqual('-');
                    });

                    describe('on checkout', function () {
                        beforeEach(function () {
                            ctrl.checkout();
                        });

                        it('then checkout is started with the previewed order', function () {
                            expect(binarta.shop.checkout.context().order.items).toEqual(JSON.parse(JSON.stringify(binarta.shop.basket.toOrder().items)));
                            expect(binarta.shop.checkout.context().order.quantity).toEqual(JSON.parse(JSON.stringify(binarta.shop.basket.toOrder().quantity)));
                        });

                        it('then checkout status is set to the first step', function () {
                            expect(binarta.shop.checkout.status()).toEqual('authentication-required');
                        });

                        it('then roadmap is set', function () {
                            expect(binarta.shop.checkout.roadmap().map(function (it) {
                                return it.name;
                            })).toEqual([
                                'address-selection',
                                'summary',
                                'completed'
                            ]);
                        });

                        it('then the user is redirected to the checkout page', function () {
                            expect($location.path()).toEqual('/checkout/start');
                        });
                    });

                    it('checkout will cancel an existing checkout', function () {
                        binarta.shop.checkout.start({}, ['summary', 'completed']);
                        ctrl.checkout();
                        expect(binarta.shop.checkout.status()).toEqual('authentication-required');
                    });

                    it('$onInit installs a basket event listener', function () {
                        expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeFalsy();
                    });

                    it('$onDestroy will remove basket event listener', function () {
                        ctrl.$onDestroy();
                        expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeTruthy();
                    });
                });

                function commonLinkTests(mode) {
                    beforeEach(function () {
                        ctrl.mode = mode;
                        binarta.shop.basket.add({
                            item: {id: 'i', price: 100, quantity: 1}
                        });
                        ctrl.$onInit();
                    });

                    it('preview exposes the order from the basket', function () {
                        expect(ctrl.preview.items[0].id).toEqual('i');
                    });

                    it('increment item quantity', function () {
                        ctrl.preview.items[0].incrementQuantity();
                        ctrl.preview.items[0].incrementQuantity();
                        expect(ctrl.preview.quantity).toEqual(3);
                        expect(binarta.shop.basket.toOrder().quantity).toEqual(3);
                    });

                    it('decrement item quantity', function () {
                        ctrl.preview.items[0].incrementQuantity();
                        ctrl.preview.items[0].incrementQuantity();

                        ctrl.preview.items[0].decrementQuantity();
                        expect(ctrl.preview.quantity).toEqual(2);
                        expect(binarta.shop.basket.toOrder().quantity).toEqual(2);

                        ctrl.preview.items[0].decrementQuantity();
                        expect(ctrl.preview.quantity).toEqual(1);
                        expect(binarta.shop.basket.toOrder().quantity).toEqual(1);
                    });

                    it('update to a specific quantity', function () {
                        ctrl.preview.items[0].quantity = 10;

                        ctrl.preview.items[0].update();

                        expect(ctrl.preview.quantity).toEqual(10);
                        expect(binarta.shop.basket.toOrder().quantity).toEqual(10);
                    });

                    it('remove an item from the basket', function () {
                        ctrl.preview.items[0].remove();

                        expect(ctrl.preview.quantity).toEqual(0);
                        expect(binarta.shop.basket.toOrder().items.length).toEqual(0);
                    });

                    it('when basket is cleared previewed contents are updated', function () {
                        binarta.shop.basket.clear();
                        expect(ctrl.preview.quantity).toEqual(0);
                    });

                    it('$onInit installs a basket event listener', function () {
                        expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeFalsy();
                    });

                    it('$onDestroy will remove basket event listener', function () {
                        ctrl.$onDestroy();
                        expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeTruthy();
                    });
                }

                [
                    'link',
                    'minimal-link',
                    'dropdown-link',
                ].forEach(function (mode) {
                    describe('in ' + mode + ' mode', function () {
                        commonLinkTests(mode);

                        if (mode === 'dropdown-link') {
                            it('should toggle isDropdownActive', function () {
                                ctrl.onDropdownClick();
                                expect(ctrl.isDropdownActive).toBeTruthy();
                                ctrl.onDropdownClick();
                                expect(ctrl.isDropdownActive).toBeFalsy();
                            });

                            it('should close the dropdown', function () {
                                ctrl.isDropdownActive = true;
                                ctrl.onCloseDropdownClick();
                                expect(ctrl.isDropdownActive).toBeFalsy();
                            });

                            it('should close the dropdown on routechange', function () {
                                ctrl.isDropdownActive = true;
                                $rootScope.$broadcast('$routeChangeStart', {params: {}});
                                $rootScope.$digest();
                                expect(ctrl.isDropdownActive).toBeFalsy();
                            });
                        }
                    });
                });

                describe('in add-to-basket-button mode', function () {
                    beforeEach(function () {
                        ctrl.mode = 'add-to-basket-button';
                        ctrl.$onInit();
                    });

                    describe('when adding an item to the basket', function () {
                        var ctrl2;

                        beforeEach(inject(function ($componentController) {
                            ctrl2 = $componentController('binBasket', undefined, {});
                            ctrl2.mode = 'add-to-basket-button';
                            ctrl2.name = 'ctrl2';
                            ctrl2.$onInit();
                        }));

                        beforeEach(function () {
                            ctrl.item = {id: 'i', price: 100};
                            ctrl.addToBasket();
                        });

                        it('the item is added to the basket', function () {
                            expect(binarta.shop.basket.toOrder().quantity).toEqual(1);
                        });

                        it('other basket controllers reflect the addition', function () {
                            expect(ctrl2.preview.quantity).toEqual(1);
                        });

                        it('then expose item added flag', function () {
                            expect(ctrl.itemAdded).toBeTruthy();
                        });

                        it('then the item added flag is not exposed on other controllers', function () {
                            expect(ctrl2.itemAdded).toBeFalsy();
                        });

                        it('when flushing timeout then item added flag is reset', inject(function ($timeout) {
                            $timeout.flush();
                            expect(ctrl.itemAdded).toBeFalsy();
                        }));
                    });
                });
            });

            describe('SetupPaymentProviderController', function () {
                var ctrl;

                beforeEach(inject(function ($controller, $location) {
                    ctrl = $controller('SetupPaymentProviderController');
                    $location.path('/custom/page');
                }));

                describe('setup billing agreement', function () {
                    var onConfirmed;

                    beforeEach(function () {
                        onConfirmed = jasmine.createSpy('on-confirmed');

                        ctrl.provider = 'p';
                        ctrl.method = 'billing-agreement';
                        ctrl.onConfirmed = onConfirmed;
                    });

                    describe('when initiating', function () {
                        beforeEach(function () {
                            ctrl.$onInit();
                        });

                        it('redirects to payment provider', inject(function ($window) {
                            expect($window.location).toEqual('http://p/billing/agreement?token=t');
                        }));

                        it('stores current route in session storage', function () {
                            expect(sessionStorage.binartaJSSetupBillingAgreementReturnUrl).toEqual('/custom/page');
                        });

                        it('on confirmed callback is not executed', function () {
                            expect(onConfirmed).not.toHaveBeenCalled();
                        });
                    });

                    describe('when confirmed', function () {
                        beforeEach(function () {
                            binarta.checkpoint.profile.billing.confirm({token: 't'});
                            ctrl.$onInit();
                        });

                        it('does not redirect to payment provider', inject(function ($window) {
                            expect($window.location).toBeUndefined();
                        }));

                        it('execute confirmation listener', function () {
                            expect(onConfirmed).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('SetupBillingAgreementController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('SetupBillingAgreementController')
                }));

                it('exposes the fact billing details are incomplete', function () {
                    expect(ctrl.status).toEqual('incomplete');
                });

                it('exposes the fact billing details are complete', inject(function ($controller) {
                    binarta.checkpoint.profile.billing.confirm({paymentProvider: 'p', confirmationToken: 't'});
                    expect($controller('SetupBillingAgreementController').status).toEqual('complete');
                }));

                describe('initiate billing details', function () {
                    beforeEach(function () {
                        ctrl.paymentProvider = 'p';
                        ctrl.submit();
                    });

                    it('changes status to working', function () {
                        expect(ctrl.status).toEqual('working');
                    });

                    it('redirects to external approval url', inject(function ($window) {
                        expect($window.location).toEqual('http://p/billing/agreement?token=t');
                    }));
                });
            });

            describe('CancelBillingAgreementController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('CancelBillingAgreementController');
                }));

                it('on execute cancel billing agreement', inject(function ($location) {
                    ctrl.execute();
                    expect(ui.receivedCanceledBillingAgreementRequest).toBeTruthy();
                }));
            });

            describe('ConfirmBillingAgreementController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('ConfirmBillingAgreementController');
                    sessionStorage.setItem('binartaJSSetupBillingAgreementReturnUrl', '');
                }));

                it('on execute confirm billing agreement', inject(function ($location) {
                    $location.path('/billing/agreement/confirm').search({token: 't'}); // TODO - as we begin supporting different payment providers we may need a strategy for this
                    ctrl.execute();
                    expect(ui.confirmedBillingAgreementRequest).toBeTruthy();
                    expect($location.path()).toEqual('/billing/agreement/confirm');
                }));

                it('on execute if a return url is stored in session storage then return to it', inject(function ($location) {
                    sessionStorage.setItem('binartaJSSetupBillingAgreementReturnUrl', '/custom/page');
                    $location.path('/billing/agreement/confirm').search({token: 't'});
                    ctrl.execute();
                    expect($location.path()).toEqual('/custom/page');
                }));
            });

            describe('UserProfileController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    binarta.checkpoint.registrationForm.submit({email: 'e', password: 'p'});
                    binarta.checkpoint.profile.refresh();
                    ctrl = $controller('UserProfileController');
                }));

                it('expose email', function () {
                    expect(ctrl.email()).toEqual('e');
                });

                it('expose VAT number', function () {
                    expect(ctrl.vat()).toEqual('BE1234567890');
                });

                it('expose profile status', function () {
                    expect(ctrl.status()).toEqual('idle');
                });

                describe('when in edit mode', function () {
                    beforeEach(function () {
                        ctrl.edit();
                    });

                    it('expose updated status', function () {
                        expect(ctrl.status()).toEqual('editing');
                    });

                    it('expose update request as form', function () {
                        expect(ctrl.form).toEqual({vat: 'BE1234567890', address: {}});
                    });

                    it('update the profile', function () {
                        ctrl.form.vat = 'BE0987654321';
                        ctrl.update();
                        expect(ctrl.vat()).toEqual('BE0987654321');
                    });

                    it('cancel editing', function () {
                        ctrl.cancel();
                        expect(ctrl.status()).toEqual('idle');
                    });
                });
            });

            describe('AddressController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    binarta.checkpoint.profile.edit();
                    binarta.checkpoint.profile.updateRequest().address.label = 'home';
                    binarta.checkpoint.profile.updateRequest().address.addressee = 'John Doe';
                    binarta.checkpoint.profile.updateRequest().address.street = 'Johny Lane';
                    binarta.checkpoint.profile.updateRequest().address.number = '1';
                    binarta.checkpoint.profile.updateRequest().address.zip = '1000';
                    binarta.checkpoint.profile.updateRequest().address.city = 'Johnyville';
                    binarta.checkpoint.profile.updateRequest().address.country = 'BE';
                    binarta.checkpoint.profile.update();
                    ctrl = $controller('BinartaAddressController');
                    ctrl.onSelect = jasmine.createSpy('on-select');
                }));

                it('mode defaults to display', function () {
                    expect(ctrl.mode).toEqual('display');
                });

                it('expose profile status', function () {
                    expect(ctrl.profileStatus()).toEqual('idle');
                });

                it('expose address status', function () {
                    expect(ctrl.addressStatus()).toEqual('awaiting-selection');
                });

                it('expose all addresses', function () {
                    expect(ctrl.addresses().map(function (it) {
                        return it.label;
                    })).toEqual(['home']);
                });

                it('when selecting an address then the selection listener is triggered', function () {
                    ctrl.select('home');
                    expect(ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                });

                it('when an undefined initial address is specified', function () {
                    ctrl.initialAddress = undefined;
                    ctrl.$onInit();
                    expect(ctrl.onSelect).not.toHaveBeenCalled();
                });

                it('when a known initial address is specified', function () {
                    ctrl.initialAddress = {label: 'home'};
                    ctrl.$onInit();
                    expect(ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                });

                it('when the initial address matches the default then changes to the default change the selection', function () {
                    ctrl.default = {label: 'home'};
                    ctrl.initialAddress = {label: 'home'};
                    ctrl.$onInit();
                    ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                    expect(ctrl.label).toEqual('work');
                });

                it('when the initial address does not match the default then changes to the default are ignored', function () {
                    ctrl.default = {label: 'work'};
                    ctrl.initialAddress = {label: 'home'};
                    ctrl.$onInit();
                    ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                    expect(ctrl.label).toEqual('home');
                });

                describe('when a specific address is selected', function () {
                    beforeEach(function () {
                        ctrl.select('home');
                    });

                    it('expose address status', function () {
                        expect(ctrl.addressStatus()).toEqual('idle');
                    });

                    it('expose attributes', function () {
                        expect(ctrl.addressee()).toEqual('John Doe');
                        expect(ctrl.street()).toEqual('Johny Lane');
                        expect(ctrl.number()).toEqual('1');
                        expect(ctrl.zip()).toEqual('1000');
                        expect(ctrl.city()).toEqual('Johnyville');
                        expect(ctrl.country()).toEqual('BE');
                    });

                    it('expose countries', function () {
                        expect(ctrl.countries().length > 0).toBeTruthy();
                    });

                    describe('when in edit mode', function () {
                        beforeEach(function () {
                            ctrl.edit();
                        });

                        it('expose updated status', function () {
                            expect(ctrl.addressStatus()).toEqual('editing');
                        });

                        it('expose update request as form', function () {
                            expect(ctrl.form).toEqual({
                                id: {label: 'home'},
                                label: 'home',
                                addressee: 'John Doe',
                                street: 'Johny Lane',
                                number: '1',
                                zip: '1000',
                                city: 'Johnyville',
                                country: 'BE'
                            });
                        });

                        it('update the address', function () {
                            ctrl.form.addressee = 'Jane Smith';
                            ctrl.update();
                            expect(ctrl.addressee()).toEqual('Jane Smith');
                        });

                        it('regenerate the address label on update', function () {
                            ctrl.generateLabel = true;

                            ctrl.update();

                            expect(ctrl.form.label).toEqual('(1000) Johny Lane 1');
                            expect(ctrl.addressee()).toEqual('John Doe');
                        });

                        it('cancel editing', function () {
                            ctrl.cancel();
                            expect(ctrl.addressStatus()).toEqual('idle');
                        });
                    });
                });

                describe('when specifying a default address', function () {
                    beforeEach(function () {
                        ctrl.default = {label: 'home'};
                        ctrl.$onInit();
                    });

                    it('then the corresponding address is selected', function () {
                        expect(ctrl.label).toEqual('home');
                    });

                    it('then the selection listener is triggered', function () {
                        expect(ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                    });

                    it('when the default address is changed then the selected address also changes', function () {
                        ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                        expect(ctrl.label).toEqual('work');
                    });

                    it('when something other than the default address is changed then the selected address remains as is', function () {
                        ctrl.$onChanges({purpose: {currentValue: '-'}});
                        expect(ctrl.label).toEqual('home');
                    });

                    it('when selecting null then fallback to default label', function () {
                        ctrl.select(null);
                        expect(ctrl.label).toEqual('home');
                    });

                    it('when a selection is made changes to the default address are ignored', function () {
                        ctrl.select('neighbour');
                        ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                        expect(ctrl.label).toEqual('neighbour');
                    });
                });

                it('cancel new address has no effect when profile is in editing mode but this controller did not cause it', function () {
                    binarta.checkpoint.profile.edit();
                    ctrl.cancelNewAddress();
                    expect(ctrl.profileStatus()).toEqual('editing');
                });

                describe('when entering create a new address mode', function () {
                    beforeEach(function () {
                        ctrl.$onInit();
                        ctrl.new();
                    });

                    it('then profile status changes to editing', function () {
                        expect(ctrl.profileStatus()).toEqual('editing');
                    });

                    it('then expose profile update request', function () {
                        expect(ctrl.form).toEqual(binarta.checkpoint.profile.updateRequest().address);
                    });

                    describe('when creating a new address', function () {
                        var ctrl2;

                        beforeEach(inject(function ($controller) {
                            ctrl2 = $controller('BinartaAddressController');
                            ctrl2.$onInit();

                            ctrl.form.label = 'work';
                            ctrl.form.addressee = 'John Doe';
                            ctrl.form.street = 'Johny Lane';
                            ctrl.form.number = '1';
                            ctrl.form.zip = '1000';
                            ctrl.form.city = 'Johnyville';
                            ctrl.form.country = 'BE';

                            ctrl.create();
                        }));

                        it('then the address is added to the profile', function () {
                            expect(binarta.checkpoint.profile.addresses().map(function (it) {
                                return it.label
                            })).toEqual(['home', 'work']);
                        });

                        it('then the newly created address is selected', function () {
                            expect(ctrl.label).toEqual('work');
                        });
                    });

                    it('when create address is rejected then expose the violation report', function () {
                        ctrl.form.label = 'invalid';
                        ctrl.create();
                        expect(ctrl.violationReport()).toEqual({label: ['invalid']});
                    });

                    it('then it can be canceled', function () {
                        ctrl.cancelNewAddress();
                        expect(ctrl.profileStatus()).toEqual('idle');
                    });
                });
            });

            describe('PaymentMethodsController', function () {
                var $ctrl;

                beforeEach(inject(function ($controller) {
                    $ctrl = $controller('BinartaPaymentMethodsController');
                    $ctrl.onSelect = jasmine.createSpy('on-select');
                }));

                it('exposes available payment methods', function () {
                    binarta.application.profile().availablePaymentMethods = 'available-payment-methods';
                    expect($ctrl.availablePaymentMethods()).toEqual('available-payment-methods');
                });

                it('initially no payment method is selected', function () {
                    expect($ctrl.onSelect).not.toHaveBeenCalled();
                });

                it('selecting a payment method', function () {
                    $ctrl.paymentProvider = 'payment-method';
                    $ctrl.select();
                    expect($ctrl.onSelect).toHaveBeenCalledWith('payment-method');
                });

                it('specify a default payment method', function () {
                    $ctrl.default = 'payment-method';
                    $ctrl.$onInit();
                    expect($ctrl.onSelect).toHaveBeenCalledWith('payment-method');
                });
            });

            describe('PaymentController', function () {
                var $ctrl;

                beforeEach(inject(function ($controller) {
                    $ctrl = $controller('BinartaPaymentController');
                    $ctrl.onConfirmed = jasmine.createSpy('on-confirmed');
                    $ctrl.onCanceled = jasmine.createSpy('on-canceled');
                }));

                it('generates a provider template based on the provider parameter', function () {
                    $ctrl.provider = 'test-bank';
                    $ctrl.$onInit();
                    expect($ctrl.providerTemplate).toEqual('bin-shop-payment-test-bank.html');
                });

                describe('given a signing context without approval url', function () {
                    beforeEach(inject(function ($timeout) {
                        $ctrl.order = {
                            signingContext: {
                                amount: 100,
                                currency: 'EUR',
                                locale: 'en'
                            }
                        };
                        $ctrl.$onInit();
                        $timeout.flush();
                    }));

                    it('then the user is not redirected', function() {
                        expect($window.location).toBeUndefined();
                    });

                    it('');
                });

                describe('given a signing context with approval url when controller is initialised', function () {
                    beforeEach(inject(function ($timeout) {
                        $ctrl.order = {signingContext: {approvalUrl: 'approval-url'}};
                        $ctrl.$onInit();
                        $timeout.flush();
                    }));

                    it('then visit approval url', inject(function ($window) {
                        expect($window.location).toEqual('approval-url');
                    }));

                    it('then on confirmed listener is not yet invoked', function () {
                        expect($ctrl.onConfirmed).not.toHaveBeenCalled();
                    });

                    describe('and reinitialised', function () {
                        beforeEach(inject(function ($window) {
                            $window.location = undefined;
                            $ctrl.$onInit();
                        }));

                        it('then the payment is canceled', function () {
                            expect($ctrl.onCanceled).toHaveBeenCalled();
                        });

                        it('then the user is not redirected to the approval url', inject(function ($timeout) {
                            $timeout.verifyNoPendingTasks();
                        }));

                        it('and reinitialised again then visit the approval url', inject(function ($timeout, $window) {
                            $ctrl.$onInit();
                            $timeout.flush();
                            expect($window.location).toEqual('approval-url');
                        }));
                    });
                });

                describe('given an order with approval url when controller is initialised', function () {
                    beforeEach(inject(function ($timeout) {
                        $ctrl.order = {approvalUrl: 'approval-url'};
                        $ctrl.$onInit();
                        $timeout.flush();
                    }));

                    it('then visit approval url', inject(function ($window) {
                        expect($window.location).toEqual('approval-url');
                    }));

                    it('then on confirmed listener is not yet invoked', function () {
                        expect($ctrl.onConfirmed).not.toHaveBeenCalled();
                    });

                    describe('and reinitialised', function () {
                        beforeEach(inject(function ($window) {
                            $window.location = undefined;
                            $ctrl.$onInit();
                        }));

                        it('then the payment is canceled', function () {
                            expect($ctrl.onCanceled).toHaveBeenCalled();
                        });

                        it('then the user is not redirected to the approval url', inject(function ($timeout) {
                            $timeout.verifyNoPendingTasks();
                        }));

                        it('and reinitialised again then visit the approval url', inject(function ($timeout, $window) {
                            $ctrl.$onInit();
                            $timeout.flush();
                            expect($window.location).toEqual('approval-url');
                        }));
                    });
                });

                it('given a token as route parameter when controller is initialised then confirm payment', inject(function ($routeParams) {
                    $routeParams.token = 't';
                    $ctrl.$onInit();
                    expect($ctrl.onConfirmed).toHaveBeenCalledWith({token: 't'});
                }));
            });

            describe('bin-coupon component', function () {
                var $ctrl, order;

                beforeEach(inject(function ($componentController) {
                    $ctrl = $componentController('binCoupon', null, {});

                    order = {items: []};
                    binarta.shop.checkout.start(order, [
                        'summary',
                        'completed'
                    ]);
                }));

                it('expose verification is not disabled to template', function () {
                    expect($ctrl.isVerificationDisabled()).toBeFalsy();
                });

                it('is required tests purchase order requirement exists on application profile', function () {
                    expect($ctrl.isRequired()).toBeFalsy();

                    binarta.application.gateway.updateApplicationProfile({
                        purchaseOrderRequirements: [{name: 'coupon'}]
                    });
                    binarta.application.refresh();

                    expect($ctrl.isRequired()).toBeTruthy();
                });

                describe('when verifying an unknown coupon code', function () {
                    beforeEach(function () {
                        $ctrl.couponCode = '-';
                        $ctrl.verify();
                    });

                    it('then expose coupon invalid', function () {
                        expect($ctrl.couponInvalid).toBeTruthy();
                    });

                    it('and resetting coupon validation then coupon invalid marker is removed', function () {
                        $ctrl.resetCouponValidation();
                        expect($ctrl.couponInvalid).toBeFalsy();
                    });

                    it('and re-verification resets previous results', function () {
                        binarta.shop.gateway.addCoupon({id: 'x'});
                        $ctrl.couponCode = 'x';
                        $ctrl.verify();
                        expect($ctrl.couponInvalid).toBeFalsy();
                    });
                });

                describe('when verifying a known coupon code', function () {
                    beforeEach(function () {
                        binarta.shop.gateway.addCoupon({id: 'x'});
                        $ctrl.couponCode = 'x';
                        $ctrl.verify();
                    });

                    it('then expose coupon valid', function () {
                        expect($ctrl.couponValid).toBeTruthy();
                    });

                    it('then apply coupon to checkout order', function () {
                        binarta.shop.gateway = jasmine.createSpyObj('spy', ['submitOrder']);
                        binarta.shop.checkout.confirm();
                        expect(binarta.shop.gateway.submitOrder).toHaveBeenCalledWith({
                            coupon: 'x',
                            termsAndConditions: 'accepted',
                            provider: 'payment-method',
                            items: []
                        }, jasmine.any(Object));
                    });

                    it('and resetting coupon validation then coupon valid marker is removed', function () {
                        $ctrl.resetCouponValidation();
                        expect($ctrl.couponValid).toBeFalsy();
                    });

                    it('and re-verification resets previous results', function () {
                        $ctrl.couponCode = '-';
                        $ctrl.verify();
                        expect($ctrl.couponValid).toBeFalsy();
                    });
                });

                describe('given a coupon code', function () {
                    beforeEach(function () {
                        binarta.shop.gateway = jasmine.createSpyObj('spy', ['submitOrder']);
                        $ctrl.couponCode = 'x';
                    });

                    it('when resetting coupon validation the coupon is not exposed on the checkout order', function () {
                        $ctrl.resetCouponValidation();
                        binarta.shop.checkout.confirm();
                        expect(binarta.shop.gateway.submitOrder).toHaveBeenCalledWith({
                            termsAndConditions: 'accepted',
                            provider: 'payment-method',
                            items: []
                        }, jasmine.any(Object));
                    });
                });

                describe('given verification is disabled', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binCoupon', null, {verification: 'disabled'});
                        binarta.shop.gateway = jasmine.createSpyObj('spy', ['submitOrder']);
                    }));

                    it('then expose verification is disabled to template', function () {
                        expect($ctrl.isVerificationDisabled()).toBeTruthy();
                    });

                    it('when resetting coupon validation the coupon code is included on the checkout order without verification', function () {
                        $ctrl.couponCode = 'x';
                        $ctrl.resetCouponValidation();
                        binarta.shop.checkout.confirm();
                        expect(binarta.shop.gateway.submitOrder).toHaveBeenCalledWith({
                            coupon: 'x',
                            termsAndConditions: 'accepted',
                            provider: 'payment-method',
                            items: []
                        }, jasmine.any(Object));
                    });
                });

                describe('given required', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binCoupon', null, {required: true});
                    }));

                    it('then is required is true', function () {
                        expect($ctrl.isRequired()).toBeTruthy();
                    });
                });
            });
        });

        describe('binarta-humanresourcesjs-angular1', function () {
            beforeEach(function () {
                config.namespace = 'N';
                $location.path('/en/');
                binarta.application.setLocaleForPresentation('en');
            });

            it('installs humanresources handler on binarta', function () {
                expect(binarta.humanresources).toBeDefined();
            });
        });

        function expectApplicationListenerUninstalled(listenerName) {
            expectEventListenerUninstalled(binarta.application.eventRegistry, listenerName);
        }

        function expectAdhesiveReadingListenerUninstalled(listenerName) {
            expectEventListenerUninstalled(binarta.application.adhesiveReading.eventRegistry, listenerName);
        }

        function expectEventListenerUninstalled(eventRegistry, listenerName) {
            var uninstalled = true;
            eventRegistry.forEach(function (l) {
                if (l.constructor.name == listenerName)
                    uninstalled = false;
            });
            expect(uninstalled).toBeTruthy();
        }
    });

    installBackendStrategy('inmem');
    angular.module('binartajs-angular1-spec', [
        'binarta-applicationjs-angular1',
        'binarta-mediajs-angular1',
        'binarta-checkpointjs-angular1',
        'binarta-publisherjs-angular1',
        'binarta-shopjs-angular1',
        'binarta-humanresourcesjs-angular1'
    ])
        .service('$window', MockWindow)
        .factory('i18nLocation', MockI18nLocationFactory)
        .service('viewport', MockViewport)
        .service('dependencyA', DependencyStub)
        .service('dependencyB', DependencyStub)
        .controller('TestComponentController', ['dependencyA', 'dependencyB', binComponentController(TestComponentController)])
        .filter('trust', ['$sce', MockTrustFilter])
        .config(ExtendBinarta);

    function MockWindow() {
        this.navigator = {userAgent: ''};
    }

    function DependencyStub() {
    }

    function MockI18nLocationFactory($location) {
        return $location;
    }

    function MockViewport() {
    }

    function MockTrustFilter($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    }

    function ExtendBinarta(binartaProvider, shopProvider) {
        binartaProvider.ui.initiatingBillingAgreement = ui.initiatingBillingAgreement;
        binartaProvider.ui.canceledBillingAgreement = ui.canceledBillingAgreement;
        binartaProvider.ui.confirmedBillingAgreement = function () {
            ui.confirmedBillingAgreement();
            shopProvider.ui.confirmedBillingAgreement();
        };
        binartaProvider.ui.promptForPublicationTime = ui.promptForPublicationTime;
    }

    function UI() {
        var self = this;

        this.initiatingBillingAgreement = function () {
        };

        this.canceledBillingAgreement = function () {
            self.receivedCanceledBillingAgreementRequest = true;
        };

        this.confirmedBillingAgreement = function () {
            self.confirmedBillingAgreementRequest = true;
        };

        this.promptForPublicationTime = function (response) {
            response.success('t');
        }
    }

    function installBackendStrategy(strategy) {
        angular.module('binarta-applicationjs-gateways-angular1', ['binarta-applicationjs-' + strategy + '-angular1'])
            .provider('binartaApplicationGateway', [strategy + 'BinartaApplicationGatewayProvider', proxy]);
        angular.module('binarta-checkpointjs-gateways-angular1', ['binarta-checkpointjs-' + strategy + '-angular1'])
            .provider('binartaCheckpointGateway', [strategy + 'BinartaCheckpointGatewayProvider', proxy]);
        angular.module('binarta-publisherjs-gateways-angular1', ['binarta-publisherjs-' + strategy + '-angular1'])
            .provider('binartaPublisherGateway', [strategy + 'BinartaPublisherGatewayProvider', proxy]);
        angular.module('binarta-shopjs-gateways-angular1', ['binarta-shopjs-' + strategy + '-angular1'])
            .provider('binartaShopGateway', [strategy + 'BinartaShopGatewayProvider', proxy]);
        angular.module('binarta-humanresourcesjs-gateways-angular1', ['binarta-humanresourcesjs-' + strategy + '-angular1'])
            .provider('binartaHumanResourcesGateway', [strategy + 'BinartaHumanResourcesGatewayProvider', proxy]);

        function proxy(gateway) {
            return gateway;
        }
    }

    function ExpectSuccessResponse() {
        this.success = function () {
        };
        this.rejected = function () {
            throw new Error('request.rejected');
        };
    }

    function TestComponentController() {
        var $ctrl = this;

        $ctrl.constructorArguments = arguments;
        $ctrl.customAttribute = 'custom-attribute';
    }


})();

var $ = function () {
    return {
        trigger: function () {
        }
    }
};

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
            if (binarta.shop.gateway.clear)
                binarta.shop.gateway.clear();
            localStorage.removeItem('locale');
            localStorage.removeItem('binartaJSPaymentProvider');
            localStorage.removeItem('cookiesAccepted');
            sessionStorage.removeItem('locale');
            sessionStorage.removeItem('binartaJSAwaitingConfirmationWithPaymentProvider');
            sessionStorage.removeItem('binartaJSSetupBillingAgreementReturnUrl');
        });

        function render(source) {
            var $scope = $rootScope.$new();
            var component = $compile(source)($scope);
            $rootScope.$digest();
            var html = component.html().replace(/<!--[\s\S]*?-->/g, '');
            $scope.$destroy();
            return html;
        }

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

            describe('with observer installed', function () {
                var rx1, rx2;

                beforeEach(function () {
                    rx1 = new BinartaRX();
                    rx2 = new BinartaRX();
                    $ctrl.observables = [{
                        toObserver: function () {
                            return rx1.observe({
                                hello: function (it) {
                                    $ctrl.msg = 'Hello ' + it + '!';
                                }
                            });
                        }
                    }, {
                        toObserver: function () {
                            return rx2.observe({
                                status: function (it) {
                                    $ctrl.status = it;
                                }
                            });
                        }
                    }];
                });

                it('notifications are ignored before init', function () {
                    rx1.notify('hello', 'world');
                    expect($ctrl.msg).not.toBeDefined();
                });

                describe('on init', function () {
                    beforeEach(function () {
                        $ctrl.$onInit();
                    });

                    it('process first observer', function () {
                        rx1.notify('hello', 'world');
                        expect($ctrl.msg).toEqual('Hello world!');
                    });

                    it('process second observer', function () {
                        rx2.notify('status', 'listening');
                        expect($ctrl.status).toEqual('listening');
                    });

                    it('on destroy stop listening', function () {
                        $ctrl.$onDestroy();
                        rx1.notify('hello', 'world');
                        expect($ctrl.msg).not.toBeDefined();
                    });
                });
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

            describe('<bin-dns/>', function () {
                describe('without optional bindings', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binDns', undefined, {});
                        $ctrl.$onInit();
                    }));

                    afterEach(function () {
                        $ctrl.$onDestroy();
                        binarta.application.dns.save([]);
                    });

                    it('exposes default container template', function () {
                        expect($ctrl.containerTemplate).toEqual('bin-all-dns-component-container-default.html');
                    });

                    it('exposes template url', function () {
                        expect($ctrl.templateUrl).toEqual('bin-all-dns-component-widget.html');
                    });

                    it('exposes i18n codes', function () {
                        expect($ctrl.i18n).toEqual({
                            title: 'bin.dns.component.title'
                        });
                    });

                    it('exposes records', function () {
                        expect($ctrl.records).toEqual([]);
                    });

                    it('exposes draft', function () {
                        expect($ctrl.draft).toEqual({});
                    });

                    describe('add record to widget', function () {
                        beforeEach(function () {
                            $ctrl.draft.type = 'T';
                            $ctrl.draft.name = 'N';
                            $ctrl.draft.values = 'V';

                            $ctrl.submit();
                        });

                        it('appends the records to the exposed records', function () {
                            expect($ctrl.records).toEqual([{id: 0, type: 'T', name: 'N', values: ['V']}]);
                        });

                        it('clears the draft', function () {
                            expect($ctrl.draft).toEqual({});
                        });
                    });

                    it('add record with multiple newline separated values to widget', function () {
                        $ctrl.draft.type = 'T';
                        $ctrl.draft.name = 'N';
                        $ctrl.draft.values = 'x\ny\nz';

                        $ctrl.submit();

                        expect($ctrl.records).toEqual([{id: 0, type: 'T', name: 'N', values: ['x', 'y', 'z']}]);
                    });

                    it('add record with multiple carriage return separated values to widget', function () {
                        $ctrl.draft.type = 'T';
                        $ctrl.draft.name = 'N';
                        $ctrl.draft.values = 'x\ry\rz';

                        $ctrl.submit();

                        expect($ctrl.records).toEqual([{id: 0, type: 'T', name: 'N', values: ['x', 'y', 'z']}]);
                    });

                    describe('adding multiple records', function () {
                        beforeEach(function () {
                            $ctrl.draft.type = 'A';
                            $ctrl.draft.name = '';
                            $ctrl.draft.values = '1.1.1.1\n2.2.2.2';
                            $ctrl.submit();

                            $ctrl.draft.type = 'TXT';
                            $ctrl.draft.name = '';
                            $ctrl.draft.values = 'config';
                            $ctrl.submit();

                            $ctrl.draft.type = 'CNAME';
                            $ctrl.draft.name = 'www';
                            $ctrl.draft.values = 'proxy.example.org.';
                            $ctrl.submit();
                        });

                        it('exposes status', function () {
                            expect($ctrl.status).toEqual('add');
                        });

                        it('is reflected in the exposed records', function () {
                            expect($ctrl.records).toEqual([
                                {id: 0, type: 'A', name: '', values: ['1.1.1.1', '2.2.2.2']},
                                {id: 1, type: 'TXT', name: '', values: ['config']},
                                {id: 2, type: 'CNAME', name: 'www', values: ['proxy.example.org.']}
                            ]);
                        });

                        it('remove first record', function () {
                            $ctrl.remove({type: 'A', name: ''});
                            expect($ctrl.records).toEqual([
                                {id: 1, type: 'TXT', name: '', values: ['config']},
                                {id: 2, type: 'CNAME', name: 'www', values: ['proxy.example.org.']}
                            ]);
                        });

                        it('remove second record', function () {
                            $ctrl.remove({type: 'TXT', name: ''});
                            expect($ctrl.records).toEqual([
                                {id: 0, type: 'A', name: '', values: ['1.1.1.1', '2.2.2.2']},
                                {id: 2, type: 'CNAME', name: 'www', values: ['proxy.example.org.']}
                            ]);
                        });

                        it('remove third record', function () {
                            $ctrl.remove({type: 'CNAME', name: 'www'});
                            expect($ctrl.records).toEqual([
                                {id: 0, type: 'A', name: '', values: ['1.1.1.1', '2.2.2.2']},
                                {id: 1, type: 'TXT', name: '', values: ['config']}
                            ]);
                        });

                        it('save updates results in database', function () {
                            $ctrl.save();
                            binarta.application.dns.refresh();
                            binarta.application.dns.observe({
                                records: function (it) {
                                    expect(it).toEqual([
                                        {id: 0, type: 'A', name: '', values: ['1.1.1.1', '2.2.2.2']},
                                        {id: 1, type: 'TXT', name: '', values: ['config']},
                                        {id: 2, type: 'CNAME', name: 'www', values: ['proxy.example.org.']}
                                    ]);
                                }
                            }).disconnect();
                        });

                        describe('when modifying a record', function () {
                            beforeEach(function () {
                                $ctrl.modify($ctrl.records[0]);
                            });

                            it('exposes status', function () {
                                expect($ctrl.status).toEqual('update');
                            });

                            it('exposes details on draft', function () {
                                expect($ctrl.draft).toEqual({
                                    type: 'A',
                                    name: '',
                                    values: '1.1.1.1\n2.2.2.2'
                                });
                            });

                            describe('on submit', function () {
                                beforeEach(function () {
                                    $ctrl.draft.values = '1.1.1.1';
                                    $ctrl.submit();
                                });

                                it('exposes status', function () {
                                    expect($ctrl.status).toEqual('add');
                                });

                                it('the modified record is updated in the exposed records', function () {
                                    expect($ctrl.records).toEqual([
                                        {id: 0, type: 'A', name: '', values: ['1.1.1.1']},
                                        {id: 1, type: 'TXT', name: '', values: ['config']},
                                        {id: 2, type: 'CNAME', name: 'www', values: ['proxy.example.org.']}
                                    ]);
                                });

                                it('system reverts to add record on submit', function () {
                                    $ctrl.draft.type = 'T';
                                    $ctrl.draft.name = 'N';
                                    $ctrl.draft.values = 'V';

                                    $ctrl.submit();

                                    expect($ctrl.records.length).toEqual(4);
                                });
                            });

                            describe('on clear', function () {
                                beforeEach(function () {
                                    $ctrl.clear();
                                });

                                it('exposes status', function () {
                                    expect($ctrl.status).toEqual('add');
                                });

                                it('clears draft', function () {
                                    expect($ctrl.draft).toEqual({});
                                });
                            });
                        });
                    });
                });

                describe('with optional bindings', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binDns', undefined, {
                            containerTemplate: 'test-border-template.html'
                        });
                        $ctrl.$onInit();
                    }));

                    it('exposes default container template', function () {
                        expect($ctrl.containerTemplate).toEqual('test-border-template.html');
                    });
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

            describe('<div bin-blog-searchable-feed/>', function () {
                beforeEach(inject(function ($compile, $rootScope) {
                    var $scope = $rootScope.$new();
                    var element = $compile('<div bin-blog-searchable-feed/>')($scope);
                    $rootScope.$digest();
                    this.$ctrl = element.controller('binBlogSearchableFeed');
                }));

                it('exposes a replayable binartax instance', function () {
                    var spy = jasmine.createSpyObj('spy', ['evt']);
                    this.$ctrl.events.notify('evt', 'ctx');

                    this.$ctrl.events.observe(spy);

                    expect(spy.evt).toHaveBeenCalledWith('ctx');
                });

            });

            describe('<bin-blog-search/>', function () {
                beforeEach(inject(function ($componentController, $location) {
                    this.$location = $location;
                    this.searchableFeed = {events: new ReplayableBinartaRX()};
                    this.$ctrl = $componentController('binBlogSearch', {}, {searchableFeed: this.searchableFeed});
                    this.searchableFeed.events.observe({
                        search: function (payload) {
                            this.payload = payload;
                        }.bind(this)
                    })
                }));

                describe('$onInit', function () {
                    beforeEach(function () {
                        binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                        this.$ctrl.$onInit();
                    });

                    it('fires a search event with an undefined content fitler', function () {
                        expect(this.payload).toEqual({content: undefined});
                    });

                    describe('and entering search terms', function () {
                        beforeEach(function () {
                            this.withSearchTerm = function (term) {
                                this.$ctrl.content = term;
                                this.$ctrl.search();
                            }
                        });

                        it('stores the search term in $location and notifies listeners', function () {
                            this.withSearchTerm('content');

                            expect(this.$location.search().content).toEqual('content');
                            expect(this.payload.content).toEqual('content');
                        });

                        it('coerces empty strings into undefined', function () {
                            this.withSearchTerm('');

                            expect(this.$location.search().content).toBeUndefined();
                            expect(this.payload.content).toBeUndefined();
                        });
                    });
                });

                describe('$onInit with previous search term in url', function () {
                    beforeEach(function () {
                        binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                        this.$location.search('content', 'content');
                        this.$ctrl.$onInit();
                    });

                    it('fires a search event with the extracted search term', function () {
                        expect(this.payload.content).toEqual('content');
                    });
                })
            });

            describe('<bin-blog-feed/>', function () {
                beforeEach(inject(function ($componentController) {
                    this.searchableFeed = {events: new ReplayableBinartaRX()};
                    $ctrl = $componentController('binBlogFeed', null, {searchableFeed: this.searchableFeed});
                }));

                it('load an initial set of published blog posts when the component initialises and binarta has initialised', function () {
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                    $ctrl.$onInit();
                    expect(binarta.publisher.db.findAllPublishedBlogsForLocale).toHaveBeenCalled();
                });

                it('does not load an initial set of posts when autoload is disabled', inject(function ($componentController) {
                    $ctrl = $componentController('binBlogFeed', null, {autoload: 'false'});
                    binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                    $ctrl.$onInit();
                    expect(binarta.publisher.db.findAllPublishedBlogsForLocale).not.toHaveBeenCalled();
                }));

                describe('$onInit', function () {
                    beforeEach(function () {
                        binarta.publisher.db = {
                            findAllPublishedBlogsForLocale: function (request, response) {
                                expect(request.type).toBeUndefined();
                                response.success([{id: 'x'}, {id: 'y'}]);
                            }
                        };
                        $ctrl.$onInit();
                        binarta.application.adhesiveReading.read('-'); // make binarta.schedule trigger
                    });

                    afterEach(function () {
                        $ctrl.$onDestroy();
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

                    describe('and search event was received', function () {
                        beforeEach(function () {
                            binarta.publisher.db = {
                                findAllPublishedBlogsForLocale: function (request, response) {
                                    expect(request.content).toEqual('content');
                                    response.success([{id: 'x'}]);
                                }
                            };
                            this.searchableFeed.events.notify('search', {content: 'content'});
                        });

                        it('throws away previously loaded posts and exposes the new ones', function () {
                            expect($ctrl.posts).toEqual([{id: 'x', uri: '/blog/post/x'}]);
                        });
                    });
                });

                describe('$onInit with blog type', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binBlogFeed', null, {type: 'type'});
                        $ctrl.$onInit();
                        binarta.application.adhesiveReading.read('-');
                    }));

                    it('finds all published blogs for the blog type', function () {
                        expect(binarta.publisher.db.findAllPublishedBlogsForLocale).toHaveBeenCalledWith(jasmine.objectContaining({type: 'type'}), jasmine.anything())
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

                describe('$onInit with blog type', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binBlogDraftFeed', null, {type: 'type'});
                        $ctrl.$onInit();
                        binarta.application.adhesiveReading.read('-');
                    }));

                    it('finds all published blogs for the blog type', function () {
                        expect(binarta.publisher.db.findAllBlogsInDraftForLocale).toHaveBeenCalledWith(jasmine.objectContaining({type: 'type'}), jasmine.anything())
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

                it('supports adding a draft for a blog type', inject(function ($componentController) {
                    binarta.publisher.db = jasmine.createSpyObj('db', ['add']);

                    $ctrl = $componentController('binAddBlogPost', null, {type: 'type'});
                    $ctrl.$onInit();
                    binarta.checkpoint.gateway.addPermission('new.blog.post');
                    binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    binarta.checkpoint.profile.refresh();
                    binarta.application.lock.reserve();

                    $ctrl.add();

                    expect(binarta.publisher.db.add).toHaveBeenCalledWith(jasmine.objectContaining({type: 'type'}), jasmine.anything());
                }));
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

                    it('setting type invokes db', function () {
                        binarta.publisher.db = jasmine.createSpyObj('db', ['setType']);

                        $ctrl.post.type = 'type';
                        $ctrl.setType();

                        expect(binarta.publisher.db.setType).toHaveBeenCalledWith({
                            id: 'p',
                            type: 'type'
                        }, jasmine.anything());
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
            });

            describe('/blog{/type}', function () {
                var config;

                beforeEach(inject(['$controller', '$routeParams', 'BinSearchBlogPostsRouteController.config', function ($controller, $routeParams, _config_) {
                    this.config = _config_;
                    this.$routeParams = $routeParams;

                    this.init = function () {
                        this.$ctrl = $controller('BinSearchBlogPostsRouteController', {});
                    }
                }]));

                it('exposes template names', function () {
                    this.init();

                    expect(this.$ctrl.decoratorTemplate).toEqual('bin-all-route-decorator.html');
                    expect(this.$ctrl.pageTemplate).toEqual('bin-publisher-blog-search-route.html');
                });

                it('the decorator template can be overridden', inject(function ($controller) {
                    this.config.decoratorTemplate = 't';

                    this.init();

                    expect(this.$ctrl.decoratorTemplate).toEqual('t');
                }));

                it('exposes the blogType', function () {
                    $routeParams.blogType = 'type';

                    this.init();

                    expect(this.$ctrl.type).toBe('type');
                })
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
                    expect($ctrl.headerTemplate).toBeUndefined();
                    expect($ctrl.sidebarTemplate).toBeUndefined();
                });

                it('the decorator template can be overridden', inject(function ($controller) {
                    config.decoratorTemplate = 't';
                    expect($controller('BinDisplayBlogPostRouteController', {}).decoratorTemplate).toEqual('t');
                }));

                it('the template can be overridden', inject(function ($controller) {
                    config.template = 't';
                    expect($controller('BinDisplayBlogPostRouteController', {}).template).toEqual('t');
                }));

                it('supports overriding the headerTemplate', inject(function ($controller) {
                    config.headerTemplate = 't';
                    expect($controller('BinDisplayBlogPostRouteController', {}).headerTemplate).toEqual('t');
                }));

                it('supports overriding the sidebarTemplate', inject(function ($controller) {
                    config.sidebarTemplate = 't';
                    expect($controller('BinDisplayBlogPostRouteController', {}).sidebarTemplate).toEqual('t');
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

                it('on summary step an optional comment can be specified', function () {
                    binarta.shop.checkout.start({provider: 'with-sufficient-funds'}, ['summary', 'completed']);

                    ctrl.comment = 'x';
                    ctrl.confirm();

                    expect(binarta.shop.checkout.context().order.comment).toEqual('x');
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

                    expect(ctrl.status()).toEqual('summary');
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

            describe('<bin-address/>', function () {
                var $ctrl;

                beforeEach(inject(function ($componentController) {
                    binarta.checkpoint.profile.edit();
                    binarta.checkpoint.profile.updateRequest().address.label = 'home';
                    binarta.checkpoint.profile.updateRequest().address.addressee = 'John Doe';
                    binarta.checkpoint.profile.updateRequest().address.street = 'Johny Lane';
                    binarta.checkpoint.profile.updateRequest().address.number = '1';
                    binarta.checkpoint.profile.updateRequest().address.zip = '1000';
                    binarta.checkpoint.profile.updateRequest().address.city = 'Johnyville';
                    binarta.checkpoint.profile.updateRequest().address.country = 'BE';
                    binarta.checkpoint.profile.update();
                    $ctrl = $componentController('binAddress', null, {});
                    $ctrl.onSelect = jasmine.createSpy('on-select');
                }));

                afterEach(function () {
                    $ctrl.$onDestroy();
                });

                it('mode defaults to display', function () {
                    expect($ctrl.mode).toEqual('display');
                });

                it('expose profile status', function () {
                    expect($ctrl.profileStatus()).toEqual('idle');
                });

                it('expose address status', function () {
                    expect($ctrl.addressStatus()).toEqual('awaiting-selection');
                });

                it('expose all addresses', function () {
                    expect($ctrl.addresses().map(function (it) {
                        return it.label;
                    })).toEqual(['home']);
                });

                it('when selecting an address then the selection listener is triggered', function () {
                    $ctrl.select('home');
                    expect($ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                });

                it('when an undefined initial address is specified', function () {
                    $ctrl.initialAddress = undefined;
                    $ctrl.$onInit();
                    expect($ctrl.onSelect).not.toHaveBeenCalled();
                });

                it('when a known initial address is specified', function () {
                    $ctrl.initialAddress = {label: 'home'};
                    $ctrl.$onInit();
                    expect($ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                });

                it('when the initial address matches the default then changes to the default change the selection', function () {
                    $ctrl.default = {label: 'home'};
                    $ctrl.initialAddress = {label: 'home'};
                    $ctrl.$onInit();
                    $ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                    expect($ctrl.label).toEqual('work');
                });

                it('when the initial address does not match the default then changes to the default are ignored', function () {
                    $ctrl.default = {label: 'work'};
                    $ctrl.initialAddress = {label: 'home'};
                    $ctrl.$onInit();
                    $ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                    expect($ctrl.label).toEqual('home');
                });

                describe('when a specific address is selected', function () {
                    beforeEach(function () {
                        $ctrl.select('home');
                    });

                    it('expose address status', function () {
                        expect($ctrl.addressStatus()).toEqual('idle');
                    });

                    it('expose attributes', function () {
                        expect($ctrl.addressee()).toEqual('John Doe');
                        expect($ctrl.street()).toEqual('Johny Lane');
                        expect($ctrl.number()).toEqual('1');
                        expect($ctrl.zip()).toEqual('1000');
                        expect($ctrl.city()).toEqual('Johnyville');
                        expect($ctrl.country()).toEqual('BE');
                    });

                    it('expose countries', function () {
                        expect($ctrl.countries().length > 0).toBeTruthy();
                    });

                    describe('when in edit mode', function () {
                        beforeEach(function () {
                            $ctrl.edit();
                        });

                        it('expose updated status', function () {
                            expect($ctrl.addressStatus()).toEqual('editing');
                        });

                        it('expose update request as form', function () {
                            expect($ctrl.form).toEqual({
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
                            $ctrl.form.addressee = 'Jane Smith';
                            $ctrl.update();
                            expect($ctrl.addressee()).toEqual('Jane Smith');
                        });

                        it('regenerate the address label on update', function () {
                            $ctrl.generateLabel = true;

                            $ctrl.update();

                            expect($ctrl.form.label).toEqual('(1000) Johny Lane 1');
                            expect($ctrl.addressee()).toEqual('John Doe');
                        });

                        it('cancel editing', function () {
                            $ctrl.cancel();
                            expect($ctrl.addressStatus()).toEqual('idle');
                        });
                    });
                });

                describe('when specifying a default address', function () {
                    beforeEach(function () {
                        $ctrl.default = {label: 'home'};
                        $ctrl.$onInit();
                    });

                    it('then the corresponding address is selected', function () {
                        expect($ctrl.label).toEqual('home');
                    });

                    it('then the selection listener is triggered', function () {
                        expect($ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                    });

                    it('when the default address is changed then the selected address also changes', function () {
                        $ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                        expect($ctrl.label).toEqual('work');
                    });

                    it('when something other than the default address is changed then the selected address remains as is', function () {
                        $ctrl.$onChanges({purpose: {currentValue: '-'}});
                        expect($ctrl.label).toEqual('home');
                    });

                    it('when selecting null then fallback to default label', function () {
                        $ctrl.select(null);
                        expect($ctrl.label).toEqual('home');
                    });

                    it('when a selection is made changes to the default address are ignored', function () {
                        $ctrl.select('neighbour');
                        $ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                        expect($ctrl.label).toEqual('neighbour');
                    });
                });

                it('cancel new address has no effect when profile is in editing mode but this controller did not cause it', function () {
                    binarta.checkpoint.profile.edit();
                    $ctrl.cancelNewAddress();
                    expect($ctrl.profileStatus()).toEqual('editing');
                });

                describe('when entering create a new address mode', function () {
                    beforeEach(function () {
                        $ctrl.$onInit();
                        $ctrl.new();
                    });

                    it('then profile status changes to editing', function () {
                        expect($ctrl.profileStatus()).toEqual('editing');
                    });

                    it('then expose profile update request', function () {
                        expect($ctrl.form).toEqual(binarta.checkpoint.profile.updateRequest().address);
                    });

                    describe('when creating a new address', function () {
                        var ctrl2;

                        beforeEach(inject(function ($componentController) {
                            ctrl2 = $componentController('binAddress', null, {});
                            ctrl2.$onInit();

                            $ctrl.form.label = 'work';
                            $ctrl.form.addressee = 'John Doe';
                            $ctrl.form.street = 'Johny Lane';
                            $ctrl.form.number = '1';
                            $ctrl.form.zip = '1000';
                            $ctrl.form.city = 'Johnyville';
                            $ctrl.form.country = 'BE';

                            $ctrl.create();
                        }));

                        afterEach(function () {
                            ctrl2.$onDestroy();
                        });

                        it('then the address is added to the profile', function () {
                            expect(binarta.checkpoint.profile.addresses().map(function (it) {
                                return it.label
                            })).toEqual(['home', 'work']);
                        });

                        it('then the newly created address is selected', function () {
                            expect($ctrl.label).toEqual('work');
                        });
                    });

                    it('when create address is rejected then expose the violation report', function () {
                        $ctrl.form.label = 'invalid';
                        $ctrl.create();
                        expect($ctrl.violationReport()).toEqual({label: ['invalid']});
                    });

                    it('then it can be canceled', function () {
                        $ctrl.cancelNewAddress();
                        expect($ctrl.profileStatus()).toEqual('idle');
                    });
                });

                it('with collect as active delivery method and purpose is collect then status becomes enabled', function () {
                    $ctrl.purpose = 'collect';
                    $ctrl.$onInit();
                    binarta.application.setProfile({activeDeliveryMethod: 'collect'});
                    expect($ctrl.status).toEqual('enabled');
                });

                it('with collect as active delivery method and purpose is shipping then status becomes disabled', function () {
                    $ctrl.purpose = 'shipping';
                    $ctrl.$onInit();
                    binarta.application.setProfile({activeDeliveryMethod: 'collect'});
                    expect($ctrl.status).toEqual('disabled');
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

                    it('then the user is not redirected', function () {
                        expect($window.location).toBeUndefined();
                    });
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

                    describe('and reinitialised without tokens', function () {
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

                    describe('and reinitialised with tokens', function () {
                        beforeEach(inject(function ($window) {
                            $window.location = undefined;
                            $routeParams.id = 'i';
                            $ctrl.$onInit();
                        }));

                        it('then the payment is confirmed', function () {
                            expect($ctrl.onConfirmed).toHaveBeenCalledWith({id: 'i'});
                        });

                        it('then the user is not redirected to the approval url', inject(function ($timeout) {
                            $timeout.verifyNoPendingTasks();
                        }));

                        it('and reinitialised again then visit the approval url', inject(function ($timeout, $window) {
                            $routeParams.id = undefined;
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

                it('given a payment id as route parameter when controller is initialised then confirm payment', inject(function ($routeParams) {
                    $routeParams.id = 'i';
                    $ctrl.$onInit();
                    expect($ctrl.onConfirmed).toHaveBeenCalledWith({id: 'i'});
                }));

                it('given a paypal token as route parameter when controller is initialised then confirm payment', inject(function ($routeParams) {
                    $routeParams.token = 't';
                    $ctrl.$onInit();
                    expect($ctrl.onConfirmed).toHaveBeenCalledWith({token: 't'});
                }));
            });

            describe('bin-stripe-connect component', function () {
                describe('when disconnected', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binStripeConnect', null, {});
                        $ctrl.$onInit();
                    }));

                    afterEach(function () {
                        $ctrl.$onDestroy();
                    });

                    it('exposes status', function () {
                        expect($ctrl.status).toEqual('disconnected');
                    });

                    it('connect', inject(function ($window) {
                        $ctrl.connect();
                        expect($window.location).toEqual('http://example.org/stripe');
                    }));

                    it('connecting while controller destroy hook has been called will not redirect', function () {
                        $ctrl.$onDestroy();
                        $ctrl.connect();
                        expect($window.location).toBeUndefined();
                    });
                });

                describe('when connected', function () {
                    beforeEach(inject(function ($componentController) {
                        binarta.shop.gateway.stripeConnect(undefined, {
                            success: function () {
                            }
                        });
                        $ctrl = $componentController('binStripeConnect', null, {});
                        $ctrl.$onInit();
                    }));

                    afterEach(function () {
                        $ctrl.$onDestroy();
                    });

                    it('expose connected status', function () {
                        expect($ctrl.status).toEqual('connected');
                    });

                    it('expose account id', function () {
                        expect($ctrl.id).toEqual('stripe-account-id');
                    });

                    it('disconnect', function () {
                        $ctrl.disconnect();
                        expect($ctrl.status).toEqual('disconnected');
                    });
                });
            });

            describe('bin-payment-on-receipt-config component', function () {
                describe('when disabled', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binPaymentOnReceiptConfig', null, {});
                        $ctrl.$onInit();
                    }));

                    it('exposes status', function () {
                        expect($ctrl.status).toEqual('disabled');
                    });

                    it('exposes params', function () {
                        expect($ctrl.params).toBeUndefined();
                    });

                    it('configure', function () {
                        $ctrl.configure();
                        expect($ctrl.status).toEqual('configured');
                        $ctrl.disable();
                    });

                    it('configuring while controller destroy hook has been called will not receive updates', function () {
                        $ctrl.$onDestroy();
                        $ctrl.configure();
                        expect($ctrl.status).toEqual('disabled');
                    });
                });

                describe('when configured', function () {
                    beforeEach(inject(function ($componentController) {
                        binarta.shop.gateway.configurePaymentOnReceipt({}, {
                            success: function () {
                            }
                        });
                        $ctrl = $componentController('binPaymentOnReceiptConfig', null, {});
                        $ctrl.$onInit();
                    }));

                    afterEach(function () {
                        $ctrl.$onDestroy();
                    });

                    it('expose configured status', function () {
                        expect($ctrl.status).toEqual('configured');
                    });

                    it('expose params', function () {
                        expect($ctrl.params).toEqual({});
                    });

                    describe('disable', function () {
                        beforeEach(function () {
                            $ctrl.disable();
                        });

                        it('expose diabled status', function () {
                            expect($ctrl.status).toEqual('disabled');
                        });

                        it('expose updated params', function () {
                            expect($ctrl.params).toBeUndefined();
                        });
                    });
                });
            });

            describe('bin-cc-config component', function () {
                describe('when disabled', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binCcConfig', null, {});
                        $ctrl.$onInit();
                    }));

                    it('exposes status', function () {
                        expect($ctrl.status).toEqual('disabled');
                    });

                    it('exposes params', function () {
                        expect($ctrl.params).toEqual({
                            supportedBy: ['piggybank', 'megabank']
                        });
                    });

                    it('configure', function () {
                        $ctrl.params.bankId = 'piggybank';
                        $ctrl.configure();
                        expect($ctrl.status).toEqual('configured');
                    });

                    describe('when configuration is rejected', function () {
                        beforeEach(function () {
                            $ctrl.configure();
                        });

                        it('expose the violation report', function () {
                            expect($ctrl.violationReport).toEqual({
                                bankId: ['required']
                            });
                        });

                        it('on re-configuration clear the violation report', function () {
                            $ctrl.params.bankId = 'piggybank';
                            $ctrl.configure();
                            expect($ctrl.violationReport).toBeUndefined();
                        });
                    });

                    it('configuring while controller destroy hook has been called will not receive updates', function () {
                        $ctrl.$onDestroy();
                        $ctrl.params.bankId = 'piggybank';
                        $ctrl.configure();
                        expect($ctrl.status).toEqual('disabled');
                    });
                });

                describe('when configured', function () {
                    beforeEach(inject(function ($componentController) {
                        binarta.shop.gateway.configureCC({bankId: 'piggybank'}, {
                            success: function () {
                            }
                        });
                        $ctrl = $componentController('binCcConfig', null, {});
                        $ctrl.$onInit();
                    }));

                    afterEach(function () {
                        $ctrl.$onDestroy();
                    });

                    it('expose configured status', function () {
                        expect($ctrl.status).toEqual('configured');
                    });

                    it('expose params', function () {
                        expect($ctrl.params).toEqual({
                            bankId: 'piggybank',
                            supportedBy: ['piggybank', 'megabank']
                        });
                    });

                    describe('disable', function () {
                        beforeEach(function () {
                            $ctrl.disable();
                        });

                        it('expose diabled status', function () {
                            expect($ctrl.status).toEqual('disabled');
                        });

                        it('expose updated params', function () {
                            expect($ctrl.params).toEqual({
                                supportedBy: ['piggybank', 'megabank']
                            });
                        });
                    });

                    it('disable clears the violation report', function () {
                        $ctrl.violationReport = 'violation-report';
                        $ctrl.disable();
                        expect($ctrl.violationReport).toBeUndefined();
                    });
                });
            });

            describe('bin-bancontact-config component', function () {
                describe('when disabled', function () {
                    beforeEach(inject(function ($componentController) {
                        $ctrl = $componentController('binBancontactConfig', null, {});
                        $ctrl.$onInit();
                    }));

                    it('exposes status', function () {
                        expect($ctrl.status).toEqual('disabled');
                    });

                    it('exposes params', function () {
                        expect($ctrl.params).toEqual({
                            supportedBy: ['piggybank', 'megabank']
                        });
                    });

                    it('configure', function () {
                        $ctrl.params.owner = 'John Doe';
                        $ctrl.params.bankId = 'piggybank';
                        $ctrl.configure();
                        expect($ctrl.status).toEqual('configured');
                    });

                    describe('when configuration is rejected', function () {
                        beforeEach(function () {
                            $ctrl.configure();
                        });

                        it('expose the violation report', function () {
                            expect($ctrl.violationReport).toEqual({
                                bankId: ['required'],
                                owner: ['required']
                            });
                        });

                        it('on re-configuration clear the violation report', function () {
                            $ctrl.params.owner = 'John Doe';
                            $ctrl.params.bankId = 'piggybank';
                            $ctrl.configure();
                            expect($ctrl.violationReport).toBeUndefined();
                        });
                    });

                    it('configuring while controller destroy hook has been called will not receive updates', function () {
                        $ctrl.$onDestroy();
                        $ctrl.params.owner = 'John Doe';
                        $ctrl.params.bankId = 'piggybank';
                        $ctrl.configure();
                        expect($ctrl.status).toEqual('disabled');
                    });
                });

                describe('when configured', function () {
                    beforeEach(inject(function ($componentController) {
                        binarta.shop.gateway.configureBancontact({owner: 'John Doe', bankId: 'piggybank'}, {
                            success: function () {
                            }
                        });
                        $ctrl = $componentController('binBancontactConfig', null, {});
                        $ctrl.$onInit();
                    }));

                    afterEach(function () {
                        $ctrl.$onDestroy();
                    });

                    it('expose configured status', function () {
                        expect($ctrl.status).toEqual('configured');
                    });

                    it('expose params', function () {
                        expect($ctrl.params).toEqual({
                            owner: 'John Doe',
                            bankId: 'piggybank',
                            supportedBy: ['piggybank', 'megabank']
                        });
                    });

                    describe('disable', function () {
                        beforeEach(function () {
                            $ctrl.disable();
                        });

                        it('expose diabled status', function () {
                            expect($ctrl.status).toEqual('disabled');
                        });

                        it('expose updated params', function () {
                            expect($ctrl.params).toEqual({
                                supportedBy: ['piggybank', 'megabank']
                            });
                        });
                    });

                    it('disable clears the violation report', function () {
                        $ctrl.violationReport = 'violation-report';
                        $ctrl.disable();
                        expect($ctrl.violationReport).toBeUndefined();
                    });
                });
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

            describe('<bin-delivery-methods/>', function () {
                describe('when unauthenticated', function () {
                    it('render blank', function () {
                        expect(render('<bin-delivery-methods></bin-delivery-methods>')).toEqual('');
                    });

                    it('with profile render blank', function () {
                        binarta.application.setProfile({activeDeliveryMethod: 'shipping'});
                        expect(render('<bin-delivery-methods></bin-delivery-methods>')).toEqual('');
                    });
                });

                describe('when authenticated', function () {
                    beforeEach(function () {
                        binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    });

                    it('render blank', function () {
                        expect(render('<bin-delivery-methods></bin-delivery-methods>')).toEqual('');
                    });

                    it('supported methods on controller are not known without permission', inject(function ($componentController) {
                        $ctrl = $componentController('binDeliveryMethods', null, {});
                        $ctrl.$onInit();
                        expect($ctrl.supportedMethods).not.toBeDefined();
                        $ctrl.$onDestroy();
                    }));

                    describe('with permission', function () {
                        beforeEach(function () {
                            binarta.checkpoint.gateway.addPermission('get.delivery.method.params');
                        });

                        describe('with controller', function () {
                            var $ctrl;

                            beforeEach(inject(function ($componentController) {
                                $ctrl = $componentController('binDeliveryMethods', null, {});
                                $ctrl.$onInit();
                            }));

                            afterEach(function () {
                                $ctrl.$onDestroy();
                            });

                            it('exposes status', function () {
                                expect($ctrl.status).toEqual('idle');
                            });

                            it('exposes supported methods', function () {
                                expect($ctrl.supportedMethods).toEqual(['shipping', 'collect']);
                            });

                            it('exposes active method', function () {
                                expect($ctrl.activeMethod).toEqual('shipping');
                            });

                            describe('when activating method', function () {
                                beforeEach(function () {
                                    $ctrl.activeMethod = 'collect';
                                    $ctrl.activate();
                                });

                                it('exposed active method reflects activated method', function () {
                                    expect($ctrl.activeMethod).toEqual('collect');
                                });

                                it('internally the active method is updated', function () {
                                    binarta.shop.deliveryMethods.observe({
                                        activeDeliveryMethod: function (it) {
                                            expect(it).toEqual('collect');
                                        }
                                    }).disconnect();
                                });
                            });
                        });
                    });
                });

                describe('when configured', function () {
                    beforeEach(inject(function ($componentController) {
                        binarta.shop.gateway.configurePaymentOnReceipt({}, {
                            success: function () {
                            }
                        });
                        $ctrl = $componentController('binPaymentOnReceiptConfig', null, {});
                        $ctrl.$onInit();
                    }));

                    afterEach(function () {
                        $ctrl.$onDestroy();
                    });

                    it('expose configured status', function () {
                        expect($ctrl.status).toEqual('configured');
                    });

                    it('expose params', function () {
                        expect($ctrl.params).toEqual({});
                    });

                    describe('disable', function () {
                        beforeEach(function () {
                            $ctrl.disable();
                        });

                        it('expose diabled status', function () {
                            expect($ctrl.status).toEqual('disabled');
                        });

                        it('expose updated params', function () {
                            expect($ctrl.params).toBeUndefined();
                        });
                    });
                });
            })
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

        describe('binarta-edit-modejs-angular1', function () {
            describe('component controller decorator', function () {
                beforeEach(inject(function ($controller, topicRegistry) {
                    this.topicRegistry = topicRegistry;
                    this.controller = $controller('TestComponentController');
                }));

                it('exposes an indicator for edit mode status which is disabled by default', function () {
                    expect(this.controller.editMode.enabled).toBe(false);
                });

                it('enables the indicator when an edit mode event with positive payload is received', function () {
                    this.topicRegistry.fire('edit.mode', true);

                    expect(this.controller.editMode.enabled).toBe(true);
                });

                it('disables the indicator again when an edit mode event with negative payload is received', function () {
                    this.topicRegistry.fire('edit.mode', true);
                    this.topicRegistry.fire('edit.mode', false);

                    expect(this.controller.editMode.enabled).toBe(false);
                });

                it('unregisters the event when the controller is destroyed', function () {
                    this.controller.$onDestroy();

                    this.topicRegistry.fire('edit.mode', true);

                    expect(this.controller.editMode.enabled).toBe(false);
                });
            });
        });

        describe('binarta-calendarjs-angular1', function () {
            describe('<bin-calendar-upcoming-events/>', function () {
                beforeEach(inject(function ($componentController) {
                    $ctrl = $componentController('binCalendarUpcomingEvents');
                }));

                it('events are empty without initialization', function () {
                    expect($ctrl.events).toEqual([]);
                });

                it('events are loaded from server on init', inject(function (binartaCalendarGateway) {
                    binartaCalendarGateway.upcomingEvents = ['a', 'b', 'c'];
                    $ctrl.$onInit();
                    expect($ctrl.events).toEqual(['a', 'b', 'c']);
                }));
            });
        });

        describe('binarta-namespacesjs-angular1', function () {
            var $ctrl;

            beforeEach(inject(function ($componentController) {
                $ctrl = $componentController('binNamespaceAdd', null, {});
                $ctrl.$onInit();
            }));

            afterEach(function () {
                $ctrl.$onDestroy();
            });

            it('initially enters personal mode', function () {
                expect($ctrl.mode).toEqual('personal');
            });

            describe('on reseller', function () {
                beforeEach(function () {
                    $ctrl.hooks.reseller();
                });

                it('switch to reseller mode', function () {
                    expect($ctrl.mode).toEqual('reseller');
                });

                it('switch to personal mode', function () {
                    $ctrl.hooks.disabled();
                    expect($ctrl.mode).toEqual('personal');
                });
            });
        });

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
        'binarta-edit-modejs-angular1',
        'binarta-publisherjs-angular1',
        'binarta-shopjs-angular1',
        'binarta-humanresourcesjs-angular1',
        'binarta-calendarjs-angular1',
        'binarta-namespacesjs-angular1'
    ])
        .service('$window', MockWindow)
        .factory('i18nLocation', MockI18nLocationFactory)
        .service('viewport', MockViewport)
        .service('dependencyA', DependencyStub)
        .service('dependencyB', DependencyStub)
        .service('resourceLoader', MockResourceLoader)
        .service('applicationBrand', MockApplicationBrand)
        .controller('TestComponentController', ['dependencyA', 'dependencyB', binComponentController(TestComponentController)])
        .filter('trust', ['$sce', MockTrustFilter])
        .config(ExtendBinarta);

    angular.module('notifications', [])
        .service('topicRegistry', [MockTopicRegistry]);

    function MockTopicRegistry() {
        var topics = {};

        this.fire = function (topic, payload) {
            var handlers = topics[topic] || [];
            handlers.forEach(function (handler) {
                handler(payload);
            });
        };

        this.subscribe = function (topic, handler) {
            if (topics[topic] === undefined)
                topics[topic] = [];
            topics[topic].push(handler);
            return function () {
                var handlers = topics[topic];
                var index = handlers.indexOf(handler);
                if (index != -1) handlers.splice(index, 1);
            }
        };
    }

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

    function MockResourceLoader() {
    }

    function MockApplicationBrand() {
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
        angular.module('binarta-calendarjs-gateways-angular1', ['binarta-calendarjs-' + strategy + '-angular1'])
            .provider('binartaCalendarGateway', [strategy + 'BinartaCalendarGatewayProvider', proxy]);

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

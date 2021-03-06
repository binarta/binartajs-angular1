(function () {
    var binarta;

    angular.module('binarta-checkpointjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-checkpointjs-gateways-angular1',
        'config'
    ])
        .provider('checkpoint', ['binartaCheckpointGatewayProvider', CheckpointProvider])
        .component('binCheckpoint', new CheckpointComponent())
        .controller('CheckpointController', ['binarta', 'config', CheckpointController])
        .component('binUserProfile', new UserProfileComponent())
        .component('binDeleteUserProfile', new DeleteUserProfileComponent())
        .component('binSignin', new SigninComponent())
        .service('UserProfileController.decorator', UserProfileControllerDecorator)
        .controller('UserProfileController', ['binarta', 'UserProfileController.decorator', UserProfileController])
        .controller('DeleteUserProfileController', ['binarta', 'i18nLocation', DeleteUserProfileController])
        .config(['binartaProvider', 'checkpointProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
        .run(['checkpoint', WireAngularDependencies]);

    function CheckpointProvider(provider) {
        this.checkpoint = new BinartaCheckpointjs();
        this.checkpoint.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.checkpoint;
        }]
    }

    function UI() {
        var self = this;
    }

    function CheckpointComponent() {
        this.bindings = {
            mode: '@',
            listener: '<'
        };
        this.controller = 'CheckpointController';
        this.templateUrl = 'bin-checkpoint-form.html';
    }

    function CheckpointController(binarta, config) {
        var self = this;

        this.$onInit = function () {
            if (this.mode == 'signin')
                self.switchToSigninMode();
            if (this.mode == 'registration')
                self.switchToRegistrationMode();
        };

        this.switchToSigninMode = function () {
            clearForm();
            this.mode = 'signin';
            this.recaptchaPublicKey = undefined;
            self.submit = function () {
                $('form input[type="password"]').trigger('change');
                binarta.checkpoint.signinForm.submit({
                    username: this.username,
                    password: this.password
                }, self.listener);
            };
            self.status = binarta.checkpoint.signinForm.status;
            self.violationReport = binarta.checkpoint.signinForm.violation;
        };

        this.switchToRegistrationMode = function () {
            clearForm();
            this.mode = 'registration';
            this.recaptchaPublicKey = config.recaptchaPublicKey;
            self.submit = function () {
                $('form input[type="password"]').trigger('change');
                binarta.checkpoint.registrationForm.submit({
                    email: this.email,
                    username: this.username,
                    password: this.password,
                    vat: this.company == 'yes' ? this.vat : '',
                    captcha: this.captcha
                }, self.listener);
            };
            self.status = binarta.checkpoint.registrationForm.status;
            self.violationReport = binarta.checkpoint.registrationForm.violationReport;
        };

        function clearForm() {
            delete self.email;
            delete self.username;
            delete self.password;
            delete self.company;
            delete self.vat;
            delete self.captcha;
        }

        this.submit = function () {
            throw new Error('checkpoint.submit.requires.an.operation.mode.to.be.selected');
        };

        this.status = function () {
            return 'idle';
        };

        function emptyViolationReport() {
            return {};
        }

        this.violationReport = emptyViolationReport;
    }

    function DeleteUserProfileComponent() {
        this.controller = 'DeleteUserProfileController';
        this.templateUrl = 'bin-checkpoint-delete-profile-component.html';
    }

    function DeleteUserProfileController(binarta, $location) {
        var self = this;
        self.working = false;

        this.submit = function () {
            self.working = true;
            binarta.checkpoint.profile.delete({
                success: function () {
                    self.working = false;
                    $location.path('/');
                }
            });
        }
    }

    function UserProfileComponent() {
        this.controller = 'UserProfileController';
        this.templateUrl = 'bin-checkpoint-profile-component.html';
    }

    function UserProfileControllerDecorator() {
        var decorators = [];

        this.add = function (it) {
            decorators.push(it);
        };

        this.decorate = function (ctrl) {
            decorators.forEach(function (it) {
                it(ctrl);
            });
        }
    }

    function UserProfileController(binarta, decorator) {
        var self = this;
        decorator.decorate(self);

        this.status = binarta.checkpoint.profile.status;
        this.email = binarta.checkpoint.profile.email;

        this.edit = function () {
            binarta.checkpoint.profile.edit();
            self.form = binarta.checkpoint.profile.updateRequest();
        };

        this.update = function () {
            binarta.checkpoint.profile.update();
        };

        this.cancel = function () {
            binarta.checkpoint.profile.cancel();
        };
    }

    function SigninComponent() {
        this.templateUrl = 'bin-all-signin.html';

        this.controller = ['binarta', function (binarta) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                var observer = binarta.checkpoint.profile.eventRegistry.observe({
                    signedin: onSignedIn,
                    signedout: onSignedOut
                });

                binarta.checkpoint.profile.isAuthenticated() ? onSignedIn() : onSignedOut();

                $ctrl.signout = function () {
                    binarta.checkpoint.profile.signout();
                };

                $ctrl.$onDestroy = function () {
                    observer.disconnect();
                };
            };

            function onSignedIn() {
                $ctrl.authenticated = true;
            }

            function onSignedOut() {
                $ctrl.authenticated = false;
            }
        }];
    }

    function ExtendBinarta(binarta, checkpointProvider) {
        binarta.addSubSystems({checkpoint: checkpointProvider.checkpoint});
    }

    function WireAngularDependencies(checkpoint) {
        binarta = checkpoint.binarta;
    }

    function InstallRoutes($routeProvider) {
        $routeProvider
            .when('/billing/agreement/confirm', {
                templateUrl: 'bin-checkpoint-confirm-billing-agreement.html',
                controller: 'ConfirmBillingAgreementController as ctrl'
            })
            .when('/billing/agreement/cancel', {
                templateUrl: 'bin-checkpoint-cancel-billing-agreement.html',
                controller: 'CancelBillingAgreementController as ctrl'
            })
            .when('/:locale/billing/agreement/confirm', {
                templateUrl: 'bin-checkpoint-confirm-billing-agreement.html',
                controller: 'ConfirmBillingAgreementController as ctrl'
            })
            .when('/:locale/billing/agreement/cancel', {
                templateUrl: 'bin-checkpoint-cancel-billing-agreement.html',
                controller: 'CancelBillingAgreementController as ctrl'
            });
    }

    binComponentControllerExtenders.push(function ($ctrl) {
        $ctrl.profile = new ComponentControllerProfile($ctrl);
    });

    function ComponentControllerProfile($ctrl) {
        var self = this;

        self.addWithPermissionHandler = function (permission, it) {
            function testForPermissionAndCallHandler() {
                if (binarta.checkpoint.profile.hasPermission(permission))
                    it.gained();
            }

            testForPermissionAndCallHandler();
            var profileObserver = binarta.checkpoint.profile.eventRegistry.observe({
                signedin: testForPermissionAndCallHandler,
                signedout: it.lost
            });
            $ctrl.addDestroyHandler(function () {
                profileObserver.disconnect();
            });
        }
    }
})();
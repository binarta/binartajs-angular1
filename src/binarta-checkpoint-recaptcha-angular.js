(function () {
    angular.module('binarta-checkpointjs-recaptcha-angular1', ['bin.recaptcha', 'binarta-checkpointjs-angular1'])
        .run(['binarta', 'vcRecaptchaService', InstallRecaptchaSupport]);

    function InstallRecaptchaSupport(binarta, vcRecaptchaService) {
        binarta.checkpoint.registrationForm.eventListener = new RegistrationEventListener(vcRecaptchaService)
    }

    function RegistrationEventListener(vcRecaptchaService) {
        this.rejected = function () {
            vcRecaptchaService.reload(false);
        };
    }
})();
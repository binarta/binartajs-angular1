(function(angular) {
    angular.module('binarta-edit-modejs-angular1', ['notifications'])
        .run(['topicRegistry', BinComponentControllerExtenderInstaller]);

    function BinComponentControllerExtenderInstaller(topicRegistry) {
        binComponentControllerExtenders.push(function($ctrl) {
            $ctrl.editMode = {enabled: false};

            var unsubscribe = topicRegistry.subscribe('edit.mode', function(enabled) {
                $ctrl.editMode.enabled = enabled;
            });

            $ctrl.addDestroyHandler(unsubscribe);
        });
    }
})(angular);
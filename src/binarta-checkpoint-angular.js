(function() {
    angular.module('binarta-checkpointjs-angular1', ['binartajs-angular1'])
        .provider('checkpoint', CheckpointProvider)
        .config(['binartaProvider', 'checkpointProvider', ExtendBinarta]);

    function CheckpointProvider() {
        this.checkpoint = new BinartaCheckpointjs();
        this.$get = function() {
            return this.checkpoint;
        }
    }

    function ExtendBinarta(binartaProvider, checkpointProvider) {
        binartaProvider.addSubSystems({checkpoint:checkpointProvider.checkpoint});
    }
})();
angular.module("binarta-shopjs-tpls-angular1", []).run(["$templateCache", function($templateCache) {$templateCache.put("bin-checkout-authentication-required.html","<div ng-init=\"checkout.$onInit()\"><h1>Checkout: {{checkout.status()}}</h1><bin-checkpoint mode=\"signin\" listener=\"::checkout.checkpointListener\"></bin-checkpoint></div>");
$templateCache.put("bin-checkout-completed.html","<div ng-init=\"checkout.$onInit()\"><h1>Checkout: {{checkout.status()}}</h1></div>");
$templateCache.put("bin-checkout-start.html","<div ng-init=\"checkout.start()\"><h1>Checkout: {{checkout.status()}}</h1></div>");
$templateCache.put("bin-checkout-summary.html","<div ng-init=\"checkout.$onInit()\"><h1>Checkout: {{checkout.status()}}</h1></div>");}]);
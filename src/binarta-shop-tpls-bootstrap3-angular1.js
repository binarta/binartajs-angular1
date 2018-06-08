angular.module("binarta-shopjs-tpls-angular1", []).run(["$templateCache", function($templateCache) {$templateCache.put("bin-shop-address-form.html","<div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().addressee}\"><label class=\"control-label\" for=\"addressee\" i18n=\"\" code=\"customer.address.addressee.label\" read-only=\"\">{{::var}}</label> <input id=\"addressee\" class=\"form-control\" ng-model=\"$ctrl.form.addressee\"><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().addressee\" i18n=\"\" code=\"customer.address.addressee.{{::v}}\" default=\"Addressee {{::v}}\" read-only=\"\">{{::var}}</p></div><div class=\"row\"><div class=\"col-sm-8\"><div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().street}\"><label class=\"control-label\" for=\"street\" i18n=\"\" code=\"customer.address.street.label\" read-only=\"\">{{::var}}</label> <input id=\"street\" class=\"form-control\" ng-model=\"$ctrl.form.street\"><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().street\" i18n=\"\" code=\"customer.address.street.{{::v}}\" default=\"Street {{::v}}\" read-only=\"\">{{::var}}</p></div></div><div class=\"col-sm-4\"><div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().number}\"><label class=\"control-label\" for=\"number\" i18n=\"\" code=\"customer.address.number.label\" read-only=\"\">{{::var}}</label> <input id=\"number\" class=\"form-control\" ng-model=\"$ctrl.form.number\"><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().number\" i18n=\"\" code=\"customer.address.number.{{::v}}\" default=\"Number {{::v}}\" read-only=\"\">{{::var}}</p></div></div></div><div class=\"row\"><div class=\"col-sm-8\"><div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().city}\"><label class=\"control-label\" for=\"city\" i18n=\"\" code=\"customer.address.city.label\" read-only=\"\">{{::var}}</label> <input id=\"city\" class=\"form-control\" ng-model=\"$ctrl.form.city\"><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().city\" i18n=\"\" code=\"customer.address.city.{{::v}}\" default=\"City {{::v}}\" read-only=\"\">{{::var}}</p></div></div><div class=\"col-sm-4\"><div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().zip}\"><label class=\"control-label\" for=\"zip\" i18n=\"\" code=\"customer.address.zip.label\" read-only=\"\">{{::var}}</label> <input id=\"zip\" class=\"form-control\" ng-model=\"$ctrl.form.zip\"><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().zip\" i18n=\"\" code=\"customer.address.zip.{{::v}}\" default=\"Zip {{::v}}\" read-only=\"\">{{::var}}</p></div></div></div><div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().country}\"><label class=\"control-label\" for=\"country\" i18n=\"\" code=\"customer.address.country.label\" read-only=\"\">{{::var}}</label><select id=\"country\" class=\"form-control\" ng-model=\"$ctrl.form.country\" ng-options=\"c.code as c.country for c in $ctrl.countries()\"></select><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().country\" i18n=\"\" code=\"customer.address.country.{{::v}}\" default=\"Country {{::v}}\" read-only=\"\">{{::var}}</p></div>");
$templateCache.put("bin-shop-address.html","<div class=\"panel panel-default panel-address\"><div class=\"panel-heading\" i18n=\"\" code=\"shop.{{$ctrl.purpose}}.address.panel.title\" read-only=\"\"><i class=\"fa fa-home fa-fw\"></i> {{::var}} <button class=\"btn btn-default btn-sm\" ng-if=\"$ctrl.mode == \'selection\' && $ctrl.profileStatus() == \'idle\' && $ctrl.addresses().length > 0\" ng-click=\"$ctrl.new()\" i18n=\"\" code=\"shop.new.button\" read-only=\"\"><i class=\"fa fa-plus fa-fw\"></i> {{::var}}</button></div><div class=\"panel-body\" ng-if=\"$ctrl.mode == \'selection\'\"><form ng-if=\"$ctrl.addresses().length == 0\" ng-submit=\"$ctrl.new()\"><div class=\"form-group text-center\"><button type=\"submit\" class=\"btn btn-default\" i18n=\"\" code=\"shop.new.button\" read-only=\"\"><i class=\"fa fa-plus fa-fw\"></i> {{::var}}</button></div></form><form ng-if=\"$ctrl.isSelectingAddress()\"><div class=\"form-group\" ng-if=\"$ctrl.addresses().length > 0\"><select class=\"form-control\" ng-model=\"$ctrl.label\" ng-options=\"a.label as a.label for a in $ctrl.addresses()\" ng-change=\"$ctrl.select($ctrl.label)\"></select></div><div class=\"form-group\" ng-if=\"$ctrl.addressee()\"><hr><button class=\"btn btn-default btn-sm pull-right\" ng-if=\"$ctrl.profileStatus() == \'idle\'\" ng-click=\"$ctrl.edit()\" i18n=\"\" code=\"shop.edit.button\" read-only=\"\"><i class=\"fa fa-pencil fa-fw\"></i> {{::var}}</button><address><strong>{{$ctrl.addressee()}}</strong><br>{{$ctrl.street()}} {{$ctrl.number()}}<br>{{$ctrl.zip()}} {{$ctrl.city()}}<br>{{$ctrl.country() | toCountryName}}</address></div></form><form ng-if=\"$ctrl.isCreatingAddress()\" ng-submit=\"$ctrl.create()\"><ng-include src=\"\'bin-shop-address-form.html\'\"></ng-include><div class=\"form-group\"><div class=\"pull-right\"><button type=\"submit\" class=\"btn btn-success\" ng-disabled=\"$ctrl.profileStatus() == \'working\'\" i18n=\"\" code=\"shop.save.button\" read-only=\"\"><span ng-show=\"working\"><i class=\"fa fa-spinner fa-spin fa-fw\"></i></span> <span ng-hide=\"working\"><i class=\"fa fa-check fa-fw\"></i></span> {{::var}}</button> <button type=\"button\" class=\"btn btn-default\" ng-click=\"$ctrl.cancelNewAddress()\" ng-disabled=\"$ctrl.profileStatus() == \'working\'\" i18n=\"\" code=\"shop.cancel.button\" read-only=\"\"><i class=\"fa fa-times fa-fw\"></i> {{::var}}</button></div></div></form><form ng-if=\"$ctrl.isEditingAddress()\" ng-submit=\"$ctrl.update()\"><ng-include src=\"\'bin-shop-address-form.html\'\"></ng-include><div class=\"form-group\"><div class=\"pull-right\"><button type=\"submit\" class=\"btn btn-success\" ng-disabled=\"$ctrl.addressStatus() == \'working\'\" i18n=\"\" code=\"shop.save.button\" read-only=\"\"><span ng-show=\"working\"><i class=\"fa fa-spinner fa-spin fa-fw\"></i></span> <span ng-hide=\"working\"><i class=\"fa fa-check fa-fw\"></i></span> {{::var}}</button> <button type=\"button\" class=\"btn btn-default\" ng-click=\"$ctrl.cancel()\" ng-disabled=\"$ctrl.addressStatus() == \'working\'\" i18n=\"\" code=\"shop.cancel.button\" read-only=\"\"><i class=\"fa fa-times fa-fw\"></i> {{::var}}</button></div></div></form></div><div class=\"panel-body\" ng-if=\"$ctrl.mode == \'display\'\"><address><strong>{{$ctrl.addressee()}}</strong><br>{{$ctrl.street()}} {{$ctrl.number()}}<br>{{$ctrl.zip()}} {{$ctrl.city()}}<br>{{$ctrl.country() | toCountryName}}</address></div></div>");
$templateCache.put("bin-shop-basket-details.html","<bin-content-header title-key=\"shop.basket.title\" sub-title-key=\"shop.basket.title\"></bin-content-header><bin-basket class=\"bin-basket-panel\" mode=\"detailed\"></bin-basket>");
$templateCache.put("bin-shop-basket-list-item-default.html","<div class=\"bin-basket-item thumbnail clearfix\"><div ng-controller=\"binImageCarouselHeroController as hero\" ng-init=\"hero.init({id: item.id, items: item.carousel})\"><a class=\"item-image\" bin-href=\"{{::\'/view\' + item.id}}\" ng-if=\"::hero.image\"><img bin-image=\"{{::hero.image.path}}\" read-only=\"\"></a></div><div class=\"caption\"><h3 class=\"item-title\"><a bin-href=\"{{::\'/view\' + item.id}}\" i18n=\"\" code=\"{{::item.id}}\" read-only=\"\" ng-bind=\"::var\"></a></h3><div class=\"item-remove\" i18n=\"\" code=\"shop.remove.item.confirm\" read-only=\"\"><button class=\"btn btn-danger btn-sm\" type=\"button\" ng-click-confirm=\"item.remove()\" confirm-message=\"{{::var}}\"><i class=\"fa fa-times\"></i></button></div><form ng-submit=\"update(item)\"><div class=\"form-group\"><div class=\"input-group\"><input type=\"number\" min=\"1\" class=\"form-control\" ng-model=\"item.quantity\" ng-change=\"item.update()\"> <span class=\"input-group-btn\"><button class=\"btn btn-default\" type=\"button\" ng-click=\"item.incrementQuantity()\" ng-disabled=\"working\"><i class=\"fa fa-plus\"></i></button> <button class=\"btn btn-default\" type=\"button\" ng-click=\"item.decrementQuantity()\" ng-disabled=\"item.quantity < 2 || working\"><i class=\"fa fa-minus\"></i></button></span></div></div></form><table class=\"item-prices\"><tbody><tr><th i18n=\"\" code=\"shop.item.price.label\" read-only=\"\">{{::var}}</th><td><span class=\"item-price\" ng-bind=\"::item.presentableTotal\"></span></td></tr></tbody></table></div></div>");
$templateCache.put("bin-shop-basket.html","<a bin-href=\"{{\'/basket\'}}\" ng-if=\"($ctrl.mode == \'link\' || $ctrl.mode == \'minimal-link\') && $ctrl.preview.quantity > 0\"><i class=\"fa fa-shopping-cart fa-fw\"></i> ({{$ctrl.preview.quantity}}) <span ng-if=\"$ctrl.mode == \'link\'\">{{$ctrl.preview.presentablePrice}}</span></a> <a ng-click=\"$ctrl.onDropdownClick()\" ng-if=\"$ctrl.mode == \'dropdown-link\' && $ctrl.preview.quantity > 0\"><i class=\"fa fa-shopping-cart fa-fw\"></i> <span class=\"total-quantity\">{{$ctrl.preview.quantity}}</span><div class=\"basket-items-dropdown\" ng-if=\"$ctrl.isDropdownActive\"><a ng-click=\"$ctrl.onCloseDropdownClick()\" class=\"close-dropdown-btn\"><i class=\"fa fa-window-close-o\" aria-hidden=\"true\"></i></a><ul><li ng-repeat=\"item in $ctrl.preview.items\"><div class=\"item-name\" i18n=\"\" code=\"{{::item.id}}\" read-only=\"\">{{::var}}</div><div class=\"item-total\" ng-bind=\"item.presentableTotal\"></div></li><a class=\"btn btn-primary\" bin-href=\"{{\'/basket\'}}\" i18n=\"\" code=\"shop.checkout.button\">{{var}}</a></ul></div></a><div ng-if=\"$ctrl.mode == \'add-to-basket-button\'\"><button class=\"btn btn-success\" ng-hide=\"$ctrl.itemAdded\" ng-click=\"$ctrl.addToBasket()\" i18n=\"\" code=\"catalog.item.add.to.basket.button\" read-only=\"\"><i class=\"fa fa-shopping-cart fa-fw\"></i> {{var}}</button> <button class=\"btn btn-success\" ng-show=\"$ctrl.itemAdded\" i18n=\"\" code=\"catalog.item.add.to.basket.button.success\" read-only=\"\" disabled=\"\"><i class=\"fa fa-shopping-cart fa-fw\"></i> {{var}}</button></div><div class=\"container\" ng-if=\"$ctrl.mode == \'summary\'\"><div class=\"row\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\"><div class=\"panel panel-default\"><div class=\"panel-heading\" i18n=\"\" code=\"shop.basket.panel.title\" read-only=\"\"><i class=\"fa fa-shopping-cart fa-fw\"></i> {{::var}}</div><div class=\"panel-body\"><div class=\"row\"><table class=\"table\"><thead><tr><th i18n=\"\" code=\"shop.basket.summary.item.label\" read-only=\"\">{{::var}}</th><th class=\"text-right\" i18n=\"\" code=\"shop.basket.summary.quantity.label\" read-only=\"\">{{::var}}</th><th class=\"text-right\" i18n=\"\" code=\"shop.basket.summary.price.label\" read-only=\"\">{{::var}}</th></tr></thead><tbody><tr ng-repeat=\"item in $ctrl.preview.items\"><td i18n=\"\" code=\"{{::item.id}}\" read-only=\"\">{{::var}}</td><td class=\"text-right\">{{::item.quantity}}</td><td class=\"text-right\" ng-bind=\"item.presentableTotal\"></td></tr></tbody></table><div class=\"col-xs-12\"><hr></div></div><div class=\"bin-basket-prices text-right\"><div class=\"row\"><div class=\"col-xs-8 col-sm-10\" i18n=\"\" code=\"shop.prices.subtotal.label\" read-only=\"\"><strong>{{::var}}</strong></div><div class=\"col-xs-4 col-sm-2\" ng-bind=\"$ctrl.preview.presentableItemTotal\"></div></div><div class=\"row\" ng-repeat=\"item in $ctrl.preview.additionalCharges\"><div class=\"col-xs-8 col-sm-10\" i18n=\"\" code=\"shop.prices.{{::item.label}}.label\" default=\"{{::item.label}}\" read-only=\"\"><strong>{{::var}}</strong></div><div class=\"col-xs-4 col-sm-2\" ng-bind=\"item.presentableValue\"></div></div><div class=\"row\"><div ng-if=\"!$ctrl.isDiscounted()\" class=\"col-xs-8 col-sm-10\" i18n=\"\" code=\"shop.prices.total.label\" read-only=\"\"><strong>{{::var}}</strong></div><div ng-if=\"$ctrl.isDiscounted()\" class=\"col-xs-8 col-sm-10\" i18n=\"\" code=\"shop.prices.discounted.total.label\" read-only=\"\"><strong>{{::var}}</strong></div><div class=\"col-xs-4 col-sm-2\"><div class=\"basket-total-price\" ng-bind=\"$ctrl.preview.presentablePrice\"></div></div></div></div></div></div></div></div></div><div class=\"container-fluid\" ng-if=\"$ctrl.mode == \'detailed\'\"><div class=\"row\" ng-if=\"$ctrl.preview.items.length == 0\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\"><div class=\"bin-status-visual\"><i class=\"fa fa-shopping-cart\"></i></div><h3 class=\"bin-status-visual-title\" i18n=\"\" code=\"shop.basket.empty.message\" read-only=\"\" ng-bind=\"::var\"></h3></div></div><div class=\"row\" ng-if=\"$ctrl.preview.items.length > 0\"><div class=\"col-xs-12\"><div ng-include=\"\'bin-shop-basket-list.html\'\" class=\"col-xs-12 col-md-8\"></div><div ng-include=\"\'bin-shop-basket-summary.html\'\" class=\"col-xs-12 col-md-4\"></div></div></div></div>");
$templateCache.put("bin-shop-checkout-address-selection.html","<div ng-init=\"checkout.$onInit()\"><bin-checkout-header sub-title-key=\"shop.checkout.address.selection\"></bin-checkout-header><div class=\"container bin-checkout-body\"><div class=\"row\"><div class=\"col-xs-12 col-sm-5 col-sm-offset-1 col-lg-4 col-lg-offset-2\"><bin-address purpose=\"billing\" mode=\"selection\" on-select=\"checkout.setBillingAddress\" generate-label=\"true\" initial-address=\"checkout.addresses.billing\"></bin-address></div><div class=\"col-xs-12 col-sm-5 col-lg-4\"><bin-address purpose=\"shipping\" mode=\"selection\" default=\"checkout.addresses.billing\" on-select=\"checkout.setShippingAddress\" generate-label=\"true\" initial-address=\"checkout.addresses.shipping\"></bin-address></div></div><div class=\"row\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\"><hr><a bin-href=\"/basket\" class=\"btn btn-default\" i18n=\"\" code=\"shop.back.button\" read-only=\"\"><i class=\"fa fa-caret-left fa-fw\"></i> {{::var}}</a> <button class=\"btn btn-success pull-right\" i18n=\"\" code=\"shop.continue.button\" read-only=\"\" ng-click=\"checkout.selectAddresses()\" ng-disabled=\"checkout.isAwaitingSelection()\"><i class=\"fa fa-caret-right fa-fw\"></i> {{::var}}</button></div></div></div></div>");
$templateCache.put("bin-shop-checkout-authentication-required.html","<div ng-init=\"checkout.$onInit()\"><bin-checkout-header sub-title-key=\"shop.checkout.authentication.required\"></bin-checkout-header><div class=\"container bin-checkout-body\"><div class=\"row\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\"><bin-checkpoint mode=\"signin\" listener=\"::checkout.checkpointListener\"></bin-checkpoint></div></div></div></div>");
$templateCache.put("bin-shop-checkout-completed.html","<div class=\"bin-shop\" ng-init=\"checkout.$onInit()\"><bin-checkout-header sub-title-key=\"shop.order.finalizing.confirmed.title\"></bin-checkout-header><div class=\"container bin-checkout-body\"><div class=\"row\"><div class=\"col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3\"><div class=\"bin-status-visual\"><span ng-show=\"working\"><i class=\"fa fa-spinner fa-spin\"></i></span> <span ng-hide=\"working || violations[\'payment\']\"><i class=\"fa fa-check\"></i></span> <span ng-hide=\"working || !violations[\'payment\']\"><i class=\"fa fa-times\"></i></span></div><h3 class=\"bin-status-visual-title\" ng-if=\"!(working || violations[\'payment\'])\" i18n=\"\" code=\"shop.order.finalizing.confirmed.title\" read-only=\"\" ng-bind=\"::var\"></h3><h3 class=\"bin-status-visual-title\" ng-if=\"!working && violations[\'payment\']\" i18n=\"\" code=\"shop.order.finalizing.rejected.title\" read-only=\"\" ng-bind=\"::var\"></h3><div ng-repeat=\"v in violations[\'payment\']\"><div class=\"alert\" ng-class=\"v.level == \'Warning\' ? \'alert-warning\' : \'alert-danger\'\"><i class=\"fa fa-exclamation-triangle fa-fw\"></i> {{v.code}}: {{::v.description}}</div></div></div></div></div></div>");
$templateCache.put("bin-shop-checkout-header.html","<bin-content-header title-key=\"shop.checkout.title\" sub-title-key=\"{{::$ctrl.subTitleKey}}\"></bin-content-header>");
$templateCache.put("bin-shop-checkout-payment.html","<div ng-init=\"$ctrl.$onInit()\"><bin-checkout-header sub-title-key=\"shop.checkout.payment\"></bin-checkout-header><div class=\"container bin-checkout-body\"><div class=\"row\"><bin-pay ng-if=\"$ctrl.order().provider != \'wire-transfer\'\" provider=\"paypal-classic\" order=\"$ctrl.order()\" on-confirmed=\"$ctrl.confirmPayment\" on-canceled=\"$ctrl.cancelPayment\"></bin-pay><div ng-if=\"$ctrl.order().provider == \'wire-transfer\'\"><div class=\"col-xs-12 col-sm-8 col-sm-offset-2 col-md-6 col-md-offset-3\"><div class=\"bin-status-visual\"><i class=\"fa fa-check\"></i></div><h3 class=\"bin-status-visual-title\" i18n=\"\" code=\"shop.order.finalizing.confirmed.title\" read-only=\"\" ng-bind=\"::var\"></h3><div class=\"well\" ng-controller=\"AccountMetadataController\"><p i18n=\"\" code=\"shop.order.finalizing.confirmed.message\" read-only=\"\">{{::var}}</p><p ng-if=\"::metadata.email\" i18n=\"\" code=\"shop.order.finalizing.confirmed.communication.message\" read-only=\"\">{{::var}} <strong>{{::metadata.email}}</strong></p></div></div></div></div></div></div>");
$templateCache.put("bin-shop-checkout-roadmap.html","<div><h1>roadmap</h1><ol><li ng-repeat=\"step in ::$ctrl.roadmap\" i18n=\"\" code=\"shop.checkout.step.{{step.name}}\" default=\"{{step.name}}\"><span ng-if=\"step.locked\">{{var}} (locked)</span> <a ng-if=\"step.unlocked\" bin-href=\"{{\'/checkout/\' + step.name}}\">{{var}} (unlocked)</a> <span ng-if=\"step.name == $ctrl.currentStep\">(current)</span></li></ol></div>");
$templateCache.put("bin-shop-checkout-setup-payment-provider.html","<div ng-init=\"checkout.$onInit()\"><bin-checkout-header sub-title-key=\"shop.checkout.setup.payment.provider\"></bin-checkout-header><bin-setup-payment-provider class=\"bin-checkout-body\" provider=\"paypal-classic\" method=\"billing-agreement\" on-confirmed=\"checkout.retry\"></bin-setup-payment-provider></div>");
$templateCache.put("bin-shop-checkout-start.html","<div ng-init=\"checkout.start(true)\"><h1>Checkout: {{checkout.status()}}</h1></div>");
$templateCache.put("bin-shop-checkout-summary.html","<div ng-init=\"$ctrl.$onInit()\"><bin-checkout-header sub-title-key=\"shop.summary.title\"></bin-checkout-header><div class=\"container bin-checkout-body\"><div class=\"row\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\"><bin-user-profile></bin-user-profile></div></div><div class=\"row\"><div class=\"col-xs-12 col-sm-5 col-sm-offset-1 col-lg-4 col-lg-offset-2\"><bin-address purpose=\"billing\" label=\"{{::$ctrl.order().billing.label}}\"></bin-address></div><div class=\"col-xs-12 col-sm-5 col-lg-4\"><bin-address purpose=\"shipping\" label=\"{{::$ctrl.order().shipping.label}}\"></bin-address></div></div><div class=\"row\"><bin-basket mode=\"summary\" order=\"$ctrl.order()\"></bin-basket></div><div class=\"row\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\"><bin-payment-methods on-select=\"$ctrl.setPaymentProvider\" default=\"$ctrl.getPaymentProvider()\" violations=\"$ctrl.violationReport().provider\"></bin-payment-methods></div></div><div class=\"row\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\" ng-class=\"{\'has-error\': $ctrl.violationReport().coupon}\"><bin-coupon verification=\"disabled\"></bin-coupon><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().coupon\" i18n=\"\" code=\"shop.order.coupon.{{::v}}\" read-only=\"\">{{::var}}</p></div></div><div class=\"row\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\"><div class=\"terms-agreement-message\"><small ng-init=\"ppoc.form.termsAndConditions = \'accepted\'\" i18n=\"\" code=\"shop.confirm.terms.message\" read-only=\"\"><i class=\"fa fa-info-circle fa-fw\"></i> {{::var}}</small></div></div></div><div class=\"row\" ng-repeat=\"v in $ctrl.violationReport().transaction\" ng-show=\"$ctrl.violationReport().transaction && v.code == \'insufficient.funds.available\'\"><div class=\"col-xs-12 col-md-10 col-md-offset-1\"><div class=\"panel panel-danger\"><div class=\"panel-heading\" i18n=\"\" code=\"order.summary.insufficient.funds.available\" default=\"insufficient.funds.available\" read-only=\"\" ng-bind=\"::var\"></div></div></div></div><div class=\"row\"><div class=\"col-xs-12 col-sm-10 col-sm-offset-1 col-lg-8 col-lg-offset-2\"><hr><a ng-if=\"$ctrl.hasPreviousStep()\" bin-href=\"/checkout/{{$ctrl.previousStep()}}\" class=\"btn btn-default\" i18n=\"\" code=\"shop.back.button\" read-only=\"\"><i class=\"fa fa-caret-left fa-fw\"></i> {{::var}}</a> <button class=\"btn btn-success pull-right\" i18n=\"\" code=\"shop.confirm.button\" read-only=\"\" ng-click=\"$ctrl.confirm()\"><span ng-hide=\"working\"><i class=\"fa fa-check fa-fw\"></i></span> <span ng-show=\"working\"><i class=\"fa fa-spinner fa-spin fa-fw\"></i></span> {{::var}}</button></div></div></div></div>");
$templateCache.put("bin-shop-coupon-component.html","<form class=\"coupon\" ng-if=\"$ctrl.isRequired()\" ng-submit=\"$ctrl.verify()\"><div class=\"form-group\" ng-class=\"{\'has-warning\': $ctrl.couponInvalid, \'has-success\': $ctrl.couponValid}\"><div class=\"row\"><div class=\"col-xs-12 col-sm-6\" i18n=\"\" code=\"coupon.code.purpose\">{{var}}</div><div class=\"col-xs-12 col-sm-6\"><div class=\"input-group input-group-sm\"><span class=\"input-group-addon hidden-xs\"><i class=\"fa fa-lock\"></i></span> <input type=\"text\" class=\"form-control\" i18n=\"\" code=\"coupon.code.label\" placeholder=\"{{var}}\" ng-model=\"$ctrl.couponCode\" ng-change=\"$ctrl.resetCouponValidation()\"> <span class=\"input-group-btn\" ng-if=\"!$ctrl.isVerificationDisabled() && $ctrl.couponCode\"><button class=\"btn btn-success\" type=\"submit\" ng-click=\"$ctrl.verify()\" i18n=\"\" code=\"coupon.code.submit\">{{var}}</button></span></div></div></div><div class=\"help-block\" ng-if=\"$ctrl.couponCode && $ctrl.couponInvalid\" i18n=\"\" code=\"coupon.code.invalid\">{{var}}</div></div></form>");
$templateCache.put("bin-shop-payment-methods.html","<div class=\"panel panel-default\" ng-class=\"{\'has-error\': $ctrl.violations}\"><div class=\"panel-heading\" i18n=\"\" code=\"shop.payment.method.panel.title\" read-only=\"\"><i class=\"fa fa-credit-card-alt fa-fw\"></i> {{::var}}</div><div class=\"panel-body\"><div ng-repeat=\"method in $ctrl.availablePaymentMethods()\"><div class=\"radio\"><label i18n=\"\" code=\"purchase.orders.payment.method.{{::method}}\" read-only=\"\"><input type=\"radio\" name=\"availablePaymentMethods\" ng-value=\"::method\" ng-model=\"$ctrl.paymentProvider\" ng-change=\"$ctrl.select()\"> {{::var}}</label> <small i18n=\"\" code=\"shop.payment.wire.transfer.restriction.message\" read-only=\"\" ng-if=\"::method == \'wire-transfer\'\">- {{::var}}</small></div></div><p class=\"help-block\" ng-repeat=\"v in $ctrl.violations\" i18n=\"\" code=\"shop.order.provider.{{::v}}\" default=\"{{::v}}\" read-only=\"\">{{::var}}</p></div></div>");
$templateCache.put("bin-shop-payment.html","<div class=\"bin-shop bin-shop-fullscreen\"><div class=\"container\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"text-center text-muted\"><i class=\"fa fa-spinner fa-spin fa-5x\"></i><h3>Redirecting...</h3></div></div></div></div></div>");
$templateCache.put("bin-shop-setup-payment-provider.html","<div><div class=\"container\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"text-center text-muted\"><i class=\"fa fa-spinner fa-spin fa-5x\"></i><h3>Redirecting...</h3></div></div></div></div></div>");}]);
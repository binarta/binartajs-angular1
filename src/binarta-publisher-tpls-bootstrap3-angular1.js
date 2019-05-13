angular.module("binarta-publisherjs-tpls-angular1", []).run(["$templateCache", function($templateCache) {$templateCache.put("bin-publisher-add-post.html","<div class=\"bin-add-article-button\" ng-if=\"$ctrl.status != \'disabled\'\"><button type=\"button\" class=\"bin-btn bin-btn-primary bin-btn-floated\" ng-disabled=\"$ctrl.status != \'idle\'\" ng-click=\"$ctrl.add()\" i18n=\"\" code=\"blog.article.add.new.button\" read-only=\"\" watch-on-code=\"\"><span ng-hide=\"$ctrl.status == \'drafting\'\"><i class=\"fa fa-plus fa-fw\"></i></span> <span ng-show=\"$ctrl.status == \'drafting\'\"><i class=\"fa fa-spinner fa-spin fa-fw\"></i></span> <span ng-bind=\"var\"></span></button></div>");
$templateCache.put("bin-publisher-blog-draft-feed.html","<div class=\"bin-blog bin-blog-drafts\" ng-if=\"$ctrl.posts.length > 0\"><div class=\"panel panel-default\"><div class=\"panel-heading\" i18n=\"\" code=\"blog.drafts.title\" read-only=\"\" ng-bind=\"::var\"></div><div class=\"panel-body\"><bin-blog-post ng-repeat=\"post in $ctrl.posts track by post.id\" post=\"post\" template=\"bin-publisher-blog-post-draft-list.html\"></bin-blog-post><div class=\"text-center\" ng-if=\"$ctrl.posts.length >= $ctrl.count\"><bin-search-more mode=\"link\" status=\"$ctrl.status\" search-more=\"$ctrl.more\"></bin-search-more></div></div></div></div>");
$templateCache.put("bin-publisher-blog-feed-widget.html","<bin-blog-draft-feed count=\"20\"></bin-blog-draft-feed><bin-add-blog-post></bin-add-blog-post><bin-blog-feed count=\"20\" post-template=\"{{::$ctrl.postTemplateUrl}}\"></bin-blog-feed>");
$templateCache.put("bin-publisher-blog-feed.html","<bin-blog-post ng-repeat=\"post in $ctrl.posts track by post.id\" post=\"post\" template=\"{{::$ctrl.postTemplate}}\"></bin-blog-post><bin-search-more ng-hide=\"$ctrl.max\" status=\"$ctrl.status\" search-more=\"$ctrl.more\"></bin-search-more><bin-no-items ng-if=\"$ctrl.posts.length === 0 && $ctrl.status === \'no-more\'\"></bin-no-items>");
$templateCache.put("bin-publisher-blog-more.html","<a ng-if=\"$ctrl.mode == \'link\'\" bin-href=\"/blog\" class=\"btn btn-primary view-more-link\"><span i18n=\"\" code=\"catalog.view.more.button\" read-only=\"\" ng-bind=\"::var\"></span> <i class=\"fa fa-arrow-right fa-fw\"></i></a>");
$templateCache.put("bin-publisher-blog-post-attribute.html","<span ng-bind-html=\"$ctrl.value | trust\"></span>");
$templateCache.put("bin-publisher-blog-post-breadcrumb.html","<ol><li><a bin-href=\"/blog\" i18n=\"\" code=\"navigation.label.blog\" read-only=\"\" ng-bind=\"var\"></a></li><li class=\"active\">{{::$ctrl.value}}</li></ol>");
$templateCache.put("bin-publisher-blog-post-cover-image.html","<img class=\"cover\" bin-image=\"{{::$ctrl.value}}\">");
$templateCache.put("bin-publisher-blog-post-default.html","<bin-blog-post-breadcrumb></bin-blog-post-breadcrumb><bin-blog-post-cover-image></bin-blog-post-cover-image><bin-display-blog-title></bin-display-blog-title><bin-blog-post-publication-time></bin-blog-post-publication-time><bin-display-blog-lead></bin-display-blog-lead><bin-display-blog-body></bin-display-blog-body><bin-blog-post-link></bin-blog-post-link>");
$templateCache.put("bin-publisher-blog-post-draft-list.html","<a bin-href=\"{{::$ctrl.post.uri}}\">{{::$ctrl.post.title}}</a>");
$templateCache.put("bin-publisher-blog-post-link-label.html","<span ng-if=\"$ctrl.linkMode == \'to-details\'\" i18n=\"\" code=\"blog.read.more\" read-only=\"\">{{::var}}</span> <span ng-if=\"$ctrl.linkMode == \'from-details\'\" i18n=\"\" code=\"blog.back\" read-only=\"\"><i class=\"fa fa-chevron-left fa-fw\"></i> {{::var}}</span>");
$templateCache.put("bin-publisher-blog-post-link.html","<a bin-href=\"{{::$ctrl.value}}\"><ng-include src=\"::$ctrl.labelTemplateUrl\"></ng-include></a>");
$templateCache.put("bin-publisher-blog-post-publication-time-raw.html","<bin-catalog-publication-time time=\"::$ctrl.$parent.value\" format=\"{{::$ctrl.$parent.format}}\" class=\"info theme-pc theme-hover-pbc\"></bin-catalog-publication-time>");
$templateCache.put("bin-publisher-blog-post-publication-time.html","<bin-blog-post-raw-publication-time ng-if=\"!$ctrl.templateUrl\"></bin-blog-post-raw-publication-time><ng-include ng-if=\"$ctrl.$value && $ctrl.templateUrl\" src=\"$ctrl.templateUrl\"></ng-include>");
$templateCache.put("bin-publisher-blog-post-route.html","<bin-display-blog-post id=\"{{::$ctrl.id}}\" template=\"{{::$ctrl.template}}\" header-template=\"{{::$ctrl.headerTemplate}}\" sidebar-template=\"{{::$ctrl.sidebarTemplate}}\" class=\"bin-blog\"></bin-display-blog-post>");
$templateCache.put("bin-publisher-blog-post.html","<ng-include ng-if=\"::$ctrl.post\" src=\"$ctrl.postTemplate\"></ng-include>");
$templateCache.put("bin-publisher-blog-search-route.html","<bin-blog-feed-widget></bin-blog-feed-widget>");
$templateCache.put("bin-publisher-blog-spotlight.html","<bin-add-blog-post></bin-add-blog-post><bin-blog-feed class=\"grid\" max=\"{{::$ctrl.max}}\" post-template=\"{{::$ctrl.postTemplateUrl}}\"></bin-blog-feed><bin-blog-more mode=\"link\"></bin-blog-more>");
$templateCache.put("bin-publisher-display-blog-body.html","<bin-application-lock><span ng-if=\"$lock.status == \'open\'\" ng-bind-html=\"$ctrl.parent.post.body|trust\"></span><i18n ng-if=\"$lock.status == \'closed\' && $ctrl.parent.post.id\" code=\"{{::$ctrl.parent.post.id}}.body\" editor=\"full-media\" ng-bind-html=\"var|trust\"></i18n></bin-application-lock>");
$templateCache.put("bin-publisher-display-blog-lead.html","<bin-application-lock><ng-include ng-if=\"$lock.status == \'open\'\" src=\"$ctrl.openedTemplate\"></ng-include><ng-include ng-if=\"$lock.status == \'closed\' && $ctrl.parent.post.id\" src=\"$ctrl.closedTemplate\"></ng-include></bin-application-lock><script type=\"text/ng-template\" id=\"bin-publisher-display-blog-lead-opened-default.html\"><span ng-bind-html=\"$ctrl.parent.post.lead|trust\"></span></script><script type=\"text/ng-template\" id=\"bin-publisher-display-blog-lead-closed-default.html\"><i18n code=\"{{::$ctrl.parent.post.id}}.lead\" editor=\"full\" ng-bind-html=\"var|trust\"></i18n></script>");
$templateCache.put("bin-publisher-display-blog-post-details.html","<bin-blog-post post=\"$ctrl.post\" link-mode=\"from-details\"></bin-blog-post>");
$templateCache.put("bin-publisher-display-blog-post.html","<div ng-if=\"::$ctrl.post\" class=\"bin-display-blog\"><div class=\"bin-blog-header\" ng-if=\"::$ctrl.headerTemplate\"><ng-include src=\"$ctrl.headerTemplate\"></ng-include></div><div class=\"bin-blog-content\"><div class=\"bin-blog-post\"><bin-blog-edit status=\"$ctrl.status\"><ng-include src=\"$ctrl.template\"></ng-include></bin-blog-edit></div><div class=\"bin-blog-sidebar\" ng-if=\"::$ctrl.sidebarTemplate\"><ng-include src=\"$ctrl.sidebarTemplate\"></ng-include></div></div></div>");
$templateCache.put("bin-publisher-display-blog-title.html","<bin-application-lock><span ng-if=\"$lock.status == \'open\'\" ng-bind=\"$ctrl.parent.post.title\"></span><i18n ng-if=\"$lock.status == \'closed\' && $ctrl.parent.post.id\" code=\"{{::$ctrl.parent.post.id}}\" ng-bind=\"var\"></i18n></bin-application-lock>");
$templateCache.put("bin-publisher-blog-edit.html","<bin-edit><bin-actions><bin-action-group><bin-action bin-action-type=\"expression\" bin-action-expression=\"$ctrl.publish()\" bin-action-icon-class=\"fa-eye\" bin-action-i18n-code=\"catalog.item.publish\" ng-if=\"$ctrl.status == \'publishable\'\"></bin-action><bin-action bin-action-type=\"expression\" bin-action-expression=\"$ctrl.withdraw()\" bin-action-icon-class=\"fa-eye-slash\" bin-action-i18n-code=\"catalog.item.unpublish\" ng-if=\"$ctrl.status == \'withdrawable\'\"></bin-action><bin-action bin-action-type=\"expression\" bin-action-expression=\"$ctrl.draft()\" bin-action-icon-class=\"fa-language\" bin-action-i18n-code=\"blog.post.translate\" ng-if=\"$ctrl.status == \'translatable\'\"></bin-action><li checkpoint-permission-for=\"delete.blog.post\" ng-show=\"permitted\" i18n=\"\" code=\"blog.article.remove.confirm\" default=\"Are you sure?\" read-only=\"\"><button type=\"button\" class=\"bin-link bin-link-danger\" ng-click-confirm=\"$ctrl.delete()\" confirm-message=\"{{::var}}\" ng-if=\"::var\" ng-disabled=\"$ctrl.status == \'deleting\'\"><span i18n=\"\" code=\"blog.article.remove.button\" read-only=\"\" ng-bind=\"::var\"></span></button></li></bin-action-group></bin-actions><bin-edit-body><div class=\"alert alert-info\" ng-if=\"$ctrl.status == \'publishable\'\"><i class=\"fa fa-eye-slash fa-fw\"></i> <span i18n=\"\" code=\"catalog.item.draft\" read-only=\"\" ng-bind=\"::var\"></span></div><div class=\"alert alert-info\" ng-if=\"$ctrl.status == \'translatable\'\"><i class=\"fa fa-language fa-fw\"></i> <span i18n=\"\" code=\"blog.post.translatable\" read-only=\"\" ng-bind=\"::var\"></span></div><ng-transclude></ng-transclude></bin-edit-body></bin-edit>");
$templateCache.put("bin-publisher-blog-search.html","<form ng-submit=\"$ctrl.search()\"><div class=\"form-group\"><input type=\"text\" class=\"form-control\" ng-model=\"$ctrl.content\" placeholder=\"SEARCH BLOG\"></div></form>");}]);
(function () {
    angular.module('binarta-publisherjs-angular1', [
        'ngRoute',
        'binartajs-angular1'
    ])
        .component('binBlogPreviews', new BlogPreviewsComponent());

    function BlogPreviewsComponent() {
        this.templateUrl = 'bin-publisher-blog-previews.html';
    }
})();
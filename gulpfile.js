var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    template = require('gulp-template'),
    templateCache = require('gulp-angular-templatecache');

var Karma = require('karma').Server;
function test(file) {
    return function(done) {
        new Karma({configFile:__dirname + '/' + file, singleRun:true}, done).start();
    }
}

var minifyHtmlOpts = {
    empty: true,
    cdata: true,
    conditionals: true,
    spare: true,
    quotes: true
};

gulp.task('checkpoint-bootstrap3', function () {
    gulp.src('template/bootstrap3/checkpoint-*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-checkpoint-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-checkpointjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));

    gulp.src('template/bootstrap3/checkout-*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-shop-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-shopjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('test-ui-widgets', test('karma.conf.js'));
gulp.task('test-rest-plugin', test('karma-rest.conf.js'));

gulp.task('default', ['test-ui-widgets', 'test-rest-plugin', 'checkpoint-bootstrap3']);
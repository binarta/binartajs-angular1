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

gulp.task('all-bootstrap3', function () {
    gulp.src(['template/bin-all-*.html', 'template/bootstrap3/bin-all-*.html'])
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-all-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-alljs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('checkpoint-bootstrap3', function () {
    gulp.src('template/bootstrap3/bin-checkpoint-*.html')
        .pipe(template({shop: false}))
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-checkpoint-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-checkpointjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('checkpoint-shop-bootstrap3', function () {
    gulp.src('template/bootstrap3/bin-checkpoint-*.html')
        .pipe(template({shop: true}))
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-checkpoint-shop-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-checkpointjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('publisher-bootstrap3', function () {
    gulp.src(['template/bootstrap3/bin-publisher-*.html', 'template/bootstrap3/publisher/*.html'])
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-publisher-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-publisherjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('calendar-bootstrap3', function () {
    gulp.src('template/bootstrap3/bin-calendar-*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-calendar-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-calendarjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('shop-bootstrap3', function () {
    gulp.src('template/bootstrap3/bin-shop-*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-shop-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-shopjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('namespaces-bootstrap3', function () {
    gulp.src('template/bootstrap3/bin-namespaces-*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-namespaces-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-namespacesjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('test-ui-widgets', test('karma.conf.js'));
gulp.task('test-rest-plugin', test('karma-rest.conf.js'));

gulp.task('templates:all', ['all-bootstrap3', 'checkpoint-bootstrap3', 'checkpoint-shop-bootstrap3', 'publisher-bootstrap3', 'shop-bootstrap3']);

gulp.task('templates:watch', ['templates:all'], function() {
    gulp.watch('template/**/*.html', function (event) {
        gulp.start('templates:all');
    });
});

gulp.task('default', [
    'test-ui-widgets',
    'test-rest-plugin',
    'all-bootstrap3',
    'checkpoint-bootstrap3',
    'checkpoint-shop-bootstrap3',
    'publisher-bootstrap3',
    'calendar-bootstrap3',
    'shop-bootstrap3',
    'namespaces-bootstrap3'
]);
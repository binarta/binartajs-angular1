var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    template = require('gulp-template'),
    templateCache = require('gulp-angular-templatecache');

var minifyHtmlOpts = {
    empty: true,
    cdata: true,
    conditionals: true,
    spare: true,
    quotes: true
};

gulp.task('checkpoint-bootstrap3', function () {
    gulp.src('template/bootstrap3/*.html')
        .pipe(minifyHtml(minifyHtmlOpts))
        .pipe(templateCache('binarta-checkpoint-tpls-bootstrap3-angular1.js', {standalone: true, module: 'binarta-checkpointjs-tpls-angular1'}))
        .pipe(gulp.dest('src'));
});

gulp.task('default', ['checkpoint-bootstrap3']);
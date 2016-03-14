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
        .pipe(templateCache('checkpoint-tpls-bootstrap3.js', {standalone: true, module: 'checkpoint.templates'}))
        .pipe(gulp.dest('src'));
});

gulp.task('default', ['checkpoint-bootstrap3']);
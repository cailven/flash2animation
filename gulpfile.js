var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var insert = require('gulp-insert');
var rimraf = require('gulp-rimraf');
var through2 = require('through2');


var pkg = require('./package.json');
var sources = pkg.sources.files.map(function(file){
    return pkg.sources.src + "/" + file;
});

var config = {
    src:sources,
    dest:"build/"
};

// 让 lint 依赖 clean 是为了，在所有执行前先删除一下目录，因为 gulp 是异步的，所以放在依赖里面更好处理
gulp.task('lint', function() {
    var lintFiles = config.src;
    return gulp.src(lintFiles)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['lint'], function(){
    return gulp.src(config.src)
        .pipe(concat("anim.js"))
        .pipe(gulp.dest(config.dest))
        .pipe(uglify())
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest(config.dest));
});

gulp.task('watch', function() {
    gulp.watch(config.src, ['default']);
});

gulp.task('default', ['build']);
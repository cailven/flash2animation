var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var insert = require('gulp-insert');
var rimraf = require('gulp-rimraf');
var through2 = require('through2');


var pkg = require('./package.json');
var sources = pkg.sources;
var baseFiles = sources.base;
var bridgeFiles = sources.bridge;
var allFiles = baseFiles.concat(bridgeFiles);

var config = {
    standalone: {
        dir: 'build/',
        filename: 'anim.js',
        start: '(function(window, undefined){\n',
        end: '\n})(this);\n'
    }
};

var modify = function() {
    return through2.obj(function(file, encoding, done) {
        var findMetadata = function(code){
            var matches = [], result;
            var module, moduleName, requireModules = [], requireClasses = [];
            var moduleRegExp = /(\*[\s]?@module[\s]+)([\S]+)\s/;
            var requireRegExp = /(\*[\s]?@requires[\s]+)([\S]+)\s/ig;
            var classRegExp = /\/?(\w+)$/;

            //module info
            if((result = moduleRegExp.exec(code)) != null){
                matches.push(result[0]);
                module = result[2];
                moduleName = module.match(classRegExp)[1];
            }

            //require module info
            while((result = requireRegExp.exec(code)) != null){
                matches.push(result[0]);
                var mod = result[2];
                var clazz = mod.match(classRegExp)[1];
                requireModules.push(mod);
                requireClasses.push(clazz);
            }

            return {
                matches: matches,
                module: module,
                moduleName: moduleName,
                requireModules: requireModules,
                requireClasses: requireClasses
            };
        };

        var content = String(file.contents);
        var meta = findMetadata(content);
        var start = "";
        var end = "";

        var getModule = function(module){
            if(module.indexOf("/") > -1){
                return module.replace(/\//g, ".");
            }
            else{
                return "window." + module;
            }
        };

        start = "\n";
        meta.requireModules.forEach(function(module, i){
            start += "var " + meta.requireClasses[i] + " = " + getModule(module) + ";\n";
        });
        start += "\n";

        end = "\n" + getModule(meta.module) + " = " + meta.moduleName + ";\n";

        file.contents = new Buffer(start + content + end);
        this.push(file);
        done();
    });
};

gulp.task('clean', function () {
    return gulp.src(['build'])
        .pipe(rimraf({ force: true }));
});

// 让 lint 依赖 clean 是为了，在所有执行前先删除一下目录，因为 gulp 是异步的，所以放在依赖里面更好处理
gulp.task('lint', ['clean'], function() {
    var lintFiles = allFiles;
    return gulp.src(lintFiles)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('bridge', function(){
    var data = config["standalone"];
    gulp.src(bridgeFiles)
        .pipe(modify())
        .pipe(insert.wrap(data.start, data.end))
        .pipe(gulp.dest(data.dir))
        .pipe(uglify())
        .pipe(rename({ suffix: ".min" })) 
        .pipe(gulp.dest(data.dir))
});

gulp.task('build', ['lint', 'bridge'], function() {
    var data = config["standalone"];
    return gulp.src(baseFiles)
        .pipe(modify())
        .pipe(insert.wrap(data.start, data.end))
        .pipe(concat(data.filename))
        .pipe(gulp.dest(data.dir))
        .pipe(uglify())
        .pipe(rename({ suffix: ".min" })) 
        .pipe(gulp.dest(data.dir))
});

gulp.task('watch', function() {
    gulp.watch(allFiles, ['build']);
});

gulp.task('default', ['build']);
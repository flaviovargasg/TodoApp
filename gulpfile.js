var gulp = require ('gulp');
var uglify = require ('gulp-uglify');
var clean = require ('gulp-clean');
var copy = require('gulp-copy');
var imagemin =require ('gulp-imagemin');
var sass2css = require ('gulp-sass');
var browserSync = require ('browser-sync').create();
var typescript = require ('gulp-typescript');
var tsProject = typescript.createProject('tsconfig.json');
var sourcemaps = require ('gulp-sourcemaps');
var concat = require ('gulp-concat');


// Definición de directorios origen
var srcPaths = {
    images:   'src/img/',
    scripts:  'src/ts/',
    styles:   'src/sass/',
    files:    'src/',
    data:     'data/',
    vendor:   'src/vendor'
};

// Definición de directorios destino
var distPaths = {
    images:   'dist/img/',
    scripts:  'dist/js/',
    styles:   'dist/css/',
    files:    'dist/',
    data:     'dist/data/',
    vendor:   'dist/vendor/'
};

// Limpieza de la carpeta dist
gulp.task('clean', function(cb) {
    clean([ distPaths.files+'*.html', distPaths.images+'**/*', distPaths.scripts+'*.js', distPaths.styles+'*.css'], cb);
});

//Copiar html.index
gulp.task('copyhtml', function () {
    gulp.src('src/index.html')
    .pipe(gulp.dest(distPaths.files));
});

//Copiar vendor
gulp.task('copyvendor', function () {
    return gulp.src(['src/vendor/**.*html', 'src/vendor/bootstrap/**/*', 'src/vendor/storejs/**/*'], {
        base: srcPaths.vendor
    })
        .pipe(gulp.dest(distPaths.vendor));
});

//Copiar data
gulp.task('copydata', function () {
    gulp.src('src/data/**.*json')
    .pipe(gulp.dest(distPaths.data));
});

//Procesamiento de imágenes para comprimir / optimizar.
gulp.task('imagemin', function() {
    return gulp.src([srcPaths.images+'**/*'])
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]
        }))
        .pipe(gulp.dest(distPaths.images))
    /*.pipe(browserSync.stream());*/
});

//Transpilación de sass
gulp.task('sass2css', function() {
    return gulp.src([srcPaths.styles+'**/*.scss'])
        .pipe(sourcemaps.init())
            .pipe(sass2css())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(distPaths.styles))
        .pipe(browserSync.stream());
});

//Transpilación typescript a js
gulp.task('typescript', function () {
    var tsResult = gulp.src(srcPaths.scripts+'**/*.ts');
    return tsProject.src()
       .pipe(tsProject({
           noImplicitAny: true,
           outFile: 'false'
       }))
       .pipe(sourcemaps.init())
            .pipe(concat('.all.min.js'))
            .pipe(uglify().on('error', function(e){
            console.log(e);
        }))
       .pipe(sourcemaps.write())
       .pipe(gulp.dest(distPaths.scripts))
       .pipe(browserSync.stream())
});


//Serve
gulp.task('serve', ['clean','copyhtml', 'imagemin', 'sass2css', 'typescript', 'copyvendor', 'copydata']);
    browserSync.init({
        server: {
            /*proxy: "localhost:3000",*/
            basedir: "./"
        },
        startPath: '/dist',
        browser: ['firefox']
    });

    gulp.watch(srcPaths.files+'*.html', ['html']);
    gulp.watch(srcPaths.images+'**/*', ['imagemin']);
    gulp.watch(srcPaths.styles+'**/*.scss', ['sass2css']);
    gulp.watch(srcPaths.scripts+'**/*.js', ['typescript']);

//Default
gulp.task('default', ['clean', 'serve'], function() {
});
var gulp = require('gulp');

// utility dependencies
var del = require('del');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');

// needed for auto-refresh and browser syncing
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// minify html
var htmlmin = require('gulp-htmlmin');

// browserify node-like requires and bundle js
var browserify = require('browserify');
var ngAnnotate = require('browserify-ngannotate');
var watchify = require('watchify');

// uglifiy / minify javascript
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');

// sass compiling and bundle & minify css
var merge = require('merge-stream');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uncss = require('gulp-uncss');
var cleanCSS = require('gulp-clean-css');

// source folders
var src = {
	html: 'src/*.html',
	js: 'src/js/**/*.js',
	jsEntry: 'src/js/app.js',
	scss: 'src/scss/**/*.scss',
	css: 'src/css/**/*.css',
	img: 'src/img/**'
};

// destination folders
var dest = {
	dev: {
		html: 'dev/',
		js: 'dev/js',
		css: 'dev/css',
		img: 'dev/img'
	},
	prod: {
		html: 'prod/',
		js: 'prod/js',
		css: 'prod/css',
		img: 'prod/img'
	},
	srcMaps: 'maps'
};

// browserify instances
var devBrowserify = browserify({
	entries: src.jsEntry,
	cache: {},
	packageCache: {},
	plugin: [watchify],
	transform: [ngAnnotate],
	debug: true
});

var prodBrowserify = browserify({
	entries: src.jsEntry,
	cache: {},
	packageCache: {},
	plugin: [watchify],
	transform: [ngAnnotate]
});

gulp.task('clean.dev', function() {
	return del.sync('dev/');
});

gulp.task('clean.prod', function() {
	return del.sync('prod/');
});

gulp.task('html.dev', function() {
	return gulp.src(src.html)
		.pipe(gulp.dest(dest.dev.html));
});

gulp.task('html.prod', function() {
	return gulp.src(src.html)
		.pipe(htmlmin({
			removeComments: true,
			collapseWhitespace: true,
			conservativeCollapse: true,
			keepClosingSlash: true
		}))
		.pipe(gulp.dest(dest.prod.html));
});

gulp.task('js.dev', function() {
	return devBrowserify.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(sourcemaps.write(dest.srcMaps))
		.pipe(gulp.dest(dest.dev.js))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('js.prod', function() {
	return prodBrowserify.bundle()
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(uglify())
			.on('error', gutil.log)
		.pipe(gulp.dest(dest.prod.js))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('css.dev', function() {
	return merge(gulp.src(src.scss)
			.pipe(sourcemaps.init())
			.pipe(sass().on('error', sass.logError))
		, gulp.src(src.css)
			.pipe(sourcemaps.init()))
		.pipe(concat('styles.css'))
		.pipe(sourcemaps.write(dest.srcMaps))
		.pipe(gulp.dest(dest.dev.css))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('css.prod', function() {
	return merge(gulp.src(src.scss)
			.pipe(sass().on('error', sass.logError))
		, gulp.src(src.css))
		.pipe(concat('styles.css'))
		/*.pipe(uncss({
            html: ['dev/index.html'],
            ignore: [''],
            timeout: 1000
        }))*/
		.pipe(cleanCSS())
		.pipe(gulp.dest(dest.prod.css))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('copyRes.dev', function() {
	return gulp.src(src.img)
		.pipe(gulp.dest(dest.dev.img));
})

gulp.task('copyRes.prod', function() {
	return gulp.src(src.img)
		.pipe(gulp.dest(dest.prod.img));
})

gulp.task('serve.dev', ['clean.dev','html.dev', 'js.dev', 'css.dev', 'copyRes.dev'], function() {
	browserSync({
		server: './dev'
	});

	gulp.watch(src.html, ['html.dev', reload]);
	gulp.watch(src.js, ['js.dev']);
	gulp.watch(src.scss, ['css.dev']);
	gulp.watch(src.img, ['copyRes.dev', reload]);
});

gulp.task('serve.prod', ['clean.prod','html.prod', 'js.prod', 'css.prod', 'copyRes.prod'], function() {
	browserSync({
		server: './prod'
	});

	gulp.watch(src.html, ['html.prod', reload]);
	gulp.watch(src.js, ['js.prod']);
	gulp.watch(src.scss, ['css.prod']);
	gulp.watch(src.img, ['copyRes.prod', reload]);
});

gulp.task('default', ['serve.dev']);
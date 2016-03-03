var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var src = {
	html: 'src/*.html',
	js: 'src/js/**/*.js',
	jsEntry: 'src/js/app.js',
	scss: 'src/scss/**/*.scss',
	css: ['node_modules/angular-material/angular-material.min.css']
};

var dest = {
	dev: {
		html: 'dev/',
		js: 'dev/js',
		css: 'dev/css'
	},
	prod: {
		html: 'prod/',
		js: 'prod/js',
		css: 'prod/css'
	},
	srcMaps: 'maps'
};

var devBrowserify = browserify({
	entries: src.jsEntry,
	cache: {},
	packageCache: {},
	plugin: [watchify],
	debug: true
});

var prodBrowserify = browserify({
	entries: src.jsEntry,
	cache: {},
	packageCache: {},
	plugin: [watchify]
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

gulp.task('scss.dev', function() {
	return gulp.src(src.scss)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(sourcemaps.write(dest.srcMaps))
		.pipe(gulp.dest(dest.dev.css))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('scss.prod', function() {
	return gulp.src(src.scss)
		.pipe(sass().on('error', sass.logError))
		.pipe(cleanCSS({
			compatibility: 'ie9'
		}))
		.pipe(gulp.dest(dest.prod.css))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('copyCss.dev', function() {
	return gulp.src(src.css)
		.pipe(gulp.dest(dest.dev.css));
})

gulp.task('copyCss.prod', function() {
	return gulp.src(src.css)
		.pipe(gulp.dest(dest.prod.css));
})

gulp.task('serve.dev', ['html.dev', 'js.dev', 'scss.dev', 'copyCss.dev'], function() {
	browserSync({
		server: './dev'
	});

	gulp.watch(src.html, ['html.dev', reload]);
	gulp.watch(src.js, ['js.dev']);
	gulp.watch(src.scss, ['scss.dev']);
	gulp.watch(src.css, ['copyCss.dev', reload]);
});

gulp.task('serve.prod', ['html.prod', 'js.prod', 'scss.prod', 'copyCss.prod'], function() {
	browserSync({
		server: './prod'
	});

	gulp.watch(src.html, ['html.prod', reload]);
	gulp.watch(src.js, ['js.prod']);
	gulp.watch(src.scss, ['scss.prod']);
	gulp.watch(src.css, ['copyCss.prod', reload]);
});

gulp.task('default', ['serve.dev']);
'use strict';
var gulp = require('gulp');

// utilities
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var del = require('del');
var gutil = require('gulp-util');
var gzip = require('gulp-gzip');
var merge = require('merge-stream');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

// needed for auto-refresh and browser syncing
var browserSync = require('browser-sync').create();
var connectGzip = require('connect-gzip-static');

// minify html
var htmlmin = require('gulp-htmlmin');

// browserify and bundle js
var browserify = require('browserify');
var ngAnnotate = require('browserify-ngannotate');
var watchify = require('watchify');

// minify js
var uglify = require('gulp-uglify');

// sass compiling and bundle & minify css
var sass = require('gulp-sass');
// var uncss = require('gulp-uncss');
var cleancss = require('gulp-clean-css');

// source folders
const src = {
	root: 'src',
	html: 'src/**/*.html',
	jsEntry: 'src/js/app.js',
	js: 'src/js/**/*.js',
	css: 'src/css/**/*.css',
	scss: 'src/css/**/*.scss',
	other: ['src/**', '!src/**/*.html', '!src/js/**/*.js',
		'!src/css/**/*.css', '!src/css/**/*.scss'
	]
};

// destination folders
const dest = {
	root: 'dist/',
	js: 'dist/js',
	css: 'dist/css',
	sourcemaps: 'maps'
};

// gzip options
const gzipOptions = {
	gzipOptions: {
		level: 9
	}
};

// gulp tasks
gulp.task('copyOther', () => {
	return gulp.src(src.other)
		.pipe(gulp.dest(dest.root));
});

gulp.task('clean', () => {
	return del.sync(dest.root);
});

gulp.task('html', () => {
	return gulp.src(src.html)
		.pipe(gutil.env.type === 'prod' ? htmlmin({
			removeComments: true,
			collapseWhitespace: true,
			conservativeCollapse: true,
			keepClosingSlash: true
		}) : gutil.noop())
		.pipe(gulp.dest(dest.root))
		.pipe(gutil.env.type === 'prod' ? gzip(gzipOptions) : gutil.noop())
		.pipe(gutil.env.type === 'prod' ? gulp.dest(dest.root) : gutil.noop());
});

gulp.task('js', () => {
	var b = browserify({
		entries: src.jsEntry,
		plugin: [watchify],
		transform: [ngAnnotate],
		debug: true
	});

	return b.bundle()
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(gutil.env.type === 'prod' ? uglify().on('error', gutil.log) : gutil.noop())
		.pipe(sourcemaps.write(dest.sourcemaps))
		.pipe(gulp.dest(dest.js))
		.pipe(gutil.env.type === 'prod' ? gzip(gzipOptions) : gutil.noop())
		.pipe(gutil.env.type === 'prod' ? gulp.dest(dest.js) : gutil.noop())
		.pipe(browserSync.stream());
});

gulp.task('css', () => {
	return merge(gulp.src(src.scss)
			.pipe(sourcemaps.init())
			.pipe(sass().on('error', sass.logError)),
			gulp.src(src.css)
			.pipe(sourcemaps.init()))
		.pipe(concat('styles.css'))
		.pipe(gutil.env.type === 'prod' ? cleancss() : gutil.noop())
		.pipe(sourcemaps.write(dest.sourcemaps))
		.pipe(gulp.dest(dest.css))
		.pipe(gutil.env.type === 'prod' ? gzip(gzipOptions) : gutil.noop())
		.pipe(gutil.env.type === 'prod' ? gulp.dest(dest.css) : gutil.noop())
		.pipe(browserSync.stream());
});

gulp.task('build', ['clean', 'copyOther', 'html', 'js', 'css']);

gulp.task('serve', ['build'], () => {
	browserSync.init({
		server: dest.root
	}, function(err, bs) {
		if (gutil.env.type === 'prod') {
			bs.addMiddleware("*", connectGzip(dest.root), {
				override: true
			});
		}
	});

	gulp.watch(src.other, ['copyOther', browserSync.reload]);
	gulp.watch(src.html, ['html', browserSync.reload]);
	gulp.watch(src.js, ['js']);
	gulp.watch([src.css, src.scss], ['css']);
});

gulp.task('default', ['serve']);
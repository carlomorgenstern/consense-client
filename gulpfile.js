'use strict';
var gulp = require('gulp');

// utilities
var buffer = require('vinyl-buffer');
var concat = require('gulp-concat');
var del = require('del');
var flatmap = require('gulp-flatmap');
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
	jsEntry: 'src/js/index.js',
	js: 'src/js/**/*.js',
	css: 'src/css/**/*.css',
	scss: 'src/css/**.scss',
	other: ['src/**', '!src/**/*.html', '!src/js/**/*.js',
		'!src/css/**/*.css', '!src/css/**/*.scss'
	]
};

// vendor folders
const vendor = {
	jsRoot: 'vendor/js/',
	cssRoot: 'vendor/css/',
	js: 'vendor/js/**/*.js',
	css: 'vendor/css/**/*.css',
	libs: [{
		name: 'angular-material',
		files: ['node_modules/angular-material/angular-material.css']
	}, {
		name: 'fullcalendar',
		files: ['node_modules/fullcalendar/dist/fullcalendar.css',
			'node_modules/fullcalendar/dist/lang/de.js'
		]
	}]
}

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

gulp.task('updateVendors', function() {
	var vendorTasks = vendor.libs.map(function(lib) {
		return gulp.src(lib.files)
			.pipe(flatmap(function(stream, file) {
				var destDir;
				var path = file.path.toString();
				if (path.endsWith('.js')) {
					destDir = vendor.jsRoot + lib.name;
				} else if (path.endsWith('.css')) {
					destDir = vendor.cssRoot + lib.name;
				}
				return stream.pipe(gulp.dest(destDir));
			}));
	});

	return merge(vendorTasks);
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

gulp.task('js', ['updateVendors'], () => {
	var b = browserify({
		entries: src.jsEntry,
		plugin: [watchify],
		debug: true
	});

	return b.bundle()
		.on('error', gutil.log)
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

gulp.task('css', ['updateVendors'], () => {
	return merge(gulp.src(src.scss)
			.pipe(sourcemaps.init())
			.pipe(sass().on('error', sass.logError)),
			gulp.src([src.css, vendor.css])
			.pipe(sourcemaps.init()))
		.pipe(concat('styles.css'))
		.pipe(gutil.env.type === 'prod' ? cleancss() : gutil.noop())
		.pipe(sourcemaps.write(dest.sourcemaps))
		.pipe(gulp.dest(dest.css))
		.pipe(gutil.env.type === 'prod' ? gzip(gzipOptions) : gutil.noop())
		.pipe(gutil.env.type === 'prod' ? gulp.dest(dest.css) : gutil.noop())
		.pipe(browserSync.stream());
});

gulp.task('build', ['clean', 'updateVendors', 'copyOther', 'html', 'js', 'css']);

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
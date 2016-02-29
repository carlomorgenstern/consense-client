var gulp = require('gulp'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload;

var src = {
	scss: 'scss/**/*.scss',
	css: 'app/css',
	js: 'app/js',
	html: 'app/*.html'
};

var libs = {
	target: 'app/libs',
	libs: ['node_modules/es6-shim/es6-shim.min.js',
		'node_modules/angular2/bundles/angular2-polyfills.min.js',
		'node_modules/rxjs/bundles/Rx.umd.min.js',
		'node_modules/angular2/bundles/angular2-all.umd.min.js'
	]
};

gulp.task('copyLibs', function() {
	return gulp.src(libs.libs)
		.pipe(gulp.dest(libs.target));
});

gulp.task('sass', function() {
	return gulp.src(src.scss)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(src.css))
		.pipe(reload({
			stream: true
		}));
});

gulp.task('serve', ['copyLibs', 'sass'], function() {
	browserSync({
		server: './app'
	});

	gulp.watch(libs.libs, ['libs']);
	gulp.watch(src.scss, ['sass']);
	gulp.watch([src.html, src.js]).on('change', reload);
});

gulp.task('default', ['serve']);
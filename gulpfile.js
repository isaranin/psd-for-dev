/* eslint-disable no-console, no-process-env */
var gulp		= require('gulp');
var clean		= require('rimraf');
var sass		= require('gulp-sass');
var watch		= require('gulp-watch');
var babel		= require('gulp-babel');
var concat		= require('gulp-concat');
var sourcemaps	= require('gulp-sourcemaps');
var connect		= require('gulp-connect');

var watching	= false;

var env = process.env.ENV || 'production';
var development = env === 'development';
console.info('Environment: ' + env);

gulp.task('default', ['build']);

gulp.task('build', [
	'build:assets',
	'build:styles',
	'build:scripts'
]);

gulp.task('build:assets', function() {
	if (development === 'development') {
		gulp.src('./test/psd-file/*.*')
			.pipe(gulp.dest('./dist/samples/'))
			.pipe(connect.reload());
	}
	gulp.src('./src/*.*')
		.pipe(gulp.dest('./dist'))
		.pipe(connect.reload());
	gulp.src('./src/js/lib/psd.js')
		.pipe(gulp.dest('./dist/js/lib'))
		.pipe(connect.reload());
});

gulp.task('build:styles', function() {
	return gulp.src('./src/sass/*.scss')
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(gulp.dest('./dist/css'))
		.pipe(connect.reload());
});

gulp.task('build:scripts', function() {
    gulp.src(['./src/js/**/*.js', '!./src/js/lib/psd.js'])
        //.pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        //.pipe(concat('app.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js'))
		.pipe(connect.reload());
});

gulp.task('clean', function(done) {
	clean('dist', done);
});

// server for development
gulp.task('http-server', function() {
	connect.server({
		root: './dist',
		port: 8080,
		livereload: true
	});

    console.log('Server listening on http://localhost:8080');
});

gulp.task('watch', function() {

    gulp.run('build');

	gulp.watch('./src/sass/**/*.scss', function() {
		gulp.run('build:styles');
	});
	gulp.watch('./src/js/**/*', function() {
		gulp.run('build:scripts');
	});
	gulp.watch('./src/*.*', function() {
		gulp.run('build:assets');
	});

    gulp.run('http-server');
});
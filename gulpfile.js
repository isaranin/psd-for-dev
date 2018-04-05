var browserify	= require('browserify');
var gulp		= require('gulp');
var clean		= require('rimraf');
var sass		= require('gulp-sass');
var watch		= require('gulp-watch');
var concat		= require('gulp-concat');
var sourcemaps	= require('gulp-sourcemaps');
var connect		= require('gulp-connect');
var coffeeify	= require('coffeeify');
var source		= require('vinyl-source-stream');
var buffer		= require('vinyl-buffer');
var hbsfy		= require('hbsfy');

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
	if (development) {
		gulp.src('./test/psd-file/*.*')
			.pipe(gulp.dest('./dist/samples/'))
			.pipe(connect.reload());
	}
	gulp.src('./src/assets/*.html')
		.pipe(gulp.dest('./dist'))
		.pipe(connect.reload());
	gulp.src('./src/assets/*.js')
		.pipe(gulp.dest('./dist/js/libs'))
		.pipe(connect.reload());
});

gulp.task('build:styles', function() {
	return gulp.src('./src/sass/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass.sync().on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./dist/css'))
		.pipe(connect.reload());
});

gulp.task('build:scripts', function() {
	var b = browserify({
		entries: ['./src/js/app.js'],
		debug: development
	});

	hbsfy.configure({
		extensions: ['hbs']
	});

	return b
		.transform(hbsfy)
		.exclude('psd')
		.bundle()
		.on('error', function (error) {
			console.error(error.toString());
			this.emit('end');
		})
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		//.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/js/'))
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
	gulp.watch(['./src/assets/*.*', './test/psd-file'], function() {
		gulp.run('build:assets');
	});

    gulp.run('http-server');
});
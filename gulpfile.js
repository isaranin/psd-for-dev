var browserify	= require('browserify');
var gulp		= require('gulp');
var clean		= require('gulp-clean');
var sass		= require('gulp-sass');
var sourcemaps	= require('gulp-sourcemaps');
var connect		= require('gulp-connect');
var uglify		= require('gulp-uglify');

var argv		= require('yargs').argv;
var gulpif		= require('gulp-if');

var source		= require('vinyl-source-stream');
var buffer		= require('vinyl-buffer');
var hbsfy		= require('hbsfy');

var git			= require('gulp-git');
var bump		= require('gulp-bump');
var filter		= require('gulp-filter');
var tagVersion	= require('gulp-tag-version');
var runSequence	= require('run-sequence');

var env = process.env.ENV || 'production';
var dev = (env === 'development');

// check arguments for state
if (argv.production) {
	dev = false;
	env = 'production';
}
if (argv.development) {
	dev = true;
	env = 'development';
}

console.info('Environment: ' + env);

// error handler
var errorHandler = function (error) {
	console.error(error.toString());
	// stop pipes
	this.emit('end');
};

// make build task default
gulp.task('default', ['build']);

// build task is seqence task
gulp.task('build', function(cb) {
	runSequence(
		'clean',
		['build:assets', 'build:styles', 'build:scripts'],
		cb);
});

// task for build assets
gulp.task('build:assets', [
	'build:assets:samples',
	'build:assets:html',
	'build:assets:jslibs',
	'build:assets:cssfonts'
]);

gulp.task('build:assets:samples', function() {
	return gulp.src('./test/psd-file/*.*')
		.pipe(gulp.dest('./dist/samples/'))
		.pipe(connect.reload());
});

gulp.task('build:assets:html', function() {
	return gulp.src('./src/assets/*.html')
		.pipe(gulp.dest('./dist'))
		.pipe(connect.reload());
});

gulp.task('build:assets:jslibs', function() {
	return gulp.src('./src/assets/*.js')
		.pipe(gulp.dest('./dist/js/libs'))
		.pipe(connect.reload());
});

gulp.task('build:assets:cssfonts', function() {
	return gulp.src('./src/assets/fonts/**')
		.pipe(gulp.dest('./dist/css/fonts'))
		.pipe(connect.reload());
});

// task for build styles
gulp.task('build:styles', function() {
	return gulp.src('./src/sass/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', errorHandler))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./dist/css'))
		.pipe(connect.reload());
});

// task for build scripts
gulp.task('build:scripts', function() {

	hbsfy.configure({
		extensions: ['hbs']
	});

	var b = browserify({
		entries: './src/js/app.js',
		paths: ['./src/js/app/'],
		debug: dev,
		transform: [hbsfy]
	});

	return b
		.exclude('psd')
		.bundle()
		.on('error', errorHandler)
		.pipe(source('app.js'))
		.pipe(buffer())
		.pipe(gulpif(dev, sourcemaps.init({loadMaps: true})))
		.pipe(gulpif(dev, uglify()))
		.pipe(gulpif(dev, sourcemaps.write('./')))
		.pipe(gulp.dest('./dist/js/'))
		.pipe(connect.reload());
});

// task for clean dist folder
gulp.task('clean', function(done) {
	return gulp.src('./dist', {read: false})
		.pipe(clean().on('error', errorHandler));
});

// task for server development
gulp.task('http-server', function() {
	connect.server({
		root: './dist',
		port: 8080,
		livereload: dev
	});

    console.log('Server listening on http://localhost:8080');
});

// watch task
gulp.task('watch', ['build'], function() {

	process.on('uncaughtException', console.error.bind(console));

	gulp.watch('./src/sass/**/*.scss', ['build:styles']);
	gulp.watch('./src/js/**/*', ['build:scripts']);
	gulp.watch(['./src/assets/**/*', './test/psd-file/*.*'], ['build:assets']);

    gulp.start('http-server');
});

// task for bumping version, used in deploy task
gulp.task('deploy:bump', function(done) {
	var importance = '';
	if (argv.patch) {
		importance = 'patch';
	}
	if (argv.minor) {
		importance = 'minor';
	}
	if (argv.major) {
		importance = 'major';
	}
	if (importance === '') {
		console.error('Use minor/major/patch flag, like this gulp build --patch');
		return process.exit(0);
	}
	return gulp.src(['./package.json'])
        .pipe(bump({type: importance}))
		.pipe(gulp.dest('./'));
});

gulp.task('deploy:push', function() {
	return gulp.src(['./package.json', './dist/**/*'])
		.pipe(git.commit('auto deploy new version'), {args: '-f'})
		.pipe(filter('package.json'))
		.pipe(tagVersion());
//		.pipe(git.push(
//			'origin',
//			{args: '--all --tags'},
//			function (err) {
//				if (err) {
//					console.error(err.toString());
//				}
//			}
//		));
});

// task for deployement
gulp.task('deploy', function(cb) {
	dev = false;
	runSequence(
		['deploy:bump', 'build'],
		'deploy:push',
		cb);

});
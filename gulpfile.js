var browserify	= require('browserify');
var watchify	= require('watchify');
var gulp		= require('gulp');
var clean		= require('gulp-clean');
var sass		= require('gulp-sass');
var sourcemaps	= require('gulp-sourcemaps');
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

var browserSync	= require('browser-sync').create();

var log			= require('fancy-log');

var env = process.env.ENV || 'production';
var dev = (env === 'development');
var watch = false;

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
	log.error(error.toString());
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
		.pipe(browserSync.stream());
});

gulp.task('build:assets:html', function() {
	return gulp.src('./src/assets/*.html')
		.pipe(gulp.dest('./dist'))
		.pipe(browserSync.stream());
});

gulp.task('build:assets:jslibs', function() {
	return gulp.src('./src/assets/*.js')
		.pipe(gulp.dest('./dist/js/libs'))
		.pipe(browserSync.stream());
});

gulp.task('build:assets:cssfonts', function() {
	return gulp.src('./src/assets/fonts/**')
		.pipe(gulp.dest('./dist/css/fonts'))
		.pipe(browserSync.stream());
});

// task for build styles
gulp.task('build:styles', function() {
	return gulp.src('./src/sass/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', errorHandler))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./dist/css'))
		.pipe(browserSync.stream());
});

// task for build scripts
gulp.task('build:scripts', function() {

	hbsfy.configure({
		extensions: ['hbs']
	});
	
	var bundler = browserify({
		entries: './src/js/app.js',
		paths: ['./src/js/app/', './src/js/libs/'],
		debug: dev,
		transform: [hbsfy],
		cache: {},
		packageCache: {}
	});

	bundler.exclude('psd');

	var rebundle = function() {
		return bundler
			.bundle()
			.on('error', errorHandler)
			.pipe(source('app.js'))
			.pipe(buffer())
			.pipe(gulpif(dev, sourcemaps.init({loadMaps: true})))
			.pipe(gulpif(!dev, uglify()))
			.pipe(gulpif(dev, sourcemaps.write('./')))
			.pipe(gulp.dest('./dist/js/'))
			.pipe(browserSync.stream());
	};

	if (watch) {
		bundler.plugin(watchify, {
			delay: 100,
			ignoreWatch: ['**/node_modules/**'],
			debug: dev,
			poll: false
		});
		bundler
			.on('log', log)
			.on('update', rebundle);
	}

	return rebundle();

});

// task for clean dist folder
gulp.task('clean', function(done) {
	return gulp.src('./dist', {read: false})
		.pipe(clean().on('error', errorHandler));
});

// task for server development
gulp.task('http-server', function() {
	browserSync.init({
		port: 8080,
		open: true,
		notify: false,
		server: './dist/'
    });
});

// watch task
gulp.task('watch', ['build:styles','build:assets'], function() {

	process.on('uncaughtException', console.error.bind(console));

	gulp.watch('./src/sass/**/*.scss', ['build:styles']);
	watch = true;
	gulp.start('build:scripts');
	//gulp.watch('./src/js/**/*', ['build:scripts']);
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
		console.error('Use minor/major/patch flag, like this gulp deploy --patch');
		return process.exit(0);
	}
	return gulp.src(['./package.json'])
        .pipe(bump({type: importance}))
		.pipe(gulp.dest('./'));
});

gulp.task('deploy:commit', function() {
	return gulp.src(['./package.json', './dist/**/*'])
		.pipe(git.commit('auto deploy new version'), {args: '-f'})
		.pipe(filter('package.json'))
		.pipe(tagVersion());
});

gulp.task('deploy:push', function() {
	return git.push('origin', {args: '--tags'});
});

// task for deployement
gulp.task('deploy', function(cb) {
	dev = false;
	runSequence(
		['deploy:bump', 'build'],
		'deploy:commit',
		'deploy:push',
		cb);

});
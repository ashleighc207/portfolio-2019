let gulp = require('gulp'),
	newer = require('gulp-newer'),
	imagemin = require('gulp-imagemin'),
	htmlclean = require('gulp-htmlclean'),
 	concat = require('gulp-concat'),
 	deporder = require('gulp-deporder'),
 	stripdebug = require('gulp-strip-debug'),
 	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	postcss = require('gulp-postcss'),
	assets = require('postcss-assets'),
	autoprefixer = require('autoprefixer'),
	mqpacker = require('css-mqpacker'),
	cssnano = require('cssnano'),
	ejs = require('gulp-ejs'),
  checkCSS = require('gulp-check-unused-css'),
	devBuild = (process.env.NODE_ENV !== 'production'),
  	folder = {
	    src: 'src/',
		build: 'build/'
	}
;



gulp.task('images', function() {
  let out = folder.build + 'imgs/';
  return gulp.src(folder.src + 'imgs/**/*')
    .pipe(newer(out))
    .pipe(imagemin({ optimizationLevel: 5 }))
    .pipe(gulp.dest(out));
});

gulp.task('html', ['images'], function() {
	let out = folder.build + 'html/',
    page = gulp.src(folder.src + 'html/**/*')
      .pipe(newer(out));

  if (!devBuild) {
    page = page.pipe(htmlclean());
  }

  return page.pipe(gulp.dest(out));
});

gulp.task('js', function() {
	let jsbuild = gulp.src(folder.src + 'js/**/*')
    .pipe(deporder())
    .pipe(concat('main.js'));

  if (!devBuild) {
    jsbuild = jsbuild
      .pipe(stripdebug())
      .pipe(uglify());
  }

  return jsbuild.pipe(gulp.dest(folder.build + 'js/'));

});

gulp.task('css', ['images'], function() {
	let postCssOpts = [
  assets({ loadPaths: ['imgs/'] }),
  autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
  mqpacker
  ];

  if (!devBuild) {
    postCssOpts.push(cssnano);
  }

  return gulp.src(folder.src + 'scss/main.scss')
    .pipe(sass({
      outputStyle: 'nested',
      imagePath: 'imgs/',
      precision: 3,
      errLogToConsole: true
    }))
    .pipe(postcss(postCssOpts))
    .pipe(gulp.dest(folder.build + 'css/'));

});

gulp.task('unusedCss', ['images'], function() {
  return gulp
    .src([ 'build/css/*.css', 'build/html/*.html' ])
    .pipe( checkCSS() );
})


gulp.task('watch', function() {

  gulp.watch(folder.src + 'imgs/**/*', ['images']);

  gulp.watch(folder.src + 'html/**/*', ['html']);

  gulp.watch(folder.src + 'js/**/*', ['js']);

  gulp.watch(folder.src + 'scss/**/*', ['css']);

  gulp.watch(folder.src + 'templates/**/*', ['ejs']);

});

gulp.task('ejs', function(){
  return gulp.src('src/templates/*.ejs')
   .pipe(ejs({}, {}, { ext: '.html' }))
   .pipe(gulp.dest('build/html'))
});

gulp.task('run', ['html', 'css', 'js', 'ejs', 'unusedCss']);

gulp.task('default', ['run', 'watch']);


const gulp = require('gulp');
const watch = require('gulp-watch');
const run = require('gulp-run');

function buildTS() {
  const cmd = run('npm run build');
  cmd.exec();
};

gulp.task('watch-project', function() {
  return watch(['./canvas-editor-engine/src/**/*', './canvas-editor-engine/images/*'], function () {
    buildTS()
    gulp.src('./canvas-editor-engine/images/*')
      .pipe(gulp.dest('./canvas-editor-engine/dist/images'));
  });
});
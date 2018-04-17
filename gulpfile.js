const gulp = require("gulp");
const removeCode = require("gulp-remove-code");
const browserSync = require("browser-sync").create();

// Start browserSync
gulp.task("browser-sync", () => {
  browserSync.init();
});

// var bs = require('browser-sync').create(); // create a browser sync instance.

// gulp.task('browser-sync', function() {
//     bs.init({
//         server: {
//             baseDir: "./"
//         }
//     });
// });

gulp.task("build", () => {
  gulp.src("src/*.html").pipe(gulp.dest("dist"));
  gulp.src("src/css/*.css").pipe(gulp.dest("dist/css"));
  gulp
    .src("src/scripts/script.js")
    .pipe(removeCode({ production: true }))
    .pipe(gulp.dest("dist/scripts"));
});

// create a task that ensures the `build` task is complete before
// reloading browsers
gulp.task("build-watch", ["build"], done => {
  browserSync.reload();
  done();
});

gulp.task("default", ["build"], () => {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  });
  // Watch for changes of HTML, CSS and JS run build-watch
  gulp.watch(["src/scripts/*.js", "src/*.html", "src/css/*.css"], ["build-watch"]);
});

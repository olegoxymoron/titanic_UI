var gulp = require('gulp')
var babel = require('gulp-babel');

//script paths
var jsxFiles = ['App.jsx'],
    jsDest = './';

//concat, transform, minimize and save bundle
gulp.task('scripts', function() {
    return gulp.src(jsxFiles)
        .pipe(babel({
            plugins: ['transform-react-jsx']
        }))
        .pipe(gulp.dest(jsDest));
});
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create();
    express = require('express');
    app = express();
    path = require('path');
    request = require('request');
    session = require('express-session');
    bodyParser = require('body-parser');
const storage = require('node-sessionstorage');
  
    // passport = require('passport');
    // LocalStrategy = require('passport-local').Strategy;
    // phpExpress = require('php-express')({

    //     // assumes php is in your PATH
    //     binPath: 'php'
    //   });
      


var DEST = 'build/';

gulp.task('scripts', function() {
    return gulp.src([
        'src/js/helpers/*.js',
        'src/js/*.js',
      ])
      .pipe(concat('custom.js'))
      .pipe(gulp.dest(DEST+'/js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest(DEST+'/js'))
      .pipe(browserSync.stream());
});

// TODO: Maybe we can simplify how sass compile the minify and unminify version
var compileSASS = function (filename, options) {
  return sass('src/scss/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST+'/css'))
        .pipe(browserSync.stream());
};

gulp.task('sass', function() {
    return compileSASS('custom.css', {});
});

gulp.task('sass-minify', function() {
    return compileSASS('custom.min.css', {style: 'compressed'});
});


// gulp.task('server', function() {
//   var server = child.spawn('node', ['server.js']);
//   var log = fs.createWriteStream('server.log', {flags: 'a'});
//   server.stdout.pipe(log);
//   server.stderr.pipe(log);
// });

// passport.use('local-signin', new LocalStrategy(
//     {passReqToCallback : true}, //allows us to pass back the request to the callback
//     function(req, res, next, done) {
//         console.log('in');
//         debugger;
//         var loginParams = {
//                     'staff_id': req.body.Username,
//                     'password': req.body.Password
//                 };
            
//                 request({
//                     url: 'https://mathsdeptlibrary.herokuapp.com/api/v1/auth/login/staff', //URL to hit
//                     qs: {staff_id: req.body.Username, password: req.body.Password},
//                     method: 'POST',
//                     json: {
//                         "staff_id": req.body.Username, "password": req.body.Password
//                     }
//                     }, function(error, response, body){
//                     if(error) {
//                         console.log(error);
//                     } else {
//                         console.log("LOGGED IN AS: " + response.user.name);
//                         req.session.success = 'You are successfully logged in ' + response.user.name + '!';
//                         done(null, user);
//                     //response.write(body); // ERROR here response.write is not a function
            
//                     //   res.send(body);// AND IT SHOULD BE USUALLY TRUE OR WITH THE OBJECT
//             //SO IT CAN ALSO BE 
//                         //  res.send(true);
//             //            return response;
//                     }
//                 })
//             })),

gulp.task('browser-sync', function() {
    browserSync.init({
        // proxy: "http://localhost:8000",
        server: 
        {
            baseDir: './',
            // routes: {
            //     '/library': 'production/lib_index.html',
            //     '/how-it-works': 'app/pages/how-it-works.html',
            //     '/jobs': 'app/pages/jobs.html'
            //   }
        },
        // middleware: function(req,res,next) {
            
        //     if (req.url === '/') {
        //       req.url = '/production/lib_index.html';
        //     } else if (req.url === '/index') {
        //       req.url = '/production/lib_index.html';
        //     } else if (req.url === '/') {
        //       req.url = '/production/lib_index.html';
        //     }
    
        //     return next();
        //   }
        middleware: [

            app.use(bodyParser.urlencoded({ extended: false })), 
            // parse application/json
            app.use(bodyParser.json()),

            app.engine('html', require('ejs').renderFile),
            app.set('view engine', 'html'),
            app.set('production', __dirname),

            app.use(function(req, res, next) {
                res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
                next();
              }),

            app.get('/login', function(req, res) {
                
                const msg = req.app.locals.message;
                if (msg != ''){
                    // storage.setItem('msg','');
                    req.app.locals.message = '';
                res.render(__dirname + '/production/login.html',{msg:msg});
                }
                else {
                    res.render(__dirname + '/production/login.html');
                }
            }),
            app.get('/library/:path', function(req, res) {
                const ses = storage.getItem('Authentication');
                const path = req.params['path'];
                console.log(path);
                if(ses != ""){
                var name = req.app.locals.name;
                res.render(__dirname + "/production/index.ejs", {ses:ses,name:name,path:path});
            }
            else{
                res.redirect('/login'); 
            }
            }),
            app.get('/books', function(req, res) {
                const ses = storage.getItem('Authentication');
                if(ses != ""){
                    var name = req.app.locals.name;
                    res.render(__dirname + "/production/lib_books.html");
                }
                else{
                    res.redirect('/login'); 
                }
            }),
            app.get('/logout', function(req, res) {
                storage.setItem('Authentication','');
                
                    res.redirect('/login'); 
                
            }),

            // app.post('/stafflogin', passport.authenticate('local-signin', {
            //     successRedirect: '/production/index.html',
            //     failureRedirect: '/production/login.html'
            //     })
            //   ),
                            // function ensureAuthenticated(req, res, next) {
                            //     if (req.isAuthenticated()) { return next(); }
                            //     req.session.error = 'Please sign in!';
                            //     res.redirect('/signin');
                            //   },
            //       funct.localAuth(username, password)
            //       .then(function (user) {
            //         if (user) {
            //           console.log("LOGGED IN AS: " + user.username);
            //           req.session.success = 'You are successfully logged in ' + user.username + '!';
            //           done(null, user);
            //         }
            //         if (!user) {
            //           console.log("COULD NOT LOG IN");
            //           req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
            //           done(null, user);
            //         }
            //       })
            //       .fail(function (err){
            //         console.log(err.body);
            //       });
            //     }
            //   ))
            app.post('/stafflogin', function(req, res, next) {
               
               var loginParams = {
                   'staff_id': req.body.staff_id,
                   'password': req.body.Password
               }
             
                request({
                    rejectUnauthorized: false,
                    url: 'https://mathsdeptlibrary.herokuapp.com/api/v1/auth/login/staff', //URL to hit
                    qs: {staff_id: req.body.staff_id, password: req.body.Password},
                    method: 'POST',
                    json: {
                        "staff_id": req.body.staff_id, "password": req.body.Password
                    }
                    }, function(error, response, body){
                    // if(response) {
                        console.log(response.body);
                    // } else {
                        if(response.body.success === true){
                        storage.setItem("Authentication", response.body.token);
                        // res.render(__dirname + "/production/lib_index.ejs", {name:response.body.user.name});
                        // console.log('success');
                        req.app.locals.name = response.body.user.name;
                        res.redirect('/library');
                        }
                        else{
                            // storage.setItem("msg", response.body.message);
                            req.app.locals.message = response.body.message;
                            res.redirect('/login');
                        }
                    // }
                })
            })
        ]
    });
});

// gulp.task('nodemon', function (cb) {
//     var callbackCalled = false;
//     return nodemon({script: './server.js'}).on('start', function () {
//         if (!callbackCalled) {
//             callbackCalled = true;
//             cb();
//         }
//     });
// });

gulp.task('watch', function() {
  // Watch .html files
  gulp.watch('production/*.html', browserSync.reload);
  // Watch .js files
  gulp.watch('src/js/*.js', ['scripts']);
  // Watch .scss files
  gulp.watch('src/scss/*.scss', ['sass', 'sass-minify']);
});

// Default Task
// gulp.task('default', ['server', 'watch']);
gulp.task('default', ['browser-sync', 'watch']);

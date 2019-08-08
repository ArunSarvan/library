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
    pjax    = require('express-pjax');
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
        port: process.env.PORT || 5000,
        startPath: '/login',
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
            
                app.use(pjax()),

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

            app.get('/staff/:path', function(req, res) {
                const data = storage.getItem('data');
                const ses = storage.getItem('Authentication');
                const role = storage.getItem('role');
                const path = req.params['path'];
                console.log(data);
                if(ses != ""){
                    if(role === "Staff"){
                        var name = req.app.locals.name;
                        res.renderPjax(__dirname + "/production/staff.ejs", {ses:ses,name:name,path:path,data:data});
                        }
                        else{
                            res.render(__dirname + "/production/page_404.html");
                        }
                }
                else{
                    res.redirect('/logout'); 
                }
            }),

            app.get('/librarian/:path', function(req, res) {
                const data = storage.getItem('data');
                const ses = storage.getItem('Authentication');
                const role = storage.getItem('role');
                const path = req.params['path'];
                console.log(data);
                if(ses != ""){
                    if(role === "Librarian"){
                        var name = req.app.locals.name;
                        res.renderPjax(__dirname + "/production/librarian.ejs", {ses:ses,name:name,path:path,data:data});
                        }
                        else{
                            res.render(__dirname + "/production/page_404.html");
                        }
                }
                else{
                    res.redirect('/logout'); 
                }
            }),

            app.get('/hod/:path', function(req, res) {
                const data = storage.getItem('data');
                const ses = storage.getItem('Authentication');
                const role = storage.getItem('role');
                const path = req.params['path'];
                console.log(data);
                if(ses != ""){
                    if(role === "HoD"){
                        var name = req.app.locals.name;
                        res.renderPjax(__dirname + "/production/hod.ejs", {ses:ses,name:name,path:path,data:data});
                        }
                        else{
                            res.render(__dirname + "/production/page_404.html");
                        }
                }
                else{
                    res.redirect('/logout'); 
                }
            }),

            app.get('/incharge/:path', function(req, res) {
                const data = storage.getItem('data');
                const ses = storage.getItem('Authentication');
                const role = storage.getItem('role');
                const path = req.params['path'];
                console.log(data);
                if(ses != ""){
                    if(role === "Incharge"){
                        var name = req.app.locals.name;
                        res.renderPjax(__dirname + "/production/incharge.ejs", {ses:ses,name:name,path:path,data:data});
                        }
                        else{
                            res.render(__dirname + "/production/page_404.html");
                        }
                }
                else{
                    res.redirect('/logout'); 
                }
            }),
    
            app.get('/logout', function(req, res) {
                storage.setItem('Authentication','');
                storage.setItem('role','');
                    res.redirect('/login'); 
                
            }),

            app.post('/stafflogin', function(req, res, next) {
               
               var loginParams = {
                   'staff_id': req.body.staff_id,
                   'password': req.body.Password
               }
             
                request({
                    rejectUnauthorized: false,
                    url: 'https://mathsdeptlibrary.herokuapp.com/api/v1/auth/login', //URL to hit
                    qs: {staff_id: req.body.staff_id, password: req.body.Password},
                    method: 'POST',
                    json: {
                        "staff_id": req.body.staff_id, "password": req.body.Password
                    }
                    }, function(error, response, body){
                    // if(response) {
                        // console.log(response.body);
                    // } else {
                        if(response.body.success === true){
                        storage.setItem("data", response.body);
                        storage.setItem("Authentication", response.body.token);
                        storage.setItem("role", response.body.user.role);
                        // res.render(__dirname + "/production/lib_index.ejs", {name:response.body.user.name});
                        // console.log('success');
                        const role =  response.body.user.role;
                        req.app.locals.name = response.body.user.name;
                        res.redirect('/'+ role +'/dashboard');
                        // const role =  response.body.user.name;
                        // if(role === "staff"){
                        // req.app.locals.name = response.body.user.name;
                        // res.redirect('/library/dashboard');
                        // }else if(role === "hod"){

                        // }else if(role === ""){

                        // }
                        }
                        else{
                            // storage.setItem("msg", response.body.message);
                            req.app.locals.message = response.body.message;
                            res.redirect('/login');
                        }
                    // }
                })
            }),

            app.post('/signup', function(req, res, next) {
               
                var signupParams = {
                    'staff_id': req.body.signup_staffid,
                    'name': req.body.signup_name,
                    'email': req.body.signup_email,
                    'desig': req.body.signup_designation,
                    'intercom': req.body.signup_intercom,
                    'salutation': req.body.signup_salutation,
                    'password': req.body.signup_pass
                }
              
                 request({
                     rejectUnauthorized: false,
                     url: 'https://mathsdeptlibrary.herokuapp.com/api/v1/auth/signup/staff', //URL to hit
                     qs: {staff_id: req.body.signup_staffid,
                            name: req.body.signup_name,
                            email: req.body.signup_email,
                            desig: req.body.signup_designation,
                            intercom: req.body.signup_intercom,
                            salutation: req.body.signup_salutation,
                            password: req.body.signup_pass},
                     method: 'POST',
                     json: {
                        'staff_id': req.body.signup_staffid,
                        'name': req.body.signup_name,
                        'email': req.body.signup_email,
                        'desig': req.body.signup_designation,
                        'intercom': req.body.signup_intercom,
                        'salutation': req.body.signup_salutation,
                        'password': req.body.signup_pass
                     }
                     }, function(error, response, body){
                         console.log(response.body);
                         if(response.body.success === true){
                            req.app.locals.message = response.body.message;
                            res.redirect('/login');
                         }
                         else{
                             req.app.locals.message = response.body.message;
                             res.redirect('/login#signup');
                         }
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

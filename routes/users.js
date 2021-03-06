var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var Project = require('../models/project');
var loggedInUser;

// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Work
router.get('/work', function(req, res){
	if(req.isAuthenticated()){
		User.getUserByUsername(loggedInUser.username, function(err, user) {
			var items = user.projects;
			res.render('work', {items});
			//console.log(items);
		});
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
});

//Add Work
router.post('/work', function(req, res){
	var title = req.body.title;
	var url = req.body.url;

	// Validation
	req.checkBody('title', 'Title is required').notEmpty();
	req.checkBody('url', 'Url is required').notEmpty();

	var errors = req.validationErrors();

	if(errors){
		res.render('work',{
			errors:errors
		});
	} else {
		var newProject = new Project({
			title: title,
			URL: url,
			
		});
		console.log(loggedInUser);
		loggedInUser.projects.push(newProject);
		loggedInUser.save();

		req.flash('success_msg', 'You have added your project');

		res.redirect('/users/work');
	}
});

//REGISTER USER
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	loggedInUser = user;

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});

module.exports = router;
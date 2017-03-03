var express = require('express');
var router = express.Router();

var User = require('../models/user');
// Get Homepage
router.get('/', function(req, res){
	User.find({}, function(err, items) {
			res.render('index', {items});
			console.log(items);
		});
});

function ensureAuthenticated(req, res, next){  //
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;


//the file is used to run the application
//rendering a view called index
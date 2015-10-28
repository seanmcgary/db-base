var DB = require('../');

var db = DB({
	database: 'some-database'
}, function(requireModel, sequelize, db, cb){
	console.log('setup models');
	console.log(arguments);

	cb();
});
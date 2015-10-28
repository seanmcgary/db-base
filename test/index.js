var DB = require('../');
var path = require('path');

var db = DB({
	database: 'some-database',
	modelPath: path.resolve(__dirname + '/models')
}, function(requireModel, sequelize, db, cb){

	var TestModel = requireModel('testModel');
	cb({
		TestModel: TestModel
	});
});
console.log(db);
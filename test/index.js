var DB = require('../');
var path = require('path');

var db = DB({
	database: 'some-database',
	modelPath: path.resolve(__dirname + '/models'),
	migrationsPath: path.resolve(__dirname + '/migrations')
}, function(requireModel, sequelize, db, cb){

	var TestModel = requireModel('testModel');
	TestModel.findAllPaginated({
		limit: 1
	})
	.spread(() => {

	})
	.catch((err) => {
		debugger;
	})
	cb({
		TestModel: TestModel
	});
});
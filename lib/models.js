var _ = require('lodash');
var Promise = require('promise');

var path = require('path');
var DB = require('./db');

var db;
module.exports = function(dbConfig){
	dbConfig = dbConfig || {};
	if(!db){
		db = DB(_.cloneDeep(dbConfig));
	}

	var sequelize = db.client;

	dbConfig = _.defaults(dbConfig, {
		modelPath: path.resolve([__dirname, 'modules/models'].join('/'))
	});

	var requireModel = function(modelName){
		// pass instance and Sequelize module
		return require([dbConfig.modelPath, modelName].join('/'))(sequelize, DB.Sequelize);
	};

	// hook into model definition here


	var migrated = new Promise(function(resolve, reject){
		return sequelize.sync()
		.then(function(){
			// run migrator
			return Promise.resolve();
		})
		.then(resolve)
		.catch(reject);
	});

	return {
		sequelize: sequelize,
		migrated: migrated
	};
};
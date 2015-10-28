'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var path = require('path');
var logwrangler = require('logwrangler');
var logger = logwrangler.create({
	logOptions: { ns: 'db-base::models '}
}, true);

var DB = require('./db');
var migrator = require('./migrator');

var db;
module.exports = function(dbConfig, initFn){
	dbConfig = dbConfig || {};
	if(!db){
		db = DB(_.cloneDeep(dbConfig));
	}

	var sequelize = db.client;

	dbConfig = _.defaults(dbConfig, {
		modelPath: path.resolve([__dirname, '../modules/models'].join('/')),
		migrationsPath: path.resolve([__dirname, '../migrations'].join('/'))
	});

	var requireModel = function(modelName){
		// pass instance and Sequelize module
		let model;
		try {
			model = require([dbConfig.modelPath, modelName].join('/'))(sequelize, DB.Sequelize);
		} catch(e){
			logger.error({
				message: 'failed to load model "' + modelName + '"',
				data: e
			});
		}
		return model;
	};

	// hook into model definition here
	var migrated;
	var models = {};
	initFn(requireModel, sequelize, DB, function(createdModels){
		models = _.merge(models, createdModels);
		migrated = new Promise(function(resolve, reject){
			return sequelize.sync()
			.then(function(){
				// run migrator
				return migrator.migrate(sequelize, dbConfig.migrationsPath)
			})
			.then(resolve)
			.catch(reject);
		});
	});
	return _.merge(models, {
		sequelize: sequelize,
		migrated: migrated
	});
};
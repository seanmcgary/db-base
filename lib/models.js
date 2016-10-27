'use strict';

const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');
const logwrangler = require('logwrangler');
const logger = logwrangler.create({
	logOptions: { ns: 'db-base::models '}
}, true);

const DB = require('./db');
const migrator = require('./migrator');

let db;
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

		const paginationDefults = model.paginationDefaults = _.defaults(model.paginationDefaults, {
			limit: 25,
			offset: 0,
			order: [['id', 'desc']]
		});

		model.findAllPaginated = function(query = {}, cursorFields = [], transaction){
			cursorFields = _.uniq(_.flatten([
				['limit', 'offset', 'order'],
				cursorFields || []
			]));

			_.defaults(query, paginationDefults);

			if(transaction){
				query.transaction = transaction;
			}

			return this.findAll(query)
			.then((results) => {
				let cursor = null;
				if(results.length === query.limit){
					cursor = _.reduce(cursorFields, (cursor, key) => {
						let val = query[key];
						if(key === 'offset'){
							val += query.limit;
						}
						cursor[key] = val;
						return cursor;
					}, {});
				}
				return Promise.all([ results, cursor ]);
			});

		}.bind(model.model);

		return model;
	};

	// hook into model definition here
	let migrated;
	let models = {};
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

	const helpers = {
		txn: (t) => {
			return (t ? { transaction: t } : {});
		},
		wrapTransaction: (t) => {
			let isLocalTransaction = false;

			if(t){
				return Promise.all([t, isLocalTransaction]);
			} else {
				isLocalTransaction = true;
				return sequelize.transaction()
				.then((t) => {
					return Promise.all([t, isLocalTransaction]);
				});
			}
		}
	};

	return _.merge(models, { helpers }, {
		sequelize: sequelize,
		migrated: migrated
	});
};
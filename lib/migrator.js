const Promise = require('bluebird');
const _ = require('lodash');

const Umzug = require('umzug');
const logwrangler = require('logwrangler');
const logger = logwrangler.create({});

exports.migrate = function(sequelize, path) {
	
	var umzug = new Umzug({
		storage: 'sequelize',
		storageOptions: {
			sequelize: sequelize
		},
		migrations: {
			params: [sequelize, {}, function(){
				throw new Error('Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.')
			}],
			path: path,
			pattern: /\.js$/
		}
	});

	logger.info({
		message: 'running migrations'
	});
	return umzug.up()
	.then(function(migrations){
		if(migrations && migrations.length){
			logger.success({
				message: 'processed ' + migrations.length + ' new migrations',
				data: {
					migrations: _.map(migrations, (migration) => migration.file)
				}
			});
		} else {
			logger.info({
				message: 'no new migrations to run'
			});
		}
		return Promise.resolve();
	});
};

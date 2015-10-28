var q = require('q');
var _ = require('lodash');

var Umzug = require('umzug');
var logwrangler = require('logwrangler');
var logger = logwrangler.create({});

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
					migrations: _.pluck(migrations, 'file')
				}
			});
		} else {
			logger.info({
				message: 'no new migrations to run'
			});
		}
		return q.resolve();
	});
};

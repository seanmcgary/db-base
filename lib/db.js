var _ = require('lodash');
var Promise = require('bluebird');
var Sequelize = require('sequelize');

function DB(config){
	config = _.defaults(config || {}, {
		username: '',
		password: '',
		host: '127.0.0.1',
		port: 5432,
		dialect: 'postgres',
		native: true,
		logging: false,
		omitNull: false,
		pool: {
			maxConnections: 20,
			maxIdleTime: 30
		},
		define: {
			underscored: true,
			syncOnAssociation: false,
			freezeTableNames: true
		},
		sync: {
			force: false
		}
	});

	if(!config.database){
		throw new Error('database name is required');
	}

	var sequelize = new Sequelize(
		config.database, 
		config.username, 
		config.password, 
		_.omit(config, ['database', 'username', 'password'])
	);

	return {
		ready: Promise.resolve(sequelize),
		client: sequelize
	};
};

DB.Sequelize = Sequelize;

module.exports = DB;
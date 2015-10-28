var _ = require('lodash');

module.exports = function(sequelize, types){
	return {
		model: sequelize.define('test_model', {
			name: {
				type: types.STRING
			}
		}, {
			freezeTableNames: false,
			timestamps: true,
			classMethods: {

			},
			instanceMethods: {

			}
		}),
		allowedFields: {
			create: ['name'],
			update: ['name']
		}
	}
};
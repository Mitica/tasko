'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;

module.exports = function(data) {
	data = _.uniq(data, 'id');

	return {
		get: function() {
			return data;
		}
	};

};

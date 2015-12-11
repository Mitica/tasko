'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;

module.exports = function(sizes) {
	sizes = sizes || [];

	var sizesMap = {};
	sizes.forEach(function(item) {
		sizesMap[item.id] = item;
	});

	return {
		get: function() {
			return sizes;
		},
		getById: function(id) {
			return sizesMap[id];
		}
	};

};

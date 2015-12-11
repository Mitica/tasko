'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;

module.exports = function(products) {
	products = products || [];

	var productsMap = {};
	products.forEach(function(item) {
		productsMap[item.id] = item;
	});

	return {
		get: function() {
			return products;
		},
		getById: function(id) {
			return productsMap[id];
		}
	};

};

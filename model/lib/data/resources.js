'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;
var sizesCreator = require('./sizes');
var productsCreator = require('./products');
var convertUnit = require('./unit_convert');

function createResourceAmount(resource) {
	if (resource.amount) {
		return resource.amount;
	}
	// console.log('resource', resource);

	var product = resource.product;
	var size = resource.size;

	var price = product.price;
	var params = product.params;
	var itemSize = params.length;
	if (size.unit === 'mp') {
		itemSize = convertUnit(params.unit, 'm', params.length) * convertUnit(params.unit, 'm', params.width);
		// itemSize = convertUnit(params.unit, 'm', itemSize);
		console.log('m2', itemSize, size.value);
	} else {
		itemSize = convertUnit(params.unit, size.unit, itemSize);
	}
	var countProducts = size.value / itemSize;
	var cost = countProducts * price.value;
	console.log('countProducts', countProducts);
	// itemValue = convertUnit(params.unit, size.unit, itemValue);
	return {
		count: countProducts,
		money: cost
	};
}

function createResourcesAmount(resources) {
	var cost = 0,
		value;
	resources.forEach(function(resource) {
		value = createResourceAmount(resource);
		if (value) {
			cost += value.money;
		}
	});
	return {
		money: cost
	};
}

module.exports = function(resources) {
	var inited = false;

	var model = {
		get: function() {
			return resources;
		},
		init: function(tasko) {
			if (inited) {
				return;
			}
			inited: true;
		},
		sizes: sizesCreator(resources.sizes),
		products: productsCreator(resources.products),
		amount: function(resource) {
			if (_.isArray(resource)) {
				return createResourcesAmount(resource);
			}
			return createResourceAmount(resource);
		}
	};

	return model;
};

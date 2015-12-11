'use strict';

var utils = require('./utils');
var _ = utils._;
var loader = require('./data/loader');
var calendar = require('./calendar');

function createModel(data) {
	var tasko = {
		calendar: calendar(data),
		init: function() {
			for (var prop in data) {
				if (_.isFunction(data[prop].init)) {
					data[prop].init(tasko);
				}
			}
		}
	};

	for (var prop in data) {
		tasko[prop] = data[prop];
	}

	// tasko.tasks.setDates(tasko.calendar);

	// tasko.config.init(tasko);
	//
	tasko.init();

	return tasko;
}

module.exports = function(location) {
	return loader.load(location).then(createModel);
};

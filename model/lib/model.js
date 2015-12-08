'use strict';

var loader = require('./data/loader');
var calendar = require('./calendar');

function createModel(data) {
	var model = {
		calendar: calendar(data)
	};

	for (var prop in data) {
		model[prop] = data[prop];
	}

	model.tasks.setDates(model.calendar);

	return model;
}

module.exports = function(location) {
	return loader.load(location).then(createModel);
};

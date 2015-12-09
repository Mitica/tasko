'use strict';

var utils = require('./utils');
var _ = utils._;
var moment = require('moment');

module.exports = function(data) {

	var config = data.config.get();
	var startDate = moment(config.time.startDate);
	var freeDates = config.freeDates || [];
	freeDates.forEach(function(fd) {
		fd.date = moment(fd.date);
		fd.format = fd.date.format('YYYY-MM-DD');
	});

	var freeDatesFormats = _.pluck(freeDates, 'format');

	var model = {
		startDate: startDate,
		freeDates: freeDates,
		isWorkingDay: function(weekDay) {
			return config.time.workingDays.indexOf(weekDay) > -1;
		},
		isWorkingDate: function(date) {
			return model.isWorkingDay(date.day()) && freeDatesFormats.indexOf(date.format('YYYY-MM-DD')) < 0;
		},
		isPartialWorkingDate: function(date) {
			var day = date.isoWeekday();
			if (config.time.workingHoursByDay) {
				return !!config.time.workingHoursByDay[day];
			}
			return false;
		},
		date: moment
	};

	return model;

};

'use strict';

var utils = require('./utils');
var _ = utils._;
var moment = require('moment');

module.exports = function(data) {

	var config = data.config.get();
	var startDate = moment(config.time.startDate);
	var freeDates = config.time.freeDates || [];
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
			return model.isWorkingDay(date.isoWeekday()) && !model.specialDate(date);
		},
		isPartialWorkingDate: function(date) {
			var day = date.isoWeekday();
			if (config.time.workingHoursByDay) {
				return !!config.time.workingHoursByDay[day];
			}
			return false;
		},
		specialDate: function(date) {
			var format = date.format('YYYY-MM-DD');
			if (freeDatesFormats.indexOf(format) > -1) {
				return _.find(freeDates, {
					format: format
				});
			}
		},
		date: moment
	};

	return model;

};

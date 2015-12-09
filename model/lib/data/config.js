'use strict';

module.exports = function(data) {

	var mainTask = data.mainTask;

	var model = {
		get: function() {
			return data;
		},
		getMainTask: function() {
			return mainTask;
		},
		init: function(tasko) {
			mainTask.team = tasko.team.get();
			mainTask.days = 0;
			var tasks = mainTask.tasks = tasko.tasks.sort();
			if (tasks.length > 0) {
				mainTask.startDate = tasks[0].startDate;
				mainTask.endDate = tasks[tasks.length - 1].endDate;
			}
			tasks.forEach(function(task) {
				mainTask.days += task.days;
			});
		}
	};

	return model;

};

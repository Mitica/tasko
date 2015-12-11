'use strict';

module.exports = function(data) {

	var mainTask = data.mainTask;
	var inited = false;

	var model = {
		get: function() {
			return data;
		},
		getMainTask: function() {
			return mainTask;
		},
		init: function(tasko) {
			if (inited) {
				return;
			}
			console.log('initing config');
			inited = true;
			tasko.tasks.init(tasko);

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

'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;

function getDataItemById(data, id) {
	var item;
	for (var i = 0; i < data.length; i++) {
		item = data[i];
		if (item.id === id) {
			return item;
		}
		if (item.tasks) {
			item = getDataItemById(item.tasks, id);
			if (item) {
				return item;
			}
		}
	}
}

function normalizeData(data, tasks, tasksMap, parent) {
	data.forEach(function(task) {
		if (parent) {
			task.parent = parent;
			task.parentId = parent.id;
		}
		tasks.push(task);
		tasksMap[task.id] = task;
		if (task.tasks) {
			normalizeData(task.tasks, tasks, tasksMap, task);
		}
	});
}

function getTaskLevel(task, tasksMap) {
	if (task.level) {
		return task.level;
	}
	if (task.parent) {
		return getTaskLevel(task.parent, tasksMap) + 1;
	}
	return 1;
}

function getTaskDays(task) {
	if (task.days) {
		return task.days;
	}
	if (task.tasks) {
		var days = 0;
		task.tasks.forEach(function(t) {
			days += getTaskDays(t);
		});
		return days;
	}
	return 1;
}

function getTaskTeam(task) {
	if (task.tasks) {
		var team = [];
		task.tasks.forEach(function(t) {
			team = team.concat(getTaskTeam(t));
		});

		return _.uniq(team);
	}
	return task.team || [];
}

function normalizeTask(task, tasksMap) {
	task.level = getTaskLevel(task, tasksMap);
	task.days = getTaskDays(task);
	task.team = getTaskTeam(task);

	if (task.prev) {
		task.prevTask = tasksMap[task.prev];
	}

	// setTaskDates(config, task);
}

function normalizeTasks(tasks, tasksMap) {
	tasks.forEach(function(task) {
		normalizeTask(task, tasksMap);
	});

	return tasks;

	// return _.sortBy(tasks, 'startDate').reverse();
}

function addDays(calendar, date, days) {
	var result = calendar.date(date);
	while (days > 0) {
		result.add(1, 'days');
		if (calendar.isWorkingDate(result)) {
			days--;
		}
	}
	return result;
}

function setTaskDates(calendar, task) {
	if (!task.parent && !task.prevTask) {
		task.startDate = calendar.startDate;
		task.endDate = addDays(calendar, task.startDate, task.days);
	} else {
		if (task.prevTask) {
			if (task.prevTask.endDate) {
				task.startDate = task.prevTask.endDate;
				task.startDate = addDays(calendar, task.prevTask.endDate, 1);
				task.endDate = addDays(calendar, task.startDate, task.days);
			}
		}
	}

	if (task.tasks) {
		var prevTask = task;
		for (var i = 0; i < task.tasks.length; i++) {
			var t = task.tasks[i];
			t.startDate = addDays(calendar, prevTask.endDate, 1);
			t.endDate = addDays(calendar, t.startDate, t.days);
			prevTask = t;
			if (t.tasks) {
				setTaskDates(config, t);
			}
		}
	}
}

function setTasksDates(calendar, tasks) {
	tasks.forEach(function(task) {
		setTaskDates(calendar, task);
	});
}

module.exports = function(data) {
	data = _.uniq(data, 'id');

	var tasks = [];
	var tasksMap = {};

	normalizeData(data, tasks, tasksMap);
	tasks = normalizeTasks(tasks, tasksMap);

	var model = {
		get: function() {
			return data;
		},
		getTasks: function() {
			return tasks;
		},
		getTasksByLevel: function(level) {
			return _.where(tasks, {
				level: level
			});
		},
		getLevelFirstTasks: function() {
			return model.getTasksByLevel(1);
		},
		setDates: function(calendar) {
			setTasksDates(calendar, model.getLevelFirstTasks());
		},
		sort: function(list) {
			list = list || model.getLevelFirstTasks();
			return list.sort(function(item) {
				return item.startDate.format('YYYY-MM-DD');
			});
		}
	};

	return model;
};

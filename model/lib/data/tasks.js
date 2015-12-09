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
	if (task.parent) {
		if (!task.days) {
			return getTaskDays(task.parent);
		}
	}
	if (task.days) {
		return task.days;
	}
	if (task.tasks) {
		var days = 0;
		task.tasks.forEach(function(t) {
			t.days = getTaskDays(t);
			days += t.days;
		});
		return days;
	}
	return 1;
}

function getTasksTeam(tasks) {

	var team = [];
	tasks.forEach(function(t) {
		team = team.concat(getTaskTeam(t));
	});

	return _.sortBy(_.uniq(team));
}

function getTaskTeam(task) {
	if (task.tasks) {
		var team = task.team || [];
		if (!task.team) {
			task.tasks.forEach(function(t) {
				team = team.concat(getTaskTeam(t));
			});
		}

		team = _.sortBy(_.uniq(team));

		task.tasks.forEach(function(t) {
			t.team = t.team || team;
		});

		return team;
	}
	return _.sortBy(task.team || []);
}

function normalizeTask(task, tasksMap) {
	task.level = getTaskLevel(task, tasksMap);
	task.days = getTaskDays(task);
	task.team = getTaskTeam(task);

	if (task.prev) {
		task.prevTask = tasksMap[task.prev];
		task.prevTask.nextTask = task;
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
	days = days || 0;
	var result = calendar.date(date);

	if (days === 0) {
		while (!calendar.isWorkingDate(result)) {
			result.add(1, 'days');
		}
	}

	while (days > 0) {
		result.add(1, 'days');
		if (calendar.isWorkingDate(result)) {
			days--;
		}
	}
	return result;
}

function setTaskDates(calendar, task) {
	if (!task.parent && !task.startDate) {
		if (!task.prevTask) {
			// console.log('!prevTask', task.id);
			task.startDate = calendar.startDate;
			task.endDate = addDays(calendar, task.startDate, task.days - 1);
		} else {
			if (task.prevTask.endDate) {
				// console.log('prevTask', task.prevTask.endDate.toString(), task.id);
				task.startDate = addDays(calendar, task.prevTask.endDate, 1);
				task.endDate = addDays(calendar, task.startDate, task.days - 1);
			}
		}
		if (task.nextTask && !task.nextTask.startDate) {
			setTaskDates(calendar, task.nextTask);
		}
	}

	if (task.tasks) {
		for (var i = 0; i < task.tasks.length; i++) {
			var t = task.tasks[i];
			if (t.prevTask) {
				t.startDate = addDays(calendar, t.prevTask.endDate, 1);
			} else {
				t.startDate = addDays(calendar, task.startDate);
			}
			t.endDate = addDays(calendar, t.startDate, t.days - 1);
			// console.log('t', t.id);
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

	// console.log(tasks);

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
			var list = model.getLevelFirstTasks();
			var initialList = list.filter(function(item) {
				return !item.prev;
			});
			setTasksDates(calendar, initialList);
			setTasksDates(calendar, list);
		},
		sort: function(list) {
			list = list || model.getLevelFirstTasks();
			return _.sortBy(list, function(item) {
				return item.startDate.format('YYYY-MM-DD');
			});
		}
	};

	return model;
};

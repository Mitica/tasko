'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var writeFile = Promise.promisify(require('fs').writeFile);

function formatTask(tasko, task, last) {
	var text = [];
	text.push('# ' + task.name);
	text.push('');
	if (task.description) {
		text.push('#### ' + task.description);
		text.push('');
	}
	if (!last) {
		// page end
		text.push('<div style="page-break-after: always;"></div>');
		text.push('');
	}

	return text.join('\n');
}

module.exports = function(tasko, file) {
	var tasks = tasko.tasks.sort();
	return Promise.each(tasks, function(task, taskIndex) {
		var text = formatTask(tasko, task, taskIndex === tasks.length - 1);
		return writeFile(file, text, {
			flag: taskIndex === 0 ? 'w' : 'a'
		});
	});
};

'use strict';

var utils = require('../../utils');
var _ = utils._;
var Promise = utils.Promise;
var fs = require('fs');
var writeFile = Promise.promisify(fs.writeFile);
var renderFile = Promise.promisify(require('jade').renderFile);
var ncp = Promise.promisify(require('ncp').ncp);
var path = require('path');

var deleteFolder = function(location) {
	if (fs.existsSync(location)) {
		fs.readdirSync(location).forEach(function(file, index) {
			var curPath = location + '/' + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolder(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(location);
	}
};

function copyAssets(file) {
	var dir = path.join(path.dirname(file), './assets');
	deleteFolder(dir);
	var localDir = path.join(__dirname, './assets');
	return ncp(localDir, dir);
}

module.exports = function(tasko, file) {
	var tasks = tasko.tasks.sort();
	var model = {
		site: {},
		tasks: tasks,
		tasko: tasko
	};

	return renderFile(path.join(__dirname, './views/layout.jade'), model)
		.then(function(html) {
			return Promise.all([copyAssets(file), writeFile(file, html)]);
		});
};

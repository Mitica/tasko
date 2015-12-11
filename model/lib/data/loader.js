'use strict';

var path = require('path');
var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;
var glob = Promise.promisify(require('glob'));
var readFile = Promise.promisify(require('fs').readFile);
var yaml = require('js-yaml');
var createConfig = require('./config');
var createTeam = require('./team');
var createTasks = require('./tasks');
var createResources = require('./resources');

function getFileData(location, file) {
	file = path.join(location, file);
	return readFile(file)
		.then(function(content) {
			if (file.endsWith('.json')) {
				return JSON.parse(content);
			}
			return yaml.safeLoad(content);
		});
}

function loadArray(pattern, location) {
	var items = [];
	return glob(pattern, {
		cwd: location
	}).each(function(file) {
		return getFileData(location, file)
			.then(function(data) {
				if (Array.isArray(data)) {
					items = items.concat(data);
				} else {
					items.push(data);
				}
			});
	}).then(function() {
		return items;
	});
}

function loadConfig(location) {
	return glob('config.{json,yml,yaml}', {
			cwd: location
		})
		.then(function(file) {
			if (file.length === 1) {
				return getFileData(location, file[0]).then(createConfig);
			} else {
				return Promise.reject(new Error('config file not founded'));
			}
		});
}

function loadTeam(location) {
	return loadArray('team/*.{json,yml,yaml}', location)
		.then(function(data) {
			return createTeam(data);
		});
}

function loadTasks(location) {
	return loadArray('tasks/*.{json,yml,yaml}', location)
		.then(function(data) {
			return createTasks(data);
		});
}

function loadResources(location) {
	return Promise.props({
			sizes: loadArray('resources/sizes/*.{json,yml,yaml}', location),
			products: loadArray('resources/products/*.{json,yml,yaml}', location)
		})
		.then(function(data) {
			return createResources(data);
		});
}

exports.load = function(location) {
	// console.log('location', location);
	return Promise.props({
		config: loadConfig(location),
		team: loadTeam(location),
		tasks: loadTasks(location),
		resources: loadResources(location)
	});
};

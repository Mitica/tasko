'use strict';

var utils = require('./utils');
var Promise = utils.Promise;
var taskoModel = require('tasko-model');
var path = require('path');
var jade = require('./generators/jade');
var fs = require('fs');

function generateJade(tasko, name) {
	var htmlFile = path.join(__dirname, '../out/' + name + '/index.html');
	return jade(tasko, htmlFile);
}

exports.generate = function(names) {
	if (!names) {
		names = ['interior'];
		if (process.argv.length > 2) {
			names = [process.argv[2]];
		}
	}
	return Promise.each(names, function(name) {
		var location = path.join(__dirname, '../../../data/' + name);
		return taskoModel(location)
			.then(function(tasko) {
				return generateJade(tasko, name);
			});
	});
};

exports.generate();

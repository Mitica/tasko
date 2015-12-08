'use strict';

var utils = require('./utils');
var taskoModel = require('tasko-model');
var path = require('path');
var md = require('./generators/md');
var jade = require('./generators/jade');
var path = require('path');
var fs = require('fs');
var marked = require('marked');

function generateMarkdown(tasko) {
	var mdFile = path.join(__dirname, '../out/test.md');
	var htmlFile = path.join(__dirname, '../out/test.html');
	return md(tasko, mdFile)
		.then(function() {
			var html = marked(fs.readFileSync(mdFile, 'utf8'));
			fs.writeFileSync(htmlFile, html);
		});
}

function generateJade(tasko) {
	var htmlFile = path.join(__dirname, '../out/test.html');
	return jade(tasko, htmlFile);
}

exports.generate = function(location) {
	location = location || path.join(__dirname, '../../../data');
	return taskoModel(location).then(generateJade);
};

exports.generate();

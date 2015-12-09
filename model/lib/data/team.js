'use strict';

var utils = require('../utils');
var Promise = utils.Promise;
var _ = utils._;

module.exports = function(members) {
	members = _.uniq(members, 'id');

	var membersMap = {};
	members.forEach(function(member) {
		membersMap[member.id] = member;
	});

	return {
		get: function() {
			return members;
		},
		getMember: function(id) {
			return membersMap[id];
		}
	};

};

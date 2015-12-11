'use strict';

var convertor = {
	'mm-mm': 1,
	'cm-cm': 1,
	'm-m': 1,
	'ml-ml': 1,
	'mm-cm': 0.1,
	'mm-m': 0.001,
	'cm-m': 0.1,
	'cm-mm': 10,
	'm-cm': 10,
	'm-mm': 1000
};

module.exports = function(fromUnit, toUnit, value) {
	var m = convertor[fromUnit + '-' + toUnit];
	if (m === undefined) {
		throw new Error('You cannot convert ' + fromUnit + ' to ' + toUnit);
	}
	return m * value;
};

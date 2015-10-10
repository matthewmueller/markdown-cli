'use strict';

const marked = require('marked');
const wrapAnsi = require('wrap-ansi');
const terminalRenderer = require('./renderer');

module.exports = (data, count, hard) => {
	marked.setOptions({
		renderer: terminalRenderer,
		gfm: true,
		tables: true,
		breaks: true,
		smartLists: true
	});

	let output = marked(data);
	if (typeof count !== 'undefined') {
		if (hard) {
			output = wrapAnsi(output, count, {
				hard
			});
		} else {
			output = wrapAnsi(output, count);
		}
	}

	return output;
};

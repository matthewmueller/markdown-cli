'use strict';

const marked = require('marked');
const wrapAnsi = require('wrap-ansi');
const TerminalRenderer = require('./renderer');

module.exports = (data, count, hard) => {
	const width = typeof count !== 'undefined' ? count : process.stdout.columns;

	marked.setOptions({
		renderer: new TerminalRenderer({
			width,
			hard
		}),
		gfm: true,
		tables: true,
		breaks: true
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

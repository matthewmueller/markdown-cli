'use strict';
/* eslint-disable prefer-reflect */
const chalk = require('chalk');
const emoji = require('node-emoji');
const indentString = require('indent-string');
const cardinal = require('cardinal');
const Table = require('cli-table');

const transform = compose(unescape, insertEmojis);

const TABLE_CELL_SPLIT = '^*||*^';
const TABLE_ROW_WRAP = '*|*|*|*';
const TABLE_ROW_WRAP_REGEXP = new RegExp(escapeRegExp(TABLE_ROW_WRAP), 'g');

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function unescape(html) {
	return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, `'`);
}

function generateTableRow(text) {
	if (!text) {
		return [];
	}

	const data = [];

	transform(text).split('\n').forEach(line => {
		if (!line) {
			return;
		}
		const parsed = line.replace(TABLE_ROW_WRAP_REGEXP, '').split(TABLE_CELL_SPLIT);

		data.push(parsed.splice(0, parsed.length - 1));
	});

	return data;
}

function highlight(code) {
	if (!chalk.enabled) {
		return chalk.green(code);
	}

	try {
		return cardinal.highlight(code);
	} catch (e) {
		return chalk.green(code);
	}
}

const padding = text => {
	return `${text}

`;
};

function compose() {
	const funcs = arguments;
	return function () {
		let args = arguments;
		for (let i = funcs.length; i-- > 0;) {
			args = [funcs[i].apply(this, args)];
		}
		return args[0];
	};
}

function insertEmojis(text) {
	return text.replace(/:([A-Za-z0-9_\-\+]+?):/g, emojiString => {
		const emojiSign = emoji.get(emojiString);
		return (!emojiSign) ? emojiString : `${emojiSign} `;
	});
}

class CliRenderer {
	constructor(options) {
		this.cli = options;
	}
	code(text) {
		return indentString(padding(highlight(text)), ' ', 4);
	}
	blockquote(quote) {
		quote = transform(quote.trim());
		quote = `${chalk.gray(quote)}`;
		quote = indentString(padding(quote), `${chalk.grey('|')} `);
		return indentString(padding(quote), ` `, 4);
	}
	html(html) {
		return html;
	}
	heading(text, level) {
		text = transform(text);
		text = `${'#'.repeat(level)} ${text}`;
		const heading = padding(chalk.red.bold(text));
		const boldHeading = `
${heading}`;
		return (level === 1) ? boldHeading : heading;
	}
	hr() {
		const output = '-'.repeat(this.cli.width);
		return padding(chalk.reset(output));
	}
	list(body) {
		body = transform(body);
		return padding(chalk.reset(body));
	}
	listitem(text) {
		const isNested = text.indexOf('\n') !== -1;

		if (isNested) {
			text = indentString(text, ' ', 2);
			text = `
${chalk.grey('-')} ${text.trim()}`;
		} else {
			text = `
${chalk.grey('-')} ${text}`;
		}

		return text;
	}
	table(header, body) {
		const table = new Table({
			head: generateTableRow(header)[0]
		});

		generateTableRow(body).forEach(row => {
			table.push(row);
		});

		return table.toString();
	}
	tablerow(content) {
		return `${TABLE_ROW_WRAP}${content}${TABLE_ROW_WRAP}
`;
	}
	tablecell(content) {
		return content + TABLE_CELL_SPLIT;
	}
	paragraph(text) {
		text = transform(text);
		return padding(chalk.reset(text));
	}
	strong(text) {
		return chalk.bold(text);
	}
	em(text) {
		return chalk.italic(text);
	}
	text(text) {
		return text;
	}
	codespan(code) {
		code = unescape(code);
		return chalk.inverse(code);
	}
	br() {
		return '\n';
	}
	del(text) {
		return text;
	}
	link(href, title, text) {
		const hasText = text && text !== href;
		return (hasText) ? `${chalk.blue(insertEmojis(text))} (${chalk.magenta(href)})` : chalk.magenta(href);
	}
	image(href, title, text) {
		return (title) ? `![${chalk.blue(text)} – ${chalk.blue(title)}](${chalk.magenta(href)})` : `![${chalk.blue(text)}](${chalk.magenta(href)})`;
	}

}

module.exports = CliRenderer;

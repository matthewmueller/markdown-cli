'use strict';
/* eslint-disable prefer-reflect */
const chalk = require('chalk');
const emoji = require('node-emoji');
const indentString = require('indent-string');

function unescape(html) {
	return html
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, `'`);
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

const transform = compose(unescape, emoji.emojify.bind(emoji));

class CliRenderer {
	code(code) {
		return indentString(padding(chalk.green(code)), ' ', 4);
	}
	blockquote(quote) {
		quote = transform(quote);
		return indentString(padding(chalk.black(quote)), ' ', 4);
	}
	html(html) {
		return html;
	}
	heading(text, level) {
		text = transform(text);
		const boldHeading = `
${chalk.bold.underline(text)}

`;
		const heading = padding(chalk.underline(text));
		return (level === 1) ? boldHeading : heading;
	}
	hr() {
		return padding(chalk.underline('--'));
	}
	list(body) {
		return padding(chalk.reset(body));
	}
	listitem(text) {
		return `${chalk.red('-')} ${text}
`;
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
		return (hasText) ? `${chalk.blue(emoji.emojify(text))} (${chalk.magenta(href)})` : chalk.magenta(href);
	}
	image(href, title, text) {
		return (title) ? `![${chalk.blue(text)} – ${chalk.blue(title)}](${chalk.magenta(href)})` : `![${chalk.blue(text)}](${chalk.magenta(href)})`;
	}

}

module.exports = new CliRenderer();

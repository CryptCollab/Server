/* eslint-disable indent */
import prefix from "loglevel-plugin-prefix";
import log from "loglevel";
import path from "path";
import colors from "colors";
import stack from "callsite";


prefix.reg(log);
prefix.apply(log);
log.enableAll();

const getColor = (level: string) => {
	switch (level) {
		case "TRACE":
			return colors.gray;
		case "DEBUG":
			return colors.blue;
		case "INFO":
			return colors.green;
		case "WARN":
			return colors.yellow;
		case "ERROR":
			return colors.red;
		default:
			return colors.white;
	}
};

prefix.apply(log, {
	format(level, name, timestamp) {
		level = level.toUpperCase();
		const color = getColor(level);
		return `${timestamp} ${color(level.toUpperCase())} ${name} ➡️ `;
	},
	nameFormatter(_name) {
		const prevStackContext = stack()[2];
		const logLocatin = `${path.relative(__dirname, prevStackContext.getFileName())}:${prevStackContext.getLineNumber()}`;
		return colors.cyan(logLocatin);
	},
	timestampFormatter(date) {
		return colors.dim(date.toISOString());
	},
});

export default log;
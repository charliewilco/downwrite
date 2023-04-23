const optionalByteOrderMark = "\\ufeff?";
const pattern =
	"^(" +
	optionalByteOrderMark +
	"(= yaml =|---)" +
	"$([\\s\\S]*?)" +
	"^(?:\\2|\\.\\.\\.)\\s*" +
	"$" +
	"(?:\\n)?)";
const regex = new RegExp(pattern, "m");

export function fmParserr(string: string): {
	attributes: Record<string, any>;
	body: string;
	bodyBegin: number;
	frontmatter?: string;
} {
	string = string || "";
	const lines = string.split(/(\r?\n)/);
	if (lines[0] && /= yaml =|---/.test(lines[0])) {
		return parse(string);
	} else {
		return {
			attributes: {},
			body: string,
			bodyBegin: 1
		};
	}
}

function parse(string: string) {
	const match = regex.exec(string);
	if (!match) {
		return {
			attributes: {},
			body: string,
			bodyBegin: 1
		};
	}

	const yaml = match[match.length - 1].replace(/^\s+|\s+$/g, "");
	const attributes = computeAttributes(yaml);
	const body = string.replace(match[0], "");
	const line = computeLocation(match, string);

	return {
		attributes: attributes,
		body: body,
		bodyBegin: line,
		frontmatter: yaml
	};
}

function computeLocation(match: RegExpExecArray, body: string): number {
	let line = 1;
	let pos = body.indexOf("\n");
	const offset = match.index + match[0].length;

	while (pos !== -1) {
		if (pos >= offset) {
			return line;
		}
		line++;
		pos = body.indexOf("\n", pos + 1);
	}

	return line;
}

function computeAttributes(yaml: string) {
	const splitter = ": ";
	const lines = yaml.split(/(\r?\n)/);
	let attributes = {};
	lines.forEach((line) => {
		if (!line.includes(splitter)) {
			return;
		}
		const split = line.split(splitter);
		const key = split[0];
		let value = line.substring(split[0].length + splitter.length).trim();
		if (value.startsWith('"') && value.endsWith('"')) {
			value = value.slice(1, -1);
		}
		attributes = {
			...attributes,
			[key]: value
		};
	});
	return attributes;
}

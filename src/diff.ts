export type DiffLine = {
	kind: "unchanged" | "inserted" | "deleted";
	left_number?: number;
	right_number?: number;
	left_text?: string;
	right_text?: string;
};

export type DiffSummary = {
	inserted: number;
	deleted: number;
	unchanged: number;
};

export function buildTextDiff(left: string, right: string): { rows: DiffLine[]; summary: DiffSummary } {
	const leftLines = splitTextLines(left);
	const rightLines = splitTextLines(right);
	const table = Array.from({ length: leftLines.length + 1 }, () => Array.from({ length: rightLines.length + 1 }, () => 0));

	for (let i = leftLines.length - 1; i >= 0; i--) {
		for (let j = rightLines.length - 1; j >= 0; j--) {
			table[i][j] = leftLines[i] === rightLines[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
		}
	}

	const rows: DiffLine[] = [];
	const summary: DiffSummary = { inserted: 0, deleted: 0, unchanged: 0 };
	let leftNumber = 1;
	let rightNumber = 1;
	let i = 0;
	let j = 0;

	while (i < leftLines.length && j < rightLines.length) {
		if (leftLines[i] === rightLines[j]) {
			rows.push({ kind: "unchanged", left_number: leftNumber, right_number: rightNumber, left_text: leftLines[i], right_text: rightLines[j] });
			summary.unchanged++;
			i++;
			j++;
			leftNumber++;
			rightNumber++;
		} else if (table[i + 1][j] >= table[i][j + 1]) {
			rows.push({ kind: "deleted", left_number: leftNumber, left_text: leftLines[i] });
			summary.deleted++;
			i++;
			leftNumber++;
		} else {
			rows.push({ kind: "inserted", right_number: rightNumber, right_text: rightLines[j] });
			summary.inserted++;
			j++;
			rightNumber++;
		}
	}

	while (i < leftLines.length) {
		rows.push({ kind: "deleted", left_number: leftNumber, left_text: leftLines[i] });
		summary.deleted++;
		i++;
		leftNumber++;
	}

	while (j < rightLines.length) {
		rows.push({ kind: "inserted", right_number: rightNumber, right_text: rightLines[j] });
		summary.inserted++;
		j++;
		rightNumber++;
	}

	return { rows, summary };
}

function splitTextLines(value: string): string[] {
	return value.replace(/\r\n?/g, "\n").split("\n");
}

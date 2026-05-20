function plainTextSelection(container) {
	const selection = window.getSelection();
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
		return null;
	}

	const range = selection.getRangeAt(0);
	if (!container.contains(range.commonAncestorContainer)) {
		return null;
	}

	const fullText = container.textContent || "";
	const selectedText = selection.toString().trim();
	if (!selectedText) {
		return null;
	}

	const startOffset = fullText.indexOf(selectedText);
	if (startOffset < 0) {
		return null;
	}

	const endOffset = startOffset + selectedText.length;

	return {
		quote: selectedText,
		startOffset,
		endOffset,
		prefix: fullText.slice(Math.max(0, startOffset - 32), startOffset),
		suffix: fullText.slice(endOffset, endOffset + 32)
	};
}

function setAnnotationDraftState(isReady) {
	const form = document.getElementById("annotation-form");
	const callout = document.getElementById("annotation-callout");
	const preview = document.getElementById("annotation-quote-preview");
	const quote = document.getElementById("annotation-quote");
	const start = document.getElementById("annotation-start");
	const end = document.getElementById("annotation-end");
	const prefix = document.getElementById("annotation-prefix");
	const suffix = document.getElementById("annotation-suffix");
	const submit = form ? form.querySelector("button[type='submit']") : null;

	if (!form || !callout || !preview || !quote || !start || !end || !prefix || !suffix || !(submit instanceof HTMLButtonElement)) {
		return;
	}

	form.classList.toggle("is-ready", isReady);
	submit.disabled = !isReady;
	callout.textContent = isReady
		? "Annotation draft is ready. Add a short note in the margin, then attach it."
		: "Select a passage in the document to open an annotation draft.";

	if (!isReady) {
		quote.value = "";
		preview.value = "";
		start.value = "";
		end.value = "";
		prefix.value = "";
		suffix.value = "";
	}
}

document.addEventListener("selectionchange", () => {
	const container = document.getElementById("reader-content");
	if (!container) {
		return;
	}

	const payload = plainTextSelection(container);
	if (!payload) {
		setAnnotationDraftState(false);
		return;
	}

	const quote = document.getElementById("annotation-quote");
	const preview = document.getElementById("annotation-quote-preview");
	const start = document.getElementById("annotation-start");
	const end = document.getElementById("annotation-end");
	const prefix = document.getElementById("annotation-prefix");
	const suffix = document.getElementById("annotation-suffix");

	if (!quote || !preview || !start || !end || !prefix || !suffix) {
		return;
	}

	quote.value = payload.quote;
	preview.value = payload.quote;
	start.value = String(payload.startOffset);
	end.value = String(payload.endOffset);
	prefix.value = payload.prefix;
	suffix.value = payload.suffix;
	setAnnotationDraftState(true);
});

function setupDropzone() {
	const dropzone = document.getElementById("dropzone");
	const fileInput = document.getElementById("dropzone-file");

	if (!dropzone || !fileInput) {
		return;
	}

	const openPicker = () => fileInput.click();

	dropzone.addEventListener("click", (event) => {
		if (event.target instanceof HTMLElement && event.target.closest("input")) {
			return;
		}
		openPicker();
	});

	["dragenter", "dragover"].forEach((eventName) => {
		dropzone.addEventListener(eventName, (event) => {
			event.preventDefault();
			dropzone.classList.add("is-dragover");
		});
	});

	["dragleave", "dragend", "drop"].forEach((eventName) => {
		dropzone.addEventListener(eventName, (event) => {
			event.preventDefault();
			dropzone.classList.remove("is-dragover");
		});
	});

	dropzone.addEventListener("drop", (event) => {
		const transfer = event.dataTransfer;
		if (!transfer || !transfer.files || transfer.files.length === 0) {
			return;
		}

		fileInput.files = transfer.files;
		if (window.htmx) {
			window.htmx.trigger(dropzone, "submit");
			return;
		}
		dropzone.submit();
	});

	fileInput.addEventListener("change", () => {
		if (!fileInput.files || fileInput.files.length === 0) {
			return;
		}

		if (window.htmx) {
			window.htmx.trigger(dropzone, "submit");
			return;
		}
		dropzone.submit();
	});
}

document.addEventListener("DOMContentLoaded", () => {
	setupDropzone();
	setAnnotationDraftState(false);
});

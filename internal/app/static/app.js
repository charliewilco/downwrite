import { LitElement, css, html } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";
import { baseKeymap } from "https://esm.sh/prosemirror-commands@1.7.1";
import { history, redo, undo } from "https://esm.sh/prosemirror-history@1.5.0";
import { keymap } from "https://esm.sh/prosemirror-keymap@1.2.3";
import { defaultMarkdownParser, defaultMarkdownSerializer } from "https://esm.sh/prosemirror-markdown@1.13.2";
import { EditorState } from "https://esm.sh/prosemirror-state@1.4.3";
import { EditorView } from "https://esm.sh/prosemirror-view@1.41.3";

/**
 * Captures a text selection relative to a rendered document container.
 *
 * Annotation offsets are stored against rendered text so the server contract
 * can stay small while the browser still captures useful quote context.
 *
 * @param {HTMLElement} container
 * @returns {{quote: string, startOffset: number, endOffset: number, prefix: string, suffix: string} | null}
 */
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

class DownwriteDocumentCard extends LitElement {
	static properties = {
		color: { type: String },
		excerpt: { type: String },
		href: { type: String },
		title: { type: String },
		typeface: { type: String },
		version: { type: String }
	};

	static styles = css`
		:host {
			display: block;
		}

		a {
			position: relative;
			display: grid;
			grid-template-columns: 0.65rem minmax(0, 1fr) auto;
			gap: 1rem;
			align-items: start;
			padding: 0.95rem 0;
			background: transparent;
			border-bottom: 1px solid #ededed;
			color: #22201d;
			text-decoration: none;
			transition: color 140ms ease;
		}

		a:hover,
		a:focus-visible {
			color: #4662f0;
		}

		.swatch {
			width: 0.65rem;
			height: 0.65rem;
			margin-top: 0.28rem;
			border-radius: 999px;
			background: #cfe7ff;
			box-shadow: 0 0 0 3px rgba(207, 231, 255, 0.35);
		}

		:host([color="blush"]) .swatch {
			background: #f8cdda;
			box-shadow: 0 0 0 3px rgba(248, 205, 218, 0.35);
		}

		:host([color="peach"]) .swatch {
			background: #ffd8b8;
			box-shadow: 0 0 0 3px rgba(255, 216, 184, 0.38);
		}

		:host([color="mint"]) .swatch {
			background: #cdebd6;
			box-shadow: 0 0 0 3px rgba(205, 235, 214, 0.4);
		}

		:host([color="lavender"]) .swatch {
			background: #ddd5ff;
			box-shadow: 0 0 0 3px rgba(221, 213, 255, 0.38);
		}

		.card-main {
			display: grid;
			gap: 0.35rem;
			min-width: 0;
		}

		strong {
			font-family: "General Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
			font-size: 0.95rem;
			font-weight: 700;
		}

		:host([typeface="serif"]) strong,
		:host([typeface="serif"]) p {
			font-family: Georgia, "Times New Roman", serif;
		}

		:host([typeface="mono"]) strong,
		:host([typeface="mono"]) p {
			font-family: "IBM Plex Mono", "SFMono-Regular", Menlo, monospace;
		}

		p {
			margin: 0;
			color: #777;
			font-family: "General Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
			font-size: 0.78rem;
			line-height: 1.35;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.version {
			align-self: start;
			padding-top: 0.1rem;
			background: transparent;
			color: #888;
			font-family: "IBM Plex Mono", "SFMono-Regular", "Menlo", monospace;
			font-size: 0.68rem;
		}

		@media (max-width: 720px) {
			a {
				grid-template-columns: minmax(0, 1fr);
			}
		}
	`;

	constructor() {
		super();
		this.color = "sky";
		this.excerpt = "";
		this.href = "#";
		this.title = "";
		this.typeface = "sans-serif";
		this.version = "";
	}

	render() {
		return html`
			<a href=${this.href}>
				<span class="swatch" aria-hidden="true"></span>
				<span class="card-main">
					<strong>${this.title}</strong>
					${this.excerpt ? html`<p>${this.excerpt}</p>` : ""}
				</span>
				<span class="version">${this.version}</span>
			</a>
		`;
	}
}

class DownwriteDropzone extends LitElement {
	createRenderRoot() {
		return this;
	}

	connectedCallback() {
		super.connectedCallback();
		this.setup();
	}

	disconnectedCallback() {
		this.teardown?.();
		super.disconnectedCallback();
	}

	/**
	 * Returns true when the drag event is carrying at least one file.
	 *
	 * Browser drag events also fire for selected text and links; checking the
	 * data-transfer types keeps the workspace overlay from appearing for those.
	 *
	 * @param {DragEvent} event
	 * @returns {boolean}
	 */
	hasFiles(event) {
		return Array.from(event.dataTransfer?.types || []).includes("Files");
	}

	setup() {
		const dropzone = this.querySelector("#dropzone");
		const fileInput = this.querySelector("#dropzone-file");

		if (!dropzone || !fileInput) {
			return;
		}

		let dragDepth = 0;

		// HTMX owns the upload request. The component only translates native file
		// picker/drop events into the same form submission path.
		const submit = () => {
			dropzone.classList.add("is-uploading");
			if (window.htmx) {
				window.htmx.trigger(dropzone, "submit");
				return;
			}
			dropzone.submit();
		};

		const activate = () => {
			dropzone.classList.add("is-dragover");
			document.body.classList.add("is-file-dragging");
		};

		const deactivate = () => {
			dragDepth = 0;
			dropzone.classList.remove("is-dragover");
			document.body.classList.remove("is-file-dragging");
		};

		dropzone.addEventListener("click", (event) => {
			if (event.target instanceof HTMLElement && event.target.closest("input")) {
				return;
			}
			fileInput.click();
		});

		const handleDragEnter = (event) => {
			if (!this.hasFiles(event)) {
				return;
			}
			event.preventDefault();
			dragDepth += 1;
			activate();
		};

		const handleDragOver = (event) => {
			if (!this.hasFiles(event)) {
				return;
			}
			event.preventDefault();
			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = "copy";
			}
			activate();
		};

		const handleDragLeave = () => {
			dragDepth -= 1;
			if (dragDepth <= 0) {
				deactivate();
			}
		};

		const handleDrop = (event) => {
			if (!this.hasFiles(event)) {
				return;
			}
			event.preventDefault();
			deactivate();
			const transfer = event.dataTransfer;
			if (!transfer || !transfer.files || transfer.files.length === 0) {
				return;
			}

			fileInput.files = transfer.files;
			submit();
		};

		const handleUploadDone = () => dropzone.classList.remove("is-uploading");

		fileInput.addEventListener("change", () => {
			if (!fileInput.files || fileInput.files.length === 0) {
				return;
			}

			submit();
		});

		for (const target of [dropzone, document.body]) {
			target.addEventListener("dragenter", handleDragEnter);
			target.addEventListener("dragover", handleDragOver);
			target.addEventListener("dragleave", handleDragLeave);
			target.addEventListener("drop", handleDrop);
		}

		document.body.addEventListener("dragend", deactivate);
		dropzone.addEventListener("htmx:afterRequest", handleUploadDone);

		this.teardown = () => {
			for (const target of [dropzone, document.body]) {
				target.removeEventListener("dragenter", handleDragEnter);
				target.removeEventListener("dragover", handleDragOver);
				target.removeEventListener("dragleave", handleDragLeave);
				target.removeEventListener("drop", handleDrop);
			}
			document.body.removeEventListener("dragend", deactivate);
			dropzone.removeEventListener("htmx:afterRequest", handleUploadDone);
			deactivate();
		};
	}
}

class DownwriteAnnotationForm extends LitElement {
	static properties = {
		reader: { type: String }
	};

	createRenderRoot() {
		return this;
	}

	constructor() {
		super();
		this.reader = "";
		this.handleSelection = this.handleSelection.bind(this);
		this.handleAnnotationSaved = this.handleAnnotationSaved.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		document.addEventListener("selectionchange", this.handleSelection);
		this.addEventListener("htmx:afterRequest", this.handleAnnotationSaved);
	}

	disconnectedCallback() {
		document.removeEventListener("selectionchange", this.handleSelection);
		this.removeEventListener("htmx:afterRequest", this.handleAnnotationSaved);
		super.disconnectedCallback();
	}

	handleSelection() {
		const container = document.getElementById(this.reader);
		if (!container) {
			return;
		}

		const payload = plainTextSelection(container);
		if (!payload) {
			return;
		}

		const quote = this.querySelector("#annotation-quote");
		const preview = this.querySelector("#annotation-quote-preview");
		const start = this.querySelector("#annotation-start");
		const end = this.querySelector("#annotation-end");
		const prefix = this.querySelector("#annotation-prefix");
		const suffix = this.querySelector("#annotation-suffix");
		const form = this.querySelector("#annotation-form");
		const comment = this.querySelector("textarea[name='comment']");

		if (!quote || !preview || !start || !end || !prefix || !suffix || !form) {
			return;
		}

		quote.value = payload.quote;
		preview.value = payload.quote;
		start.value = String(payload.startOffset);
		end.value = String(payload.endOffset);
		prefix.value = payload.prefix;
		suffix.value = payload.suffix;
		form.classList.add("is-ready");
		if (comment instanceof HTMLTextAreaElement) {
			comment.focus();
		}
	}

	handleAnnotationSaved() {
		const form = this.querySelector("#annotation-form");
		const preview = this.querySelector("#annotation-quote-preview");
		const comment = this.querySelector("textarea[name='comment']");
		if (form instanceof HTMLFormElement) {
			form.classList.remove("is-ready");
		}
		if (preview instanceof HTMLTextAreaElement) {
			preview.value = "";
		}
		if (comment instanceof HTMLTextAreaElement) {
			comment.value = "";
		}
	}
}

/**
 * Progressive markdown editor for the new document route.
 *
 * ProseMirror owns the editing surface, but the existing textarea remains the
 * only submitted form control. That keeps the Go handler unchanged and makes
 * this safe to remove if the enhancement fails to load.
 */
class DownwriteMarkdownEditor extends LitElement {
	createRenderRoot() {
		return this;
	}

	connectedCallback() {
		super.connectedCallback();
		this.setup();
	}

	disconnectedCallback() {
		if (this.view) {
			this.view.destroy();
		}
		super.disconnectedCallback();
	}

	/**
	 * Upgrades a plain textarea into a ProseMirror editor while keeping the
	 * textarea as the form field submitted to the Go server.
	 *
	 * @returns {void}
	 */
	setup() {
		const textarea = this.querySelector("textarea");
		if (!textarea || this.view) {
			return;
		}

		this.textarea = textarea;
		this.textarea.hidden = true;

		const mount = document.createElement("div");
		mount.className = "new-prosemirror-canvas";
		this.insertBefore(mount, textarea);

		this.view = new EditorView(mount, {
			state: EditorState.create({
				doc: defaultMarkdownParser.parse(textarea.value || ""),
				plugins: [
					history(),
					keymap({
						"Mod-z": undo,
						"Shift-Mod-z": redo,
						"Mod-y": redo
					}),
					keymap(baseKeymap)
				]
			}),
			dispatchTransaction: (transaction) => {
				const nextState = this.view.state.apply(transaction);
				this.view.updateState(nextState);
				this.syncTextarea();
			}
		});

		this.closest("form")?.addEventListener("submit", () => this.syncTextarea());
	}

	/**
	 * Serializes the ProseMirror document back into markdown for the existing
	 * `content` field.
	 *
	 * @returns {void}
	 */
	syncTextarea() {
		if (!this.view || !this.textarea) {
			return;
		}

		this.textarea.value = defaultMarkdownSerializer.serialize(this.view.state.doc);
	}
}

customElements.define("dw-document-card", DownwriteDocumentCard);
customElements.define("dw-dropzone", DownwriteDropzone);
customElements.define("dw-annotation-form", DownwriteAnnotationForm);
customElements.define("dw-markdown-editor", DownwriteMarkdownEditor);

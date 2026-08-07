export interface MarkdownDropDetail {
  workspaceId: string | null;
  files: FileList;
}

export class MarkdownDragArea extends HTMLElement {
  #dragDepth = 0;

  constructor() {
    super();
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
        }

        .drop-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: none;
          border: 2px dashed var(--notice);
          border-radius: 8px;
          background: color-mix(in srgb, var(--notice) 10%, transparent);
          pointer-events: none;
        }

        :host([dragging]) .drop-overlay {
          display: block;
        }
      </style>
      <slot></slot>
      <div class="drop-overlay"></div>
    `;
  }

  connectedCallback() {
    this.addEventListener("dragenter", this.#handleDragEnter);
    this.addEventListener("dragover", this.#handleDragOver);
    this.addEventListener("dragleave", this.#handleDragLeave);
    this.addEventListener("drop", this.#handleDrop);
  }

  disconnectedCallback() {
    this.removeEventListener("dragenter", this.#handleDragEnter);
    this.removeEventListener("dragover", this.#handleDragOver);
    this.removeEventListener("dragleave", this.#handleDragLeave);
    this.removeEventListener("drop", this.#handleDrop);
  }

  #handleDragEnter = (event: DragEvent) => {
    if (!hasFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    this.#dragDepth += 1;
    this.toggleAttribute("dragging", true);
  };

  #handleDragOver = (event: DragEvent) => {
    if (!hasFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  };

  #handleDragLeave = (event: DragEvent) => {
    if (!hasFiles(event.dataTransfer)) {
      return;
    }

    event.preventDefault();
    this.#dragDepth = Math.max(0, this.#dragDepth - 1);
    if (this.#dragDepth === 0) {
      this.removeAttribute("dragging");
    }
  };

  #handleDrop = (event: DragEvent) => {
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer || !hasFiles(dataTransfer)) {
      return;
    }

    event.preventDefault();
    this.#dragDepth = 0;
    this.removeAttribute("dragging");
    this.dispatchEvent(
      new CustomEvent<MarkdownDropDetail>("markdown-files-drop", {
        bubbles: true,
        composed: true,
        detail: {
          workspaceId: this.getAttribute("workspace-id") || null,
          files: dataTransfer.files,
        },
      }),
    );
  };
}

function hasFiles(dataTransfer: DataTransfer | null) {
  return dataTransfer
    ? Array.from(dataTransfer.types).includes("Files")
    : false;
}

if (!customElements.get("markdown-dragarea")) {
  customElements.define("markdown-dragarea", MarkdownDragArea);
}

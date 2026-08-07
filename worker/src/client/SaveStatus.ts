export class SaveStatus extends HTMLElement {
  static observedAttributes = ["state"];

  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  private render() {
    const state = this.getAttribute("state") ?? "idle";
    this.className = `save-status ${state}`;
    this.textContent = labelForState(state);
  }
}

function labelForState(state: string) {
  switch (state) {
    case "dirty":
      return "Unsaved changes";
    case "saving":
      return "Saving...";
    case "saved":
      return "Saved";
    case "error":
      return "Save failed";
    default:
      return "Ready";
  }
}

if (!customElements.get("dw-save-status")) {
  customElements.define("dw-save-status", SaveStatus);
}

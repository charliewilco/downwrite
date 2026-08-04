import { render } from "preact";
import { App } from "./app.js";
import "./style.css";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Missing #app root");
}

render(<App />, root);

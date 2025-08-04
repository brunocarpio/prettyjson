import { state as prettyEditorState } from "./prettyEditor.mts";
import { state as schemaEditorState } from "./schemaValidator.mts";

document.getElementById("copyButton")?.addEventListener("click", () => {
  navigator.clipboard.writeText(prettyEditorState.getDocString());
});

document
  .getElementById("clearButton")
  ?.addEventListener("click", () => prettyEditorState.overwrite("clear"));

document
  .getElementById("prettifyButton")
  ?.addEventListener("click", () => prettyEditorState.overwrite("pretty"));

document
  .getElementById("linearizeButton")
  ?.addEventListener("click", () => prettyEditorState.overwrite("linear"));

document
  .getElementById("unescapeButton")
  ?.addEventListener("click", () => prettyEditorState.overwrite("unescape"));

document
  .getElementById("escapeButton")
  ?.addEventListener("click", () => prettyEditorState.overwrite("escape"));

document
  .getElementById("validateButton")
  ?.addEventListener("click", () => schemaEditorState.showAlert())

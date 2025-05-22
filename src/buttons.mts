import * as Editor from "./editor.mts";

document.getElementById("copyButton")?.addEventListener("click", () => {
  navigator.clipboard.writeText(Editor.getDocString());
});

document
  .getElementById("clearButton")
  ?.addEventListener("click", () => Editor.overwrite("clear"));

document
  .getElementById("prettifyButton")
  ?.addEventListener("click", () => Editor.overwrite("pretty"));

document
  .getElementById("linearizeButton")
  ?.addEventListener("click", () => Editor.overwrite("linear"));

document
  .getElementById("unescapeButton")
  ?.addEventListener("click", () => Editor.overwrite("unescape"));

document
  .getElementById("escapeButton")
  ?.addEventListener("click", () => Editor.overwrite("escape"));

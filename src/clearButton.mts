import * as Editor from "./editor.mts";

let button = document.getElementById("clearButton");

export function init() {
    button?.addEventListener("click", () => Editor.overwrite("empty"));
}

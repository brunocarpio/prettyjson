import * as Editor from "./editor.mts";

let button = document.getElementById("escapeButton");

export function init() {
    button?.addEventListener("click", () => Editor.overwrite("escape"));
    return true;
}

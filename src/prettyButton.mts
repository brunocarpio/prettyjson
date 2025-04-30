import * as Editor from "./editor.mts";

let button = document.getElementById("prettifyButton");

export function init() {
    button?.addEventListener("click", () => Editor.overwrite("pretty"));
    return true;
}

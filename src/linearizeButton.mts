import * as Editor from "./editor.mts";

let button = document.getElementById("linearizeButton");

export function init() {
    button?.addEventListener("click", () => Editor.overwrite("linear"));
    return true;
}

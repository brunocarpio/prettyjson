import * as Editor from "./editor.mts";

let button = document.getElementById("unescapeButton");

export function init() {
    button?.addEventListener("click", () => Editor.overwrite("unescape"));
    return true;
}

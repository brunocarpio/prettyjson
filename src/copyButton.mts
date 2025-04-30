import * as Editor from "./editor.mts";

let button = document.getElementById("copyButton");

export function init() {
    button?.addEventListener("click", () => {
        navigator.clipboard.writeText(Editor.getDocString());
    });
}

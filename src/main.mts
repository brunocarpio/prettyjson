import * as PrettyButton from "./prettyButton.mts";
import * as Editor from "./editor.mts";
import * as CopyButton from "./copyButton.mts";
import * as ClearButton from "./clearButton.mts";
import * as LinearizeButton from "./linearizeButton.mts";
import * as MediaListener from "./mediaListener.mts";
import * as EscapeButton from "./escapeButton.mjs";
import * as UnescapeButton from "./unescapeButton.mjs";


window.onload = (_) => {
    MediaListener.init();
    let editorView = Editor.init();
    if (editorView) {
        CopyButton.init();
        PrettyButton.init();
        ClearButton.init();
        LinearizeButton.init();
        EscapeButton.init();
        UnescapeButton.init();
    }
}

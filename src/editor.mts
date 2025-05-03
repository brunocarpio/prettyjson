import { json, jsonParseLinter } from "@codemirror/lang-json";
import { diagnosticCount, linter, lintGutter } from "@codemirror/lint";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import { highlightTrailingWhitespace, placeholder, ViewUpdate } from "@codemirror/view";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { basicSetup, EditorView } from "codemirror";

let editorParent = document.getElementById("editorParent");

let lightTheme: Extension = githubLight;
let darkTheme: Extension = githubDark;

let theme: Compartment = new Compartment();

let editorView: EditorView;

export let initial = {
    isDarkTimeZero: false,
}

function fixedHeight() {
    return EditorView.theme({
        "&": {
            height: "500px",
        },
        ".cm-scroller": {
            overflow: "auto",
            "scrollbar-width": "thin",
        },
    });
}

export function toDarkTheme(isDark: boolean) {
    if (editorView) {
        editorView.dispatch(
            {
                effects: [
                    theme.reconfigure(isDark ? darkTheme : lightTheme),
                ],
            }
        );
    }
}

export function overwrite(option: string) {
    if (editorView) {
        let state = editorView.state;
        let isValid = diagnosticCount(state) == 0;
        if (isValid) {
            let str = "";
            let tmp = "";
            switch (option) {
                case "pretty":
                    str = JSON.stringify(JSON.parse(state.doc.toString()), null, 2);
                    break;
                case "linear":
                    str = JSON.stringify(JSON.parse(state.doc.toString()));
                    break;
                case "empty":
                    break;
                case "escape":
                    tmp = JSON.stringify({ remove: state.doc.toString() });
                    str = tmp.substring(tmp.indexOf(":") + 1, tmp.length - 1);
                    break;
                case "unescape":
                    tmp = state.doc.toString();
                    if (tmp[0] === '"') {
                        str = JSON.parse(tmp);
                    }
                    else {
                        str = tmp;
                    }
                    break;
                default:
                    break;
            }
            if (state.doc.toString()) {
                editorView.dispatch({
                    changes: {
                        from: 0,
                        to: state.doc.length,
                        insert: str
                    },
                });
            }
        }
    }
}

export function getDocString() {
    return editorView.state.doc.toString()
}

function syntaxErrorListener() {
    return EditorView.updateListener.of(async (update: ViewUpdate) => {
        if (diagnosticCount(update.state) > 0) {
            let alertParent = document.querySelector("div.cm-panel.cm-panel-lint")! as HTMLDivElement;
            if (alertParent) {
                alertParent.querySelector("button")!.style.display = "none";
                alertParent.classList.add("alert", "alert-danger");
                let li = alertParent.querySelector("li")!;
                li.style.background = "none";
                let errorMarker = document.querySelector("div.cm-lint-marker.cm-lint-marker-error") as HTMLDivElement;
                if (errorMarker) {
                    errorMarker.classList.replace("cm-lint-marker-error", "cm-json-error")
                }
            }
        }
    });
}

export function init() {
    if (editorParent) {
        editorView = new EditorView({
            state: EditorState.create({
                extensions:
                    [
                        basicSetup,
                        EditorView.lineWrapping,
                        fixedHeight(),
                        highlightTrailingWhitespace(),
                        json(),
                        theme.of(initial.isDarkTimeZero ? darkTheme : lightTheme),
                        linter(jsonParseLinter(), { delay: 250, autoPanel: true }),
                        lintGutter(),
                        placeholder("Enter your JSON"),
                        syntaxErrorListener()
                    ]
            }),
            parent: editorParent
        });
        return editorView;
    }
}

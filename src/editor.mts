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

export function toDarkTheme(isDark: boolean): void {
    if (!EditorView) return;
    editorView.dispatch(
        {
            effects: [
                theme.reconfigure(isDark ? darkTheme : lightTheme),
            ],
        }
    );
}

export function getDocString(): string {
    return editorView.state.doc.toString()
}

export function overwrite(option: string): void {
    if (!editorView) return;

    let state = editorView.state;

    if (diagnosticCount(state) !== 0) return;

    let content = state.doc.toString();
    if (!content) return;

    let from = 0;
    let to = content.length;
    let selection = content;

    if (!state.selection.main.empty) {
        from = state.selection.main.anchor.valueOf();
        to = state.selection.main.head.valueOf();
        selection = content.substring(from, to);
    }

    switch (option) {
        case "pretty":
            prettify(selection, from, to);
            break;
        case "linear":
            linearize(selection, from, to);
            break;
        case "clear":
            clear();
            break;
        case "escape":
            escape(selection, from, to);
            break;
        case "unescape":
            unescape(selection, from, to);
            break;
        default:
            break;
    }
}

export function init() {
    if (!editorParent) return;

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

function fixedHeight(): Extension {
    return EditorView.theme({
        "&": {
            height: "600px",
        },
        ".cm-scroller": {
            overflow: "auto",
            "scrollbar-width": "thin",
        },
    });
}

function prettify(content: string, from: number, to: number): void {
    editorView.dispatch({
        changes: {
            from,
            to,
            insert: JSON.stringify(JSON.parse(content), null, 2)
        }
    });
}

function linearize(content: string, from: number, to: number): void {
    editorView.dispatch({
        changes: {
            from,
            to,
            insert: JSON.stringify(JSON.parse(content))
        }
    });
}

function clear(): void {
    editorView.dispatch({
        changes: {
            from: 0,
            to: editorView.state.doc.toString().length,
            insert: ""
        }
    });
}

function escape(content: string, from: number, to: number): void {
    let b_option = "";
    let bracketIdx = content.indexOf("[") >= 0 ? content.indexOf("[") : Infinity;
    let braceIdx = content.indexOf("{") >= 0 ? content.indexOf("{") : Infinity;

    b_option = bracketIdx < braceIdx ? "[" : "{";

    let open = "";
    let close = "";
    switch (b_option) {
        case "[":
            open = "[";
            close = "]";
            break;
        case "{":
            open = "{";
            close = "}";
            break;
        default:
            break;
    }

    let tmp = JSON.stringify(`${content.substring(content.indexOf(open) + 1, content.lastIndexOf(close))}`);
    tmp = tmp.substring(1, tmp.length - 1);
    tmp = `"${open}` + tmp + `${close}"`;

    editorView.dispatch({
        changes: {
            from,
            to,
            insert: tmp
        }
    });
}

function unescape(content: string, from: number, to: number): void {
    if (content[0] !== '"') return;

    let str = JSON.parse(content);

    if (str.startsWith("{\\") || str.startsWith("[\\") || str.startsWith("[{\\")) {
        str = '"' + str + '"';
    }

    editorView.dispatch({
        changes: {
            from,
            to,
            insert: str
        }
    });
}

function syntaxErrorListener(): Extension {
    return EditorView.updateListener.of(async (update: ViewUpdate) => {
        if (diagnosticCount(update.state) === 0) return;

        let alertParent = document.querySelector("div.cm-panel.cm-panel-lint")! as HTMLDivElement;

        if (!alertParent) return;

        if (update.state.doc.toString() === "") {
            alertParent.style.display = "none";
        }
        else {
            alertParent.querySelector("button")!.style.display = "none";
            alertParent.classList.add("alert", "alert-danger");
            let li = alertParent.querySelector("li")!;
            li.style.background = "none";
        }

        let errorMarker = document.querySelector("div.cm-lint-marker.cm-lint-marker-error") as HTMLDivElement;
        if (errorMarker) {
            errorMarker.classList.replace("cm-lint-marker-error", "cm-json-error")
        }
    });
}


import { json, jsonParseLinter } from "@codemirror/lang-json";
import { diagnosticCount, linter, lintGutter } from "@codemirror/lint";
import { Compartment, EditorState, Extension } from "@codemirror/state";
import {
  highlightTrailingWhitespace,
  placeholder,
  ViewUpdate,
} from "@codemirror/view";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { basicSetup, EditorView } from "codemirror";

interface State {
  editorView: EditorView | null;
  theme: Compartment;
  overwrite: Function;
  getDocString: Function;
  toDarkTheme: Function;
}

export let state: State = {
  editorView: null,
  theme: new Compartment(),
  overwrite,
  getDocString,
  toDarkTheme,
};

function byteSizeListener(): Extension {
  return EditorView.updateListener.of(async (update: ViewUpdate) => {
    let byteSize = document.getElementById("byteSize");
    if (!state.editorView || !byteSize) {
      return;
    }
    let content = update.state.doc.toString();
    let size = new Blob([content]).size;
    if (0 <= size && size < Math.pow(10, 3)) {
      byteSize.textContent = size + " B";
    } else if (size < Math.pow(10, 6)) {
      byteSize.textContent = Number(size / Math.pow(10, 3)).toFixed(3) + " KB";
    } else {
      byteSize.textContent = Number(size / Math.pow(10, 6)).toFixed(3) + " MB";
    }
  });
}

function toDarkTheme(isDark: boolean): void {
  if (!EditorView) return;
  state.editorView?.dispatch({
    effects: [state.theme.reconfigure(isDark ? githubDark : githubLight)],
  });
}

function getDocString(): string | undefined {
  return state.editorView?.state.doc.toString();
}

function overwrite(option: string): void {
  let { editorView } = state;
  if (!editorView) return;

  let evState = editorView.state;

  if (diagnosticCount(evState) !== 0) return;

  let content = evState.doc.toString();
  if (!content) return;

  let from = 0;
  let to = content.length;
  let selection = content;

  if (!evState.selection.main.empty) {
    from = evState.selection.main.anchor.valueOf();
    to = evState.selection.main.head.valueOf();
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

function fixedHeight(): Extension {
  return EditorView.theme({
    "&": {
      "font-size": "1rem",
    },
    ".cm-scroller": {
      overflow: "auto",
      "scrollbar-width": "thin",
    },
  });
}

function prettify(content: string, from: number, to: number): void {
  state.editorView?.dispatch({
    changes: {
      from,
      to,
      insert: JSON.stringify(JSON.parse(content), null, 2),
    },
  });
}

function linearize(content: string, from: number, to: number): void {
  state.editorView?.dispatch({
    changes: {
      from,
      to,
      insert: JSON.stringify(JSON.parse(content)),
    },
  });
}

function clear(): void {
  state.editorView?.dispatch({
    changes: {
      from: 0,
      to: state.editorView.state.doc.toString().length,
      insert: "",
    },
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

  let tmp = JSON.stringify(
    `${content.substring(content.indexOf(open) + 1, content.lastIndexOf(close))}`,
  );
  tmp = tmp.substring(1, tmp.length - 1);
  tmp = `"${open}` + tmp + `${close}"`;

  state.editorView?.dispatch({
    changes: {
      from,
      to,
      insert: tmp,
    },
  });
}

function unescape(content: string, from: number, to: number): void {
  if (content[0] !== '"') return;

  let str = JSON.parse(content);

  if (
    str.startsWith("{\\") ||
    str.startsWith("[\\") ||
    str.startsWith("[{\\")
  ) {
    str = '"' + str + '"';
  }

  state.editorView?.dispatch({
    changes: {
      from,
      to,
      insert: str,
    },
  });
}

function syntaxErrorListener(): Extension {
  return EditorView.updateListener.of(async (update: ViewUpdate) => {
    if (diagnosticCount(update.state) === 0) return;

    let alertParent = document.querySelector(
      "div.cm-panel.cm-panel-lint",
    )! as HTMLDivElement;

    if (!alertParent) return;

    if (update.state.doc.toString() === "") {
      alertParent.style.display = "none";
    } else {
      alertParent.querySelector("button")!.style.display = "none";
      alertParent.classList.add("alert", "alert-danger");
      let li = alertParent.querySelector("li")!;
      li.style.background = "none";
    }

    let errorMarker = document.querySelector(
      "div.cm-lint-marker.cm-lint-marker-error",
    ) as HTMLDivElement;
    if (errorMarker) {
      errorMarker.classList.replace("cm-lint-marker-error", "cm-json-error");
    }
  });
}

function lineColumnListener(): Extension {
  return EditorView.updateListener.of(async (update: ViewUpdate) => {
    let lineColumn = document.getElementById("lineColumn");
    if (!lineColumn) {
      return;
    }
    lineColumn.textContent =
      "Line " +
      update.state.doc.lineAt(update.state.selection.main.head).number +
      ", Column " +
      (update.state.selection.ranges[0].head -
        update.state.doc.lineAt(update.state.selection.main.head).from);
  });
}

function main() {
  let editorParent = document.getElementById("editorParent");
  if (!editorParent) return;

  let editorView = new EditorView({
    state: EditorState.create({
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        fixedHeight(),
        highlightTrailingWhitespace(),
        json(),
        state.theme.of(githubLight),
        linter(jsonParseLinter(), { delay: 250, autoPanel: true }),
        lintGutter(),
        placeholder("Enter your JSON"),
        syntaxErrorListener(),
        lineColumnListener(),
        byteSizeListener(),
      ],
    }),
    parent: editorParent,
  });

  state.editorView = editorView;
}

main();

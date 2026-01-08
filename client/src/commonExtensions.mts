import { diagnosticCount } from "@codemirror/lint";
import { Extension } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { EditorView } from "codemirror";

export function syntaxErrorListener(editorParent: HTMLElement): Extension {
  return EditorView.updateListener.of(async (update: ViewUpdate) => {
    if (diagnosticCount(update.state) === 0) return;

    let alertParent = editorParent.querySelector(
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

    let errorMarker = editorParent.querySelector(
      "div.cm-lint-marker.cm-lint-marker-error",
    ) as HTMLDivElement;
    if (errorMarker) {
      errorMarker.classList.replace("cm-lint-marker-error", "cm-json-error");
    }
  });
}

export function fixedHeight(height: number = 600): Extension {
  return EditorView.theme({
    "&": {
      "font-size": "1rem",
      height: "100%",
      "max-height": `${height}px`,
    },
    ".cm-scroller": {
      overflow: "auto",
      "scrollbar-width": "thin",
    },
    ".cm-gutter": {
      "min-height": "200px",
    },
    ".cm-content": {
      "min-height": "200px",
    },
    ".cm-search": {
      "font-size": "large",
    },
  });
}

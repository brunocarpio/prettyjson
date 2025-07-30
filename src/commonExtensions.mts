import {diagnosticCount} from "@codemirror/lint";
import {Extension} from "@codemirror/state";
import {ViewUpdate} from "@codemirror/view";
import {EditorView} from "codemirror";

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

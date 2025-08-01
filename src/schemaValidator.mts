import {json} from "@codemirror/lang-json";
import {Compartment, EditorState, Extension} from "@codemirror/state";
import {githubDark} from "@ddietr/codemirror-themes/theme/github-dark";
import {githubLight} from "@ddietr/codemirror-themes/theme/github-light";
import {basicSetup, EditorView} from "codemirror";

interface State {
  editorViewSchema: EditorView | null;
  editorViewTestJson: EditorView | null;
  theme: Compartment;
  toDarkTheme: Function;
}

export let state: State = {
  editorViewSchema: null,
  editorViewTestJson: null,
  theme: new Compartment(),
  toDarkTheme,
}

function toDarkTheme(isDark: boolean): void {
  if (!EditorView) return;
  state.editorViewSchema?.dispatch({
    effects: [state.theme.reconfigure(isDark ? githubDark : githubLight)],
  });
  state.editorViewTestJson?.dispatch({
    effects: [state.theme.reconfigure(isDark ? githubDark : githubLight)],
  });
}

function fixedHeight(): Extension {
  return EditorView.theme({
    "&": {
      "font-size": "1rem",
      "height": "100%",
      "max-height": "800px",
    },
    ".cm-scroller": {
      "overflow": "auto",
      "scrollbar-width": "thin",
    },
    ".cm-gutter": {
      "min-height": "200px"
    },
    ".cm-content": {
      "min-height": "200px"
    },
    ".cm-search": {
      "font-size": "large",
    }
  });
}

function main() {
  let schemaParent = document.getElementById("schemaParent");
  if (!schemaParent) return;

  let testJsonParent = document.getElementById("testJsonParent");
  if (!testJsonParent) return;

  state.editorViewSchema = new EditorView({
    state: EditorState.create({
      extensions: [
        basicSetup,
        fixedHeight(),
        json(),
        state.theme.of(githubLight),
      ]
    }),
    parent: schemaParent,
  });

  state.editorViewTestJson = new EditorView({
    state: EditorState.create({
      extensions: [
        basicSetup,
        fixedHeight(),
        json(),
        state.theme.of(githubLight),
      ]
    }),
    parent: testJsonParent,
  })

}

main()

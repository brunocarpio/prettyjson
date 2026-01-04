import { Compartment, EditorState } from "@codemirror/state";
import { highlightTrailingWhitespace } from "@codemirror/view";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { basicSetup, EditorView } from "codemirror";
import { fixedHeight, syntaxErrorListener } from "./commonExtensions.mts";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";

interface State {
  sEditor: EditorView | null;
  mEditor: EditorView | null;
  rEditor: EditorView | null;
  theme: Compartment;
  toDarkTheme: (isDark: boolean) => void;
}

export const state: State = {
  sEditor: null,
  mEditor: null,
  rEditor: null,
  theme: new Compartment(),
  toDarkTheme,
};

function toDarkTheme(isDark: boolean): void {
  if (!EditorView) return;
  state.sEditor?.dispatch({
    effects: [state.theme.reconfigure(isDark ? githubDark : githubLight)],
  });
  state.mEditor?.dispatch({
    effects: [state.theme.reconfigure(isDark ? githubDark : githubLight)],
  });
  state.rEditor?.dispatch({
    effects: [state.theme.reconfigure(isDark ? githubDark : githubLight)],
  });
}

function main() {
  const sourceJsonContainer = document.getElementById("sourceJsonContainer");
  const mappingJsonContainer = document.getElementById("mappingJsonContainer");
  const resultJsonContainer = document.getElementById("resultJsonContainer");

  if (!sourceJsonContainer || !mappingJsonContainer || !resultJsonContainer)
    return;

  const initialSourceDoc = JSON.stringify(
    {
      product: {
        id: "QL-54905",
        SKU: "123",
        price: "USD 500",
      },
    },
    null,
    2,
  );

  state.sEditor = new EditorView({
    state: EditorState.create({
      doc: initialSourceDoc,
      extensions: [
        basicSetup,
        highlightTrailingWhitespace(),
        fixedHeight(),
        json(),
        state.theme.of(githubLight),
        linter(jsonParseLinter(), { delay: 250, autoPanel: true }),
        syntaxErrorListener(sourceJsonContainer),
      ],
    }),
    parent: sourceJsonContainer,
  });

  state.mEditor = new EditorView({
    state: EditorState.create({
      extensions: [basicSetup, fixedHeight(), state.theme.of(githubLight)],
    }),
    parent: mappingJsonContainer,
  });

  state.rEditor = new EditorView({
    state: EditorState.create({
      extensions: [
        EditorState.readOnly.of(true),
        basicSetup,
        fixedHeight(),
        json(),
        state.theme.of(githubLight),
      ],
    }),
    parent: resultJsonContainer,
  });
}

main();

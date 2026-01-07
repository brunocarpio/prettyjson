import { Compartment, EditorState } from "@codemirror/state";
import { highlightTrailingWhitespace } from "@codemirror/view";
import { githubDark } from "@ddietr/codemirror-themes/theme/github-dark";
import { githubLight } from "@ddietr/codemirror-themes/theme/github-light";
import { basicSetup, EditorView } from "codemirror";
import { fixedHeight, syntaxErrorListener } from "./commonExtensions.mts";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import {
  getObjectFromEditorView,
  getStringFromEditorView,
  setObjectContentToEditorView,
} from "./lib.mts";

interface State {
  sEditor: EditorView | null;
  mEditor: EditorView | null;
  rEditor: EditorView | null;
  theme: Compartment;
  toDarkTheme: (isDark: boolean) => void;
  applyFilter: () => void;
}

export const state: State = {
  sEditor: null,
  mEditor: null,
  rEditor: null,
  theme: new Compartment(),
  toDarkTheme,
  applyFilter,
};

async function applyFilter(): Promise<void> {
  const input = getObjectFromEditorView(state.sEditor);
  if (!input) return;
  const filter = getStringFromEditorView(state.mEditor);
  if (!filter) return;

  const url = "/api/jq";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filter,
        sourceJson: input,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();

    setObjectContentToEditorView(state.rEditor, result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred");
    }
  }
}

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
      widget: {
        debug: "on",
        window: {
          title: "Sample Konfabulator Widget",
          name: "main_window",
          width: 500,
          height: 500,
        },
        image: {
          src: "Images/Sun.png",
          name: "sun1",
        },
        text: {
          data: "Click Here",
          size: 36,
          style: "bold",
          name: "text1",
        },
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

  const initialQuery = ".widget | keys";

  state.mEditor = new EditorView({
    state: EditorState.create({
      doc: initialQuery,
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

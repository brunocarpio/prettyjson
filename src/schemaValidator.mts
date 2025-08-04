import {json, jsonParseLinter} from "@codemirror/lang-json";
import {Compartment, EditorState} from "@codemirror/state";
import {githubDark} from "@ddietr/codemirror-themes/theme/github-dark";
import {githubLight} from "@ddietr/codemirror-themes/theme/github-light";
import {basicSetup, EditorView} from "codemirror";
import {fixedHeight, syntaxErrorListener} from "./commonExtensions.mts";
import {highlightTrailingWhitespace} from "@codemirror/view";
import {linter} from "@codemirror/lint";

import Ajv from "ajv";
import addFormats from "ajv-formats";

let ajv = new Ajv({allErrors: false});
addFormats(ajv);

interface State {
  sEditor: EditorView | null;
  jEditor: EditorView | null;
  theme: Compartment;
  toDarkTheme: (isDark: boolean) => void;
  showAlert: () => void;
  errorMessages: any;
}

export let state: State = {
  sEditor: null,
  jEditor: null,
  theme: new Compartment(),
  toDarkTheme,
  showAlert,
  errorMessages: null,
}

function getJson(e: EditorView | null): any {
  try {
    if (e) {
      let d = e.state.doc.toString();
      if (d === "") {
        return null;
      }
      let j = JSON.parse(d);
      return j;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

function validateSchema(): boolean {
  try {
    let sj = getJson(state.sEditor);
    let jj = getJson(state.jEditor);
    if (!sj) return false;
    let v = ajv.compile(sj)
    let isValid = v(jj);
    if (isValid) {
      state.errorMessages = null;
    } else {
      state.errorMessages = v.errors;
    }
    return isValid;
  } catch (e) {
    console.error(e);
    return false;
  }
}

function showAlert(): void {
  let div = document.getElementById("validateAlert");
  if (!div) return;
  let isValid = validateSchema();
  let containsSuccess = div.classList.contains("alert-success");
  let containsDanger = div.classList.contains("alert-danger");
  if (isValid) {
    if (containsDanger) {
      div.classList.remove("alert-danger");
    }
    if (!containsSuccess) {
      div.classList.add("alert-success");
    }
    div.innerText = "JSON is valid"
  } else {
    if (containsSuccess) {
      div.classList.remove("alert-success");
    }
    if (!containsDanger) {
      div.classList.add("alert-danger");
    }
    let firstError = state.errorMessages[0];
    console.error(JSON.stringify(firstError))
    div.innerHTML = `
    <p>JSON is not valid.</p>
    <dl>
      <dt>instancePath</dt>
      <dd>${firstError.instancePath}</dd>

      <dt>schemaPath</dt>
      <dd>${firstError.schemaPath}</dd>

      <dt>message</dt>
      <dd>${firstError.message}</dd>
    </dl>
    `
  }
}

function toDarkTheme(isDark: boolean): void {
  if (!EditorView) return;
  state.sEditor?.dispatch({
    effects: [state.theme.reconfigure(isDark ? githubDark : githubLight)],
  });
  state.jEditor?.dispatch({
    effects: [state.theme.reconfigure(isDark ? githubDark : githubLight)],
  });
}

function main() {
  let schemaParent = document.getElementById("schemaParent");
  if (!schemaParent) return;

  let sInitialDoc = JSON.stringify({"type": "object", "properties": {"first_name": {"type": "string"}, "last_name": {"type": "string"}, "birthday": {"type": "string", "format": "date"}, "address": {"type": "object", "properties": {"street_address": {"type": "string"}, "city": {"type": "string"}, "state": {"type": "string"}, "country": {"type": "string"}}}}}, null, 2)

  let testJsonParent = document.getElementById("testJsonParent");
  if (!testJsonParent) return;

  let jInitialDoc = JSON.stringify({"first_name": "George", "last_name": "Washington", "birthday": "1732-02-22", "address": {"street_address": "3200 Mount Vernon Memorial Highway", "city": "Mount Vernon", "state": "Virginia", "country": "United States"}}, null, 2)

  state.sEditor = new EditorView({
    state: EditorState.create({
      doc: sInitialDoc,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        highlightTrailingWhitespace(),
        fixedHeight(),
        json(),
        state.theme.of(githubLight),
        linter(jsonParseLinter(), {delay: 250, autoPanel: true}),
        syntaxErrorListener(schemaParent),
      ]
    }),
    parent: schemaParent,
  });

  state.jEditor = new EditorView({
    state: EditorState.create({
      doc: jInitialDoc,
      extensions: [
        basicSetup,
        EditorView.lineWrapping,
        highlightTrailingWhitespace(),
        fixedHeight(),
        json(),
        state.theme.of(githubLight),
        linter(jsonParseLinter(), {delay: 250, autoPanel: true}),
        syntaxErrorListener(testJsonParent),
      ]
    }),
    parent: testJsonParent,
  })

}

main()

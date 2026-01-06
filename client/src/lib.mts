import { EditorView } from "codemirror";
import { Json } from "node-jq/lib/options";

export function getObjectFromEditorView(e: EditorView | null): object | null {
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

export function getStringFromEditorView(e: EditorView | null): string | null {
  try {
    if (e) {
      let d = e.state.doc.toString();
      if (d === "") {
        return null;
      }
      return d;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function getJsonFromEditorView(e: EditorView | null): Json | null {
  try {
    if (e) {
      let d = e.state.doc.toString();
      if (d === "") {
        return null;
      }
      return d;
    } else {
      return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function setObjectContentToEditorView(
  e: EditorView | null,
  content: object,
): void {
  e?.dispatch({
    changes: {
      from: 0,
      to: e.state.doc.length,
      insert: JSON.stringify(content, null, 2),
    },
  });
}

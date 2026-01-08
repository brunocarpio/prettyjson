import { EditorView } from "codemirror";
import { Json } from "node-jq/lib/options";

export function getObjectFromEditorView(
  editor: EditorView | null,
): object | null {
  try {
    if (editor) {
      let d = editor.state.doc.toString();
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

export function getStringFromEditorView(
  editor: EditorView | null,
): string | null {
  try {
    if (editor) {
      let d = editor.state.doc.toString();
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

export function getJsonFromEditorView(editor: EditorView | null): Json | null {
  try {
    if (editor) {
      let d = editor.state.doc.toString();
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
  editor: EditorView | null,
  content: object,
): void {
  editor?.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: JSON.stringify(content, null, 2),
    },
  });
}

export function setStringContentToEditorView(
  editor: EditorView | null,
  content: string,
): void {
  editor?.dispatch({
    changes: {
      from: 0,
      to: editor.state.doc.length,
      insert: content,
    },
  });
}

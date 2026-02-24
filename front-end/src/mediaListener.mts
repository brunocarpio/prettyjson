import { state as prettyEditorState } from "./prettyEditor.mts";
import { state as schemaState } from "./schemaValidator.mts";

function main() {
  let prefersDarkMedia = window.matchMedia("(prefers-color-scheme: dark)");

  if (prefersDarkMedia.matches) {
    console.log("Dark mode is enabled");
    prettyEditorState.toDarkTheme(true);
    schemaState.toDarkTheme(true);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else {
    console.log("Dark mode is not enabled");
    prettyEditorState.toDarkTheme(false);
    schemaState.toDarkTheme(false);
    document.documentElement.setAttribute("data-bs-theme", "light");
  }

  prefersDarkMedia.addEventListener("change", (event) => {
    if (event.matches) {
      console.log("Dark mode is enabled");
      prettyEditorState.toDarkTheme(true);
      schemaState.toDarkTheme(true);
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
      console.log("Dark mode is not enabled");
      prettyEditorState.toDarkTheme(false);
      schemaState.toDarkTheme(false);
      document.documentElement.setAttribute("data-bs-theme", "light");
    }
  });
}

main();

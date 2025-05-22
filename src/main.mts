import * as Editor from "./editor.mts";
import * as MediaListener from "./mediaListener.mts";

window.onload = (_) => {
  MediaListener.init();
  Editor.init();
};

import * as Editor from "./editor.mts";

const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)');

export function init() {
    if (prefersDarkMedia.matches) {
        console.log('Dark mode is enabled');
        Editor.initial.isDarkTimeZero = true;
        document.documentElement.setAttribute("data-bs-theme", "dark");
    }
    else {
        console.log('Dark mode is not enabled');
        Editor.initial.isDarkTimeZero = false;
        document.documentElement.setAttribute("data-bs-theme", "light");
    }
    prefersDarkMedia.addEventListener('change', (event) => {
        if (event.matches) {
            console.log('Dark mode is enabled');
            Editor.toDarkTheme(true);
            document.documentElement.setAttribute("data-bs-theme", "dark");
        } else {
            console.log('Dark mode is not enabled');
            Editor.toDarkTheme(false);
            document.documentElement.setAttribute("data-bs-theme", "light");
        }
    });
}

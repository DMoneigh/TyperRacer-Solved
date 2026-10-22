# TypeRacer Practice Auto-Typer

A small script that automatically types the passage in **TypeRacer Practice races**.

> ⚠️ Practice mode only. Don't use it in multiplayer/public races — it's unfair to other players and against TypeRacer's rules.

## How to use

1. Open [`typeracer-autotyper.user.js`](./typeracer-autotyper.user.js) and **copy the entire file** (Ctrl+A, Ctrl+C).
2. Go to https://play.typeracer.com/ and open a **Practice** race.
3. Open the browser DevTools console:
   - Windows/Linux: `F12` or `Ctrl+Shift+J`
   - macOS: `Cmd+Option+J`
4. **Paste** the code into the console and press `Enter`.
   - If the browser warns about pasting, type `allow pasting` and press Enter, then paste again.
5. A **🤖 Practice Auto-Typer** panel appears in the bottom-right corner.
6. Set the speed with the slider, then press **Start** — it begins typing immediately.
   Press **Stop** at any time.

> Tip: Press Start after the countdown finishes. If you start too early and characters get dropped, press Stop, then Start again — it resumes from what's already typed.

## Optional: install as a userscript

Instead of pasting each time, install [Tampermonkey](https://www.tampermonkey.net/) or Violentmonkey, create a new script, paste the file contents, and save. The panel will load automatically on play.typeracer.com.

## Notes

- TypeRacer may show a typing verification test after very fast races (roughly 100+ WPM); the script can't complete that.
- If TypeRacer changes its page layout, the selectors in `getInput()` / `getPassage()` may need updating.

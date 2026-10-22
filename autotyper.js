// Auto-Typer: reads the highlighted word from the page and types it into the
// input box one keystroke at a time, firing real input/keyboard events so the
// game treats it just like a human typing.
(() => {
  const SEL = { input: "#typeInput", currentWord: "#passage .current" };

  const panel = document.createElement("div");
  panel.id = "autoTyper";
  panel.innerHTML = `
    <h3>🤖 Auto-Typer</h3>
    <label>Speed <span><b id="atWpmVal">90</b> WPM</span></label>
    <input id="atWpm" type="range" min="20" max="250" value="90" />
    <label>Accuracy <span><b id="atAccVal">98</b>%</span></label>
    <input id="atAcc" type="range" min="80" max="100" value="98" />
    <label class="check"><input id="atAuto" type="checkbox" checked /> Auto-start when race begins</label>
    <div class="row"><button id="atStart">Start</button><button id="atStop">Stop</button></div>
    <div id="atLog">Idle</div>`;
  document.body.appendChild(panel);

  const $ = (id) => document.getElementById(id);
  const log = (m) => ($("atLog").textContent = m);
  ["Wpm", "Acc"].forEach((k) => $("at" + k).addEventListener("input", (e) => ($(`at${k}Val`).textContent = e.target.value)));

  let running = false, timeoutId = null;
  const sleep = () => {
    // WPM = (chars/5)/min  ->  ms per char = 60000 / (wpm*5), with ±30% jitter
    const base = 60000 / ($("atWpm").value * 5);
    return base * (0.7 + Math.random() * 0.6);
  };

  function sendKey(input, key, isBackspace = false) {
    const opts = { key, bubbles: true, cancelable: true };
    input.dispatchEvent(new KeyboardEvent("keydown", opts));
    if (!isBackspace) input.dispatchEvent(new KeyboardEvent("keypress", opts));
    // Use the native setter so frameworks (React, etc.) notice the change.
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, isBackspace ? input.value.slice(0, -1) : input.value + key);
    input.dispatchEvent(new InputEvent("input", {
      bubbles: true, data: isBackspace ? null : key,
      inputType: isBackspace ? "deleteContentBackward" : "insertText",
    }));
    input.dispatchEvent(new KeyboardEvent("keyup", opts));
  }

  function step() {
    if (!running) return;
    const input = document.querySelector(SEL.input);
    const cur = document.querySelector(SEL.currentWord);
    if (!input || input.disabled || !cur) { stop("Done ✅"); return; }

    const word = cur.dataset.word ?? cur.textContent;
    const isLast = !cur.nextElementSibling;
    const target = isLast ? word : word + " ";
    const typed = input.value;

    if (!target.startsWith(typed)) {
      sendKey(input, "Backspace", true);          // fix a mistake
    } else if (typed.length < target.length) {
      const next = target[typed.length];
      const makeError = Math.random() * 100 > $("atAcc").value && next !== " ";
      sendKey(input, makeError ? randomWrong(next) : next);
    }
    log(`Typing: "${word}"`);
    timeoutId = setTimeout(step, sleep());
  }

  function randomWrong(c) {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let r; do { r = letters[Math.floor(Math.random() * 26)]; } while (r === c.toLowerCase());
    return r;
  }

  function start() {
    if (running) return;
    const input = document.querySelector(SEL.input);
    if (!input || input.disabled) return log("Waiting for race to start…");
    running = true; input.focus(); log("Running…"); step();
  }
  function stop(msg = "Stopped") { running = false; clearTimeout(timeoutId); log(msg); }

  $("atStart").addEventListener("click", start);
  $("atStop").addEventListener("click", () => stop());
  document.addEventListener("race:start", () => $("atAuto").checked && start());
  document.addEventListener("race:end", () => stop("Done ✅"));

  window.autoTyper = { start, stop };
})();

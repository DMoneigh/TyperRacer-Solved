// ==UserScript==
// @name         TypeRacer Practice Auto-Typer (Dez's Minion)
// @namespace    dezs-minion
// @version      1.0
// @description  Auto-types the passage in TypeRacer PRACTICE races only.
// @match        https://play.typeracer.com/*
// @grant        none
// ==/UserScript==
//
// Usage: install in Tampermonkey/Violentmonkey, OR paste the whole file into the
// DevTools console on play.typeracer.com. Open a Practice race and press Start
// in the panel (bottom-right) – it begins typing immediately.
(() => {
  if (window.__drAutoTyper) return;
  window.__drAutoTyper = true;

  const cfg = { wpm: 90 };

  // ---------- UI ----------
  const panel = document.createElement("div");
  panel.style.cssText =
    "position:fixed;right:16px;bottom:16px;z-index:2147483647;width:240px;background:#1d3557;color:#fff;" +
    "font:13px Segoe UI,Arial,sans-serif;border-radius:10px;padding:12px;box-shadow:0 6px 20px rgba(0,0,0,.3)";
  panel.innerHTML = `
    <b>🤖 Practice Auto-Typer</b>
    <div style="margin:8px 0 2px;display:flex;justify-content:space-between">Speed <span><b id="drWpmV">${cfg.wpm}</b> WPM</span></div>
    <input id="drWpm" type="range" min="20" max="200" value="${cfg.wpm}" style="width:100%">
    <div style="display:flex;gap:6px;margin-top:8px">
      <button id="drStart" style="flex:1;padding:6px;border:0;border-radius:5px;background:#e63946;color:#fff;cursor:pointer">Start</button>
      <button id="drStop"  style="flex:1;padding:6px;border:0;border-radius:5px;background:#6c757d;color:#fff;cursor:pointer">Stop</button>
    </div>
    <div id="drLog" style="margin-top:8px;font-size:12px;opacity:.85">Press Start to begin typing.</div>`;
  document.body.appendChild(panel);
  const $ = (id) => document.getElementById(id);
  const log = (m) => ($("drLog").textContent = m);
  $("drWpm").oninput = (e) => ($("drWpmV").textContent = cfg.wpm = +e.target.value);

  // ---------- Page helpers ----------
  const getInput = () =>
    document.querySelector("input.font-mono.text-race-text.bg-race-text-bg") ||
    document.querySelector("input.txtInput");

  function getPassage() {
    const spans = document.querySelectorAll('.inputPanel span[unselectable="on"], span[unselectable="on"]');
    let text = "";
    const seen = new Set();
    spans.forEach((s) => { if (!seen.has(s)) { seen.add(s); text += s.textContent; } });
    return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  }

  // Only allow practice races (solo vs. no one) – never public/multiplayer.
  function isPractice() {
    const area = document.querySelector(".mainViewport") || document.body;
    return /practice/i.test(area.innerText);
  }

  function typeChar(input, ch) {
    input.focus();
    const key = ch === " " ? " " : ch;
    const code = ch.charCodeAt(0);
    const kOpts = { key, charCode: code, keyCode: code, which: code, bubbles: true, cancelable: true };
    input.dispatchEvent(new KeyboardEvent("keydown", kOpts));
    input.dispatchEvent(new KeyboardEvent("keypress", kOpts));
    // execCommand produces a native (trusted) input event; fall back to setting value.
    if (!document.execCommand("insertText", false, ch)) {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
      setter.call(input, input.value + ch);
      input.dispatchEvent(new InputEvent("input", { bubbles: true, data: ch, inputType: "insertText" }));
    }
    input.dispatchEvent(new KeyboardEvent("keyup", kOpts));
  }

  // ---------- Typing loop ----------
  let running = false, timer = null, text = "", idx = 0;
  const delay = () => (60000 / (cfg.wpm * 5)) * (0.7 + Math.random() * 0.6);

  function step() {
    if (!running) return;
    const input = getInput();
    if (!input || idx >= text.length) return stop("Done ✅");
    typeChar(input, text[idx++]);
    log(`Typing… ${Math.round((idx / text.length) * 100)}%`);
    timer = setTimeout(step, delay());
  }

  function start() {
    if (running) return;
    if (!isPractice()) return log("⛔ Practice races only.");
    const input = getInput();
    if (!input) return log("Couldn't find the typing box.");
    text = getPassage();
    if (!text) return log("Couldn't find passage text.");
    idx = input.value.length; // resume if something is already typed
    running = true;
    log("Running…");
    step();
  }
  function stop(msg = "Stopped") { running = false; clearTimeout(timer); log(msg); }

  $("drStart").onclick = start;
  $("drStop").onclick = () => stop();
})();

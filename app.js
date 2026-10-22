// TypeRacer-style game: type the passage word by word; a word is accepted when
// it is typed correctly followed by a space (or the final word is complete).
(() => {
  const PASSAGES = [
    "The quick brown fox jumps over the lazy dog while the sun sets slowly behind the distant hills.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Programs must be written for people to read, and only incidentally for machines to execute.",
    "In the middle of every difficulty lies opportunity, waiting patiently for someone brave enough to find it.",
    "A journey of a thousand miles begins with a single step, taken with purpose and steady resolve.",
  ];
  const BOTS = [{ name: "Speedy", wpm: 55 }, { name: "Turbo", wpm: 75 }, { name: "Lightning", wpm: 95 }];

  const $ = (id) => document.getElementById(id);
  const passageEl = $("passage"), input = $("typeInput"), statusEl = $("status"), track = $("track");

  let words = [], wordIdx = 0, startTime = 0, timer = null, keystrokes = 0, errors = 0, racing = false, bots = [];
  const totalChars = () => words.join(" ").length;

  function buildTrack() {
    track.innerHTML = "";
    const lanes = [{ name: "You", you: true }, ...bots];
    lanes.forEach((l) => {
      const lane = document.createElement("div");
      lane.className = "lane" + (l.you ? " you" : "");
      lane.innerHTML = `<span class="car">🏎️</span><span class="name">${l.name}${l.wpm ? ` (${l.wpm} wpm)` : ""}</span>`;
      track.appendChild(lane);
      l.carEl = lane.querySelector(".car");
    });
    youCar = lanes[0].carEl;
  }
  let youCar;
  const moveCar = (el, frac) => (el.style.left = `calc(${Math.min(frac, 1) * 85}% )`);

  function render() {
    const typed = input.value;
    passageEl.innerHTML = words.map((w, i) => {
      if (i < wordIdx) return `<span class="done">${w}</span>`;
      if (i > wordIdx) return `<span>${w}</span>`;
      let ok = 0;
      while (ok < typed.length && typed[ok] === w[ok]) ok++;
      const bad = Math.min(typed.length - ok, w.length - ok);
      return `<span class="current" data-word="${w}"><span class="ok">${w.slice(0, ok)}</span><span class="bad">${w.slice(ok, ok + bad)}</span>${w.slice(ok + bad)}</span>`;
    }).join(" ");
  }

  function doneChars() {
    return words.slice(0, wordIdx).join(" ").length + (wordIdx ? 1 : 0);
  }

  function updateStats() {
    const secs = (performance.now() - startTime) / 1000;
    const wpm = secs > 0 ? Math.round((doneChars() / 5) / (secs / 60)) : 0;
    $("wpm").textContent = wpm;
    $("time").textContent = secs.toFixed(1) + "s";
    $("acc").textContent = keystrokes ? Math.round(((keystrokes - errors) / keystrokes) * 100) + "%" : "100%";
    moveCar(youCar, doneChars() / totalChars());
    bots.forEach((b) => moveCar(b.carEl, ((b.wpm * 5) / 60) * secs / totalChars()));
  }

  function newRace() {
    clearInterval(timer);
    words = PASSAGES[Math.floor(Math.random() * PASSAGES.length)].split(" ");
    wordIdx = 0; keystrokes = 0; errors = 0; racing = false;
    bots = BOTS.map((b) => ({ ...b }));
    buildTrack();
    input.value = ""; input.disabled = true; input.classList.remove("error");
    render();
    let n = 3;
    statusEl.textContent = `Race starts in ${n}...`;
    const cd = setInterval(() => {
      n--;
      if (n > 0) return (statusEl.textContent = `Race starts in ${n}...`);
      clearInterval(cd);
      statusEl.textContent = "GO! Type the text!";
      racing = true; input.disabled = false; input.focus();
      startTime = performance.now();
      timer = setInterval(updateStats, 100);
      document.dispatchEvent(new CustomEvent("race:start"));
    }, 1000);
  }

  function finish() {
    racing = false; input.disabled = true;
    updateStats(); clearInterval(timer);
    statusEl.textContent = `🏁 Finished! ${$("wpm").textContent} WPM, ${$("acc").textContent} accuracy.`;
    document.dispatchEvent(new CustomEvent("race:end"));
  }

  input.addEventListener("input", (e) => {
    if (!racing) return;
    const w = words[wordIdx], v = input.value, last = wordIdx === words.length - 1;
    if (e.inputType !== "deleteContentBackward") {
      keystrokes++;
      const expected = (w + " ")[v.length - 1];
      if (v[v.length - 1] !== expected) errors++;
    }
    if ((!last && v === w + " ") || (last && v === w)) {
      wordIdx++; input.value = "";
      if (wordIdx === words.length) { render(); return finish(); }
    }
    input.classList.toggle("error", !(w + " ").startsWith(input.value) && input.value !== "");
    render();
  });

  $("newRace").addEventListener("click", newRace);
  render();
})();

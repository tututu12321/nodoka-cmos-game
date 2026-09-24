window.Nodoka = window.Nodoka || {};
Nodoka.Dialogue = function(state, elements, character, hooks) {
  const {speech} = elements;
  const cfg = Nodoka.CONFIG;

  function n(v, fallback = 0) {
    const x = Number(v);
    return Number.isFinite(x) ? x : fallback;
  }

  function rows(category) { return state.dialogues.filter(d => d.category === category); }
  function pick(list) { return list.length ? list[Math.floor(Math.random() * list.length)] : null; }

  function speak(text) {
    if (state.typingTimer) clearInterval(state.typingTimer);
    state.fullText = text;
    speech.textContent = '';
    let i = 0;
    state.typingTimer = setInterval(() => {
      speech.textContent = text.slice(0, i++);
      if (i > text.length) {
        clearInterval(state.typingTimer);
        state.typingTimer = null;
      }
    }, cfg.typingMs);
  }

  function finish() {
    if (!state.typingTimer) return;
    clearInterval(state.typingTimer);
    state.typingTimer = null;
    speech.textContent = state.fullText;
  }

  function use(category, fallbackText, fallbackCategories) {
    const d = pick(rows(category));
    if (d) {
      state.favor += n(d.favor_delta, 0);
      state.anger += n(d.anger_delta, 0);
      character.applyPose(d.pose || character.choose(fallbackCategories));
      hooks.updateMeters();
      speak(d.text || fallbackText);
      return d;
    }
    character.applyPose(character.choose(fallbackCategories));
    speak(fallbackText);
    hooks.updateMeters();
    return null;
  }

  return {rows, pick, speak, finish, use, n};
};

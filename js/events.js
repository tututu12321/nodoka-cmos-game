window.Nodoka = window.Nodoka || {};
Nodoka.Events = function(state, dialogue, character, hooks) {
  function today() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {year: y, date: `${y}-${m}-${day}`, monthDay: `${m}-${day}`};
  }

  function runToday() {
    const t = today();
    const matches = state.events
      .filter(e => (e.date && e.date === t.date) || (e.month_day && e.month_day === t.monthDay))
      .sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0));
    const ev = matches[0];
    if (!ev) return;

    const key = `nodoka_event_${ev.id}_${t.year}`;
    if (ev.once_per_year === '1' && localStorage.getItem(key)) return;

    state.favor += Number(ev.favor_delta || 0);
    state.anger += Number(ev.anger_delta || 0);
    character.applyPose(ev.pose);
    hooks.updateMeters();
    dialogue.speak(ev.text);
    if (ev.once_per_year === '1') localStorage.setItem(key, '1');
  }

  return {runToday};
};

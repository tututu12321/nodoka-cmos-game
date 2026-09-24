(async function() {
  const E = {
    start: document.getElementById('start'),
    startBtn: document.getElementById('startBtn'),
    csvBtn: document.getElementById('csvBtn'),
    importer: document.getElementById('importer'),
    girl: document.getElementById('girl'),
    wrap: document.getElementById('wrap'),
    shadow: document.getElementById('shadow'),
    speech: document.getElementById('speech'),
    favorNum: document.getElementById('favorNum'),
    angerNum: document.getElementById('angerNum'),
    favorFill: document.getElementById('favorFill'),
    angerFill: document.getElementById('angerFill'),
    techBtn: document.getElementById('techBtn'),
    dailyBtn: document.getElementById('dailyBtn'),
    pinchBtn: document.getElementById('pinchBtn'),
    leftBtn: document.getElementById('leftBtn'),
    rightBtn: document.getElementById('rightBtn'),
    gameover: document.getElementById('gameover'),
    gameoverReason: document.getElementById('gameoverReason'),
    apologyText: document.getElementById('apologyText'),
    apologyBtn: document.getElementById('apologyBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  const state = Nodoka.createState();
  const data = await Nodoka.loadData();
  state.dialogues = data.dialogues;
  state.poses = data.poses;
  state.events = data.events;

  let dialogue, events;

  function updateMeters() {
    state.favor = Math.max(0, Math.min(100, state.favor));
    state.anger = Math.max(0, Math.min(100, state.anger));
    E.favorNum.textContent = Math.round(state.favor);
    E.angerNum.textContent = Math.round(state.anger);
    E.favorFill.style.width = state.favor + '%';
    E.angerFill.style.width = state.anger + '%';
    if (state.started && !state.gameOver && (state.anger >= Nodoka.CONFIG.gameOverAnger || state.favor <= Nodoka.CONFIG.gameOverFavor)) {
      triggerGameOver();
    }
  }

  const character = Nodoka.Character(state, E);
  character.buildPoseIndex();
  dialogue = Nodoka.Dialogue(state, E, character, {updateMeters});
  events = Nodoka.Events(state, dialogue, character, {updateMeters});

  function save() {
    localStorage.setItem(Nodoka.CONFIG.storageKey, JSON.stringify({favor: state.favor, anger: state.anger, x: state.x}));
  }

  function loadSave() {
    try {
      const s = JSON.parse(localStorage.getItem(Nodoka.CONFIG.storageKey) || 'null');
      if (!s) return;
      state.favor = Number(s.favor ?? state.favor);
      state.anger = Number(s.anger ?? state.anger);
      state.x = Number(s.x ?? state.x);
    } catch {}
  }

  function startGame() {
    if (state.started) return;
    state.started = true;
    E.start.style.display = 'none';
    character.applyPose(character.choose(['wave','idle']));
    character.applyWorldTransform();
    updateMeters();
    dialogue.speak('こんにちは、蟹谷のどかです。今日はどの回路から見ていく？');
    setTimeout(events.runToday, 350);
  }

  function techTalk() {
    if (state.gameOver) return;
    if (state.lifted) releasePinch();
    dialogue.use('tech', 'まずは動作点から整理しよう。', ['teach','think','wave']);
  }

  function dailyTalk() {
    if (state.gameOver) return;
    if (state.lifted) releasePinch();
    dialogue.use('daily', '少し回路雑談をしよう。', ['idle','wave']);
  }

  function touchReaction() {
    if (!state.started || state.lifted || state.gameOver) return;
    state.touchCount++;
    dialogue.use(state.anger >= 60 ? 'angry' : 'touch', '少しやさしくお願い。', state.anger >= 60 ? ['angry'] : ['surprise','pout']);
  }

  function pinchAction() {
    if (!state.started || state.gameOver || state.lifted) return;
    state.lifted = true;
    dialogue.use('pinch', 'わ、つまんだ！？', ['lift']);
    const startedAt = performance.now();
    function animate(now) {
      if (!state.lifted) return;
      const t = (now - startedAt) / 220;
      character.applyWorldTransform(-88 + Math.sin(t * 8) * 4);
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
    clearTimeout(pinchAction.timer);
    pinchAction.timer = setTimeout(releasePinch, Nodoka.CONFIG.pinchDurationMs);
  }

  function releasePinch() {
    if (!state.lifted) return;
    state.lifted = false;
    character.applyWorldTransform();
    dialogue.use('release', '着地確認。', ['idle','wave']);
  }

  function triggerGameOver() {
    state.gameOver = true;
    state.lifted = false;
    clearTimeout(pinchAction.timer);
    character.applyWorldTransform();
    character.applyPose(character.choose(['angry']));
    E.gameoverReason.textContent = state.anger >= 100 ? '怒りが100に達しました。' : '好感度が0になりました。';
    E.apologyText.textContent = 'のどかは会話を中断しています。';
    E.gameover.style.display = 'flex';
  }

  function apologize() {
    const d = dialogue.pick(dialogue.rows('apology'));
    state.anger += dialogue.n(d?.anger_delta, -35);
    state.favor += dialogue.n(d?.favor_delta, 12);
    E.apologyText.textContent = d?.text || '少し落ち着いたよ。';
    updateMeters();
    if (state.anger <= Nodoka.CONFIG.recoverAngerMax && state.favor >= Nodoka.CONFIG.recoverFavorMin) {
      state.gameOver = false;
      E.gameover.style.display = 'none';
      dialogue.use('recover', '復帰しよう。', ['wave','idle']);
    }
  }

  function resetGame() {
    state.gameOver = false;
    state.favor = Nodoka.CONFIG.initialFavor;
    state.anger = Nodoka.CONFIG.initialAnger;
    state.touchCount = 0;
    state.x = 0;
    localStorage.removeItem(Nodoka.CONFIG.storageKey);
    E.gameover.style.display = 'none';
    character.applyWorldTransform();
    character.applyPose(character.choose(['wave','idle']));
    updateMeters();
    dialogue.speak('最初の状態に戻しました。');
  }

  async function importFiles(files) {
    for (const file of files) {
      const text = await file.text();
      const rows = Nodoka.parseCSV(text);
      const lower = file.name.toLowerCase();
      if (lower.includes('dialog')) state.dialogues = rows;
      else if (lower.includes('pose')) { state.poses = rows; character.buildPoseIndex(); }
      else if (lower.includes('event')) state.events = rows;
    }
  }

  E.startBtn.addEventListener('click', startGame);
  E.csvBtn.addEventListener('click', () => E.importer.click());
  E.importer.addEventListener('change', e => importFiles([...e.target.files]));
  E.techBtn.addEventListener('click', techTalk);
  E.dailyBtn.addEventListener('click', dailyTalk);
  E.pinchBtn.addEventListener('click', pinchAction);
  E.leftBtn.addEventListener('click', () => character.move(-1));
  E.rightBtn.addEventListener('click', () => character.move(1));
  E.apologyBtn.addEventListener('click', apologize);
  E.resetBtn.addEventListener('click', resetGame);
  E.speech.addEventListener('click', dialogue.finish);

  E.girl.addEventListener('pointerdown', () => {
    if (!state.started) { startGame(); return; }
    state.holdTriggered = false;
    clearTimeout(state.holdTimer);
    state.holdTimer = setTimeout(() => { state.holdTriggered = true; pinchAction(); }, Nodoka.CONFIG.longPressMs);
  });
  E.girl.addEventListener('pointerup', () => {
    clearTimeout(state.holdTimer);
    if (!state.holdTriggered) touchReaction();
  });
  E.girl.addEventListener('pointercancel', () => clearTimeout(state.holdTimer));

  window.addEventListener('keydown', e => {
    if (!state.started && (e.key === 'Enter' || e.code === 'Space')) { e.preventDefault(); startGame(); return; }
    if (!state.started || state.gameOver) return;
    if (['ArrowLeft','a','A'].includes(e.key)) character.move(-1);
    if (['ArrowRight','d','D'].includes(e.key)) character.move(1);
    if (e.key === '1') techTalk();
    if (e.key === '2') dailyTalk();
    if (e.key === '3') pinchAction();
  });
  window.addEventListener('beforeunload', save);

  loadSave();
  updateMeters();
  character.applyWorldTransform();
  character.applyPose(character.choose(['idle']));

  setInterval(() => {
    if (state.started && !state.lifted && !state.gameOver && state.anger > 0) {
      state.anger = Math.max(0, state.anger - Nodoka.CONFIG.angerDecayAmount);
      updateMeters();
    }
  }, Nodoka.CONFIG.angerDecayMs);
})();

window.Nodoka = window.Nodoka || {};
Nodoka.Character = function(state, elements) {
  const {girl, wrap, shadow} = elements;
  const cfg = Nodoka.CONFIG;

  function buildPoseIndex() {
    state.poseMap = new Map(state.poses.map(p => [p.id, p]));
    state.poseGroups = new Map();
    state.poses.forEach(p => {
      if (!state.poseGroups.has(p.category)) state.poseGroups.set(p.category, []);
      state.poseGroups.get(p.category).push(p);
    });
  }

  function group(name) { return state.poseGroups.get(name) || []; }

  function choose(categories) {
    const source = categories.flatMap(group);
    if (!source.length) return state.poses[0] || null;
    const fresh = source.filter(p => !state.poseMemory.includes(p.id));
    const pool = fresh.length ? fresh : source;
    const pose = pool[Math.floor(Math.random() * pool.length)];
    state.poseMemory.push(pose.id);
    if (state.poseMemory.length > cfg.recentPoseMemory) state.poseMemory.shift();
    return pose;
  }

  function applyPose(poseOrId) {
    const pose = typeof poseOrId === 'string' ? state.poseMap.get(poseOrId) : poseOrId;
    if (!pose) return;
    girl.src = pose.image;
    const scale = Number(pose.scale || 1);
    const rotate = Number(pose.rotate_deg || 0);
    const ox = Number(pose.offset_x_px || 0);
    const oy = Number(pose.offset_y_px || 0);
    const flip = String(pose.flip_x) === '1' ? -1 : 1;
    girl.style.setProperty('--pose-scale', scale);
    girl.style.setProperty('--pose-rotate', rotate + 'deg');
    girl.style.setProperty('--pose-x', ox + 'px');
    girl.style.setProperty('--pose-y', oy + 'px');
    girl.style.setProperty('--pose-flip', flip);
  }

  function applyWorldTransform(y = 0) {
    wrap.style.transform = `translateX(-50%) translateX(${state.x}px) translateY(${y}px)`;
    shadow.style.transform = `translateX(calc(-50% + ${state.x}px)) scale(${state.lifted ? 0.72 : 1})`;
    shadow.style.opacity = state.lifted ? '.16' : '.35';
  }

  function move(dir) {
    if (!state.started || state.gameOver || state.lifted) return;
    state.x = Math.max(-cfg.moveLimitPx, Math.min(cfg.moveLimitPx, state.x + dir * cfg.moveStepPx));
    const cat = dir < 0 ? 'walkL' : 'walkR';
    const list = group(cat);
    if (list.length) {
      if (dir < 0) {
        state.walkIndexL = (state.walkIndexL + 1) % list.length;
        applyPose(list[state.walkIndexL]);
      } else {
        state.walkIndexR = (state.walkIndexR + 1) % list.length;
        applyPose(list[state.walkIndexR]);
      }
    }
    applyWorldTransform();
    clearTimeout(move.timer);
    move.timer = setTimeout(() => applyPose(choose(['idle','wave'])), 240);
  }

  return {buildPoseIndex, group, choose, applyPose, applyWorldTransform, move};
};

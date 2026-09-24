window.Nodoka = window.Nodoka || {};
Nodoka.createState = function() {
  const c = Nodoka.CONFIG;
  return {
    started: false,
    gameOver: false,
    favor: c.initialFavor,
    anger: c.initialAnger,
    x: 0,
    lifted: false,
    typingTimer: null,
    fullText: '',
    holdTimer: null,
    holdTriggered: false,
    touchCount: 0,
    poseMemory: [],
    walkIndexL: 0,
    walkIndexR: 0,
    dialogues: [],
    poses: [],
    events: [],
    poseMap: new Map(),
    poseGroups: new Map()
  };
};

const createClock = () => {
  let isRunning: boolean = false;
  let nowT: number;
  let timeId: number | null = null;
  let onTick: (t: number) => void = undefined;

  const start = () => {
    isRunning = true;
    nowT = new Date().getTime();
    const intervalRequest = func => {
      timeId = setInterval(func, 16);
    };
    const loopFunc = window.requestAnimationFrame || intervalRequest;
    const f = () => {
      if (isRunning) {
        tick();
        loopFunc(f);
      }
    };
    loopFunc(f);
  };

  const stop = () => {
    isRunning = false;
    if (timeId) {
      clearInterval(timeId);
      timeId = null;
    }
  };

  const tick = () => {
    const t = nowT;
    nowT = new Date().getTime();
    onTick && onTick((nowT - t) / 1000);
  };

  const setOnTick = _onTick => {
    onTick = _onTick;
  };
  return {
    start,
    stop,
    setOnTick,
  };
};

export default createClock;

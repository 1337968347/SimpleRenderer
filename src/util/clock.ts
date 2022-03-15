const createClock = (webXRSession?) => {
  let isRunning: boolean = false;
  let nowT: number;
  let timeId: any = null;
  let onTick: (t: number, frame: any) => void = undefined;

  const start = async (webXRSession?) => {
    if (isRunning) return;
    isRunning = true;
    nowT = new Date().getTime();
    let loopFunc: Function;

    const f = (time, frame) => {
      if (isRunning) {
        tick(time, frame);
        loopFunc(f);
      }
    };

    // 定时器
    const intervalRequest = func => {
      timeId = setTimeout(func, 16);
    };
    loopFunc = webXRSession ? webXRSession.requestAnimationFrame.bind(webXRSession) : window.requestAnimationFrame || intervalRequest;

    loopFunc(f);
  };

  const stop = () => {
    isRunning = false;
    if (timeId) {
      clearInterval(timeId);
      timeId = null;
    }
    if (webXRSession) {
      webXRSession.end();
      webXRSession = undefined;
    }
  };

  const tick = (_time, frame) => {
    const t = nowT;
    nowT = new Date().getTime();

    onTick && onTick((nowT - t) / 1000, frame);
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

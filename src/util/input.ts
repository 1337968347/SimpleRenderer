const KEYNAME = {
  32: 'SPACE',
  13: 'ENTER',
  9: 'TAB',
  8: 'BACKSPACE',
  16: 'SHIFT',
  17: 'CTRL',
  18: 'ALT',
  20: 'CAPS_LOCK',
  144: 'NUM_LOCK',
  145: 'SCROLL_LOCK',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  33: 'PAGE_UP',
  34: 'PAGE_DOWN',
  36: 'HOME',
  35: 'END',
  45: 'INSERT',
  46: 'DELETE',
  27: 'ESCAPE',
  19: 'PAUSE',
};

const clamp = (a: number, b: number, c: number) => {
  return a < b ? b : a > c ? c : a;
};

const createInputHandler = () => {
  let keys = {};
  let offset: { x: number; y: number } = { x: 0, y: 0 };
  let mouse: { down: boolean; x: number; y: number } = { down: false, x: 0, y: 0 };
  let onClick = undefined;
  let onKeyUp = undefined;
  let onKeyDown = undefined;
  let width: number = 0;
  let height: number = 0;
  let hasFocus: boolean = true;
  let element: HTMLElement = undefined;

  const bind = (_element: HTMLElement) => {
    if (!_element) return;
    element = _element;
    const elementRect = _element.getBoundingClientRect();
    offset = { x: elementRect.left, y: elementRect.top };
    width = elementRect.width;
    height = elementRect.height;
    // 绑定监听事件
    document.onkeydown = e => keyDown(e.keyCode);
    document.onkeyup = e => keyUp(e.keyCode);
    window.onclick = e => {
      if (e.target === element) {
        focus();
      } else {
        blur();
      }
    };

    window.onblur = () => blur();

    document.onmousemove = e => {
      mouseMove(e.pageX, e.pageY);
    };
    element.onmousedown = () => {
      mouseDown();
    };
    document.onmouseup = () => {
      mouseUp();
    };
    // 禁用 选择
    document.onselectstart = () => false;
  };

  const focus = () => {
    if (!hasFocus) {
      hasFocus = true;
      reset();
    }
  };

  const blur = () => {
    hasFocus = false;
    reset();
  };

  const mouseMove = (pageX: number, pageY: number) => {
    if (!mouse.down) return;
    mouse.x = clamp(pageX - offset.x, 0, width);
    mouse.y = clamp(pageY - offset.y, 0, height);
  };

  const mouseDown = () => {
    mouse.down = true;
  };

  const mouseUp = () => {
    mouse.down = false;
    if (hasFocus && onClick) {
      onClick(mouse.x, mouse.y);
    }
  };

  const keyDown = (key: number) => {
    const keyName = getKeyName(key);
    console.log(keyName);
    const wasKeyDown = keys[keyName];
    keys[keyName] = true;
    if (onKeyDown && !wasKeyDown) {
      onKeyDown(keyName);
    }
    return hasFocus;
  };

  const keyUp = (key: number) => {
    var name = getKeyName(key);
    keys[name] = false;
    if (onKeyUp) {
      onKeyUp(name);
    }
    return hasFocus;
  };

  const reset = () => {
    keys = {};
    for (let i = 65; i < 128; i++) {
      keys[String.fromCharCode(i)] = false;
    }

    for (let i in KEYNAME) {
      keys[KEYNAME[i]] = false;
    }
    mouse = { down: false, x: 0, y: 0 };
  };

  const getKeyName = (key: number) => {
    return KEYNAME[key] || String.fromCharCode(key);
  };

  return { bind, element };
};

export default createInputHandler;

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

export default class InputHandler {
  keys = {};
  offset: { x: number; y: number } = { x: 0, y: 0 };
  mouse: { down: boolean; x: number; y: number } = { down: false, x: 0, y: 0 };
  onClick = undefined;
  onKeyUp = undefined;
  onKeyDown = undefined;
  width: number = 0;
  height: number = 0;
  hasFocus: boolean = true;
  element: HTMLElement = undefined;
  constructor(element: HTMLElement) {}

  bind(element: HTMLElement) {
    if (!element) return;
    this.element = element;
    const elementRect = element.getBoundingClientRect();
    this.offset = { x: elementRect.left, y: elementRect.top };
    this.width = elementRect.width;
    this.height = elementRect.height;
    // 绑定监听事件
    document.onkeydown = e => this.keyDown(e.keyCode);
    document.onkeyup = e => this.keyUp(e.keyCode);
    window.onclick = e => {
      if (e.target === element) {
        focus();
      } else {
        blur();
      }
    };
  }

  focus = () => {
    if (!this.hasFocus) {
      this.hasFocus = true;
      this.reset();
    }
  };
  blur = () => {
    this.hasFocus = false;
    this.reset();
  };

  mouseMove = (pageX: number, pageY: number) => {
    if (!this.mouse.down) return;
    this.mouse.x = clamp(pageX - this.offset.x, 0, this.width);
    this.mouse.y = clamp(pageY - this.offset.y, 0, this.height);
  };

  mouseDown = () => {
    this.mouse.down = true;
  };

  mouseUp = () => {
    this.mouse.down = false;
    if (this.hasFocus && this.onClick) {
      this.onClick(this.mouse.x, this.mouse.y);
    }
  };

  keyDown = (key: number) => {
    const keyName = this.getKeyName(key);
    console.log(keyName);
    const wasKeyDown = this.keys[keyName];
    this.keys[keyName] = true;
    if (this.onKeyDown && !wasKeyDown) {
      this.onKeyDown(keyName);
    }
    return this.hasFocus;
  };

  keyUp = (key: number) => {
    var name = this.getKeyName(key);
    this.keys[name] = false;
    if (this.onKeyUp) {
      this.onKeyUp(name);
    }
    return this.hasFocus;
  };

  reset = () => {
    this.keys = {};
    for (let i = 65; i < 128; i++) {
      this.keys[String.fromCharCode(i)] = false;
    }

    for (let i in KEYNAME) {
      this.keys[KEYNAME[i]] = false;
    }
    this.mouse = { down: false, x: 0, y: 0 };
  };

  getKeyName = (key: number) => {
    return KEYNAME[key] || String.fromCharCode(key);
  };
}

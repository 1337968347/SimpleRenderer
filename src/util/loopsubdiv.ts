class SDVertex {
  point: Float32Array;
  startFace: SDFace | null = null;
  // 是否规则点 内部顶点的价数为6，边界顶点的价数为4
  regular: boolean = false;
  // 是否边界点
  boundary: boolean = false;
  constructor(point: Float32Array) {
    this.point = point;
  }
}

class SDFace {
  v: Array<SDVertex> = [];
  f: Array<SDFace> = [];
  children: Array<SDFace> = [];
  constructor() {
    for (let i = 0; i < 3; i++) {
      this.v[i] = null;
      this.f[i] = null;
    }
    for (let i = 0; i < 4; i++) {
      this.children[i] = null;
    }
  }
}


import { SceneGraph } from './scene';
let globalGL = undefined;

export const getGL = (canvas?: HTMLCanvasElement) => {
  if (!globalGL) {
    if (!canvas) canvas = document.querySelector('canvas');
    if (!canvas) return null;
    globalGL = canvas.getContext('webgl');
  }
  return globalGL;
};

export class Texture2D {
  gl: WebGLRenderingContext;
  texture: WebGLTexture;
  image: HTMLImageElement;
  unit: number = -1;

  constructor(image: HTMLImageElement) {
    this.image = image;
    this.gl = getGL();
    this.texture = this.gl.createTexture();

    const gl = this.gl;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  bind(unit: number) {
    if (unit !== undefined) {
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.unit = unit;
    }
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  uniform(location: number) {
    this.gl.uniform1i(location, this.unit);
  }
}

export class VertexBufferObject {
  gl: WebGLRenderingContext;
  buffer: WebGLBuffer;
  data: Float32Array;
  constructor(vertexData: Float32Array) {
    this.data = vertexData;
    this.gl = getGL();
    this.buffer = this.gl.createBuffer();
    this.bind();
    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.data, this.gl.STATIC_DRAW);
  }

  bind() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  }

  drawTriangles() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, this.data.length/3);
  }
}

export const setCanvasFullScreen = (canvas: HTMLCanvasElement, scene: SceneGraph) => {
  const onResize = () => {
    canvas.width = scene.viewportWidth = window.innerWidth;
    canvas.height = scene.viewportHeight = window.innerHeight;
    scene.draw();
  };
  window.addEventListener('resize', onResize, false);
  onResize();
};

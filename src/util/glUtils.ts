let globalGL = undefined;
const getContext = (canvas: HTMLCanvasElement) => {
  if (!globalGL) {
    globalGL = canvas.getContext('webgl');
  }
  return globalGL;
};

const createTexture2DManger = (gl: WebGLRenderingContext, image: HTMLImageElement) => {
  const texture: WebGLTexture = gl.createTexture();
  let unit: number = -1;

  const bind = (_unit?: number) => {
    if (_unit !== undefined) {
      gl.activeTexture(gl.TEXTURE0 + _unit);
      unit = _unit;
    }
    gl.bindTexture(gl.TEXTURE_2D, texture);
  };

  const uniform = (location: number) => {
    gl.uniform1i(location, unit);
  };

  bind();

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  return { uniform, bind };
};

const createVertexBufferObject = (gl: WebGLRenderingContext, data: BufferSource) => {
  const bind = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  };

  const draw = () => {
    gl.drawArrays(gl.TRIANGLES, 0, length / 3);
  };

  let buffer = gl.createBuffer();
  const length = data.byteLength;
  bind();
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  return {
    bind,
    draw,
  };
};

const setCanvasFullScreen = (canvas: HTMLCanvasElement, scene) => {
  const onResize = () => {
    canvas.width = scene.viewportWidth = window.innerWidth;
    canvas.height = scene.viewportHeight = window.innerHeight;
    scene.draw();
  };
  window.addEventListener('resize', onResize, false);
  onResize();
};

const createGlUtils = () => {
  return { createTexture2DManger, createVertexBufferObject, getContext, setCanvasFullScreen };
};

export default createGlUtils;

/**
 * 创建一个Shader
 * @param gl
 * @param shaderType
 * @param source
 * @returns
 */
const makeShader = (gl: WebGLRenderingContext, shaderType: number, source: string) => {
  const shader = gl.createShader(shaderType);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader), shaderType, source);
    throw 'Compiler exception: "' + gl.getShaderInfoLog(shader) + '"';
  }
  return shader;
};

/**
 * 创建一个WebGLProgram
 * @param gl
 * @param vertexSource
 * @param fragmentSource
 * @returns
 */
const makeProgram = (gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) => {
  const vertexShader = makeShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = makeShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw 'Linker exception: ' + gl.getProgramInfoLog(program);
  }
  return program;
};

/**
 * 创建一个shader
 * @param gl
 * @param vertexSource
 * @param fragmentSource
 * @returns
 */
const createShader = (gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) => {
  const program = makeProgram(gl, vertexSource, fragmentSource);
  // const uniformInfo = {};

  const use = () => {
    gl.useProgram(program);
  };

  const uniforms = values => {
    for (let name in values) {
      const value = values[name];
      const location = gl.getUniformLocation(program, name);
      if (typeof value === 'number') {
        gl.uniform1f(location, value);
        return;
      } else {
        value.uniform(location);
      }
    }
  };

  const getAttributeLocation = name => {
    const location = gl.getAttribLocation(program, name);
    if (location < 0) throw 'attribute not found';
    return location;
  };

  return { use, uniforms, getAttributeLocation };
};

const createShaderManager = (gl: WebGLRenderingContext, resources: any) => {
  const shaders = [];

  const get = (vertex: string, frag?: string) => {
    if (!frag) {
      frag = vertex + '.frag';
      vertex = vertex + '.vertex';
    }
    const key = `${vertex}-${frag}`;

    if (!(key in resources)) {
      shaders[key] = createShader(gl, getSource(vertex), getSource(frag));
    }
    return shaders[key];
  };

  const getSource = (shaderPath: string) => {
    const name = _getSourceName(shaderPath);
    return resources[name] || '';
  };

  const _getSourceName = name => {
    const nameArr = name.split('/');
    return nameArr[nameArr.length - 1];
  };

  return { get, getSource };
};

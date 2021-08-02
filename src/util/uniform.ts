const createGlValue = set => {
  const setValue = value => {
    const uniform = location => {
      set(location, value);
    };
    return { uniform, value };
  };
  return setValue;
};
export default class UniformManager {
  static Mat4(gl: WebGLRenderingContext) {
    return createGlValue((location, value) => {
      gl.uniformMatrix4fv(location, false, value);
    });
  }

  static Mat3(gl: WebGLRenderingContext) {
    return createGlValue((location, value) => {
      gl.uniformMatrix3fv(location, false, value);
    });
  }

  static Vec3(gl: WebGLRenderingContext) {
    return createGlValue((location, value) => {
      gl.uniform3fv(location, value);
    });
  }

  static Vec4(gl: WebGLRenderingContext) {
    return createGlValue((location, value) => {
      gl.uniform4fv(location, value);
    });
  }

  static Int(gl: WebGLRenderingContext) {
    return createGlValue((location, value) => {
      gl.uniform1i(location, value);
    });
  }
}

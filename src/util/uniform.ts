interface UniformHandler {
  uniform: (location: any) => void;
  value: any;
}
interface UniformManager {
  Mat4: (value: any) => UniformHandler;
  Mat3: (value: any) => UniformHandler;
  Vec3: (value: any) => UniformHandler;
  Vec4: (value: any) => UniformHandler;
  Int: (value: any) => UniformHandler;
}
const createUniformManager = (gl: WebGLRenderingContext): UniformManager => {
  // 创建一个uniform
  const createGlValue = set => {
    const setValue = value => {
      const uniform = location => {
        set(location, value);
      };
      return { uniform, value };
    };
    return setValue;
  };

  const Mat4 = createGlValue((location, value) => {
    gl.uniformMatrix4fv(location, false, value);
  });

  const Mat3 = createGlValue((location, value) => {
    gl.uniformMatrix3fv(location, false, value);
  });
  const Vec3 = createGlValue((location, value) => {
    gl.uniform3fv(location, value);
  });

  const Vec4 = createGlValue((location, value) => {
    gl.uniform4fv(location, value);
  });

  const Int = createGlValue((location, value) => {
    gl.uniform1i(location, value);
  });

  return { Mat4, Mat3, Vec3, Vec4, Int };
};

export default createUniformManager;

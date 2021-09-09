import { getGL } from './glUtils';

export interface GlValue {
  uniform: (location: any) => void;
  value: any;
}

const createGlValue = (set, value) => {
  const setValue = (value): GlValue => {
    const uniform = location => {
      set(location, value);
    };
    return { uniform, value };
  };
  return setValue(value);
};

const gl: WebGLRenderingContext = getGL();
export default class Uniform {
  static Mat4(value) {
    return createGlValue(location => {
      gl.uniformMatrix4fv(location, false, value);
    }, value);
  }

  static Mat3(value) {
    return createGlValue(location => {
      gl.uniformMatrix3fv(location, false, value);
    }, value);
  }

  static Vec3(value) {
    return createGlValue(location => {
      gl.uniform3fv(location, value);
    }, value);
  }

  static Vec4(value) {
    return createGlValue(location => {
      gl.uniform4fv(location, value);
    }, value);
  }

  static Int(value) {
    return createGlValue(location => {
      gl.uniform1i(location, value);
    }, value);
  }
}

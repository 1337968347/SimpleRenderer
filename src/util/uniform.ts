import { getGL } from './glUtils';

export interface GlValue {
  uniform: (location: any) => void;
  value: any;
}

const createGlValue = set => {
  const setValue = (value): GlValue => {
    const uniform = location => {
      set(location, value);
    };
    return { uniform, value };
  };
  return setValue;
};

const gl = getGL();
export default class Uniform {
  static Mat4(value) {
    return createGlValue(location => {
      gl.uniformMatrix4fv(location, false, value);
    });
  }

  static Mat3(value) {
    return createGlValue(location => {
      gl.uniformMatrix3fv(location, false, value);
    });
  }

  static Vec3(value) {
    return createGlValue(location => {
      gl.uniform3fv(location, value);
    });
  }

  static Vec4(value) {
    return createGlValue(location => {
      gl.uniform4fv(location, value);
    });
  }

  static Int(value) {
    return createGlValue(location => {
      gl.uniform1i(location, value);
    });
  }
}

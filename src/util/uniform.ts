export const createUniformManager = (gl: WebGLRenderingContext) => {
  function glValue(set) {
    function GlValue(value) {
      this.value = value;
    }
    GlValue.prototype = {
      uniform: set,
    };
    return GlValue;
  }

  const Mat4 = glValue((location)=>{
      
  })
};

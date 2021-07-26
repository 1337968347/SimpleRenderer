export const createSceneNode = (children: any[] = []) => {
  const visit = (scene: any) => {
    enter(scene);
    for (let i = 0; i < children.length; i++) {
      children[i].visit(scene);
    }
    exit(scene);
  };

  const append = (child: any) => {
    children.push(child);
  };

  const enter = scene => {
    console.log(scene);
  };

  const exit = scene => {
    console.log(scene);
  };

  return {
    visit,
    append,
    enter,
    exit,
  };
};

export const createSceneGraph = (gl: WebGLRenderingContext) => {
  const root = createSceneNode();
  let uniforms = {};
  const shaders = [];
  const viewportWidth = 640;
  const viewportHeight = 480;
  let sceneGraph = undefined;
  let textureUnit: number = 0;

  const draw = () => {
    gl.viewport(0, 0, viewportWidth, viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    root.visit(sceneGraph);
  };

  const pushUniforms = () => {
    uniforms = Object.create(uniforms);
  };

  const popUniforms = () => {
    uniforms = Object.getPrototypeOf(uniforms);
  };

  const pushTextura = () => {
    textureUnit++;
  };

  const popTextura = () => {
    textureUnit--;
  };

  const pushShader = shader => {
    shaders.push(shader);
  };

  const popShader = () => {
    shaders.pop();
  };

  const getShader = () => {
    return shaders[shaders.length - 1];
  };

  return (sceneGraph = {
    draw,
    pushUniforms,
    popUniforms,
    pushTextura,
    popTextura,
    pushShader,
    popShader,
    getShader,
  });
};

export const sceneUtil = () => {};

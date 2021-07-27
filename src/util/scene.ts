export class SceneNode {
  children: any[] = [];

  constructor(childrenP: any[] = []) {
    this.children = childrenP;
  }

  visit(scene: any) {
    this.enter(scene);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].visit(scene);
    }
    this.exit(scene);
  }

  append(child: any) {
    this.children.push(child);
  }

  enter(scene) {
    console.log(scene);
  }

  exit(scene) {
    console.log(scene);
  }
}

export class SceneRenderTarget extends SceneNode {
  fbo;
  children: any[] = [];

  constructor(fbo, children) {
    super();
    this.fbo = fbo;
    this.children = children;
  }

  enter(scene) {
    this.fbo.bind();

    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);
    scene.gl.viewport(0, 0, this.fbo.width, this.fbo.height);
  }

  exit(scene) {
    this.fbo.unbind();
    scene.gl.viewport(0, 0, scene.viewportWidth, scene.viewportHeight);
  }
}

export class SceneGraph {
  gl: WebGLRenderingContext;
  root = new SceneNode();
  uniforms = {};
  shaders = [];
  viewportWidth = 640;
  viewportHeight = 480;
  textureUnit: number = 0;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.root = new SceneNode();
  }

  draw() {
    this.gl.viewport(0, 0, this.viewportWidth, this.viewportHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.root.visit(this);
  }

  pushUniforms() {
    this.uniforms = Object.create(this.uniforms);
  }

  popUniforms() {
    this.uniforms = Object.getPrototypeOf(this.uniforms);
  }

  pushTextura() {
    this.textureUnit++;
  }

  popTextura() {
    this.textureUnit--;
  }

  pushShader(shader) {
    this.shaders.push(shader);
  }

  popShader() {
    this.shaders.pop();
  }

  getShader() {
    return this.shaders[this.shaders.length - 1];
  }
}

export class SceneMaterial {
  shader: any;
  uniforms: any;
  children: any[] = [];

  constructor(shader, uniforms, children) {
    this.shader = shader;
    this.uniforms = uniforms;

    this.children = children;
  }

  enter(scene) {
    for (let uniform of this.uniforms) {
      if (uniform.bindTexture) {
        uniform.bindTexture(scene.pushTextura());
      }
    }
    scene.pushShader(this.shader);
    this.shader.use();
    this.shader.uniforms(scene.uniforms);
    this.shader.uniforms(this.uniforms);
  }

  exit(scene) {
    for (let uniform of this.uniforms) {
      if (uniform.bindTexture) {
        scene.popTextura();
      }
    }
    scene.popShader();
  }
}

export const sceneUtil = () => {};

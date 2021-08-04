import { mat3, mat4, vec3, vec4 } from '../lib/MV';
import { getGL, VertexBufferObject } from './glUtils';
import { Shader } from './shader';
import Uniform from './uniform';

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

  enter(scene: SceneGraph) {
    this.fbo.bind();

    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);
    scene.gl.viewport(0, 0, this.fbo.width, this.fbo.height);
  }

  exit(scene: SceneGraph) {
    this.fbo.unbind();
    scene.gl.viewport(0, 0, scene.viewportWidth, scene.viewportHeight);
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

  enter(scene: SceneGraph) {
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

  exit(scene: SceneGraph) {
    for (let uniform of this.uniforms) {
      if (uniform.bindTexture) {
        scene.popTextura();
      }
    }
    scene.popShader();
  }
}

export class SceneCamera {
  gl: WebGLRenderingContext;
  children: any[] = [];
  position: Float32Array;
  pitch: number = 0.0;
  yaw: number = 0.0;
  near: number = 0.1;
  far: number = 5000;
  fov: number = 50;

  constructor(gl: WebGLRenderingContext, children: any[]) {
    this.children = children;
    this.gl = gl;
    this.position = vec3.create([0, 0, 10]);
  }

  enter(scene: SceneGraph) {
    scene.pushUniforms();
    scene.uniforms['projection'] = Uniform.Mat4(this.getProjection(scene));
    scene.uniforms['worldView'] = Uniform.Mat4(this.getWorldView());
  }

  exit(scene: SceneGraph) {
    scene.popUniforms();
  }

  project(point, scene: SceneGraph) {
    const mvp = mat4.create();
    mat4.multiply(this.getProjection(scene), this.getWorldView(), mvp);
    const projected = mat4.multiplyVec4(mvp, point, vec4.create());
    vec4.scale(projected, 1 / projected[3]);
    return projected;
  }

  getInverseRotation() {
    return mat3.toMat4(mat4.toInverseMat3(this.getWorldView()));
  }

  // project
  getProjection(scene: SceneGraph) {
    return mat4.perspective(this.fov, scene.viewportWidth / scene.viewportHeight, this.near, this.far);
  }

  // ModelView
  getWorldView() {
    const matrix = mat4.identity(mat4.create());
    mat4.rotateX(matrix, this.pitch);
    mat4.rotateY(matrix, this.yaw);
    mat4.translate(matrix, vec3.negate(this.position, vec3.create()));
    return matrix;
  }
}

export class SceneGraph {
  gl: WebGLRenderingContext;
  root = new SceneNode();
  uniforms = {};
  shaders: Shader[] = [];
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

export class SceneSimpleMesh {
  vbo: VertexBufferObject;
  gl: WebGLRenderingContext;
  constructor(vbo: VertexBufferObject) {
    this.vbo = vbo;
    this.gl = getGL();
  }

  visit(scene: SceneGraph) {
    const shader = scene.getShader();
    const location = shader.getAttribLocation('position');
    const stride = 0;
    const offset = 0;
    const normalized = false;
    this.gl.enableVertexAttribArray(location);
    this.gl.vertexAttribPointer(location, 3, this.gl.FLOAT, normalized, stride, offset);
  }
}

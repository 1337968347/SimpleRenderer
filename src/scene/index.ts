import * as uniform from '../util/uniform';
import { mat3, mat4, vec3, vec4 } from '../math/MV';
import { getGL, VertexBufferObject, Texture2D, FrameBufferObject } from '../util/glUtils';
import { Shader } from '../util/shader';
import { UniformMap } from '../util/uniform';

export class Node {
  children: Node[] = [];

  constructor(childrenP: any[] = []) {
    this.children = childrenP;
  }

  visit(scene: Graph) {
    this.enter(scene);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].visit(scene);
    }
    this.exit(scene);
  }

  // overwrite
  exit(_scene: Graph) {
    // console.log(scene);
  }

  append(child: any) {
    this.children.push(child);
  }

  // overwrite
  enter(_scene: Graph) {
    // console.log(scene);
  }
}

export class Graph {
  gl: WebGLRenderingContext;
  root: Node;
  uniforms: UniformMap = {};
  shaders: Shader[] = [];
  viewportWidth = 640;
  viewportHeight = 480;
  textureUnit: number = 0;

  constructor() {
    this.gl = getGL();
    this.root = new Node();
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
    return this.textureUnit++;
  }

  popTextura() {
    this.textureUnit--;
  }

  pushShader(shader: Shader) {
    this.shaders.push(shader);
  }

  popShader() {
    this.shaders.pop();
  }

  getShader() {
    return this.shaders[this.shaders.length - 1];
  }
}

// 渲染场景到FrameBufferObject上
export class RenderTarget extends Node {
  fbo: FrameBufferObject;
  children: Node[] = [];

  constructor(fbo, children: Node[]) {
    super();
    this.fbo = fbo;
    this.children = children;
  }

  enter(scene: Graph) {
    this.fbo.bind();
    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);
  }

  exit(scene: Graph) {
    this.fbo.unbind();
    scene.gl.viewport(0, 0, scene.viewportWidth, scene.viewportHeight);
  }
}

export class Material extends Node {
  shader: Shader;
  uniforms: UniformMap;
  children: Node[] = [];

  constructor(shader: Shader, uniforms: UniformMap, children: Node[]) {
    super();
    this.shader = shader;
    this.uniforms = uniforms;

    this.children = children;
  }

  enter(scene: Graph) {
    scene.pushShader(this.shader);
    this.shader.use();
    Uniforms.prototype.enter.call(this, scene);
  }

  exit(scene: Graph) {
    scene.popShader();
    Uniforms.prototype.exit.call(this, scene);
  }
}

export class Camera extends Node {
  gl: WebGLRenderingContext;
  children: Node[] = [];
  position: Float32Array;
  pitch: number = 0.3;
  yaw: number = 0.0;
  near: number = 0.5;
  far: number = 5000;
  fov: number = 50;

  constructor(children: Node[]) {
    super();
    this.children = children;
    this.gl = getGL();
    this.position = vec3.create([0, 0, 0]);
  }

  enter(scene: Graph) {
    scene.pushUniforms();
    const project = this.getProjection(scene);
    const wordView = this.getWorldView();
    // modeView Project ;
    // not most valuable player
    const mvp = mat4.create();

    mat4.multiply(project, wordView, mvp);
    scene.uniforms.projection = uniform.Mat4(mvp);
    scene.uniforms.eye = uniform.Vec3(this.position);
  }

  exit(scene: Graph) {
    scene.popUniforms();
  }

  project(point: Float32Array, scene: Graph) {
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
  getProjection(scene: Graph) {
    return mat4.perspective(this.fov, scene.viewportWidth / scene.viewportHeight, this.near, this.far);
  }

  // ModelView
  getWorldView() {
    // 先平移到标架原点， 然后再旋转
    const matrix = mat4.identity(mat4.create());
    mat4.rotateX(matrix, this.pitch);
    mat4.rotateY(matrix, this.yaw);
    mat4.translate(matrix, vec3.negate(this.position, vec3.create()));
    return matrix;
  }
}

export class CameraFixUniform extends Node {
  camera: Camera;
  children: Node[] = [];
  fixMartix: Float32Array = mat4.create();

  constructor(children: Node[]) {
    super();
    this.children = children;
  }

  enter(scene: Graph) {
    scene.pushUniforms();
    // 相机标架
    const cameraModelView = mat4.inverse(this.camera.getWorldView());
    const aux = mat4.create();
    mat4.multiply(cameraModelView, this.fixMartix, aux);
    scene.uniforms.modelTransform = uniform.Mat4(aux);
  }

  exit(scene: Graph) {
    scene.popUniforms();
  }
}
export class SimpleMesh extends Node {
  constructor() {
    super();
  }

  visit(scene: Graph) {
    const shader = scene.getShader();
    shader.uniforms(scene.uniforms);
    const attributes = shader.attributes;
    for (const name of Object.keys(attributes)) {
      const bufferObject = attributes[name];
      bufferObject.bind();
      if (bufferObject instanceof VertexBufferObject) {
        bufferObject.drawTriangles();
      }
    }

    for (const name of Object.keys(attributes)) {
      const bufferObject = attributes[name];
      bufferObject.unbind();
    }
  }
}

export class Transform extends Node {
  children: Node[] = [];
  wordMatrix = mat4.create();
  aux = mat4.create();

  constructor(children: Node[]) {
    super();
    this.children = children;
    mat4.identity(this.wordMatrix);
  }

  enter(scene: Graph) {
    scene.pushUniforms();
    if (scene.uniforms.modelTransform) {
      mat4.multiply((scene.uniforms.modelTransform as any).value, this.wordMatrix, this.aux);
      scene.uniforms.modelTransform = uniform.Mat4(this.aux);
    } else {
      scene.uniforms.modelTransform = uniform.Mat4(this.wordMatrix);
    }
  }

  exit(scene: Graph) {
    scene.popUniforms();
  }
}

export class Mirror extends Transform {
  constructor(children: Node[]) {
    super(children);
  }

  enter(scene: Graph) {
    scene.gl.cullFace(scene.gl.FRONT);
    super.enter.call(this, scene);
  }

  exit(scene: Graph) {
    scene.gl.cullFace(scene.gl.BACK);
    super.exit.call(this, scene);
  }
}
export class Uniforms extends Node {
  uniforms: UniformMap;
  children: Node[];

  constructor(uniforms: UniformMap, children: Node[]) {
    super();
    this.uniforms = uniforms;
    this.children = children;
  }

  enter(scene: Graph) {
    scene.pushUniforms();
    for (let uniform in this.uniforms) {
      const value = this.uniforms[uniform];
      if (value instanceof Texture2D || value instanceof FrameBufferObject) {
        value.bindTexture(scene.pushTextura());
      }
      // 把this.uniform 绑定到Scene的uniform属性上去
      scene.uniforms[uniform] = value;
    }
  }

  exit(scene: Graph) {
    for (let uniform in this.uniforms) {
      const value = this.uniforms[uniform];
      if (value instanceof Texture2D || value instanceof FrameBufferObject) {
        value.unbindTexture();
        scene.popTextura();
      }
    }
    scene.popUniforms();
  }
}

export class PostProcess extends Node {
  children: Node[];
  constructor(shader: Shader, uniforms: UniformMap) {
    super();
    shader.setAttribBufferData('position', new Float32Array([-1, 1, 0, -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]));
    const mesh = new SimpleMesh();
    const material = new Material(shader, uniforms, [mesh]);
    this.children = [material];
  }
}

export class Skybox extends Node {
  children: Node[];
  constructor(shader: Shader, uniforms: UniformMap) {
    super();

    shader.setAttribBufferData(
      'position',
      new Float32Array([
        // back
        1, 1, 1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, -1, 1, -1, 1, 1,
        // front
        -1, 1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, -1, -1, 1, -1, -1,
        // left
        -1, 1, 1, -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1,
        // right
        1, 1, 1, 1, 1, -1, 1, -1, -1, 1, 1, 1, 1, -1, -1, 1, -1, 1,
        // top
        1, 1, 1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, -1,
        // bottom
        -1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, 1, -1, 1, 1, -1, -1,
      ]),
    );
    const mesh = new SimpleMesh();
    const material = new Material(shader, uniforms, [mesh]);
    this.children = [material];
  }
}

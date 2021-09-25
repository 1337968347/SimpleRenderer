import { mat3, mat4, vec3, vec4 } from '../lib/MV';
import { getGL } from './glUtils';
import Uniform from './uniform';
import { VertexBufferObject, Texture2D, FrameBufferObject } from './glUtils';
import { GlValue, Shader } from '../interface';

export interface Uniforms {
  [k: string]: GlValue | Texture2D | FrameBufferObject | number;
}

export class SceneNode {
  children: SceneNode[] = [];

  constructor(childrenP: any[] = []) {
    this.children = childrenP;
  }

  visit(scene: SceneGraph) {
    this.enter(scene);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].visit(scene);
    }
    this.exit(scene);
  }

  exit(_scene: SceneGraph) {
    // console.log(scene);
  }

  append(child: any) {
    this.children.push(child);
  }

  enter(_scene: SceneGraph) {
    // console.log(scene);
  }
}

export class SceneGraph {
  gl: WebGLRenderingContext;
  root = new SceneNode();
  uniforms: Uniforms = {};
  shaders: Shader[] = [];
  viewportWidth = 640;
  viewportHeight = 480;
  textureUnit: number = 0;

  constructor() {
    this.gl = getGL();
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

export class SceneRenderTarget extends SceneNode {
  fbo: FrameBufferObject;
  children: SceneNode[] = [];

  constructor(fbo, children: SceneNode[]) {
    super();
    this.fbo = fbo;
    this.children = children;
  }

  enter(scene: SceneGraph) {
    this.fbo.bind();
    scene.gl.clear(scene.gl.COLOR_BUFFER_BIT | scene.gl.DEPTH_BUFFER_BIT);
  }

  exit(scene: SceneGraph) {
    this.fbo.unbind();
    scene.gl.viewport(0, 0, scene.viewportWidth, scene.viewportHeight);
  }
}

export class SceneMaterial extends SceneNode {
  shader: Shader;
  uniforms: Uniforms;
  children: SceneNode[] = [];

  constructor(shader: Shader, uniforms: Uniforms, children: SceneNode[]) {
    super();
    this.shader = shader;
    this.uniforms = uniforms;

    this.children = children;
  }

  enter(scene: SceneGraph) {
    scene.pushShader(this.shader);
    this.shader.use();
    SceneUniforms.prototype.enter.call(this, scene);
  }

  exit(scene: SceneGraph) {
    scene.popShader();
    SceneUniforms.prototype.exit.call(this, scene);
  }
}

export class SceneCamera extends SceneNode {
  gl: WebGLRenderingContext;
  children: SceneNode[] = [];
  position: Float32Array;
  pitch: number = 0.3;
  yaw: number = 0.0;
  near: number = 0.5;
  far: number = 5000;
  fov: number = 50;

  constructor(children: SceneNode[]) {
    super();
    this.children = children;
    this.gl = getGL();
    this.position = vec3.create([0, 0, 0]);
  }

  enter(scene: SceneGraph) {
    scene.pushUniforms();
    const project = this.getProjection(scene);
    const wordView = this.getWorldView();
    // modeView Project ;
    // not most valuable player
    const mvp = mat4.create();

    mat4.multiply(project, wordView, mvp);
    scene.uniforms.projection = Uniform.Mat4(mvp);
    scene.uniforms.eye = Uniform.Vec3(this.position);
  }

  exit(scene: SceneGraph) {
    scene.popUniforms();
  }

  project(point: Float32Array, scene: SceneGraph) {
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
    // 先平移到标架原点， 然后再旋转
    const matrix = mat4.identity(mat4.create());
    mat4.rotateX(matrix, this.pitch);
    mat4.rotateY(matrix, this.yaw);
    mat4.translate(matrix, vec3.negate(this.position, vec3.create()));
    return matrix;
  }
}

export class SceneSimpleMesh extends SceneNode {
  vbo: VertexBufferObject;
  gl: WebGLRenderingContext;

  constructor(vbo: VertexBufferObject) {
    super();
    this.vbo = vbo;
    this.gl = getGL();
  }

  visit(scene: SceneGraph) {
    const shader = scene.getShader();
    this.vbo.bind();
    shader.uniforms(scene.uniforms);
    this.vbo.drawTriangles();
    this.vbo.unbind();
  }
}

export class SceneTransform extends SceneNode {
  children: SceneNode[] = [];
  wordMatrix = mat4.create();
  aux = mat4.create();

  constructor(children: SceneNode[]) {
    super();
    this.children = children;
    mat4.identity(this.wordMatrix);
  }

  enter(scene: SceneGraph) {
    scene.pushUniforms();
    if (scene.uniforms.modelTransform) {
      mat4.multiply((scene.uniforms.modelTransform as any).value, this.wordMatrix, this.aux);
      scene.uniforms.modelTransform = Uniform.Mat4(this.aux);
    } else {
      scene.uniforms.modelTransform = Uniform.Mat4(this.wordMatrix);
    }
  }

  exit(scene: SceneGraph) {
    scene.popUniforms();
  }
}

export class SceneMirror extends SceneTransform {
  constructor(children: SceneNode[]) {
    super(children);
  }

  enter(scene: SceneGraph) {
    scene.gl.cullFace(scene.gl.FRONT);
    super.enter.call(this, scene);
  }

  exit(scene: SceneGraph) {
    scene.gl.cullFace(scene.gl.BACK);
    super.exit.call(this, scene);
  }
}
export class SceneUniforms extends SceneNode {
  uniforms: Uniforms;
  children: SceneNode[];

  constructor(uniforms: Uniforms, children: SceneNode[]) {
    super();
    this.uniforms = uniforms;
    this.children = children;
  }

  enter(scene: SceneGraph) {
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

  exit(scene: SceneGraph) {
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

export class ScenePostProcess extends SceneNode {
  children: SceneNode[];
  constructor(shader: Shader, uniforms: Uniforms) {
    super();
    const mesh = new SceneSimpleMesh(
      new VertexBufferObject(
        new Float32Array([-1, 1, 0, -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0]),
        shader.getAttribLocation('position'),
      ),
    );
    const material = new SceneMaterial(shader, uniforms, [mesh]);
    this.children = [material];
  }
}

export class SceneSkybox extends SceneNode {
  children: SceneNode[];
  constructor(shader: Shader, uniforms: Uniforms) {
    super();
    const mesh = new SceneSimpleMesh(
      new VertexBufferObject(
        new Float32Array([
          -1, 1, 1, -1, -1, 1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 1,

          // front
          -1, 1, -1, -1, -1, -1, 1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, -1,

          // left
          -1, 1, -1, -1, -1, -1, -1, 1, 1, -1, 1, -1, -1, -1, 1, -1, 1, 1,

          // right
          1, 1, -1, 1, -1, -1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1,

          // top
          -1, 1, -1, -1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, -1,
        ]),
        shader.getAttribLocation('position'),
      ),
    );
    const material = new SceneMaterial(shader, uniforms, [mesh]);
    this.children = [material];
  }
}

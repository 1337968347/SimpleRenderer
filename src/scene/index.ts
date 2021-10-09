import * as uniform from '../util/uniform';
import { mat3, mat4, vec3, vec4 } from '../math/MV';
import { getGL, VertexBufferObject, Texture2D, FrameBufferObject } from '../util/glUtils';
import { Shader } from '../util/shader';
import { UniformMap } from '../util/uniform';
import { WebXr } from '../util/webXR';

export class Node {
  children: Node[] = [];

  constructor(childrenP: any[] = []) {
    this.children = childrenP;
  }

  visit(scene: Graph, frame?) {
    this.enter(scene, frame);
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].visit(scene, frame);
    }
    this.exit(scene, frame);
  }

  // overwrite
  exit(_scene: Graph, _frame?) {
    // console.log(scene);
  }

  append(child: any) {
    this.children.push(child);
  }

  // overwrite
  enter(_scene: Graph, _frame?) {
    // console.log(scene);
  }
}

export class Graph {
  gl: WebGLRenderingContext;
  root: Node;
  uniforms: UniformMap = {};
  shaders: Shader[] = [];
  public viewport = {
    x: 0,
    y: 0,
    width: 640,
    height: 480,
  };
  textureUnit: number = 0;
  camera: Camera;
  webXr: WebXr;
  view: any;

  constructor(xRSession) {
    this.gl = getGL();
    this.attempWebXRInit(xRSession);
    this.root = new Node();
  }

  attempWebXRInit(xRSession) {
    if (xRSession) {
      this.webXr = new WebXr(xRSession, this.gl);
    }
  }

  draw(frame?) {
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (frame) {
      const eyes = frame.getViewerPose(this.webXr.XRReferenceSpace);
      let baseLayer = frame.session.renderState.baseLayer;
      for (let view of eyes.views) {
        let i = baseLayer.getViewport(view);
        this.viewport = {
          x: i.x,
          y: i.y,
          width: i.width,
          height: i.height,
        };
        gl.viewport(i.x, i.y, i.width, i.height);
        this.setCurrentView(view);
        this.root.visit(this, frame);
      }
    } else {
      this.root.visit(this, frame);
    }
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

  getWebXR() {
    return this.webXr;
  }

  setCamera(camera: Camera) {
    this.camera = camera;
  }

  getCamera() {
    return this.camera;
  }

  // 对VR来说 每双眼睛需要生成一帧不同的图像
  setCurrentView(view: any) {
    this.view = view;
  }

  getCurrentView() {
    return this.view;
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
    scene.gl.viewport(scene.viewport.x, scene.viewport.y, scene.viewport.width, scene.viewport.height);
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
  x: number = 0.0;
  y: number = 0.0;
  near: number = 0.5;
  far: number = 5000;
  fov: number = 50;
  view: any;

  constructor(children: Node[]) {
    super();
    this.children = children;
    this.gl = getGL();
    this.position = vec3.create([0, 0, 0]);
  }

  enter(scene: Graph, frame) {
    scene.pushUniforms();
    if (frame) {
      this.view = scene.getCurrentView();
      this.position = new Float32Array([
        this.view.transform.position.x * 10,
        this.view.transform.position.y * 10+10,
        this.view.transform.position.z * 10 + 200,
      ]);
    }
    const project = this.getProjection(scene);
    const wordView = this.getWorldView();

    const mvp = mat4.create();
    mat4.multiply(project, wordView, mvp);
    scene.uniforms.projection = uniform.Mat4(mvp);
    scene.uniforms.eye = uniform.Vec3(new Float32Array(this.position));
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
    if (this.view) {
      return this.view.transform.matrix;
    }
    return mat3.toMat4(mat4.toInverseMat3(this.getWorldView()));
  }

  // project
  getProjection(scene: Graph) {
    if (this.view) {
      return this.view.projectionMatrix;
    }
    return mat4.perspective(this.fov, scene.viewport.width / scene.viewport.height, this.near, this.far);
  }

  // ModelView
  getWorldView() {
    if (this.view) {
      mat4.translate(this.view.transform.inverse.matrix, vec3.negate(this.position, vec3.create()));
      return this.view.transform.inverse.matrix;
    }

    // 先平移到标架原点， 然后再旋转
    const matrix = mat4.identity(mat4.create());
    mat4.rotateX(matrix, this.x);
    mat4.rotateY(matrix, this.y);
    mat4.translate(matrix, vec3.negate(this.position, vec3.create()));
    return matrix;
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

export class CameraFixTransform extends Transform {
  wordMatrix = mat4.create();

  constructor(children: Node[]) {
    super(children);
    this.children = children;
  }

  enter(scene: Graph) {
    scene.pushUniforms();
    // 相机标架
    const aux = mat4.create();
    mat4.multiply(scene.getCamera().getInverseRotation(), this.wordMatrix, aux);
    scene.uniforms.modelTransform = uniform.Mat4(aux);
  }

  exit(scene: Graph) {
    scene.popUniforms();
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

export class WebVrRenderTarget extends Node {
  enter(scene: Graph, frame) {
    if (frame) {
      const webXR = scene.getWebXR();
      webXR.bind();
    }
  }

  exit(scene: Graph, frame) {
    if (frame) {
      const webXR = scene.getWebXR();
      webXR.unbind();
    }
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

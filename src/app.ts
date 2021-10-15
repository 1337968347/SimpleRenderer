import * as Scene from './scene';
import * as uniform from './util/uniform';
import createClock from './util/clock';
import { setCanvasFullScreen, Texture2D, getGL, VertexBufferObject, getImageData, sampleHeight } from './util/glUtils';
import { ShaderManager } from './util/shader';
import Loader from './loader';
import Mesh from './util/mesh';
import CameraController from './control/cameraController';
import InputHandler from './control/input';
import { mat3, mat4, vec3 } from './math/MV';

const query = new URLSearchParams(location.search);

const scale = parseFloat(query.get('d')) || 1.0;

// 网格密度
const GRID_RESOLUTION = 512 * scale * scale,
  // 世界缩放
  GRID_SIZE = 512,
  FAR_AWAY = 10000;

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const inputHandler = new InputHandler(canvasEl);
  const clock = createClock();
  const loader = new Loader('./assets/');
  loader.load([
    'shaders/sun.glsl',
    'shaders/transform.glsl',
    'shaders/water.vert',
    'shaders/water.frag',
    'heightmap.png',
    'normalnoise.png',
    'snow.png',
    'occlusion.png',

    'shaders/terrain.vert',
    'shaders/terrain.frag',
  ]);

  let cameraController: CameraController;
  let sceneGraph: Scene.Graph;
  const gl: WebGLRenderingContext = getGL();
  const globaluniform = {
    sunColor: uniform.Vec3([1.1, 1.0, 1.0]),
    sunDirection: uniform.Vec3(vec3.normalize(new Float32Array([0.0, 0.6, -1.0]))),
    skyColor: uniform.Vec3([0.3, 0.3, 0.45]),
    clip: 1000,
    time: 0.0,
  };
  const inverseWorldMatrix = mat4.create();
  let sampleImage: ImageData;

  const prepareScence = (xrSession?: XRSession) => {
    sceneGraph = new Scene.Graph(xrSession);

    gl.clearColor(1.0, 1.0, 1.0, FAR_AWAY);
    const shaderManager = new ShaderManager(loader.resources);
    const heightText2D = new Texture2D(loader.resources['heightmap.png']);
    const waterText2D = new Texture2D(loader.resources['normalnoise.png']);
    const snowText2D = new Texture2D(loader.resources['snow.png']);
    const occlusionText2D = new Texture2D(loader.resources['occlusion.png']);
    sampleImage = getImageData(loader.resources['heightmap.png']);

    // 着色器
    const mountainShader = shaderManager.get('terrain.vert', 'terrain.frag');
    const waterShader = shaderManager.get('water.vert', 'water.frag');

    const moutainVbo = new VertexBufferObject(Mesh.gird(GRID_RESOLUTION));
    const waterVbo = new VertexBufferObject(Mesh.gird(100));

    const mountainTransform = new Scene.Transform([new Scene.SimpleMesh({ position: moutainVbo })]);
    const waterTransform = new Scene.Transform([new Scene.SimpleMesh({ position: waterVbo })]);

    const mountain = new Scene.Material(
      mountainShader,
      {
        heightmap: heightText2D,
        snowTexture: snowText2D,
        occlusionmap: occlusionText2D,
        snowColor: uniform.Vec3([1.0, 1.0, 1.0]),
        groundColor: uniform.Vec3([0.5, 0.4, 0.3]),
      },
      [mountainTransform],
    );

    // 然后用山的倒影生成的纹理 画水面
    const water = new Scene.Material(waterShader, { color: uniform.Vec3([0.2, 0.28, 0.3]), waterNoise: waterText2D }, [waterTransform]);

    // 开放场景图数据传输
    // Scene.Graph 场景
    // Scene.Camera  根据相机的位置获取MVP：ModelView Projection
    // Scene.Uniforms 传输uniform变量|纹理
    // Scene.Material 绑定着色器 && 传递Uniform变量|纹理
    // Scene.Transform 生成世界缩放平移矩阵
    // Scene.SimpleMesh 绑定好着色器，传好变量后，并且绘制顶点
    // Scene.RenderTarget 将渲染的内容 渲染到图片上
    // VertexBufferObject 顶点相关数据
    // Scene.PostProcess 将生成的纹理进行后处理操作。将渲染生成的图片当成纹理，渲染到一个正方形上。
    // can be optimized with a z only shader

    // 先画山的倒影， 然后画山 画水
    const camera: Scene.Camera = new Scene.Camera([new Scene.Uniforms(globaluniform, [mountain, water])]);

    cameraController = new CameraController(inputHandler, camera);

    sceneGraph.setCamera(camera);
    sceneGraph.root.append(camera);

    camera.setProjection(0.1, FAR_AWAY * 2, sceneGraph.getWebXR());
    camera.position = new Float32Array([0, 10, 180]);
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(mountainTransform.wordMatrix, new Float32Array([-0.5 * GRID_SIZE, -40, -0.5 * GRID_SIZE]));
    mat4.scale(mountainTransform.wordMatrix, new Float32Array([GRID_SIZE, 100, GRID_SIZE]));

    mat4.translate(waterTransform.wordMatrix, new Float32Array([-0.5 * FAR_AWAY, 0, -0.5 * FAR_AWAY]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([FAR_AWAY, 1, FAR_AWAY]));

    mat3.toMat4(mat4.toInverseMat3(mountainTransform.wordMatrix), inverseWorldMatrix);

    camera.far = FAR_AWAY * 2;
    setCanvasFullScreen(canvasEl, sceneGraph);
  };

  loader.setOnRendy(async () => {
    // loop函数
    clock.setOnTick((t: number, frame: XRFrame) => {
      globaluniform.time += t;
      cameraController.tick();
      const camera = cameraController.camera;
      const fakePosition = vec3.create();
      mat4.multiplyVec3(inverseWorldMatrix, camera.position, fakePosition);
      console.log(sampleHeight(sampleImage, fakePosition[0], fakePosition[2]));
      sceneGraph.draw(frame);
    });

    prepareScence();
    clock.start();
  });
};

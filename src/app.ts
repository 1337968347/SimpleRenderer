import createClock from './util/clock';
import { VertexBufferObject, setCanvasFullScreen, Texture2D, FrameBufferObject, getGL } from './util/glUtils';
import Uniform from './util/uniform';
import {
  SceneCamera,
  SceneGraph,
  SceneMaterial,
  SceneSimpleMesh,
  SceneTransform,
  SceneUniforms,
  SceneRenderTarget,
  ScenePostProcess,
} from './util/scene';
import { ShaderManager } from './util/shader';
import Loader from './util/loader';
import { gird } from './util/mesh';
import CameraConstroller from './util/cameraController';
import InputHandler from './util/input';
import { mat4 } from './lib/MV';

const GRID_SIZE = 512,
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
    'shaders/terrain.vert',
    'shaders/terrain.frag',
    'shaders/screen.vert',
    'shaders/tonemapping.frag',
  ]);

  const globaluniform = {
    skyColor: Uniform.Vec3([0.2, 0.3, 0.35]),
    groundColor: Uniform.Vec3([0.7, 0.87, 1.0]),
    sunColor: Uniform.Vec3([0.7, 0.7, 0.7]),
    sunDirection: Uniform.Vec3([0.0, 0.71, 0.71]),
    time: 0.0,
  };

  let cameraController;
  let sceneGraph: SceneGraph;

  const prepareScence = () => {
    const gl = getGL();

    gl.clearColor(0.4, 0.6, 1.0, GRID_SIZE);
    const shaderManager = new ShaderManager(loader.resources);
    const heightText2D = new Texture2D(loader.resources['heightmap.png']);
    const waterText2D = new Texture2D(loader.resources['normalnoise.png']);
    // 着色器
    const moutainShader = shaderManager.get('terrain.vert', 'terrain.frag');
    const waterShader = shaderManager.get('water.vert', 'water.frag');
    // 场景图
    sceneGraph = new SceneGraph();
    // 被观察物
    const triangle = new VertexBufferObject(gird(GRID_SIZE));

    // 开放场景图数据传输
    // SceneGraph 场景
    // SceneCamera  根据相机的位置获取MVP：ModelView Projection
    // SceneUniforms 传输uniform变量|纹理
    // SceneMaterial 绑定着色器 && 传递Uniform变量|纹理
    // SceneTransform 生成世界缩放平移矩阵
    // SceneSimpleMesh 绑定好着色器，传好变量后，并且绘制顶点
    // SceneRenderTarget 将渲染的内容 渲染到图片上
    // VertexBufferObject 顶点相关数据
    // ScenePostProcess 将生成的纹理进行后处理操作。将渲染生成的图片当成纹理，渲染到一个正方形上。

    let moutainTransform = new SceneTransform([new SceneSimpleMesh(triangle)]);
    let waterTransform = new SceneTransform([new SceneSimpleMesh(triangle)]);
    const camera = new SceneCamera([
      new SceneUniforms(globaluniform, [
        new SceneMaterial(
          waterShader,
          {
            color: Uniform.Vec3([0.3, 0.5, 0.9]),
            waterNoise: waterText2D,
          },
          [waterTransform],
        ),
        new SceneMaterial(moutainShader, { heightmap: heightText2D }, [moutainTransform]),
      ]),
    ]);

    const fbo = new FrameBufferObject(2048, 2048);
    const mountainTarget = new SceneRenderTarget(fbo, [camera]);
    const postprocess = new ScenePostProcess(shaderManager.get('screen.vert', 'tonemapping.frag'), { texture: fbo });

    cameraController = new CameraConstroller(inputHandler, camera);
    sceneGraph.root.append(mountainTarget);
    sceneGraph.root.append(postprocess);

    camera.position[1] = 50;
    camera.position[2] += 300;
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(moutainTransform.wordMatrix, new Float32Array([-0.5 * GRID_SIZE, -10, -0.5 * GRID_SIZE]));
    mat4.scale(moutainTransform.wordMatrix, new Float32Array([GRID_SIZE, 100, GRID_SIZE]));

    mat4.translate(waterTransform.wordMatrix, new Float32Array([-1 * FAR_AWAY, 0, -1 * FAR_AWAY]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([FAR_AWAY * 2, 100, FAR_AWAY * 2]));

    setCanvasFullScreen(canvasEl, sceneGraph);
  };

  loader.setOnRendy(() => {
    prepareScence();
    clock.setOnTick(t => {
      globaluniform.time += t;
      cameraController.tick();
      sceneGraph.draw();
    });
    clock.start();
  });
};

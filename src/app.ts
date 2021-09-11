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

const MESHNUM = 512;

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const inputHandler = new InputHandler(canvasEl);
  const clock = createClock();
  const loader = new Loader('./assets/');
  loader.load([
    'shaders/water.vert',
    'shaders/water.frag',
    'heightmap.png',
    'normalnoise.png',
    'shaders/heightmap.vert',
    'shaders/terrain.frag',
    'shaders/screen.vert',
    'shaders/tonemapping.frag',
  ]);

  const globaluniform = {
    skyColor: Uniform.Vec3([0.2, 0.3, 0.35]),
    groundColor: Uniform.Vec3([0.7, 0.87, 1.0]),
    sunColor: Uniform.Vec3([0.7, 0.7, 0.7]),
    sunDirection: Uniform.Vec3([0.577, 0.577, 0.577]),
    time: 0.0,
  };

  let cameraController;
  let sceneGraph: SceneGraph;

  const prepareScence = () => {
    const gl = getGL();

    gl.clearColor(0.4, 0.6, 1.0, 1.0);
    const shaderManager = new ShaderManager(loader.resources);
    const heightText2D = new Texture2D(loader.resources['heightmap.png']);
    const waterText2D = new Texture2D(loader.resources['normalnoise.png']);
    // 着色器
    const moutainShader = shaderManager.get('heightmap.vert', 'terrain.frag');
    const waterShader = shaderManager.get('water.vert', 'water.frag');
    // 场景图
    sceneGraph = new SceneGraph();
    // 被观察物
    const triangle = new VertexBufferObject(gird(MESHNUM));

    // 开放场景图数据传输
    // SceneGraph 场景
    // SceneCamera  根据相机的位置获取MVP：ModelView Projection
    // SceneUniforms 传输uniform变量|纹理
    // SceneMaterial 绑定着色器 && 传递Uniform变量|纹理
    // SceneTransform 生成世界缩放平移矩阵
    // SceneSimpleMesh 绑定好着色器，传好变量后，绘制顶点用
    // SceneRenderTarget 渲染内容到FrameBufferObject上
    // ScenePostProcess

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

    camera.position[1] = 60;
    camera.position[2] += 300;
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(moutainTransform.wordMatrix, new Float32Array([-0.5 * MESHNUM, -10, -0.5 * MESHNUM]));
    mat4.scale(moutainTransform.wordMatrix, new Float32Array([MESHNUM, 100, MESHNUM]));

    mat4.translate(waterTransform.wordMatrix, new Float32Array([-10.0 * MESHNUM, 0, -10.0 * MESHNUM]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([MESHNUM * 20, 100, MESHNUM * 20]));

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

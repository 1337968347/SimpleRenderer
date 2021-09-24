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
  SceneMirror,
  SceneSkybox,
} from './util/scene';
import { ShaderManager } from './util/shader';
import Loader from './util/loader';
import { gird, parseObj } from './util/mesh';
import CameraConstroller from './util/cameraController';
import InputHandler from './util/input';
import { mat4, vec3 } from './lib/MV';

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
    'shaders/screen.frag',
    'shaders/sky.vert',
    'shaders/sky.frag',
    'shaders/plane.vert',
    'shaders/plane.frag',
    'obj/seahawk.obj',
  ]);

  let cameraController: CameraConstroller;
  let sceneGraph: SceneGraph;
  let camera: SceneCamera;
  let planeTransform: SceneTransform;
  const globaluniform = {
    skyColor: Uniform.Vec3([0.2, 0.3, 0.35]),
    groundColor: Uniform.Vec3([0.2, 0.4, 0.2]),
    sunColor: Uniform.Vec3([0.7, 0.7, 0.7]),
    sunDirection: Uniform.Vec3(vec3.normalize(new Float32Array([0.577, 0.577, 0.077]))),
    clip: 1000,
    time: 0.0,
  };

  const prepareScence = () => {
    const gl = getGL();
    sceneGraph = new SceneGraph();

    gl.clearColor(0.4, 0.6, 1.0, FAR_AWAY);
    const shaderManager = new ShaderManager(loader.resources);
    const heightText2D = new Texture2D(loader.resources['heightmap.png']);
    const waterText2D = new Texture2D(loader.resources['normalnoise.png']);
    const { position, normal } = parseObj(loader.resources['obj/seahawk.obj']);
    // 着色器
    const mountainShader = shaderManager.get('terrain.vert', 'terrain.frag');
    const waterShader = shaderManager.get('water.vert', 'water.frag');
    const postShader = shaderManager.get('screen.vert', 'screen.frag');
    const skyShader = shaderManager.get('sky.vert', 'sky.frag');
    const planeShader = shaderManager.get('plane.vert', 'plane.frag');

    const mounTainVbo = new VertexBufferObject(gird(GRID_SIZE), mountainShader.getAttribLocation('position'));
    const waterVbo = new VertexBufferObject(gird(100), waterShader.getAttribLocation('position'));
    const planeVbo = new VertexBufferObject(new Float32Array(position), planeShader.getAttribLocation('position'));
    new VertexBufferObject(new Float32Array(normal), planeShader.getAttribLocation('vNormal'));

    const mountainTransform = new SceneTransform([new SceneSimpleMesh(mounTainVbo)]);
    const waterTransform = new SceneTransform([new SceneSimpleMesh(waterVbo)]);
    planeTransform = new SceneTransform([new SceneSimpleMesh(planeVbo)]);

    const plane = new SceneMaterial(planeShader, {}, [planeTransform]);
    const mountain = new SceneMaterial(mountainShader, { heightmap: heightText2D }, [mountainTransform]);
    const sky = new SceneTransform([
      new SceneSkybox(skyShader, {
        horizonColor: Uniform.Vec3([0.2, 0.5, 1]),
        zenithColor: Uniform.Vec3([0.15, 0.2, 0.8]),
      }),
    ]);

    // 倒影
    const flipTransform = new SceneMirror([mountain, sky]);

    const mountainDepthFbo = new FrameBufferObject(512, 512);
    const mountainDepthTarget = new SceneRenderTarget(mountainDepthFbo, [new SceneUniforms({ clip: 0.0 }, [mountain])]);

    const reflectionFBO = new FrameBufferObject(1024, 1024),
      reflectionTarget = new SceneRenderTarget(reflectionFBO, [new SceneUniforms({ clip: 0.0 }, [flipTransform])]);

    const water = new SceneMaterial(
      waterShader,
      { color: Uniform.Vec3([0.3, 0.5, 0.9]), waterNoise: waterText2D, reflection: reflectionFBO, refraction: mountainDepthFbo },
      [waterTransform],
    );

    const combinedFBO = new FrameBufferObject(1024, 1024),
      combinedTarget = new SceneRenderTarget(combinedFBO, [plane, mountain, water, sky]);
    // 场景图
    // 被观察物

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
    // can be optimized with a z only shader

    // 先画山的倒影， 然后画山 画水
    camera = new SceneCamera([new SceneUniforms(globaluniform, [mountainDepthTarget, reflectionTarget, combinedTarget])]);

    const postprocess = new ScenePostProcess(postShader, { texture: combinedFBO });

    cameraController = new CameraConstroller(inputHandler, camera);

    sceneGraph.root.append(camera);
    sceneGraph.root.append(postprocess);

    camera.position[1] = 10;
    camera.position[2] += 200;
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(mountainTransform.wordMatrix, new Float32Array([-0.5 * GRID_SIZE, -30, -0.5 * GRID_SIZE]));
    mat4.scale(mountainTransform.wordMatrix, new Float32Array([GRID_SIZE, 100, GRID_SIZE]));

    mat4.scale(flipTransform.wordMatrix, new Float32Array([1.0, -1.0, 1.0]));

    mat4.translate(waterTransform.wordMatrix, new Float32Array([-1 * FAR_AWAY, 0, -1 * FAR_AWAY]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([FAR_AWAY * 2, 1, FAR_AWAY * 2]));

    mat4.translate(planeTransform.wordMatrix, camera.position);
    mat4.scale(planeTransform.wordMatrix, new Float32Array([0.01, 0.01, 0.01]));
    mat4.rotateY(planeTransform.wordMatrix, Math.PI);

    mat4.scale(sky.wordMatrix, new Float32Array([FAR_AWAY, FAR_AWAY, FAR_AWAY]));

    camera.far = FAR_AWAY * 2;
    setCanvasFullScreen(canvasEl, sceneGraph);
  };

  loader.setOnRendy(() => {
    prepareScence();

    clock.setOnTick(t => {
      globaluniform.time += t;
      cameraController.tick();
      // 然后乘以 摄像机的齐次坐标
      const cameraModelView = mat4.inverse(camera.getWorldView());
      mat4.rotateY(cameraModelView, Math.PI);
      const offset = new Float32Array([0, -3, 10]);
      // 然后缩放的基础上z坐标向前移动 10（右手坐标）
      mat4.translate(cameraModelView , offset)
      // 飞机先缩放 100倍
      mat4.scale(cameraModelView, new Float32Array([0.01, 0.01, 0.01]));
      planeTransform.wordMatrix = cameraModelView;
      sceneGraph.draw();
    });
    clock.start();
  });
};

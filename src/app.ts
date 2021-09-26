import createClock from './util/clock';
import { setCanvasFullScreen, Texture2D, FrameBufferObject, getGL } from './util/glUtils';
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
  SceneNode,
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
    'shaders/brightpass.frag',
    'shaders/vblur.frag',
    'shaders/hblur.frag',

    'obj/seahawk.obj',
  ]);

  let cameraController: CameraConstroller;
  let sceneGraph: SceneGraph;
  let camera: SceneCamera;
  let planeTransform: SceneTransform;
  const globaluniform = {
    skyColor: Uniform.Vec3([0.15, 0.2, 0.8]),
    sunColor: Uniform.Vec3([1.0, 1.0, 1.0]),
    sunDirection: Uniform.Vec3(vec3.normalize(new Float32Array([0.577, 0.577, 0.077]))),
    color: Uniform.Vec3([1.0, 1.0, 1.0]),
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
    const brightpassShader = shaderManager.get('screen.vert', 'brightpass.frag');
    const vblurShader = shaderManager.get('screen.vert', 'vblur.frag');
    const hblurShader = shaderManager.get('screen.vert', 'hblur.frag');

    // 顶点数据
    mountainShader.setAttribBufferData('position', gird(GRID_SIZE));
    waterShader.setAttribBufferData('position', gird(100));
    planeShader.setAttribBufferData('position', new Float32Array(position));
    planeShader.setAttribBufferData('vNormal', new Float32Array(normal));

    const mountainTransform = new SceneTransform([new SceneSimpleMesh()]);
    const waterTransform = new SceneTransform([new SceneSimpleMesh()]);
    planeTransform = new SceneTransform([new SceneSimpleMesh()]);

    const plane = new SceneMaterial(
      planeShader,
      {
        color: Uniform.Vec3([0.3, 0.3, 0.3]),
      },
      [planeTransform],
    );
    const mountain = new SceneMaterial(
      mountainShader,
      {
        heightmap: heightText2D,
        color: Uniform.Vec3([0.1, 0.1, 0.1]),
      },
      [mountainTransform],
    );
    const sky = new SceneTransform([
      new SceneSkybox(skyShader, {
        horizonColor: Uniform.Vec3([0.3, 0.6, 1.2]),
      }),
    ]);

    // 倒影
    const flipTransform = new SceneMirror([mountain, sky]);

    // 水底的山
    const mountainDepthFbo = new FrameBufferObject(1024, 512);
    // 水面的倒影
    const reflectionFBO = new FrameBufferObject(1024, 1024);
    // 将所有的东西渲染到图片上，可以用来后处理
    const combinedFBO = new FrameBufferObject(2048, 1024);
    const bloomFbo0 = new FrameBufferObject(512, 256);
    const bloomFbo1 = new FrameBufferObject(512, 256);

    const mountainDepthTarget = new SceneRenderTarget(mountainDepthFbo, [new SceneUniforms({ clip: 0.0 }, [mountain])]);

    // 先把山的倒影画到帧缓存中
    const reflectionTarget = new SceneRenderTarget(reflectionFBO, [new SceneUniforms({ clip: 0.0 }, [flipTransform])]);

    // 然后用山的倒影生成的纹理 画水面
    const water = new SceneMaterial(
      waterShader,
      { color: Uniform.Vec3([0.6, 0.6, 0.9]), waterNoise: waterText2D, reflection: reflectionFBO, refraction: mountainDepthFbo },
      [waterTransform],
    );

    const combinedTarget = new SceneRenderTarget(combinedFBO, [plane, mountain, water, sky]);

    const brightpass = new SceneRenderTarget(bloomFbo0, [
        new ScenePostProcess(brightpassShader, {
          texture: combinedFBO,
        }),
      ]),
      hblurpass = new SceneRenderTarget(bloomFbo1, [
        new ScenePostProcess(hblurShader, {
          texture: bloomFbo0,
        }),
      ]),
      vblurpass = new SceneRenderTarget(bloomFbo0, [
        new ScenePostProcess(vblurShader, {
          texture: bloomFbo1,
        }),
      ]),
      bloom = new SceneNode([brightpass, hblurpass, vblurpass]);

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

    const postprocess = new ScenePostProcess(postShader, { texture: combinedFBO, bloom: bloomFbo0 });

    cameraController = new CameraConstroller(inputHandler, camera);

    sceneGraph.root.append(camera);
    sceneGraph.root.append(bloom);
    sceneGraph.root.append(postprocess);

    camera.position[1] = 10;
    camera.position[2] += 200;
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(mountainTransform.wordMatrix, new Float32Array([-0.5 * GRID_SIZE, -50, -0.5 * GRID_SIZE]));
    mat4.scale(mountainTransform.wordMatrix, new Float32Array([GRID_SIZE, 100, GRID_SIZE]));
    // 倒影
    mat4.scale(flipTransform.wordMatrix, new Float32Array([1.0, -1.0, 1.0]));

    mat4.translate(waterTransform.wordMatrix, new Float32Array([-1 * FAR_AWAY, 0, -1 * FAR_AWAY]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([FAR_AWAY * 2, 1, FAR_AWAY * 2]));

    // mat4.translate(sky.wordMatrix, [0, -200, 0]);
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
      mat4.translate(cameraModelView, offset);
      // 飞机先缩放 100倍
      mat4.scale(cameraModelView, new Float32Array([0.01, 0.01, 0.01]));
      planeTransform.wordMatrix = cameraModelView;
      sceneGraph.draw();
    });
    clock.start();
  });
};

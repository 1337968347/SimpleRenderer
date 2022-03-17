import * as Scene from './scene';
import * as uniform from './util/uniform';
import createClock from './util/clock';
import { setCanvasFullScreen, Texture2D, FrameBufferObject, getGL, VertexBufferObject } from './util/glUtils';
import { ShaderManager } from './util/shader';
import Loader from './loader';
import Mesh from './util/mesh';
import CameraController from './control/cameraController';
import InputHandler from './control/input';
import { mat4, vec3 } from './math/MV';

let navigator: any = window.navigator;

const query = new URLSearchParams(location.search);

const scale = parseFloat(query.get('d')) || 0.5;

// 网格密度
const GRID_RESOLUTION = 512 * scale * scale,
  // 世界缩放
  GRID_SIZE = 512,
  FAR_AWAY = 500;

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const inputHandler = new InputHandler(canvasEl);
  const clock = createClock();
  const loader = new Loader('./assets/');
  loader.load([
    'shaders/sun.glsl',
    'shaders/transform.glsl',
    'shaders/fog.glsl',
    'shaders/water.vert',
    'shaders/water.frag',
    'heightmap.png',
    'normalnoise.png',
    'snow.png',
    'occlusion.png',

    'shaders/terrain.vert',
    'shaders/terrain.frag',
    'shaders/screen.vert',
    'shaders/screen.frag',
    'shaders/sky.vert',
    'shaders/sky.frag',
  ]);

  const enterVrButton = document.querySelector('button');
  let supportVr: boolean = false;
  if (navigator.xr && (await navigator.xr.isSessionSupported('immersive-vr'))) {
    enterVrButton.innerHTML = 'ENTER VR';
    enterVrButton.disabled = false;
    supportVr = true;
  }

  let cameraController: CameraController;
  let sceneGraph: Scene.Graph;
  const gl: WebGLRenderingContext = getGL();
  const globaluniform = {
    sunColor: uniform.Vec3([1.1, 1.0, 1.0]),
    sunDirection: uniform.Vec3(vec3.normalize(new Float32Array([0.0, 0.4, -1.0]))),
    skyColor: uniform.Vec3([0.1, 0.15, 0.45]),
    fogColor: uniform.Vec3([0.5, 0.6, 0.7]),
    clip: 1000,
    time: 0.0,
    globalFogDensity: 0.01,
    fogHeight: 20
  };

  const prepareScence = (xrSession?: XRSession) => {
    sceneGraph = new Scene.Graph(xrSession);

    gl.clearColor(1.0, 1.0, 1.0, FAR_AWAY);
    const shaderManager = new ShaderManager(loader.resources);
    const heightText2D = new Texture2D(loader.resources['heightmap.png']);
    const waterText2D = new Texture2D(loader.resources['normalnoise.png']);
    const snowText2D = new Texture2D(loader.resources['snow.png']);
    const occlusionText2D = new Texture2D(loader.resources['occlusion.png']);

    // 着色器
    const mountainShader = shaderManager.get('terrain.vert', 'terrain.frag');
    const waterShader = shaderManager.get('water.vert', 'water.frag');
    const skyShader = shaderManager.get('sky.vert', 'sky.frag');

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
        snowColor: uniform.Vec3([0.8, 0.8, 0.8]),
        groundColor: uniform.Vec3([0.1, 0.1, 0.12]),
      },
      [mountainTransform],
    );
    const sky = new Scene.Transform([new Scene.Skybox(skyShader, { horizonColor: uniform.Vec3([0.3, 0.6, 1.2]) })]);
    // 倒影
    const flipTransform = new Scene.Mirror([mountain, sky]);
    // 水底的山
    const mountainDepthFbo = new FrameBufferObject(1024 * scale, 512 * scale);
    // 水面的倒影
    const reflectionFBO = new FrameBufferObject(1024 * scale, 1024 * scale);

    const mountainDepthTarget = new Scene.RenderTarget(mountainDepthFbo, [new Scene.Uniforms({ clip: 0.0 }, [mountain])]);
    // 先把山的倒影画到帧缓存中
    const reflectionTarget = new Scene.RenderTarget(reflectionFBO, [new Scene.Uniforms({ clip: 0.0 }, [flipTransform])]);
    // 水底下的东西
    const underWaterTarget = new Scene.Node([reflectionTarget, mountainDepthTarget]);

    // 然后用山的倒影生成的纹理 画水面
    const water = new Scene.Material(
      waterShader,
      { color: uniform.Vec3([0.7, 0.7, 0.9]), waterNoise: waterText2D, reflection: reflectionFBO, refraction: mountainDepthFbo },
      [waterTransform],
    );
    const webGlRenderTarget = new Scene.WebVrRenderTarget([mountain, water, sky]);

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
    const camera: Scene.Camera = new Scene.Camera([new Scene.Uniforms(globaluniform, [webGlRenderTarget, underWaterTarget])]);

    cameraController = new CameraController(inputHandler, camera);

    sceneGraph.setCamera(camera);
    sceneGraph.root.append(camera);

    camera.setProjection(0.1, FAR_AWAY * 2, sceneGraph.getWebXR());
    camera.position = new Float32Array([0, 10, 250]);
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(mountainTransform.wordMatrix, new Float32Array([-0.5 * GRID_SIZE, -40, -0.5 * GRID_SIZE]));
    mat4.scale(mountainTransform.wordMatrix, new Float32Array([GRID_SIZE, 120, GRID_SIZE]));
    // 倒影
    mat4.scale(flipTransform.wordMatrix, new Float32Array([1.0, -1.0, 1.0]));

    mat4.translate(waterTransform.wordMatrix, new Float32Array([-0.5 * FAR_AWAY, 0, -0.5 * FAR_AWAY]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([FAR_AWAY, 1, FAR_AWAY]));

    mat4.scale(sky.wordMatrix, new Float32Array([FAR_AWAY, FAR_AWAY, FAR_AWAY]));

    camera.far = FAR_AWAY * 2;
    setCanvasFullScreen(canvasEl, sceneGraph);
  };

  loader.setOnRendy(async () => {
    // loop函数
    clock.setOnTick((t: number, frame: XRFrame) => {
      globaluniform.time += t;
      cameraController.tick();
      sceneGraph.draw(frame);
    });

    // 启动渲染
    const startRender = (xrSession?: XRSession) => {
      clock.stop();
      prepareScence(xrSession);
      clock.start(xrSession);
    };
    document.body.removeChild(document.querySelector('span'));
    enterVrButton.onclick = () => {
      enterVrButton.remove();
      //  需要用户点击 进入VR 后才可以获取到XRSession
      if (supportVr) {
        navigator.xr.requestSession('immersive-vr').then((xrSession: XRSession) => {
          startRender(xrSession);
        });
      } else {
        startRender();
      }
    };
  });
};

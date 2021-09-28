import * as Scene from './scene';
import * as uniform from './util/uniform';
import createClock from './util/clock';
import { setCanvasFullScreen, Texture2D, FrameBufferObject, getGL } from './util/glUtils';
import { ShaderManager } from './util/shader';
import Loader from './loader';
import { gird, parseObj } from './util/mesh';
import CameraController from './control/cameraController';
import InputHandler from './control/input';
import { mat4, vec3 } from './math/MV';

const GRID_RESOLUTION = 512,
  GRID_SIZE = 512,
  FAR_AWAY = 5000;

const cameraLocation = new Float32Array([0, 10, 160]);

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

  let cameraController: CameraController;
  let sceneGraph: Scene.Graph;

  const globaluniform = {
    sunColor: uniform.Vec3([0.7, 0.7, 0.7]),
    sunDirection: uniform.Vec3(vec3.normalize(new Float32Array([0.5, 0.2, 0.5]))),
    skyColor: uniform.Vec3([0.1, 0.15, 0.45]),
    groundColor: uniform.Vec3([0.025, 0.05, 0.1]),
    clip: 1000,
    time: 0.0,
  };

  const prepareScence = () => {
    const gl = getGL();
    sceneGraph = new Scene.Graph();

    gl.clearColor(0.4, 0.6, 1.0, FAR_AWAY);
    const shaderManager = new ShaderManager(loader.resources);
    const heightText2D = new Texture2D(loader.resources['heightmap.png']);
    const waterText2D = new Texture2D(loader.resources['normalnoise.png']);
    const snowText2D = new Texture2D(loader.resources['snow.png']);
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
    mountainShader.setAttribBufferData('position', gird(GRID_RESOLUTION));
    waterShader.setAttribBufferData('position', gird(100));
    planeShader.setAttribBufferData('position', new Float32Array(position));
    planeShader.setAttribBufferData('vNormal', new Float32Array(normal));

    // 视口固定矩阵
    const fixModelView = mat4.identity(mat4.create());
    mat4.rotateY(fixModelView, Math.PI);
    const offset = new Float32Array([0, -3, 10]);
    // 然后缩放的基础上z坐标向前移动 10（右手坐标）
    mat4.translate(fixModelView, offset);
    // 飞机先缩放 100倍
    mat4.scale(fixModelView, new Float32Array([0.01, 0.01, 0.01]));

    const mountainTransform = new Scene.Transform([new Scene.SimpleMesh()]);
    const waterTransform = new Scene.Transform([new Scene.SimpleMesh()]);
    const planeTransform: Scene.CameraFixUniform = new Scene.CameraFixUniform([new Scene.SimpleMesh()]);

    const plane = new Scene.Material(planeShader, { color: uniform.Vec3([0.3, 0.3, 0.3]) }, [planeTransform]);
    const mountain = new Scene.Material(
      mountainShader,
      {
        heightmap: heightText2D,
        snowTexture: snowText2D,
      },
      [mountainTransform],
    );
    const sky = new Scene.Transform([new Scene.Skybox(skyShader, { horizonColor: uniform.Vec3([0.3, 0.6, 1.2]) })]);
    // 倒影
    const flipTransform = new Scene.Mirror([mountain, sky]);
    // 水底的山
    const mountainDepthFbo = new FrameBufferObject(1024, 512);
    // 水面的倒影
    const reflectionFBO = new FrameBufferObject(1024, 1024);
    // 将所有的东西渲染到图片上，可以用来后处理
    const combinedFBO = new FrameBufferObject(2048, 1024);
    const bloomFbo0 = new FrameBufferObject(512, 256);
    const bloomFbo1 = new FrameBufferObject(512, 256);

    const mountainDepthTarget = new Scene.RenderTarget(mountainDepthFbo, [new Scene.Uniforms({ clip: 0.0 }, [mountain])]);
    // 先把山的倒影画到帧缓存中
    const reflectionTarget = new Scene.RenderTarget(reflectionFBO, [new Scene.Uniforms({ clip: 0.0 }, [flipTransform])]);

    // 然后用山的倒影生成的纹理 画水面
    const water = new Scene.Material(
      waterShader,
      { color: uniform.Vec3([0.6, 0.6, 0.9]), waterNoise: waterText2D, reflection: reflectionFBO, refraction: mountainDepthFbo },
      [waterTransform],
    );

    const combinedTarget = new Scene.RenderTarget(combinedFBO, [plane, mountain, water, sky]);

    // 离屏渲染
    // 原始图像
    const brightpass = new Scene.RenderTarget(bloomFbo0, [new Scene.PostProcess(brightpassShader, { texture: combinedFBO })]);
    // 水平卷积处理
    const hblurpass = new Scene.RenderTarget(bloomFbo1, [new Scene.PostProcess(hblurShader, { texture: bloomFbo0 })]);
    // 竖直卷积处理
    const vblurpass = new Scene.RenderTarget(bloomFbo0, [new Scene.PostProcess(vblurShader, { texture: bloomFbo1 })]);
    const bloom = new Scene.Node([brightpass, hblurpass, vblurpass]);

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
    const camera: Scene.Camera = new Scene.Camera([
      new Scene.Uniforms(globaluniform, [mountainDepthTarget, reflectionTarget, combinedTarget]),
    ]);

    const postprocess = new Scene.PostProcess(postShader, { texture: combinedFBO, bloom: bloomFbo0 });

    cameraController = new CameraController(inputHandler, camera);

    sceneGraph.root.append(camera);
    sceneGraph.root.append(bloom);
    sceneGraph.root.append(postprocess);

    camera.position = cameraLocation;
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(mountainTransform.wordMatrix, new Float32Array([-0.5 * GRID_SIZE, -40, -0.5 * GRID_SIZE]));
    mat4.scale(mountainTransform.wordMatrix, new Float32Array([GRID_SIZE, 100, GRID_SIZE]));
    // 倒影
    mat4.scale(flipTransform.wordMatrix, new Float32Array([1.0, -1.0, 1.0]));

    mat4.translate(waterTransform.wordMatrix, new Float32Array([-0.5 * FAR_AWAY, 0, -0.5 * FAR_AWAY]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([FAR_AWAY, 1, FAR_AWAY]));

    mat4.translate(sky.wordMatrix, [0, -200, 0]);
    mat4.scale(sky.wordMatrix, new Float32Array([FAR_AWAY, FAR_AWAY, FAR_AWAY]));

    // 然后乘以 摄像机的齐次坐标
    planeTransform.camera = camera;

    planeTransform.fixMartix = fixModelView;

    camera.far = FAR_AWAY * 2;
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

import createClock from './util/clock';
import { VertexBufferObject, setCanvasFullScreen, Texture2D } from './util/glUtils';
import Uniform from './util/uniform';
import { SceneCamera, SceneGraph, SceneMaterial, SceneSimpleMesh, SceneTransform, SceneUniforms } from './util/scene';
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
  loader.load(['shaders/transform.vert', 'shaders/color.frag', 'heightmap.png', 'shaders/heightmap.vert', 'shaders/terrain.frag']);

  loader.setOnRendy(() => {
    const shaderManager = new ShaderManager(loader.resources);
    const heightText2D = new Texture2D(loader.resources['heightmap.png']);
    // 着色器
    const moutainShader = shaderManager.get('heightmap.vert', 'terrain.frag');
    const waterShader = shaderManager.get('transform.vert', 'color.frag');
    // 场景图
    const sceneGraph = new SceneGraph();
    // 被观察物
    const triangle = new VertexBufferObject(gird(MESHNUM));

    let moutainTransform;
    let waterTransform;

    // 观察者
    const camera = new SceneCamera([
      new SceneUniforms(
        {
          skyColor: Uniform.Vec3([0.2, 0.3, 0.35]),
          groundColor: Uniform.Vec3([0.05, 0.1, 0.3]),
          sunColor: Uniform.Vec3([0.7, 0.6, 0.75]),
          sunDirection: Uniform.Vec3([0.577, 0.577, 0.577]),
        },
        [
          new SceneMaterial(
            waterShader,
            {
              color: Uniform.Vec3([0, 0, 1]),
            },
            [(waterTransform = new SceneTransform([new SceneSimpleMesh(triangle)]))],
          ),
          new SceneMaterial(moutainShader, { heightmap: heightText2D }, [
            (moutainTransform = new SceneTransform([new SceneSimpleMesh(triangle)])),
          ]),
        ],
      ),
    ]);

    const cameraController = new CameraConstroller(inputHandler, camera);
    sceneGraph.root.append(camera);

    camera.position[1] = 30;
    // 把世界坐标 从 0-1 变成 0- MESHNUM
    // 并且 把坐标原点移到中心
    mat4.translate(moutainTransform.wordMatrix, new Float32Array([-0.5 * MESHNUM, -50, -0.5 * MESHNUM]));
    mat4.scale(moutainTransform.wordMatrix, new Float32Array([MESHNUM, 100, MESHNUM]));

    mat4.translate(waterTransform.wordMatrix, new Float32Array([-10.0 * MESHNUM, 0, -10.0 * MESHNUM]));
    mat4.scale(waterTransform.wordMatrix, new Float32Array([MESHNUM * 20, 100, MESHNUM * 20]));

    setCanvasFullScreen(canvasEl, sceneGraph);

    clock.setOnTick(() => {
      cameraController.tick();
      sceneGraph.draw();
    });
    clock.start();
  });
};

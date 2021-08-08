import createClock from './util/clock';
import { VertexBufferObject, setCanvasFullScreen } from './util/glUtils';
import Uniform from './util/uniform';
import { SceneCamera, SceneGraph, SceneMaterial, SceneSimpleMesh, SceneTransform, SceneUniforms } from './util/scene';
import { ShaderManager } from './util/shader';
import Loader from './util/loader';
import { gird } from './util/mesh';
import CameraConstroller from './util/cameraController';
import InputHandler from './util/input';

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const inputHandler = new InputHandler(canvasEl);
  const clock = createClock();
  const loader = new Loader('./assets/');
  loader.load(['shaders/transform.vert', 'shaders/color.frag']);

  loader.setOnRendy(() => {
    const shaderManager = new ShaderManager(loader.resources);
    // 着色器
    const shader = shaderManager.get('transform.vert', 'color.frag');
    // 场景图
    const sceneGraph = new SceneGraph();
    // 被观察物
    const triangle = new VertexBufferObject(gird(15));
    // 观察者
    const camera = new SceneCamera([
      new SceneUniforms({ color: Uniform.Vec3([0, 1, 0]) }, [
        new SceneMaterial(shader, {}, [new SceneTransform([new SceneSimpleMesh(triangle)])]),
      ]),
    ]);

    const cameraController = new CameraConstroller(inputHandler, camera);
    sceneGraph.root.append(camera);

    setCanvasFullScreen(canvasEl, sceneGraph);

    clock.setOnTick(() => {
      cameraController.tick();
      sceneGraph.draw();
    });
    clock.start();
  });
};

import createClock from './util/clock';
import { VertexBufferObject, setCanvasFullScreen } from './util/glUtils';
import Uniform from './util/uniform';
import { SceneCamera, SceneGraph, SceneMaterial, SceneSimpleMesh } from './util/scene';
import { ShaderManager } from './util/shader';
import Loader from './util/loader';
import CameraConstroller from './util/cameraController';
import InputHandler from './util/input';

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const inputHandler = new InputHandler(canvasEl);
  const clock = createClock();
  const loader = new Loader('/assets/');
  loader.load(['shaders/transform.vert', 'shaders/color.frag']);
  loader.setOnRendy(() => {
    const shaderManager = new ShaderManager(loader.resources);

    const sceneGraph = new SceneGraph();
    const triangle = new VertexBufferObject(new Float32Array([-1, 1, 1, 0, -1, 1, 1, 1, 1]));
    const mesh = new SceneSimpleMesh(triangle);
    const shader = shaderManager.get('transform.vert', 'color.frag');
    const material = new SceneMaterial(
      shader,
      {
        color: Uniform.Vec3([1, 0, 0]),
      },
      [mesh],
    );
    const camera = new SceneCamera([material]);
    const cameraController = new CameraConstroller(inputHandler, camera);
    setCanvasFullScreen(canvasEl, sceneGraph);

    sceneGraph.root.append(camera);
    clock.setOnTick(() => {
      cameraController.tick();
      sceneGraph.draw();
    });
    clock.start();
  });
};

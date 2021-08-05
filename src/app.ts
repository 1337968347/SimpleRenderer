import createClock from './util/clock';
import { getGL, VertexBufferObject, setCanvasFullScreen } from './util/glUtils';
import Uniform from './util/uniform';
import { SceneCamera, SceneGraph, SceneMaterial, SceneSimpleMesh } from './util/scene';
import { ShaderManager } from './util/shader';
import Loader from './util/loader';

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const clock = createClock();
  const gl = getGL(canvasEl);
  const loader = new Loader('/assets/');
  loader.load(['shaders/transform.vert', 'shaders/color.frag']);
  loader.setOnRendy(() => {
    const shaderManager = new ShaderManager(loader.resources);

    const sceneGraph = new SceneGraph(gl);
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
    setCanvasFullScreen(canvasEl, sceneGraph);

    sceneGraph.root.append(camera);
    clock.setOnTick(() => {
      debugger
      sceneGraph.draw();
    });
    clock.start();
  });
};

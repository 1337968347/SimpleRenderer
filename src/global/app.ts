import createClock from '../util/clock';
import createInputHandler from '../util/input';
import createGlUtils from '../util/glUtils';

export default async () => {
  const canvasEl = document.querySelector('canvas');
  const clock = createClock();
  const { createTexture2DManger, createVertexBufferObject, getContext, setCanvasFullScreen } = createGlUtils();

  const gl = getContext(canvasEl);

  clock.start();
  const inputHandler = createInputHandler();
  inputHandler.bind(canvasEl);
};

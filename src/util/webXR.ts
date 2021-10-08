let navigator: any = window.navigator;
let XRWebGLLayer = (window as any).XRWebGLLayer;
export class WebXr {
  XRWebGLLayer: any;
  webXRSession: any;
  baseLayer: any;
  XRReferenceSpace: any;
  gl: WebGLRenderingContext;

  constructor(webXRSession, gl: WebGLRenderingContext) {
    this.webXRSession = webXRSession;
    this.gl = gl;
    this.init();
  }

  async init() {
    this.baseLayer = new XRWebGLLayer(this.webXRSession, this.gl);
    this.webXRSession.updateRenderState({ baseLayer: this.baseLayer });
    this.XRReferenceSpace = await this.webXRSession.requestReferenceSpace('local');
  }

  static async attempGetWebVrSession() {
    return new Promise(async resolve => {
      if (navigator.xr && (await navigator.xr.isSessionSupported('immersive-vr'))) {
        // await (gl as any).makeXRCompatible();
        navigator.xr.requestSession('immersive-vr').then(async xr => resolve(xr));
      } else {
        resolve(null);
      }
    });
  }
}

let XRWebGLLayer = (window as any).XRWebGLLayer;
let XRRigidTransform = (window as any).XRRigidTransform;
export class WebXr {
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
    
    this.XRReferenceSpace = this.XRReferenceSpace.getOffsetReferenceSpace(
      new XRRigidTransform(new Float32Array([0,0,0]), new Float32Array([0,0,0])));
  }

  bind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.baseLayer.framebuffer);
  }

  unbind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}

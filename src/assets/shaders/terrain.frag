precision highp float;

varying vec3 surfaceNormal;

uniform vec3 groundColor;
uniform vec3 skyColor;
uniform vec3 eye;
uniform float clip;
uniform vec3 atmosphereColor;
uniform float atmosphereDistance;

varying float depth;
varying vec3 worldPosition;

/// import "sun.glsl"

// 根据光线与法向量的夹角 在蓝天 跟 土地 颜色之间插值
vec3 lightHemisphere(const vec3 surfaceNormal) {
  float costheta = dot(surfaceNormal, vec3(0, 1, 0));
  float a = costheta * 0.5 + 0.5;
  return mix(groundColor, skyColor, a);
}

void main() {
  if(worldPosition.y > clip) {
    discard;
  }
  vec3 eyeNormal = normalize(eye - worldPosition);
  vec3 sun = sunLight(surfaceNormal, eyeNormal, 10.0, 0.5, 0.8);
  vec3 color = lightHemisphere(surfaceNormal) + sun;
  gl_FragColor = vec4(color, depth);
}

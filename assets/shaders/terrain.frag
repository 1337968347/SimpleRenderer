precision highp float;

varying vec3 surfaceNormal;

uniform vec3 groundColor;
uniform vec3 skyColor;
uniform vec3 eye;

varying vec3 worldPosition;

import "sun.glsl"

// 根据光线与法向量的夹角 在蓝天 跟 土地 颜色之间插值
vec3 lightHemisphere(const vec3 surfaceNormal) {
  float costheta = dot(surfaceNormal, vec3(0, 1, 0));
  float a = costheta * 0.5 + 0.5;
  return mix(groundColor, skyColor, a);
}

void main() {
  vec3 eyeNormal = normalize(eye - worldPosition);
  vec3 color = lightHemisphere(surfaceNormal) + sunLight(surfaceNormal, eyeNormal, 100.0, 2.0, 1.5);;
  gl_FragColor = vec4(color, 1.0);
}

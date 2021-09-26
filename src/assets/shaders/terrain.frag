precision highp float;

varying vec3 surfaceNormal;

uniform vec3 skyColor;
uniform vec3 eye;
uniform float clip;

varying vec3 worldPosition;

/// import "sun.glsl"

// 根据光线与法向量的夹角 在蓝天 跟 土地 颜色之间插值
vec3 lightHemisphere(const vec3 surfaceNormal) {
  float costheta = dot(surfaceNormal, vec3(0, 1, 0));
  float a = costheta * 0.25 + 0.75;
  return mix(skyColor, color, a);
}

void main() {
  if(worldPosition.y > clip) {
    discard;
  }
  vec3 eyeNormal = normalize(eye - worldPosition);
  vec3 sun = sunLight(surfaceNormal, eyeNormal, 0.3, 1.0, 0.1, 0.3);
  vec3 color = lightHemisphere(surfaceNormal) + sun;
  // 山到眼睛的距离
  float depth = length(worldPosition - eye);
  gl_FragColor = vec4(color, depth);
}

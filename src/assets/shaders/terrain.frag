precision highp float;

varying vec3 surfaceNormal;

uniform vec3 skyColor;
uniform vec3 eye;
uniform float clip;

varying vec2 uv;
varying mat3 tbn;
varying vec3 worldPosition;

uniform sampler2D snowTexture;

/// import "sun.glsl"

// 根据光线与法向量的夹角 在蓝天 跟 土地 颜色之间插值
vec3 lightHemisphere(const vec3 surfaceNormal) {
  float costheta = dot(surfaceNormal, vec3(-1.0, 0.0, 0.0));
  float a = max(costheta, 0.0);
  return mix(skyColor, color, a);
}

void main() {
  if(worldPosition.y > clip) {
    discard;
  }
  vec4 sample = texture2D(snowTexture, uv);
  vec3 normal = normalize(normalize(sample.xyz * 2.0 - 1.0) * tbn);
  normal = surfaceNormal;
  vec3 eyeNormal = normalize(eye - worldPosition);
  vec3 color = lightHemisphere(normal) +sunLight(normal, eyeNormal, 0.1, 10.0, 0.1, 0.5);
  // 山到眼睛的距离
  float depth = length(worldPosition - eye);
  gl_FragColor = vec4(color, depth);
}

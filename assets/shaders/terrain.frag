precision highp float;

uniform float clip;
uniform vec3 eye;
uniform sampler2D snowTexture;
uniform vec3 groundColor;
uniform vec3 skyColor;

varying vec3 worldPosition;
varying vec3 surfaceNormal;
varying vec2 uv;
varying mat3 tbn;

/// import "sun.glsl"

// 根据光线与法向量的夹角 在蓝天 跟 土地 颜色之间插值
vec3 lightHemisphere(const vec3 surfaceNormal) {
  float costheta = dot(surfaceNormal, vec3(0.0, 1.0, 0.0));
  float a = max(costheta, 0.0);
  return mix(groundColor, skyColor, a);
}

void main() {
  if(worldPosition.y > clip) {
    discard;
  }
  vec4 sample = texture2D(snowTexture, uv);
  vec3 normal = normalize(normalize(sample.rgb - 0.5) * tbn + surfaceNormal);
  //normal = surfaceNormal;
  vec3 eyeNormal = normalize(eye - worldPosition);
  vec3 color = sunLight(normal, eyeNormal, 5.0, 0.2, 1.0);

  float depth = length(worldPosition - eye);
  gl_FragColor = vec4(color , depth);
}
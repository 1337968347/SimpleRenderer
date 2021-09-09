precision highp float;

uniform vec3 color;
uniform vec3 sunColor;
uniform vec3 sunDirection;
uniform sampler2D waterNoise;
uniform float time;
uniform vec3 eye;
uniform mat4 modelTransform;
varying vec3 worldPosition;

// 漫反射 
vec3 sunLight(const vec3 surfaceNormal) {
  vec3 diffuse = max(dot(sunDirection, surfaceNormal), 0.0) * sunColor;

  float depth = length(worldPosition - eye);
  vec3 eyeNormal = normalize(eye - worldPosition);
  // 半角向量
  vec3 H = normalize(sunDirection + eyeNormal);
  float ks = 2.0 * pow(max(dot(H, surfaceNormal), 0.0), 250.0);
  vec3 specular = ks * sunColor;
  return diffuse + specular;
}

vec4 getNoise(vec2 uv) {
  vec2 uv0 = (uv / 3.0) + vec2(time / 22.0, time / 10.0);
  vec2 uv1 = uv / vec2(8.0, 9.0) + vec2(time / 18.0, time / 12.0);

  vec4 noise = (texture2D(waterNoise, uv0)) +
    (texture2D(waterNoise, uv1));
  return noise - 0.5;
}

void main() {
  vec2 uv = vec2(worldPosition.x, worldPosition.z);
  vec4 noise = getNoise(uv);

  vec3 surfaceNormal = normalize(vec3(0.0, 1.0, 0.0) + vec3(noise.x, 0.0, noise.z));
  vec3 sun = sunLight(surfaceNormal);
  gl_FragColor = vec4(sun * color, 1.0);
}
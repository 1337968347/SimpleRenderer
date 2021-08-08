precision highp float;

varying vec3 surfaceNormal;

uniform vec3 sunColor;
uniform vec3 sunDirection;
uniform vec3 groundColor;
uniform vec3 skyColor;

// 根据光线与法向量的夹角 在蓝天 跟 土地 颜色之间插值
vec3 lightHemisphere(const vec3 surfaceNormal) {
  float costheta = dot(surfaceNormal, vec3(0, 1, 0));
  float a = costheta*0.5+0.5;
  return mix(groundColor, skyColor, a);
}

// 漫反射 
vec3 sunLight(const vec3 surfaceNormal){
  return max(dot(sunDirection, surfaceNormal),0.0)*sunColor;
}

void main(){
  vec3 color = lightHemisphere(surfaceNormal)+sunLight(surfaceNormal);
  gl_FragColor = vec4(color, 1.0);
}

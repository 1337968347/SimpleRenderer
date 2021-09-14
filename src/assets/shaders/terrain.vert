attribute vec3 position;
uniform sampler2D heightmap;
varying vec3 surfaceNormal;

import "transform.glsl"

void main(){
    vec4 heightPixel = texture2D(heightmap, vec2(position.x, position.z ));
    vec3 positionHeight = vec3(position.x, heightPixel.a, position.z);
    surfaceNormal = normalize(vec3(heightPixel.r - 0.5,heightPixel.b -0.5, heightPixel.g -0.5));
    transform(positionHeight);
}
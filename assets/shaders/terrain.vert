attribute vec3 position;
uniform mat4 modelTransform;
uniform mat4 projection;
uniform sampler2D heightmap;
varying vec3 worldPosition;
varying vec3 surfaceNormal;

void main(){
    vec4 heightPixel = texture2D(heightmap, vec2(position.x, position.z ));
    vec3 positionHeight = vec3(position.x, heightPixel.a, position.z);
    vec4 worldPosition4 = modelTransform * vec4(positionHeight,1.0);
    surfaceNormal = normalize(vec3(heightPixel.x - 0.5,heightPixel.z -0.5, heightPixel.y -0.5));
    worldPosition = vec3(worldPosition4);
    gl_Position = projection* worldPosition4;
}
attribute vec3 position;
uniform sampler2D heightmap;
varying vec3 surfaceNormal;

varying mat3 tbn;
varying vec2 uv;

/// import "transform.glsl"

void main() {
    vec4 heightPixel = texture2D(heightmap, vec2(position.x, position.z));
    vec3 position = vec3(position.x, heightPixel.a, position.z);
    surfaceNormal = normalize(vec3(heightPixel.x, heightPixel.z, heightPixel.y) - vec3(0.5));

    uv = vec2(position.z, dot(position.xz, vec2(1.0, 0.0)) * 0.5 + 0.5) * vec2(50.0);
    // 切线
    vec3 surfaceTangent = normalize(cross(surfaceNormal, vec3(0.0, 1.0, 0.0))); //vec3(0.0, 1.0, 0.0)));
    vec3 surfaceBinormal = normalize(cross(surfaceNormal, surfaceTangent));
    tbn = mat3(surfaceTangent, surfaceBinormal, surfaceNormal);
    transform(position);
}
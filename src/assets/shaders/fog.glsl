uniform vec3 fogColor;

vec3 heightFog(vec3 eyePosition, vec3 viewPosition, vec3 color) {
    float distance = length(eyePosition - viewPosition) * 0.01;
    float fogDensity = exp2(-distance);
    return mix(fogColor, color, fogDensity);
}
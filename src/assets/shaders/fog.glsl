uniform vec3 fogColor;
uniform float globalFogDensity;
uniform float fogHeight;

vec3 heightFog(vec3 cameraPosition, vec3 viewPosition, vec3 color) {
    float rayLength = length(cameraPosition - viewPosition);
    float eyeFogEffectZ = cameraPosition.y - fogHeight;

    float effectZ = cameraPosition.y - viewPosition.y;
    float heightFallOff = 0.1;

    float falloff = effectZ * heightFallOff;
    float fogFactor = min((1.0 - exp2(-falloff)) / falloff, 1.0);
    float fogDensity =  min(exp2(eyeFogEffectZ * heightFallOff), 1.0);

    float fog = fogDensity * fogFactor * max(exp2(-rayLength * globalFogDensity), 0.0);
    return mix(fogColor, color, fog);

    // float distance = length(cameraPosition - viewPosition) * globalFogDensity;
    // float fogDensity = exp2(-distance);
    // return mix(fogColor, color, fogDensity);
}
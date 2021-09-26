precision highp float;

varying vec2 screenPosition;
uniform sampler2D texture;
const float blurSize = 1.0 / 256.0;

void main() {
    vec4 sum = vec4(0.0);
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y - 4.0 * blurSize)) * 0.05;
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y - 3.0 * blurSize)) * 0.09;
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y - 2.0 * blurSize)) * 0.12;
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y - blurSize)) * 0.15;
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y)) * 0.16;
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y + blurSize)) * 0.15;
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y + 2.0 * blurSize)) * 0.12;
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y + 3.0 * blurSize)) * 0.09;
    sum += texture2D(texture, vec2(screenPosition.x, screenPosition.y + 4.0 * blurSize)) * 0.05;

    gl_FragColor = sum;
}
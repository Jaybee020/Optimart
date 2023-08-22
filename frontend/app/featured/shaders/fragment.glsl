varying vec2 vUv;

uniform float time;
uniform vec4 resolution;
uniform sampler2D uTexture;

const float pi = 3.1415926535897932384626433832795;

void main() {
    gl_FragColor = texture2D(uTexture, vUv);
}
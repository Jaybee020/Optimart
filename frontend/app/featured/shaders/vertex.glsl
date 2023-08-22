varying vec2 vUv;

uniform float time;
uniform vec4 resolution;

const float pi = 3.1415926535897932384626433832795;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );
}



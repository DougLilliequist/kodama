precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute float frustumCornerIndex;

uniform mat4 _MainCameraViewMatrix;
uniform mat4 _MainCameraInvViewMatrix;
uniform vec3 _CameraWorldPos;

uniform vec3 _FrustumCorners[4];

varying vec3 vViewRay;
varying vec2 vUv;

void main() {

    gl_Position = vec4(position, 1.0);
    vViewRay = (_MainCameraInvViewMatrix * vec4(_FrustumCorners[int(frustumCornerIndex)], 0.0)).xyz;
    vUv = uv;
}


precision highp float;

attribute vec3 position;
attribute vec2 samplerCoord;
attribute vec3 normal;
attribute vec2 uv;
attribute float scale;

uniform sampler2D _Position;
uniform sampler2D _Normal;
uniform sampler2D tShadow;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform mat4 shadowProjectionMatrix;
uniform mat4 shadowViewMatrix;

varying vec2 vUv;
varying vec3 vWorldPos;
varying vec3 vLocalPos;
varying vec4 vShadowCoord;
varying float vShadow;
varying float vScale;

uniform float _ShadowMapTexelSize;
#define BIAS 0.0001


float unpackRGBA (vec4 v) {
    return dot(v, 1.0 / vec4(1.0, 255.0, 65025.0, 16581375.0));
}

vec2 hash23(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

vec2 hash22(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

float inShadow(vec2 coord, vec2 offset, float depth) {

    if(coord.x < -1.0 || coord.x > 1.0) return 1.0;
    if(coord.y < -1.0 || coord.y > 1.0) return 1.0;
    if(depth < -1.0 || depth > 1.0) return 1.0;

    // vec2 jitter = (hash23(vec3((coord + offset)*2000.0, depth)-0.5)) * _ShadowMapTexelSize;
    // vec2 jitter = (hash23(vec3((coord + offset)*3000.0, depth*3000.0)*2.0-1.0)) * _ShadowMapTexelSize;
    vec2 jitter = (hash22(vec2((coord + offset)*3000.0)*2.0-1.0)) * _ShadowMapTexelSize;
    float occluder = unpackRGBA(texture2D(tShadow, coord + offset + jitter));
    if(depth-BIAS > occluder) {
        return 1.0;
    } else {
        return 0.0;
    }

}

void main() {

    vec4 worldPos = texture2D(_Position, samplerCoord);
    vec4 wPos = modelMatrix * vec4(worldPos.xyz, 1.0);
    vWorldPos = wPos.xyz;
    vLocalPos = position;
    vec4 viewPos = viewMatrix * wPos;
    float lifePhase = worldPos.w * 4.0 * (1.0-worldPos.w);
    viewPos.xy += position.xy * mix(1.0, 1.5, scale) * lifePhase;

    vec4 clipPos = projectionMatrix * viewPos;

    vec4 shadowViewPos = shadowViewMatrix * vec4(wPos.xyz, 1.0);
    vec4 shadowCoord = shadowProjectionMatrix * shadowViewPos;
    shadowCoord.xyz = shadowCoord.xyz/shadowCoord.w;
    shadowCoord.xyz = shadowCoord.xyz * 0.5 + 0.5;

    float shadow = 1.0;
    
    float texelSizeHalf = _ShadowMapTexelSize*0.5;
    shadow -= inShadow(shadowCoord.xy, vec2(-texelSizeHalf, -texelSizeHalf), shadowCoord.z) * 0.2;
    shadow -= inShadow(shadowCoord.xy, vec2(-texelSizeHalf, texelSizeHalf), shadowCoord.z) * 0.2;
    shadow -= inShadow(shadowCoord.xy, vec2(0.0,0.0), shadowCoord.z) * 0.2;
    shadow -= inShadow(shadowCoord.xy, vec2(texelSizeHalf, -texelSizeHalf), shadowCoord.z) * 0.2;
    shadow -= inShadow(shadowCoord.xy, vec2(texelSizeHalf, texelSizeHalf), shadowCoord.z) * 0.2;

    vShadow = shadow;
    gl_Position = clipPos;
    vUv = uv;
    vScale = scale;

}
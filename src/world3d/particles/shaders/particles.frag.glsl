precision highp float;

uniform sampler2D _Normal;
uniform sampler2D tShadow;

uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

uniform float _ShadowMapTexelSize;

varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vLocalPos;
varying vec2 vUv;
varying float vShadow;
varying float vScale;

#define LIGHT vec3(0.0, 10.0, 0.0)

vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);

}

vec2 hash23(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

void main() {

    vec3 n = texture2D(_Normal, vUv).xyz;
    if(dot(n,n) < 0.2) discard;
    n = n * 2.0 - 1.0;

    vec3 viewNormal = (vec4(n, 0.0)*viewMatrix).xyz;

    float light = dot(normalize(LIGHT), normalize(viewNormal)) * 0.35 + (1.0 - 0.35);
    // float light = dot(normalize(LIGHT), viewNormal) * 0.5 + 0.5;
    vec3 col = mix(vec3(0.543, 0.9342, 0.84), vec3(0.343, 0.7342, 0.413), vScale);
    float shadow = mix(0.3, 1.0, vShadow);
    col *= light;

    gl_FragColor = vec4(col * shadow, 1.0);

}
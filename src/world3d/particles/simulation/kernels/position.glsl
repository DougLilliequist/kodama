precision highp float;

uniform sampler2D tMap;
uniform sampler2D _Velocity;

uniform vec3 _Points[4];

uniform float _Time;
uniform float _TimeScale;

varying vec2 vUv;

#define EPS 0.001
#define PI 3.1415926538
#define PI2 3.1415926538 * 2.0

float hash13(vec3 p3)
{
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}

vec3 hash33(vec3 p3)
{
	p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);

}

float hash12(vec2 p)
{
	vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

vec2 hash21(float p)
{
	vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}

vec3 computeBezier(float t) {

    vec3 p0p1 = mix(_Points[0], _Points[1], t);
    vec3 p1p2 = mix(_Points[1], _Points[2], t);
    vec3 p2p3 = mix(_Points[2], _Points[3], t);

    vec3 a = mix(p0p1, p1p2, t);
    vec3 b = mix(p1p2, p2p3, t);

    return mix(a, b, t);
    
}

void main() {

    vec4 pos = texture2D(tMap, vUv);
    vec4 vel =texture2D(_Velocity, vUv);

    pos.w += vel.w * _TimeScale;
    if(pos.w >= 1.0) {
        pos.w = 0.0;
        
        pos.xyz = _Points[0];

    };

    pos.xyz += vel.xyz;

    gl_FragColor = pos;

}
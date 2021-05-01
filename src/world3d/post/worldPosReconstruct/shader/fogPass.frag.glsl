precision highp float;

uniform sampler2D _BasePass;
uniform sampler2D _Depth;
uniform vec3 _CameraWorldPos;

uniform float _Near;
uniform float _Far;

uniform float _Time;

varying vec3 vViewRay;
varying vec2 vUv;

// #define USING_WORLDPSPACE_POSITION

float LinearizeDepth(float depth) 
{
    float z = depth * 2.0 - 1.0; // back to NDC 
    return (2.0 * _Near * _Far) / (_Far + _Near - z * (_Far - _Near));	
}

vec3 hash32(vec2 p)
{
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

void main() {

    float depth = LinearizeDepth(texture2D(_Depth, vUv).x);

    vec3 col = texture2D(_BasePass, vUv).xyz;

    #ifdef USING_WORLDPSPACE_POSITION

    vec3 viewRay = vViewRay * (depth/_Far);

    vec3 worldPos = viewRay + _CameraWorldPos;
    float dist = length(worldPos);
    float fog = smoothstep(0.0, 20.0, dist);

    #else

    float fog = smoothstep(_Near, _Far*0.31, depth);

    #endif

    col = mix(col, vec3(0.7, 0.8, 0.93), fog);

    vec3 hash1 = hash32(gl_FragCoord.xy+fract(_Time)*1300.0);
    vec3 hash2 = hash32(gl_FragCoord.yx+fract(_Time+0.3123)*1300.0);
    vec3 dither = ((hash1) + (hash2-1.0)) / 255.0;

    gl_FragColor = vec4((col*0.85)+ dither, 1.0);
    // gl_FragColor = vec4(vec3(worldPos), 1.0);

}
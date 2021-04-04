precision highp float;

uniform sampler2D _BasePass;
uniform sampler2D _Depth;
uniform vec3 _CameraWorldPos;

uniform float _Near;
uniform float _Far;


varying vec3 vViewRay;
varying vec2 vUv;

//https://www.geeks3d.com/20091216/geexlab-how-to-visualize-the-depth-buffer-in-glsl/
float LinearizeDepth(float depth) 
{
    float z = depth;
    return (2.0 * _Near) / (_Far + _Near - z * (_Far - _Near));
}

void main() {

    float depth = LinearizeDepth(texture2D(_Depth, vUv).x);

    vec3 viewRay = vViewRay * depth;
    vec3 worldPos = viewRay + _CameraWorldPos;

    vec3 col = texture2D(_BasePass, vUv).xyz;

    float dist = length(worldPos);
    // float fog = clamp(smoothstep(_Near, _Far, dist), 0.0, 1.0);
    float fog = smoothstep(_Near, _Far, dist);
    // float fog = clamp(dist/_Far, 0.0, 0.9);
    // float fog = smoothstep(_Near, _Far, dist);
    // col = mix(col, vec3(0.8, 0.84, 0.93)*0.7, fog);
    col = mix(col, vec3(0.8, 0.84, 0.93)*0.85, fog);

    gl_FragColor = vec4(col, 1.0);

}
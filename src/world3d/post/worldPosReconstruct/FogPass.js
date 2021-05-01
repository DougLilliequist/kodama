import { Geometry } from "../../../vendor/ogl/src/core/Geometry";
import { Mesh } from "../../../vendor/ogl/src/core/Mesh";
import { Program } from "../../../vendor/ogl/src/core/Program";
import { Texture } from "../../../vendor/ogl/src/core/Texture";
import { Plane } from "../../../vendor/ogl/src/extras/Plane";
import { Mat4 } from "../../../vendor/ogl/src/math/Mat4";
import { Vec3 } from "../../../vendor/ogl/src/math/Vec3";


/**
 * Rename this class. will only rely on view space
 * because since I'm just using this for creating fog.
 * 
 * Actually: rename this class to simply fog pass
 * 
 */
export default class FogPass extends Mesh {

    constructor(gl, camera) {

        super(gl);

        this.gl = gl;

        this.camera = camera;

        this.corners = [
            new Vec3(0.0,0.0,0.0),
            new Vec3(0.0,0.0,0.0),
            new Vec3(0.0,0.0,0.0),
            new Vec3(0.0,0.0,0.0)
        ]

        this.invViewMatrix = new Mat4();
        this.viewMatrix = new Mat4();

        this.initQuad();
        this.initProgram();
        this.calcFrustumCorners();

    }

    initQuad() {

        const refGeometry = new Plane(this.gl, {width: 2, height: 2});

        const {position, uv, index} = refGeometry.attributes;

        const cornerIndex = new Float32Array(4);

        cornerIndex[0] = 0; 
        cornerIndex[1] = 1; 
        cornerIndex[2] = 2; 
        cornerIndex[3] = 3;
        
        this.geometry = new Geometry(this.gl, {

            position: {
                data: position.data,
                size: 3
            },

            uv: {
                data: uv.data,
                size: 2
            },

            frustumCornerIndex: {
                data: cornerIndex,
                size: 1
            },

            index: {
                data: index.data
            }

        });

    }

    initProgram() {

        const uniforms = {

            _BasePass: {
                value: new Texture(this.gl)
            },
            _Depth: {
                value: new Texture(this.gl)
            },
            _MainCameraInvViewMatrix: {
                value: this.invViewMatrix
            },
            _MainCameraViewMatrix: {
                value: this.viewMatrix
            },
            _CameraWorldPos: {
                value: this.camera.worldPosition
            },
            _FrustumCorners: {
                value: this.corners
            },
            _Near: {
                value: this.camera.near
            },
            _Far: {
                value: this.camera.far
            },
            _Time: {
                value: 0
            }

        }

        this.program = new Program(this.gl, {
            uniforms,
            vertex: require('./shader/fogPass.vert.glsl'),
            fragment: require('./shader/fogPass.frag.glsl')
        });

    }

    calcFrustumCorners() {

        const h = Math.tan((this.camera.fov * (Math.PI / 180.0)) * 0.5) * this.camera.far
        const w = h * this.camera.aspect;

        this.corners[0].set(-w, h, -this.camera.far);
        this.corners[1].set(w, h, -this.camera.far);
        this.corners[2].set(-w, -h, -this.camera.far);
        this.corners[3].set(w, -h, -this.camera.far);

    }

    update({camera, depth, color, dt}) {

        this.program.uniforms._MainCameraInvViewMatrix.value.copy(this.invViewMatrix.inverse(camera.viewMatrix));
        this.program.uniforms._CameraWorldPos.value.copy(camera.worldPosition);
        this.program.uniforms._Depth.value = depth;
        this.program.uniforms._BasePass.value = color;
        this.program.uniforms._Time.value += dt;


    }

}
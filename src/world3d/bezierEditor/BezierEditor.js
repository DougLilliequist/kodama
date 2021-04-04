import { Mesh } from "../../vendor/ogl/src/core/Mesh";
import { Program } from "../../vendor/ogl/src/core/Program";
import { Transform } from "../../vendor/ogl/src/core/Transform";
import { Raycast } from "../../vendor/ogl/src/extras/Raycast";
import { Sphere } from "../../vendor/ogl/src/extras/Sphere";
import { Mat4 } from "../../vendor/ogl/src/math/Mat4";
import { Vec2 } from "../../vendor/ogl/src/math/Vec2";
import { Vec3 } from "../../vendor/ogl/src/math/Vec3";

export class BezierEditor extends Transform {
    
    constructor(gl, {
        visible
    }) {
        super();

        this.gl = gl;

        this.enabled = false;

        // this.initPositions = [
        //     new Vec3(-10.0, 0.0, 25.0),
        //     new Vec3(-5.0, 0.0, -18.0),
        //     new Vec3(5.0, 0.0, 30.0),
        //     new Vec3(23.0, 0.0,  -15.0)
        // ]

        // this.initPositions = [
        //     new Vec3(-35.0, 0.0, -10.0),
        //     new Vec3(-18.0, 0.0, 2.0),
        //     new Vec3(13.0, 0.0, 5.0),
        //     new Vec3(25.0, 0.0,  23.0)
        // ]

        // this.initPositions = [
        //     new Vec3(-15.0, 0.0, 10.0),
        //     new Vec3(-7.0, 0.0, -5.0),
        //     new Vec3(3.0, 0.0, 5.0),
        //     new Vec3(15.0, 0.0,  -13.0)
        // ]

        // this.initPositions = [
        //     new Vec3(-15.0, 0.0, 17.0),
        //     new Vec3(-7.0, 0.0, -13.0),
        //     new Vec3(3.0, 0.0, 11.0),
        //     new Vec3(15.0, 0.0,  -15.0)
        // ]

        this.initPositions = [
            new Vec3(-11.0, 0.0, 17.0),
            new Vec3(-7.0, 0.0, -13.0),
            new Vec3(3.0, 0.0, 11.0),
            new Vec3(21.0, 0.0,  -15.0)
        ]

        this.planeDimensions = new Vec2();

        this.ray = new Raycast(this.gl);

        this.prevViewSpacePoint = new Vec3();
        this.firstMove = true;
        this.prevTarget = null;

        this.editingPoint = false;
        this.activeZ = 0.0;

        this.activePoint = null;

        this.initPoints(visible);

    }

    initPoints(visible) {

        const geometry = new Sphere(this.gl, {
            radius: 2.0,
            widthSegments: 32,
            heightSegments: 16
        });

        geometry.raycast = 'sphere';

        const program = new Program(this.gl, {
            vertex: require('./shader/sphere.vert.glsl'),
            fragment: require('./shader/sphere.frag.glsl')
        });

        this.pointA = new Mesh(this.gl, {
            geometry,
            program
        });

        this.pointB = new Mesh(this.gl, {
            geometry,
            program
        });

        this.pointC = new Mesh(this.gl, {
            geometry,
            program
        });

        this.pointD = new Mesh(this.gl, {
            geometry,
            program
        });

        this.pointA.position.copy(this.initPositions[0]);
        this.pointB.position.copy(this.initPositions[1]);
        this.pointC.position.copy(this.initPositions[2]);
        this.pointD.position.copy(this.initPositions[3]);

        this.pointA.setParent(this);
        this.pointB.setParent(this);
        this.pointC.setParent(this);
        this.pointD.setParent(this);

        this.pointA.visible = visible;
        this.pointB.visible = visible;
        this.pointC.visible = visible;
        this.pointD.visible = visible;

    }

    pickPoint({camera, inputPos, orbitControls}) {

        if(!this.enabled) return;

        if(this.editingPoint===false) {

            this.ray.castMouse(camera, inputPos);

            this.children.forEach((point) => {
    
                point.isHit = false;
    
            });
    
            const hits = this.ray.intersectBounds(this.children);
    
            hits.forEach((point) => point.isHit = true);
    
            this.children.forEach((point) => {
    
                if(point.isHit) {
                    
                    orbitControls.enabled = false;
                    this.activePoint = point;
                    const viewSpaceInputPos = new Vec3().copy(point.position);
                    viewSpaceInputPos.applyMatrix4(camera.viewMatrix);
                    this.activeZ = -viewSpaceInputPos.z;
                    this.calcPlaneSize({camera});
                    this.editingPoint = true;
    
                }
    
            });
        }

    }

    updatePoints({camera, inputPos}) {

        if(this.editingPoint) {
            this.translatePoint({camera, inputPos})
        }

    }

    updateState() {
        this.enabled = !this.enabled;
        this.children.forEach((point) => {
            point.visible = this.enabled;
        });
    }

    resetInteractionStates({orbitControls}) {

        this.editingPoint = false;
        this.firstMove = true;
        orbitControls.enabled = true;

    }

    screenToViewspace({inputPos, camera}) {

        const tmpVec = new Vec3(inputPos.x, inputPos.y, 1);
        const invProjMatrix = new Mat4();
        invProjMatrix.inverse(new Mat4().copy(camera.projectionMatrix));
        tmpVec.applyMatrix4(invProjMatrix);

    }

    calcPlaneSize({camera}) {

        this.planeDimensions.y = Math.tan((camera.fov * (Math.PI / 180.0)) * 0.5) * Math.abs(this.activeZ);
        this.planeDimensions.x = this.planeDimensions.y * camera.aspect;

    }

    translatePoint({point, camera, inputPos}) {

        const viewSpacePos = new Vec3().copy(this.activePoint.position);
        viewSpacePos.applyMatrix4(camera.viewMatrix);

        const viewSpaceInputPos = new Vec2();
        viewSpaceInputPos.x = this.planeDimensions.x * inputPos.x;
        viewSpaceInputPos.y = this.planeDimensions.y * inputPos.y;

        if(this.firstMove) {
            this.prevViewSpacePoint.copy(viewSpaceInputPos);
            this.firstMove = false;
        }
        //translate along normal and binormal
        viewSpacePos.x += viewSpaceInputPos.x - this.prevViewSpacePoint.x;
        viewSpacePos.y += viewSpaceInputPos.y - this.prevViewSpacePoint.y;

        const offset = new Vec3().copy(viewSpacePos);
        this.prevViewSpacePoint.copy(viewSpaceInputPos);
        offset.applyMatrix4(new Mat4().inverse(camera.viewMatrix));
        this.activePoint.position.copy(offset);

    }

    get PointA() {
        return this.pointA.position;
    }

    get PointB() {
        return this.PointB.position;
    }

    get PointC() {
        return this.pointC.position;
    }   

    get PointD() {
        return this.pointD.position;
    }

    get PathPoints() {
        return [this.pointA.position, this.pointB.position, this.pointC.position, this.pointD.position]
    }

}
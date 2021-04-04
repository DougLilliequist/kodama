import {
    Renderer
} from "../vendor/ogl/src/core/Renderer.js";
import {
    Transform
} from "../vendor/ogl/src/core/Transform.js";
import {
    Camera
} from "../vendor/ogl/src/core/Camera.js";
import {
    Orbit
} from "../vendor/ogl/src/extras/Orbit.js";
import {
    Raycast
} from '../vendor/ogl/src/extras/Raycast';

import Particles from './particles/Particles.js';

import { Vec3 } from "../vendor/ogl/src/math/Vec3.js";
import Normals from "./normals/Normals.js";
import { RenderTarget } from "../vendor/ogl/src/core/RenderTarget.js";
import FogPass from "./post/worldPosReconstruct/FogPass.js";
import PostProcessing from "./post/PostProcessing.js";

import Quad from './quad/Quad.js';
import { BezierEditor } from "./bezierEditor/BezierEditor.js";

export default class World3d {
    constructor({el}) {
        this.init({el});
        this.initInputParams();
    }

    init({el}) {
        this.renderer = new Renderer({
            width: el.clientWidth,
            height: el.clientHeight,
            antialias: false
        });
        this.gl = this.renderer.gl;

        this.gl.clearColor(0.0, 0.0, 0.0, 1);

        el.appendChild(this.gl.canvas);

        this.camera = new Camera(this.gl, {
            aspect: this.gl.canvas.clientWidth / this.gl.canvas.clientHeight,
            fov: 50,
            far: 300
        });
        this.camera.position.x = 0.0;
        this.camera.position.y = 10.0;
        this.camera.position.z = 21.0;
        
        this.orbitCamera = new Orbit(this.camera, {
            element: this.gl.canvas
        });

        this.scene = new Transform();

        this.initBezierEditor();
        this.initMesh();
        this.initWorldPosCaptureQuad();
        this.initPostPass();

    }

    initInputParams() {

        this.inputPos = new Vec3(0.0, 0.0, 0.5);
        this.prevInputPos = new Vec3().copy(this.inputPos);
        this.inputDelta = new Vec3(0.0, 0.0, 0.0);
        this.projectedInputPos = new Vec3(0.0, 0.0, 0.5);
        this.worldInputPos = new Vec3(0.0,0.0,0.5);
        this.raycast = new Raycast(this.gl);
        this.isInteracting = false;

        this.touchCount = 0;

    }

    onMouseDown(e) {

        this.isInteracting = true;

        this.inputPos.x = (e.clientX / this.gl.canvas.clientWidth) * 2.0 - 1.0;
        this.inputPos.y = (1.0 - e.clientY / this.gl.canvas.clientHeight) * 2.0 - 1.0;
        this.prevInputPos.copy(this.inputPos);
        this.bezierEditor.pickPoint({camera: this.camera, inputPos: this.inputPos, orbitControls: this.orbitCamera})
    }

    onMouseMove(e) {

        if(this.isInteracting === false) return;

        this.inputPos.x = (e.clientX / this.gl.canvas.clientWidth) * 2.0 - 1.0;
        this.inputPos.y = (1.0 - e.clientY / this.gl.canvas.clientHeight) * 2.0 - 1.0;   
        
        this.inputDelta.x = this.inputPos.x - this.prevInputPos.x;
        this.inputDelta.y = this.inputPos.y - this.prevInputPos.y;

        if(this.editingPath === true) {
            this.bezierEditor.updatePoints({camera: this.camera, inputPos: this.inputPos});
        }

        this.prevInputPos.copy(this.inputPos);


    }

    onMouseUp(e) {  

        this.isInteracting = false;
        this.bezierEditor.resetInteractionStates({orbitControls: this.orbitCamera});

    }

    onTouchStart = e => {
        e.preventDefault();
        console.log("TOUCH START");
        this.touchCount++;
        this.isInteracting = true;
        const currentTouch = e.touches[0];
        this.inputPos.x = (currentTouch.clientX / this.gl.canvas.clientWidth) * 2.0 - 1.0;
        this.inputPos.y = (1.0 - currentTouch.clientY / this.gl.canvas.clientHeight) * 2.0 - 1.0;  
        this.prevInputPos.copy(this.inputPos);
        this.inputDelta.copy(this.inputPos).sub(this.prevInputPos);
        this.bezierEditor.pickPoint({camera: this.camera, inputPos: this.inputPos, orbitControls: this.orbitCamera})

      };
    
      onTouchMove = e => {
        e.preventDefault();
        if (this.touchCount < 2) {
          const currentTouch = e.touches[0];
          this.inputPos.x = (currentTouch.clientX / this.gl.canvas.clientWidth) * 2.0 - 1.0;
          this.inputPos.y = (1.0 - currentTouch.clientY / this.gl.canvas.clientHeight) * 2.0 - 1.0; 
    
          if (this.firstMove === false) {
            this.firstMove = true;
            this.prevInputPos.copy(this.inputPos);
            this.inputDelta.copy(this.inputPos).sub(this.prevInputPos);
          }

          if(this.editingPath === true) {
            this.bezierEditor.updatePoints({camera: this.camera, inputPos: this.inputPos});
        }

        }
      };
    
      onTouchEnd = () => {
        this.isInteracting = false;
        this.firstMove = false;
        this.touchCount = 0;
        this.bezierEditor.resetInteractionStates({orbitControls: this.orbitCamera});
      };

    onKeyUp(e) {
        
        switch(e.keyCode) {
            case 32: {
                this.updateBezierEditorMode();
            }
            break;
        }


    }

    initBezierEditor() {

        const editor = window.pane.addFolder({
            title: 'path editor',
            expanded: false
        });

        const toggle = editor.addButton({
            title: 'EDIT PATH',
        });

        toggle.on('click', () => {
            this.updateBezierEditorMode();
        });

        this.editingPath = false;
        this.bezierEditor = new BezierEditor(this.gl, {visible: false});
        this.bezierEditor.setParent(this.scene);
    }

    initMesh() {

        this.sphereNormals = new Normals(this.gl, this.renderer);
        this.particles = new Particles(this.gl, {count: 256, normal: this.sphereNormals.Texture});
        this.particles.program.uniforms._Normal.value = this.sphereNormals.Texture;
        this.particles.setParent(this.scene);

    }

    initWorldPosCaptureQuad() {

        this.fogPass = new FogPass(this.gl, this.camera);

    }

    initPostPass() {

        this.basePass = new RenderTarget(this.gl, {
            width: this.gl.canvas.clientWidth,
            height: this.gl.canvas.clientHeight,
            depthTexture: true
        });

        this.post = new PostProcessing(this.gl);

    }

    updateBezierEditorMode() {
        this.editingPath = !this.editingPath;
        if(this.orbitCamera.enabled === false) this.orbitCamera.enabled = true;
        this.bezierEditor.updateState();
    }

    render({
        scene,
        camera = null,
        target = null,
        // clear = true
    }) {

        this.renderer.render({
            scene,
            camera,
            target,
            // clear
        });
    }

    calcScreenToWorldPos() {

        
        this.camera.unproject(this.projectedInputPos.copy(this.inputPos));
        this.projectedInputPos.sub(this.camera.position).normalize();
        
        const dist = -this.camera.position.z / this.projectedInputPos.z;

        this.worldInputPos.copy(this.camera.position).add(this.projectedInputPos.multiply(dist));
        // this.worldInputPos.z = -this.inputPos.y * 1.0;
        this.worldInputPos.z = -this.inputPos.y * 5.0;

    }

    updateOrbitCamera() {

        // this.orbitCamera.enabled = !this.bezierEditor.editingPoint;
        this.orbitCamera.update();
        this.camera.updateMatrixWorld();      

    }

    update(dt) {

        this.updateOrbitCamera();
        this.particles.update({deltaTime: dt, bezier: this.bezierEditor});

        this.render({
            scene: this.scene,
            camera: this.camera,
            target: this.basePass,
        });

        this.fogPass.update({camera: this.camera, depth: this.basePass.depthTexture, color: this.basePass.texture});

        this.render({scene: this.fogPass});

        this.post.render({scene: this.fogPass, depth: this.basePass.depthTexture, dt});

    }

    onResize({el}) {
        this.renderer.setSize(el.clientWidth, el.clientHeight);
        this.camera.perspective({
            aspect: this.gl.canvas.clientWidth / this.gl.canvas.clientHeight
        });
        this.post.onResize({width: this.gl.canvas.clientWidth, height: this.gl.canvas.clientHeight});
        
    }
}
import World3d from './world3d/World3D.js'
import TweakPane from 'tweakpane';

export class App {
    constructor() {

       window.pane = new TweakPane();

       this.el = document.getElementById("WebGL"); 
       this.World3d = new World3d({el: this.el});
       this.initCTA();
       this.initEvents();
       this.start();
    }

    initCTA() {

    }

    initEvents() {

        this.time = Date.now();
        this.prevTime = this.time;
        this.deltaTime = 0;
        this.ctaHidden = false;

        this.World3d.gl.canvas.addEventListener("resize", this.onResize.bind(this));
        this.World3d.gl.canvas.addEventListener('mousedown', this.onMouseDown);
        this.World3d.gl.canvas.addEventListener('mousemove', this.onMouseMove);
        this.World3d.gl.canvas.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('keyup', this.onKeyUp);
        this.World3d.gl.canvas.addEventListener('touchstart', this.onTouchStart);
        this.World3d.gl.canvas.addEventListener('touchmove', this.onTouchMove);
        this.World3d.gl.canvas.addEventListener('touchend', this.onTouchEnd);
        this.World3d.gl.canvas.addEventListener('touchcancel', this.onTouchEnd);

    }

    start() {
    
        this.update();

    }

    onMouseDown = e => {

        this.World3d.onMouseDown(e);

    }

    onMouseMove = e => {

        this.World3d.onMouseMove(e);

    }

    onMouseUp = e => {

        this.World3d.onMouseUp(e);

    }

    onTouchStart = e => {
        this.World3d.onTouchStart(e);
    }

    onTouchMove = e => {
        console.log('MOVED')
        this.World3d.onTouchMove(e);
    }

    onTouchEnd = e => {
        this.World3d.onTouchEnd(e);
    }

    onTouchCancel = e => {
        this.World3d.onTouchEnd(e);
    }

    onKeyUp = e => {
        this.World3d.onKeyUp(e);
    }

    onResize = () => {
        this.World3d.onResize({
            el: this.el
        });
    }

    update = () => {
    
        window.requestAnimationFrame(() => this.update());

        this.time = Date.now();
        let tmpTime = this.time;
        this.deltaTime = (this.time - this.prevTime) / 1000.0;
        this.prevTime = tmpTime;

        this.World3d.update(this.deltaTime);

    }
    
}

window.onload = () => new App();
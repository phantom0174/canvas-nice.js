import { requestAnimationFrame, cancelAnimationFrame, canvasStyle } from './utils';
import { Simulator } from './simulator';
import { Grid } from './objs';


export class CanvasNice {
    constructor(config) {
        this.c = config;

        this.canvas = undefined;
        this.initializeCanvas();
        this.ctx = this.canvas.getContext('2d');

        this.grid = undefined; // chunk manager
        this.simulator = undefined;

        this.pointer = {
            x: null,
            y: null
        };

        this.registerListener();

        this.render = {
            draw: true,
            need_initialize: true,
            delay_after: 0.2,
            last_changed_time: 0,
        };

        this.pendingRender();
    }

    updateCanvasSize() {
        this.canvas.width = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
        this.canvas.height = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;
    }

    resetRenderInfo() {
        this.render.last_changed_time = Date.now();
        this.render.draw = false;
        this.render.need_initialize = true;
    }

    registerListener() {
        window.onresize = () => {
            cancelAnimationFrame(this.tid);

            this.updateCanvasSize();
            this.resetRenderInfo();
        };

        if (this.c.pointer_inter_type === -1) return;

        this.onmousemove = window.onmousemove;
        window.onmousemove = e => {
            this.pointer.x = e.clientX;
            this.pointer.y = e.clientY;
            this.onmousemove && this.onmousemove(e);
        };

        this.onmouseout = window.onmouseout;
        window.onmouseout = () => {
            this.pointer.x = null;
            this.pointer.y = null;
            this.onmouseout && this.onmouseout();
        };
    }

    initializeCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = canvasStyle(this.c);
        this.updateCanvasSize();

        document.body.appendChild(this.canvas);
    }

    optimizeChunkSize() {
        const opti_size = Math.round(
            this.c.point_dist * Math.max(this.c.chunk_size_constant, 0.25)
        );
        console.log('[c-noice.js] Optimized chunk size:', opti_size);

        const calOpti = (dimension) => {
            const diff = (num_of_chunks) => {
                return Math.abs(dimension / num_of_chunks - opti_size);
            };

            let test_num = dimension / opti_size;
            if (diff(Math.floor(test_num)) < diff(Math.ceil(test_num))) return Math.floor(test_num);
            else return Math.ceil(test_num);
        };

        this.c.X_CHUNK = calOpti(this.canvas.width);
        this.c.Y_CHUNK = calOpti(this.canvas.height);

        console.log(`[c-noice.js] Chunk Number: ${this.c.X_CHUNK}*${this.c.Y_CHUNK}`);
    }

    async pendingRender() {
        if (this.render.draw) {
            if (this.render.need_initialize) {
                this.optimizeChunkSize();

                this.grid = new Grid(this.canvas.width, this.canvas.height, this.c);
                this.simulator = new Simulator(
                    this.ctx, this.grid, this.pointer, this.c
                );

                this.render.need_initialize = false;
                console.log(`[c-noice.js] Canvas Size: ${this.canvas.width}*${this.canvas.height}`);
            }
            this.requestFrame();
        } else if (Date.now() - this.render.last_changed_time > 500) {
            this.render.draw = true;
            this.pendingRender();
        } else { // wait until ready
            setTimeout(() => {
                this.pendingRender();
            }, this.render.delay_after * 1000);
        }
    }

    requestFrame() {
        this.simulator.draw();
        if (this.c.render_rate) this.tid = setTimeout(
            () => { this.pendingRender(); },
            1000 / this.c.render_rate
        );
        else this.tid = requestAnimationFrame(
            () => { this.pendingRender(); }
        );
    }

    destroy() {        
        cancelAnimationFrame(this.tid);
        document.body.removeChild(this.canvas);

        if (this.c.pointer_inter_type === -1) return;
        
        // set mouse event to default
        window.onmousemove = this.onmousemove;
        window.onmouseout = this.onmouseout;
    }
}

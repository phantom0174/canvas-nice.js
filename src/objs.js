import { rand } from './utils';

export class Point {
    constructor(w, h, config) {
        this.c = config;

        this.x = rand(0, w);
        this.y = rand(0, h);
        this.vx = rand(-1, 1);
        this.vy = rand(-1, 1);

        this.size = rand(config.point_size.min, config.point_size.max);
        this.pointer_inter = false;
    }

    evolve() {
        if (!this.c.pointer_inter_type && this.pointer_inter) {
            this.pointer_inter = false;
            return;
        }
        
        this.vx += rand(-0.1, 0.1);
        this.vy += rand(-0.1, 0.1);
        
        this.x += this.vx;
        this.y += this.vy;

        if (Math.abs(this.vx) > this.c.max_speed)
            this.vx *= this.c.slow_down;
        if (Math.abs(this.vy) > this.c.max_speed)
            this.vy *= this.c.slow_down;

        this.pointer_inter = false;
    }

    calAlpha(dist) {
        return Number(Math.max(Math.min(1.2 - dist / this.c.r, 1), 0.2).toFixed(1));
    }

    calPointerForce(ratio) {
        if (1 < ratio) {
            return Math.pow(ratio - 1, 2) * this.c.max_speed;
        } else if (0.5 < ratio) {
            return -Math.pow(1 - ratio, 2) * this.c.max_speed;
        }
        return 0;
    }

    calInterWithPointer(pt) {
        const dx = pt.x - this.x, dy = pt.y - this.y;
        const d = Math.hypot(dx, dy);

        if (d < 1) return;
        const ratio = d / this.c.r;
        if (ratio > 1.5) return;
        if (ratio > 1 && !this.c.pointer_inter_type) return;

        this.pointer_inter = true;

        if (!this.c.pointer_inter_type) {
            this.vx = 0, this.vy = 0;
        } else if (this.c.pointer_inter_type) {
            const force = this.calPointerForce(ratio);
            let dv = {
                x: Math.sign(dx) * force,
                y: Math.sign(dy) * force
            };
            this.vx += dv.x, this.vy += dv.y;

            // test collision
            const test_d = Math.hypot(this.x + this.vx, this.y + this.vy);
            const test_ratio = test_d / this.c.r;
            if (test_ratio <= 1) {
                const inc_ratio = 1 - this.c.r / d;
                dv = {
                    x: inc_ratio * dx,
                    y: inc_ratio * dy
                };
                this.x += dv.x, this.y += dv.y;
                this.vx = 0, this.vy = 0;
            }
        }

        return {
            type: 'l',
            a: this.calAlpha(d),
            pos_info: [this.x, this.y, pt.x, pt.y]
        };
    }

    calInterWithPoint(p) {
        const dx = p.x - this.x, dy = p.y - this.y;
        const d = Math.hypot(dx, dy);

        if (d > this.c.r || d < 1) return;

        return {
            type: 'l',
            a: this.calAlpha(d),
            pos_info: [this.x, this.y, p.x, p.y]
        };
    }
}

class Chunk {
    constructor(x, y, w, h) {
        this.x = x; this.y = y;
        this.w = w, this.h = h;
        this.points = [];
        this.traversed = false;
    }
}

export class Grid {
    constructor(w, h, config) {
        this.c = config;

        // point config
        this.pc = {
            pointer_inter_type: config.pointer_inter_type,
            max_speed: config.max_point_speed,
            r: config.point_dist,
            slow_down: config.point_slow_down_rate,
            point_size: config.point_size || {
                min: 1,
                max: 1
            }
        };

        this.w = w;
        this.h = h;

        this.chunk_w = this.w / this.c.X_CHUNK;
        this.chunk_h = this.h / this.c.Y_CHUNK;

        this.chunks = [];
        this.genChunks();
        this.initializePoints();
    }

    genChunks() {
        this.chunks = new Array(this.c.X_CHUNK).fill(null)
            .map(() => new Array(this.c.Y_CHUNK).fill(null));

        for (let i = 0; i < this.c.X_CHUNK; i++) {
            for (let j = 0; j < this.c.Y_CHUNK; j++) {
                this.chunks[i][j] = new Chunk(
                    this.chunk_w * i, this.chunk_h * j,
                    this.chunk_w, this.chunk_h,
                );
            }
        }
    }

    initializePoints() {
        for (let i = 0; i < this.c.point_count; i++) this.genNewPoint();
    }

    genNewPoint() {
        const point = new Point(this.w, this.h, this.pc);

        const chunk_x_num = Math.floor(point.x / this.chunk_w);
        const chunk_y_num = Math.floor(point.y / this.chunk_h);

        const t_chunk = this.chunks[chunk_x_num][chunk_y_num];

        // force push
        t_chunk.points.push(point);
    }
}


export class DrawBuffer {
    constructor(ctx, config) {
        this.line_color = config.line_color;
        this.line_width_multiplier = config.line_width_multiplier;
        
        this.ctx = ctx;
        this.ctx.fillStyle = `rgb(${config.point_color})`;
        this.ctx.lineCap = "round";

        // index: 10 * alpha(0.2 ~ 1) - 2
        // inverse: (index + 2) / 10
        // d_info: [star_x, start_y, end_x, end_y]
        this.line = {
            buffer: new Array(9).fill(null).map(() => []),
            max_cap: 1000,
            cur_cap: 0
        };

        // d_info: [x, y, radius]
        this.arc = {
            buffer: [],
            max_cap: 1000,
            cur_cap: 0
        };

        this.rad = Math.PI * 2;
    }

    push(d_info) {
        if (!d_info) return;

        if (d_info.type === 'l' && this.line_width_multiplier > 0) {
            this.line.buffer[10 * d_info.a - 2].push(d_info.pos_info);
            if (++this.line.cur_cap > this.line.max_cap) this.dumpLine();
        } else if (d_info.type === 'a') {
            this.arc.buffer.push(d_info.pos_info);
            if (++this.arc.cur_cap > this.arc.max_cap) this.dumpArc();
        }
    }

    dumpLine() {
        for (let i = 0; i < 9; i++) this.dumpLineSlot(i);
        this.line.cur_cap = 0;
    }

    dumpLineSlot(slot_num) {
        let info = this.line.buffer[slot_num];

        this.ctx.beginPath();

        const alpha = (slot_num + 2) / 10;
        this.ctx.lineWidth = alpha * this.line_width_multiplier;
        this.ctx.strokeStyle = `rgba(${this.line_color},${alpha})`;

        for (let i = 0, len = info.length; i < len; i++) {
            const pos_info = info[i];

            this.ctx.moveTo(pos_info[0], pos_info[1]);
            this.ctx.lineTo(pos_info[2], pos_info[3]);
        }
        this.ctx.stroke();

        this.line.buffer[slot_num] = [];
    }

    dumpArc() {
        this.ctx.beginPath();
        for (let i = 0; i < this.arc.buffer.length; i++) {
            const pos_info = this.arc.buffer[i];
            this.ctx.moveTo(pos_info[0], pos_info[1]);
            this.ctx.arc(pos_info[0], pos_info[1], pos_info[2], 0, this.rad);
        }
        this.ctx.fill();
        
        this.arc.buffer = [];
        this.arc.cur_cap = 0;
    }
}

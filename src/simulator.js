import { Point, DrawBuffer } from './objs';


export class Simulator {
    constructor(ctx, grid, pointer, config) {
        this.c = config;
        this.ctx = ctx;

        this.grid = grid;
        this.pointer = pointer;

        this.draw_buffer = new DrawBuffer(this.ctx, config);
    }

    async traverse() {
        for (let ci = 0; ; ci++) {
            let tasks = [];

            if (ci >= 0 && ci < this.c.X_CHUNK) tasks.push(this.calVerticalInteraction(ci));
            if (ci - 2 >= 0 && ci - 2 < this.c.X_CHUNK) tasks.push(this.evolveVerticalChunks(ci - 2));
            if (ci - 4 >= 0 && ci - 4 < this.c.X_CHUNK) tasks.push(this.updateVerticalChunks(ci - 4));
            if (tasks.length === 0) {
                this.draw_buffer.dumpLine();
                this.draw_buffer.dumpArc();                
                break;
            }

            await Promise.all(tasks);
        }
    }

    async calVerticalInteraction(ci) {
        for (let cj = 0; cj < this.c.Y_CHUNK; cj++) {
            const chunk = this.grid.chunks[ci][cj];

            this.calLocalInteraction(chunk);

            // temp var
            const right_x = chunk.x + chunk.w;
            const right_y = chunk.y + chunk.h;

            // calculate interaction in surrounding chunk
            chunk.points.forEach(loc_p => {
                if (this.pointer.x !== null) {
                    this.draw_buffer.push(
                        loc_p.calInterWithPointer(this.pointer)
                    );
                }

                // Calculate if point interaction range exceeds current chunk
                // The reason for not calculating left_dx is that
                // the traverse direction is left to right
                const right_dx = (loc_p.x + this.c.point_dist >= right_x) ? 1 : 0;
                const left_dy = (loc_p.y - this.c.point_dist < chunk.y) ? -1 : 0;
                const right_dy = (loc_p.y + this.c.point_dist >= right_y) ? 1 : 0;
                for (let i = 0; i <= right_dx; i++) {
                    for (let j = left_dy; j <= right_dy; j++) {
                        if (i === 0 && j === 0) continue; // do not compute local chunk
                        if (
                            ci + i >= this.c.X_CHUNK
                            || cj + j < 0 || cj + j >= this.c.Y_CHUNK
                        ) continue; // out of range

                        const tar_chunk = this.grid.chunks[ci + i][cj + j];
                        if (tar_chunk.traversed) continue;

                        this.calSurroundingInteraction(tar_chunk, loc_p);
                    }
                }
            });
            chunk.traversed = true;
        }
    }

    calLocalInteraction(chunk) {
        for (let i = 0; i < chunk.points.length - 1; i++) {
            const p = chunk.points[i];

            for (let j = i + 1; j < chunk.points.length; j++) {
                const tar_p = chunk.points[j];

                this.draw_buffer.push(
                    p.calInterWithPoint(tar_p)
                );
                // deprecated calculation
                // tar_p.calInterWithPoint(p, false);
            }
        }
    }

    calSurroundingInteraction(tar_chunk, local_p) {
        tar_chunk.points.forEach(tar_p => {
            this.draw_buffer.push(
                local_p.calInterWithPoint(tar_p)
            );
            // deprecated calculation, since simulation in legacy versions
            // needs calculating the gravity of each particle
            // 
            // tar_p.calInterWithPoint(local_p, false);
        });
    }

    async evolveVerticalChunks(ci) {
        for (let cj = 0; cj < this.c.Y_CHUNK; cj++) {
            const chunk = this.grid.chunks[ci][cj];
            chunk.points.forEach(p => {
                this.draw_buffer.push({
                    type: 'a',
                    pos_info: [p.x, p.y, p.size]
                });
                p.evolve();
            });
        }
    }

    // update what chunk is point currently in after evolving
    async updateVerticalChunks(ci) {
        for (let cj = 0; cj < this.c.Y_CHUNK; cj++) {
            const chunk = this.grid.chunks[ci][cj];
            chunk.traversed = false; // reset status for next frame

            // for temp
            const right_x = chunk.x + chunk.w;
            const right_y = chunk.y + chunk.h;

            let rmv_list = [];
            for (let i = 0; i < chunk.points.length; i++) {
                const cur_p = chunk.points[i];

                let chunk_dx = 0, chunk_dy = 0;
                if (cur_p.x < chunk.x) chunk_dx = -1;
                else if (cur_p.x >= right_x) chunk_dx = 1;

                if (cur_p.y < chunk.y) chunk_dy = -1;
                else if (cur_p.y >= right_y) chunk_dy = 1;

                if (chunk_dx === 0 && chunk_dy === 0) continue;

                const new_chunk_x = ci + chunk_dx;
                const new_chunk_y = cj + chunk_dy;

                // boundary check
                if (new_chunk_x < 0) {
                    cur_p.x *= -1;
                    cur_p.vx *= -1;
                } else if (new_chunk_x >= this.c.X_CHUNK) {
                    cur_p.x = 2 * this.grid.w - cur_p.x;
                    cur_p.vx *= -1;
                } else if (new_chunk_y < 0) {
                    cur_p.y *= -1;
                    cur_p.vy *= -1;
                } else if (new_chunk_y >= this.c.Y_CHUNK) {
                    cur_p.y = 2 * this.grid.h - cur_p.y;
                    cur_p.vy *= -1;
                } else { // move to new chunk, or to random location if full
                    rmv_list.push(i);

                    const new_chunk = this.grid.chunks[new_chunk_x][new_chunk_y];
                    if (new_chunk.points.length < this.c.chunk_capacity)
                        new_chunk.points.push(cur_p);
                    else this.grid.genNewPoint();
                }
            }

            // remove in O(N) time
            let cur_rmv_ind = 0;
            chunk.points = chunk.points.filter((v, ind) => {
                if (cur_rmv_ind !== rmv_list.length && ind === rmv_list[cur_rmv_ind]) {
                    cur_rmv_ind++;
                    return false;
                } else {
                    return true;
                }
            });
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.grid.w, this.grid.h);
        this.traverse();
    }
}

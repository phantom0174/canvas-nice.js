# ✨ Canvas-nice.js

A webpage particle animation renderer optimized from [canvas-nest.js](https://github.com/hustcc/canvas-nest.js/).

- [Preview website](https://phantom0174.github.io/canvas-nice.js/)
- [Customable preview website](https://codepen.io/phantom0174/pen/OJoXWmJ)

## 💨 **Faster Rendering**

- Use `chunks` for spacial partitioning to store dynamic objects instead of the brute-force search used by `canvas-nest`.

- Implements drawing buffer, which increases the rendering speed **dramatically**.

## 🎨 **More Custom Options**

Compared to `5` custom options of `canvas-nest.js`, this renderer offers up to **`14`** custom options. Enables you to create a variety of animation!

## How to use

### Install

Copy and paste the following url and put it into the `body` section of html file, or directly clone `canvas-nice.min.js` onto your computer.

```html
<script defer type="text/javascript" src="https://cdn.jsdelivr.net/npm/canvas-nice.js/dist/canvas-nice.min.js"></script>
```

> The code had been packed and zipped. Current size: `7.22` KiB

### Creating Canvas

Create a new `js` file, and pass your customized parameters into `CanvasNice`.

```js
new CanvasNice({
    point_dist: 77,
    point_count: 500,
    point_size: {
        min: 1,
        max: 2
    },
    point_slow_down_rate: 0.8,
    point_color: '120,120,120',
    line_color: '120,120,120',
    line_width_multiplier: 0.5,
    max_point_speed: 2,
    zIndex: 0,
    canvas_opacity: 1,
    render_rate: 45,
    chunk_capacity: 15,
    chunk_size_constant: 0.8,
    pointer_inter_type: 0
});
```

Go to [index.html](https://github.com/phantom0174/canvas-nice.js/blob/master/index.html) and [main.js](https://github.com/phantom0174/canvas-nice.js/blob/master/main.js) for examples.

### Parameters Information

Written below are the data-types and valid range for the custom options.

```text
point_dist: float (> 0)
point_count: int (>= 0)
point_size: {
    min: float (>= 0),
    max: float (>= 0)
}
max_point_speed: float (> 0)
point_slow_down_rate: float (> 0 && < 1)
point_color: 'r,g,b' (r, g, b >= 0 && <= 255)
line_color: 'r,g,b' (r, g, b >= 0 && <= 255)
line_width_multiplier: float (>= 0)
zIndex: int (any)
render_rate: int (> 0)
canvas_opacity: float (>= 0 && <= 1)
chunk_capacity: int (> 0)
chunk_size_constant: float (> 0.25)
pointer_inter_type: int (-1 / 0 / 1)
```

- `point_dist`: The interaction radius of a particle. (in pixels)
- `point_count`: The number of particles. (a number lesser than `1000` is recommended under regular settings)
- `point_size`: Optional: The minimum and maximum radius of a particle. (the default value for `min` and `max` is both `1`)
- `max_point_speed`: The maximum moving speed of a particle in x or y coordinate can has in each frame. (in pixels)
- `point_slow_down_rate`: The deceleration rate of a particle after it succeeds it's maximum moving speed.
- `point_color`: The color of particles.
- `line_color`: The color of the line between two particles.
- `line_width_multiplier`: The line-width multiplier for the line between two particles. If set to `0`, the line will not be rendered. (any number between `0.5 ~ 1.5` is recommended)
- `zIndex`: The `z-index` of the canvas.
- `render_rate`: Number of frames to render per second. Will use browser default if not set.
- `canvas_opacity`: The opacity of the canvas (`1` means completely opaque while `0` means completely transparent)
- `chunk_capacity`: The number of particle that a chunk can contain.
- `chunk_size_constant`: The ratio of the width or height of the chunk divided by the interaction radius of particle. (a number greater than `1` means lossless computing. `0.8` is recommended)
- `pointer_inter_type`: The interaction type between the particles and the cursor, with a total of 2 types:

    ```text
    -1: No interaction
    0: Particles in a certain area around the cursor will be completely stationary.
    1: Nearly the same interaction of the original canvas-nest.js, oscillating the particles back and forth within a certain range around the cursor.
    ```

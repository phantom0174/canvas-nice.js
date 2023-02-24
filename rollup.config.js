import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";


export default {
    input: './src/index.js',
    output: {
        file: 'dist/canvas-nice.min.js',
        name: 'CanvasNice',
        format: 'umd'
    },
    plugins: [
        resolve(),
        commonjs(),
        terser({
            parse: {
                html5_comments: false
            },
            compress: {
                ecma: 2018,
                arguments: true,
                keep_fargs: false,
                module: true,
            },
            format: {
                comments: false,
                ecma: 2018,
            },
            mangle: {
                module: true,
                properties: {
                    regex: '^[a-zA-Z_$]*$',
                    reserved: [
                        "CanvasNice",
                        "point_dist",
                        "point_count",
                        "point_size",
                        "min",
                        "max",
                        "point_slow_down_rate",
                        "point_color",
                        "line_color",
                        "line_width_multiplier",
                        "max_point_speed",
                        "zIndex",
                        "canvas_opacity",
                        "render_rate",
                        "chunk_capacity",
                        "chunk_size_constant",
                        "pointer_inter_type"
                    ],
                },
            }
        })
    ]
};

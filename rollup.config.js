import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";


export default {
    input: './src/index.js',
    output: {
        file: 'canvas-nice.min.js',
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

            },
            format: {
                comments: false,
                ecma: 2018,
            }
        })
    ]
};

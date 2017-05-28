import css from 'rollup-plugin-css-only';
import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/index.js',
    format: 'iife',
    moduleName: 'SilkyTiles',
    plugins: [
        css({ output: 'dist/silky-tiles.css' }),
        //babel()
    ],
    dest: 'dist/silky-tiles.js',
    sourceMap: true
};

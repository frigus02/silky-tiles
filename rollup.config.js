import css from 'rollup-plugin-css-only';
import babel from 'rollup-plugin-babel';
import babili from 'rollup-plugin-babili';

export default {
    entry: 'src/index.js',
    format: 'iife',
    moduleName: 'SilkyTiles',
    plugins: [
        css({ output: 'dist/silky-tiles.css' }),
        babel(),
        babili({
            comments: false
        })
    ],
    dest: 'dist/silky-tiles.js',
    sourceMap: true
};

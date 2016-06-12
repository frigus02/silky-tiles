export default class ColumnLayout {
    constructor (options) {
        this._options = {
            columns: 5
        };
        Object.assign(this._options, options);

        this._tileWidth = 0;
        this.height = 0;
    }

    layout (layoutParams) {
        const row = Math.floor(layoutParams.position / this._options.columns);
        const col = layoutParams.position - row * this._options.columns;
        const translateX = col * this._tileWidth;
        const translateY = row * this._tileWidth;

        this.height = Math.max(this.height, (row + 1) * this._tileWidth);

        return {
            x: translateX,
            y: translateY,
            width: this._tileWidth,
            height: this._tileWidth
        };
    }

    onWidthChanged (width) {
        this._tileWidth = width / this._options.columns;
        this.height = 0;
    }
}

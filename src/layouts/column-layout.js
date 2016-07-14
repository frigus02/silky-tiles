export default class ColumnLayout {
    constructor (options) {
        this._options = {
            columns: 5,
            margin: 8,
            outerMargin: true
        };
        Object.assign(this._options, options);

        this._tileWidth = 0;
        this.height = 0;
    }

    layout (layoutParams) {
        const row = Math.floor(layoutParams.position / this._options.columns);
        const col = layoutParams.position - row * this._options.columns;
        let translateX = col * (this._tileWidth + this._options.margin);
        let translateY = row * (this._tileWidth + this._options.margin);
        if (this._options.outerMargin) {
            translateX += this._options.margin;
            translateY += this._options.margin;
        }

        this.height = Math.max(this.height, (row + 1) * (this._tileWidth + this._options.margin) + (this._options.outerMargin ? this._options.margin : -this._options.margin));

        return {
            x: translateX,
            y: translateY,
            width: this._tileWidth,
            height: this._tileWidth
        };
    }

    onWidthChanged (width) {
        if (this._options.outerMargin) {
            this._tileWidth = (width - (this._options.columns + 1) * this._options.margin) / this._options.columns;
        } else {
            this._tileWidth = (width - (this._options.columns - 1) * this._options.margin) / this._options.columns;
        }

        this.height = 0;
    }
}

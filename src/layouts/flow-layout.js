export default class FlowLayout {
    constructor (options) {
        this._options = {
            tileWidth: 96,
            tileHeight: 96,
            margin: 8,
            outerMargin: true
        };
        Object.assign(this._options, options);

        this._tilesInRow = 1;
        this.height = 0;
    }

    layout (layoutParams) {
        const row = Math.floor(layoutParams.position / this._tilesInRow);
        const col = layoutParams.position - row * this._tilesInRow;
        let translateX = col * (this._options.tileWidth + this._options.margin);
        let translateY = row * (this._options.tileHeight + this._options.margin);
        if (this._options.outerMargin) {
            translateX += this._options.margin;
            translateY += this._options.margin;
        }

        this.height = Math.max(this.height, (row + 1) * (this._options.tileHeight + this._options.margin) + (this._options.outerMargin ? this._options.margin : -this._options.margin));

        return {
            x: translateX,
            y: translateY,
            width: this._options.tileWidth,
            height: this._options.tileHeight
        };
    }

    onWidthChanged (width) {
        if (this._options.outerMargin) {
            this._tilesInRow = Math.floor((width - this._options.margin) / (this._options.tileWidth + this._options.margin));
        } else {
            this._tilesInRow = Math.floor((width + this._options.margin) / (this._options.tileWidth + this._options.margin));
        }

        this.height = 0;
    }
}

import BaseLayout from './base-layout';

export default class FlowLayout extends BaseLayout {
    constructor (options) {
        super();

        this._options = {
            tileWidth: 96,
            tileHeight: 96,
            margin: 8,
            outerMargin: true
        };
        Object.assign(this._options, options);

        this._tiles = [];
        this._queue = [];
        this._tilesInRow = 1;
        this._height = 0;
    }

    get height () {
        return this._height;
    }

    layout (layoutParamsGetter) {
        const queue = this._queue;
        this._queue = [];

        queue.forEach(tile => {
            const layoutParams = layoutParamsGetter(tile);
            const row = Math.floor(layoutParams.position / this._tilesInRow);
            const col = layoutParams.position - row * this._tilesInRow;
            let translateX = col * (this._options.tileWidth + this._options.margin);
            let translateY = row * (this._options.tileHeight + this._options.margin);
            if (this._options.outerMargin) {
                translateX += this._options.margin;
                translateY += this._options.margin;
            }

            this._height = Math.max(this._height, (row + 1) * (this._options.tileHeight + this._options.margin) + (this._options.outerMargin ? this._options.margin : -this._options.margin));

            this.setTilePosition(tile, {
                x: translateX,
                y: translateY,
                width: this._options.tileWidth,
                height: this._options.tileHeight
            });
        });

        return queue;
    }

    onTileAdded (tile) {
        this._tiles.push(tile);
        this._queue.push(tile);
    }

    onTileChanged (tile) {
        this._queue.push(tile);
    }

    onTileRemoved (tile) {
        const index = this._tiles.indexOf(tile);
        if (index > -1) {
            this._tiles.splice(index, 1);
            this._queue.push(...this._tiles);
        }
    }

    onWidthChanged (width) {
        this._queue.push(...this._tiles);

        if (this._options.outerMargin) {
            this._tilesInRow = Math.floor((width - this._options.margin) / (this._options.tileWidth + this._options.margin));
        } else {
            this._tilesInRow = Math.floor((width + this._options.margin) / (this._options.tileWidth + this._options.margin));
        }

        if (this._tilesInRow < 1) {
            this._tilesInRow = 1;
        }

        this._height = 0;
    }
}

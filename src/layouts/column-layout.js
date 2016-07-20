import BaseLayout from './base-layout';

export default class ColumnLayout extends BaseLayout {
    constructor (options) {
        super();

        this._options = {
            columns: 5,
            margin: 8,
            outerMargin: true
        };
        Object.assign(this._options, options);

        this._tiles = [];
        this._queue = [];
        this._tileWidth = 1;
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
            const row = Math.floor(layoutParams.position / this._options.columns);
            const col = layoutParams.position - row * this._options.columns;
            let translateX = col * (this._tileWidth + this._options.margin);
            let translateY = row * (this._tileWidth + this._options.margin);
            if (this._options.outerMargin) {
                translateX += this._options.margin;
                translateY += this._options.margin;
            }

            this._height = Math.max(this._height, (row + 1) * (this._tileWidth + this._options.margin) + (this._options.outerMargin ? this._options.margin : -this._options.margin));

            this.setTilePosition(tile, {
                x: translateX,
                y: translateY,
                width: this._tileWidth,
                height: this._tileWidth
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
            this._tileWidth = (width - (this._options.columns + 1) * this._options.margin) / this._options.columns;
        } else {
            this._tileWidth = (width - (this._options.columns - 1) * this._options.margin) / this._options.columns;
        }

        this._height = 0;
    }
}

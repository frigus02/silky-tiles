import BaseLayout from './base-layout';
import GridLayoutHelper from '../helpers/grid-layout-helper';

export default class ColumnLayout extends BaseLayout {
    constructor(options) {
        super();

        this._options = {
            columns: 5,
            margin: 8,
            outerMargin: true,
            moveMode: 'switch' // switch || push
        };
        Object.assign(this._options, options);

        this._tiles = [];
        this._queue = [];
        this._grid = new GridLayoutHelper();
        this._grid.reset(this._options.columns);
        this._tileWidth = 1;
        this._height = 0;
    }

    get height() {
        return this._height;
    }

    onLayout(layoutParamsGetter, tilePositionSetter) {
        const queue = this._queue
            .map(tile => ({
                tile,
                layoutParams: layoutParamsGetter(tile)
            }))
            .sort((a, b) => a.layoutParams.position - b.layoutParams.position);
        this._queue = [];

        queue.forEach(({tile, layoutParams}) => {
            const {row, col} = this._grid.includesTile(tile)
                ? this._grid.getTilePosition(tile)
                : this._grid.addTile(tile, layoutParams);

            let translateX = col * (this._tileWidth + this._options.margin);
            let translateY = row * (this._tileWidth + this._options.margin);
            if (this._options.outerMargin) {
                translateX += this._options.margin;
                translateY += this._options.margin;
            }

            this._height = Math.max(
                this._height,
                (row + 1) * (this._tileWidth + this._options.margin) + (this._options.outerMargin ? this._options.margin : -this._options.margin));

            tilePositionSetter(tile, {
                x: translateX,
                y: translateY,
                width: (this._tileWidth + this._options.margin) * layoutParams.width - this._options.margin,
                height: (this._tileWidth + this._options.margin) * layoutParams.height - this._options.margin
            });
        });

        return queue;
    }

    onTileAdded(tile) {
        this._tiles.push(tile);
        this._queue.push(tile);
    }

    onTileChanged(tile) {
        this._grid.reset(this._tilesInRow);
        this._height = 0;
        this._queue = [...this._tiles];
    }

    onTileRemoved(tile) {
        const index = this._tiles.indexOf(tile);
        if (index > -1) {
            this._tiles.splice(index, 1);

            this._grid.reset(this._tilesInRow);
            this._height = 0;
            this._queue = [...this._tiles];
        }
    }

    onTileMoved(tile, targetTile, layoutParamsGetter) {
        const position = layoutParamsGetter(tile).position;
        const targetPosition = layoutParamsGetter(targetTile).position;
        const changedTiles = [];

        if (this._options.moveMode === 'switch') {
            changedTiles.push(
                {
                    tile: tile,
                    newPosition: targetPosition
                },
                {
                    tile: targetTile,
                    newPosition: position
                }
            );
        } else if (this._options.moveMode === 'push') {
            const tilePositions = {};
            for (const tile of this._tiles) {
                const position = layoutParamsGetter(tile).position;
                tilePositions[position] = tile;
            }

            const modifier = position > targetPosition ? 1 : -1;
            changedTiles.push(
                {
                    tile: tile,
                    newPosition: targetPosition
                },
                {
                    tile: targetTile,
                    newPosition: targetPosition + modifier
                }
            );

            const from = Math.min(position, targetPosition) + 1;
            const to = Math.max(position, targetPosition) - 1;

            for (let middlePosition = from; middlePosition <= to; middlePosition++) {
                const middleTile = tilePositions[middlePosition];
                if (middleTile) {
                    changedTiles.push({
                        tile: middleTile,
                        newPosition: middlePosition + modifier
                    });
                }
            }
        }

        this._grid.reset(this._tilesInRow);
        this._height = 0;
        this._queue = [...this._tiles];

        return changedTiles;
    }

    onWidthChanged(width) {
        if (this._options.outerMargin) {
            this._tileWidth = (width - (this._options.columns + 1) * this._options.margin) / this._options.columns;
        } else {
            this._tileWidth = (width - (this._options.columns - 1) * this._options.margin) / this._options.columns;
        }

        this._height = 0;
        this._queue = [...this._tiles];
    }
}

export default class BaseLayout {
    constructor() {
        this._positions = new WeakMap();
    }

    get height() {
    }

    getTilePosition(tile) {
        return this._positions.get(tile);
    }

    layout(layoutParamsGetter) {
        const changedTiles = [];
        this.onLayout(layoutParamsGetter, (tile, position) => {
            const lastPosition = this._positions.get(tile);
            if (!lastPosition ||
                lastPosition.x !== position.x ||
                lastPosition.y !== position.y ||
                lastPosition.width !== position.width ||
                lastPosition.height !== position.height) {
                this._positions.set(tile, position);
                changedTiles.push(tile);
            }
        });

        return changedTiles;
    }

    /**
     * Called during the layout phase. Implementations should calculate
     * the new coordinates for all changed tiles and set them using the
     * passed tilePositionSetter.
     */
    onLayout(/*layoutParamsGetter, tilePositionSetter*/) {
    }

    /**
     * Called when a new tile is added to the grid. The tile
     * will always be positioned at the end of the grid.
     */
    onTileAdded(/*tile*/) {
    }

    /**
     * Called when layout params of a tile change, such as the
     * position, width or height.
     */
    onTileChanged(/*tile*/) {
    }

    /**
     * Called when a tile is removed from the grid.
     */
    onTileRemoved(/*tile*/) {
    }

    /**
     * Called when the user moved a tile from one position to another.
     * The function gets the tile and the tile it was moved on top on.
     * It should return new positions for all tiles, which change
     * as a result of this action.
     *
     * @return {Array} Tiles, which changes positions because of the action.
     */
    onTileMoved(/*tile, targetTile, layoutParamsGetter*/) {
        return [
            /*{
                tile: someTile,
                newPosition: 12
            }*/
        ];
    }

    /**
     * Called when the width of the container has changed.
     */
    onWidthChanged(/*width*/) {
    }
}

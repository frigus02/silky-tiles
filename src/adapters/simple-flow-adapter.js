import SimpleAdapter from './simple-adapter';

export default class SimpleFlowAdapter extends SimpleAdapter {
    constructor (containerElement, moveMode) {
        super(containerElement);

        this._moveMode = moveMode;
    }

    onTileMoved (tile, targetTile) {
        const index = this._tiles.indexOf(tile);
        const targetIndex = this._tiles.indexOf(targetTile);

        if (this._moveMode === 'switch') {
            this._tiles[index] = targetTile;
            this._tiles[targetIndex] = tile;

            this.dispatchEvent('tilechanged', tile);
            this.dispatchEvent('tilechanged', targetTile);
        } else {
            this._tiles.splice(index, 1);
            this._tiles.splice(targetIndex, 0, tile);

            const from = Math.min(index, targetIndex);
            const to = Math.max(index, targetIndex);
            for (let i = from; i <= to; i++) {
                this.dispatchEvent('tilechanged', this._tiles[i]);
            }
        }
    }

    getTileLayoutParams (tile) {
        return {
            position: this._tiles.indexOf(tile)
        };
    }
}

export default class BaseLayout {
    constructor () {
        this._positions = new WeakMap();
    }

    get height () {
    }

    getTilePosition (tile) {
        return this._positions.get(tile);
    }

    layout () {
    }

    onTileAdded (/*tile*/) {
    }

    onTileChanged (/*tile*/) {
    }

    onTileRemoved (/*tile*/) {
    }

    onWidthChanged (/*width*/) {
    }

    setTilePosition (tile, position) {
        this._positions.set(tile, position);
    }
}

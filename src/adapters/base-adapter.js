import ListenableMixin from '../helpers/listenable-mixin';

/**
 * Supported events: tileadded, tilechanged, tileremoved
 */
export default class BaseAdapter extends ListenableMixin() {
    constructor() {
        super();
    }

    get container() {
        return undefined;
    }

    get tiles() {
        return [];
    }

    getContainerBounds() {
        return {
            /*top: 12,
            left: 12,
            absoluteTop: 120,
            absoluteLeft: 80*/
        };
    }

    getTileBounds(/*tile*/) {
        return {
            /*width: 100,
            height: 100,
            x: 12,
            y: 12*/
        };
    }

    getTileLayoutParams(/*tile*/) {
    }

    onTilePositionChanged(/*tile, newPosition*/) {
    }
}

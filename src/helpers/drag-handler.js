import Listenable from './listenable';
import {getTouchCoordinate, mix} from './utils';


export default class DragHandler {
    constructor (silkyTiles) {
        Listenable.call(this, ['dragstart', 'dragend']);

        this._silkyTiles = silkyTiles;
        this._tile = null;
        this._startX = 0;
        this._startY = 0;
        this._currentX = 0;
        this._currentY = 0;

        this._initEventListeners = this._initEventListeners.bind(this);
        this._destroyEventListeners = this._destroyEventListeners.bind(this);
        this._onDragStart = this._onDragStart.bind(this);
        this._onDragMove = this._onDragMove.bind(this);
        this._onDragEnd = this._onDragEnd.bind(this);
    }

    get adapter () {
        return this._adapter;
    }

    set adapter (adapter) {
        if (this._adapter) {
            this._adapter.removeEventListener('tileadded', this._initEventListeners);
            this._adapter.tiles.forEach(this._destroyEventListeners);
        }

        this._adapter = adapter;
        this._adapter.tiles.forEach(this._initEventListeners);
        this._adapter.addEventListener('tileadded', this._initEventListeners);
    }

    _initEventListeners (tile) {
        tile.addEventListener('touchstart', this._onDragStart);
        tile.addEventListener('mousedown', this._onDragStart);
    }

    _destroyEventListeners (tile) {
        tile.removeEventListener('touchstart', this._onDragStart);
        tile.removeEventListener('mousedown', this._onDragStart);
    }

    _onDragStart (evt) {
        if (this._tile) return;

        evt.preventDefault();

        this._tile = evt.currentTarget;

        const currentPosition = this._silkyTiles.getTilePosition(this._tile);

        this._currentX = getTouchCoordinate(evt, 'pageX');
        this._currentY = getTouchCoordinate(evt, 'pageY');
        this._startX = this._currentX - currentPosition.x;
        this._startY = this._currentY - currentPosition.y;

        this._tile.classList.add('at-is-dragging');

        document.addEventListener('touchmove', this._onDragMove);
        document.addEventListener('touchend', this._onDragEnd);
        document.addEventListener('mousemove', this._onDragMove);
        document.addEventListener('mouseup', this._onDragEnd);

        this.dispatchEvent('dragstart', this._tile);
    }

    _onDragMove (evt) {
        if (!this._tile) return;

        this._currentX = getTouchCoordinate(evt, 'pageX');
        this._currentY = getTouchCoordinate(evt, 'pageY');
    }

    _onDragEnd () {
        if (!this._tile) return;

        document.removeEventListener('touchmove', this._onDragMove);
        document.removeEventListener('touchend', this._onDragEnd);
        document.removeEventListener('mousemove', this._onDragMove);
        document.removeEventListener('mouseup', this._onDragEnd);

        this._tile.classList.remove('at-is-dragging');

        this.dispatchEvent('dragend', this._tile);

        this._tile = null;
    }

    _getTileAtPosition (x, y) {
        for (let tile of this._adapter.tiles) {
            const position = this._silkyTiles.getTilePosition(tile);

            if (tile !== this._tile &&
                x > position.x && x < position.x + position.width &&
                y > position.y && y < position.y + position.height) {
                return tile;
            }
        }
    }

    layout () {
        if (!this._tile) return;

        const containerBounds = this._adapter.getContainerBounds();
        const targetTile = this._getTileAtPosition(
            this._currentX - containerBounds.absoluteLeft,
            this._currentY - containerBounds.absoluteTop);

        if (targetTile) {
            this._adapter.onTileMoved(this._tile, targetTile);
        }

        return {
            x: this._currentX - this._startX,
            y: this._currentY - this._startY
        };
    }
}

mix(DragHandler, Listenable);

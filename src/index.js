import './styles/minimal.css';
import DragHandler from './helpers/drag-handler';
import ColumnLayout from './layouts/column-layout';
import FlowLayout from './layouts/flow-layout';
import SimpleAdapter from './adapters/simple-adapter';
import SimpleFlowAdapter from './adapters/simple-flow-adapter';

export class SilkyTiles {
    constructor () {
        this._adapter = null;
        this._layout = null;
        this._layoutQueue = [];
        this._layoutWidth = 0;
        this._layoutHeight = 0;
        this._layoutPositions = new WeakMap();
        this._dragHandler = new DragHandler(this);
        this._draggingTile = null;

        this._onTileAdded = this._onTileAdded.bind(this);
        this._onTileChanged = this._onTileChanged.bind(this);
        this._onTileDragStart = this._onTileDragStart.bind(this);
        this._onTileDragEnd = this._onTileDragEnd.bind(this);
        this.update = this.update.bind(this);

        this._dragHandler.addEventListener('dragstart', this._onTileDragStart);
        this._dragHandler.addEventListener('dragend', this._onTileDragEnd);

        requestAnimationFrame(this.update);
    }

    get adapter () {
        return this._adapter;
    }

    set adapter (adapter) {
        if (this._adapter) {
            this._adapter.removeEventListener('tileadded', this._onTileAdded);
            this._adapter.removeEventListener('tilechanged', this._onTileChanged);
        }

        this._adapter = adapter;

        this._layoutQueue = Array.from(this._adapter.tiles);
        this._adapter.addEventListener('tileadded', this._onTileAdded);
        this._adapter.addEventListener('tilechanged', this._onTileChanged);

        this._dragHandler.adapter = this._adapter;
    }

    get layout () {
        return this._layout;
    }

    set layout (layout) {
        this._layout = layout;
    }

    _onTileAdded (tile) {
        this._layoutQueue.push(tile);
    }

    _onTileChanged (tile) {
        this._layoutQueue.push(tile);
    }

    _onTileDragStart (tile) {
        this._draggingTile = tile;
    }

    _onTileDragEnd (tile) {
        this._draggingTile = null;
        this._layoutQueue.push(tile);
    }

    getTilePosition (tile) {
        return this._layoutPositions.get(tile);
    }

    update () {
        if (!this._adapter || !this._layout) return;

        // Get layout from drag handler first, because it might add
        // additional tiles to the queue.
        let draggingTilePosition;
        if (this._draggingTile) {
            this._layoutQueue.push(this._draggingTile);
            draggingTilePosition = this._dragHandler.layout();
        }

        // Get layout queue.
        let layoutQueue = this._layoutQueue;
        this._layoutQueue = [];

        // If the container width changed, we need to layout all tiles.
        if (this._layoutWidth !== this._adapter.container.clientWidth) {
            this._layoutWidth = this._adapter.container.clientWidth;
            this._layout.onWidthChanged(this._layoutWidth);
            layoutQueue = this._adapter.tiles;
        }

        // Measure all tiles in queue.
        for (let tile of layoutQueue) {
            const layoutParams = this._adapter.getTileLayoutParams(tile);
            const position = this._layout.layout(layoutParams);

            this._layoutPositions.set(tile, position);
        }

        // Layout all tiles in queue.
        for (let tile of layoutQueue) {
            const position = this._layoutPositions.get(tile);
            if (tile === this._draggingTile) {
                Object.assign(position, draggingTilePosition);
            }

            tile.style.width = `${position.width}px`;
            tile.style.height = `${position.height}px`;
            tile.style.transform = `translateX(${position.x}px) translateY(${position.y}px)`;
        }

        // Update container height.
        if (this._layoutHeight !== this._layout.height) {
            this._layoutHeight = this._layout.height;
            this._adapter.container.style.height = `${this._layoutHeight}px`;
        }

        requestAnimationFrame(this.update);
    }
}

export const layouts = {
    ColumnLayout,
    FlowLayout
};

export const adapters = {
    SimpleAdapter,
    SimpleFlowAdapter
};

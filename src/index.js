import './styles/minimal.css';
import DragHandler from './helpers/drag-handler';
import BaseLayout from './layouts/base-layout';
import ColumnLayout from './layouts/column-layout';
import FlowLayout from './layouts/flow-layout';
import BaseAdapter from './adapters/base-adapter';
import DomAdapter from './adapters/dom-adapter';

export class SilkyTiles {
    constructor() {
        this._adapter = null;
        this._layout = null;
        this._layoutWidth = 0;
        this._layoutHeight = 0;
        this._dragHandler = new DragHandler(this);
        this._draggingTile = null;

        this._onTileAdded = this._onTileAdded.bind(this);
        this._onTileChanged = this._onTileChanged.bind(this);
        this._onTileRemoved = this._onTileRemoved.bind(this);
        this._onTileDragStart = this._onTileDragStart.bind(this);
        this._onTileDragEnd = this._onTileDragEnd.bind(this);
        this._onTileMoved = this._onTileMoved.bind(this);
        this._update = this._update.bind(this);

        this._dragHandler.addEventListener('dragstart', this._onTileDragStart);
        this._dragHandler.addEventListener('dragend', this._onTileDragEnd);
        this._dragHandler.addEventListener('tilemoved', this._onTileMoved);

        requestAnimationFrame(this._update);
    }

    get adapter() {
        return this._adapter;
    }

    set adapter(adapter) {
        if (this._adapter) {
            this._adapter.removeEventListener('tileadded', this._onTileAdded);
            this._adapter.removeEventListener('tilechanged', this._onTileChanged);
            this._adapter.removeEventListener('tileremoved', this._onTileRemoved);
            this._adapter.tiles.forEach(this._onTileRemoved);
        }

        this._adapter = adapter;
        this._adapter.tiles.forEach(this._onTileAdded);
        this._adapter.addEventListener('tileadded', this._onTileAdded);
        this._adapter.addEventListener('tilechanged', this._onTileChanged);
        this._adapter.addEventListener('tileremoved', this._onTileRemoved);

        this._dragHandler.adapter = this._adapter;
    }

    get layout() {
        return this._layout;
    }

    set layout(layout) {
        if (this._layout && this._adapter) {
            this._adapter.tiles.forEach(this._onTileRemoved);
        }

        this._layout = layout;
        if (this._adapter) {
            this._adapter.tiles.forEach(this._onTileAdded);
        }
    }

    _onTileAdded(tile) {
        if (this._layout) {
            this._layout.onTileAdded(tile);
        }
    }

    _onTileChanged(tile) {
        if (this._layout) {
            this._layout.onTileChanged(tile);
        }
    }

    _onTileRemoved(tile) {
        if (this._layout) {
            this._layout.onTileRemoved(tile);
        }
    }

    _onTileDragStart(tile) {
        this._draggingTile = tile;
    }

    _onTileDragEnd(tile) {
        this._draggingTile = null;
        this._onTileChanged(tile);
    }

    _onTileMoved(tile, targetTile) {
        if (this._layout) {
            const newPositions = this._layout.onTileMoved(tile, targetTile, tile => this._adapter.getTileLayoutParams(tile));
            for (const pos of newPositions) {
                this._adapter.onTilePositionChanged(pos.tile, pos.newPosition);
            }
        }
    }

    _update() {
        if (!this._adapter || !this._layout) return;

        const changedTiles = [];

        // Get layout from drag handler first, because it might add
        // additional tiles to the queue.
        let draggingTilePosition;
        if (this._draggingTile) {
            draggingTilePosition = this._dragHandler.layout();
            changedTiles.push(this._draggingTile);
        }

        // If the container width changed, we need to layout all tiles.
        if (this._layoutWidth !== this._adapter.container.clientWidth) {
            this._layoutWidth = this._adapter.container.clientWidth;
            this._layout.onWidthChanged(this._layoutWidth);
        }

        // Get layout queue.
        changedTiles.push(...this._layout.layout(tile => this._adapter.getTileLayoutParams(tile)));

        // Layout all tiles in queue.
        for (let tile of changedTiles) {
            const position = this._layout.getTilePosition(tile);
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

        requestAnimationFrame(this._update);
    }

    getTilePosition(tile) {
        return this._layout && this._layout.getTilePosition(tile);
    }
}

export const layouts = {
    BaseLayout,
    ColumnLayout,
    FlowLayout
};

export const adapters = {
    BaseAdapter,
    DomAdapter
};

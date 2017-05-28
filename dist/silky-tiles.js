(function (exports) {
'use strict';

const ListenableMixin = (superclass = Object) => class extends superclass {
    constructor() {
        super();
        this._listeners = {};
    }

    addEventListener(eventName, callback) {
        this._getListeners(eventName).push(callback);
    }

    dispatchEvent(eventName, ...args) {
        const listeners = this._getListeners(eventName);
        for (const listener of listeners) {
            listener(...args);
        }
    }

    removeEventListener(eventName, callback) {
        const listeners = this._getListeners(eventName);
        const index = listeners.indexOf(callback);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    }

    _getListeners(eventName) {
        if (!this._listeners.hasOwnProperty(eventName)) {
            this._listeners[eventName] = [];
        }

        return this._listeners[eventName];
    }
};

function getTouchCoordinate(evt, prop) {
    if (evt.touches && evt.touches.length > 0) {
        return evt.touches[0][prop];
    } else {
        return evt[prop];
    }
}

class DragHandler extends ListenableMixin() {
    constructor(silkyTiles) {
        super();

        this._silkyTiles = silkyTiles;
        this._adapter = null;
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

    get adapter() {
        return this._adapter;
    }

    set adapter(adapter) {
        if (this._adapter) {
            this._adapter.removeEventListener('tileadded', this._initEventListeners);
            this._adapter.tiles.forEach(this._destroyEventListeners);
        }

        this._adapter = adapter;
        this._adapter.tiles.forEach(this._initEventListeners);
        this._adapter.addEventListener('tileadded', this._initEventListeners);
    }

    _initEventListeners(tile) {
        if (window.PointerEvent) {
            tile.addEventListener('pointerdown', this._onDragStart);
        } else {
            tile.addEventListener('touchstart', this._onDragStart);
            tile.addEventListener('mousedown', this._onDragStart);
        }
    }

    _destroyEventListeners(tile) {
        if (window.PointerEvent) {
            tile.removeEventListener('pointerdown', this._onDragStart);
        } else {
            tile.removeEventListener('touchstart', this._onDragStart);
            tile.removeEventListener('mousedown', this._onDragStart);
        }
    }

    _onDragStart(evt) {
        if (this._tile) return;

        evt.preventDefault();

        this._tile = evt.currentTarget;

        const currentPosition = this._silkyTiles.getTilePosition(this._tile);

        this._currentX = getTouchCoordinate(evt, 'pageX');
        this._currentY = getTouchCoordinate(evt, 'pageY');
        this._startX = this._currentX - currentPosition.x;
        this._startY = this._currentY - currentPosition.y;

        this._tile.classList.add('st-is-dragging');

        if (window.PointerEvent) {
            this._tile.addEventListener('pointermove', this._onDragMove);
            this._tile.addEventListener('pointerup', this._onDragEnd);
            this._tile.addEventListener('pointercancel', this._onDragEnd);

            this._tile.setPointerCapture(evt.pointerId);
        } else {
            document.addEventListener('touchmove', this._onDragMove);
            document.addEventListener('touchend', this._onDragEnd);
            document.addEventListener('mousemove', this._onDragMove);
            document.addEventListener('mouseup', this._onDragEnd);
        }

        this.dispatchEvent('dragstart', this._tile);
    }

    _onDragMove(evt) {
        if (!this._tile) return;

        this._currentX = getTouchCoordinate(evt, 'pageX');
        this._currentY = getTouchCoordinate(evt, 'pageY');
    }

    _onDragEnd() {
        if (!this._tile) return;

        if (window.PointerEvent) {
            this._tile.removeEventListener('pointermove', this._onDragMove);
            this._tile.removeEventListener('pointerup', this._onDragEnd);
            this._tile.removeEventListener('pointercancel', this._onDragEnd);
        } else {
            document.removeEventListener('touchmove', this._onDragMove);
            document.removeEventListener('touchend', this._onDragEnd);
            document.removeEventListener('mousemove', this._onDragMove);
            document.removeEventListener('mouseup', this._onDragEnd);
        }

        this._tile.classList.remove('st-is-dragging');

        this.dispatchEvent('dragend', this._tile);

        this._tile = null;
    }

    _getTileAtPosition(x, y) {
        for (let tile of this._adapter.tiles) {
            const position = this._silkyTiles.getTilePosition(tile);

            if (tile !== this._tile &&
                x > position.x && x < position.x + position.width &&
                y > position.y && y < position.y + position.height) {
                return tile;
            }
        }
    }

    layout() {
        if (!this._tile) return;

        const containerBounds = this._adapter.getContainerBounds();
        const targetTile = this._getTileAtPosition(
            this._currentX - containerBounds.absoluteLeft,
            this._currentY - containerBounds.absoluteTop);

        if (targetTile) {
            this.dispatchEvent('tilemoved', this._tile, targetTile);
        }

        return {
            x: this._currentX - this._startX,
            y: this._currentY - this._startY
        };
    }
}

class BaseLayout {
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

class GridLayoutHandler {
    constructor() {
        this._grid = [];
        this._tilesInRow = 1;
    }

    addTile(tile, layoutParams) {
        // In case the tile does not fit into the grid at all, at
        // least make sure it takes to full width.
        const tileWidth = Math.min(layoutParams.width, this._tilesInRow);
        const tileHeight = layoutParams.height;

        // Find first free spot
        let rowIndexStart,
            rowIndexEnd,
            colIndexStart,
            colIndexEnd;

        rowLoop:
        for (rowIndexStart = 0, rowIndexEnd = tileHeight - 1; ; rowIndexStart++, rowIndexEnd++) {
            for (colIndexStart = 0, colIndexEnd = tileWidth - 1; colIndexEnd < this._tilesInRow; colIndexStart++, colIndexEnd++) {
                if (this._doesTileFitIntoPosition(rowIndexStart, rowIndexEnd, colIndexStart, colIndexEnd)) {
                    break rowLoop;
                }
            }
        }

        // Occupy spot
        for (let rowIndex = rowIndexStart; rowIndex <= rowIndexEnd; rowIndex++) {
            while (this._grid.length <= rowIndex) {
                this._grid.push(new Array(this._tilesInRow));
            }

            for (let colIndex = colIndexStart; colIndex <= colIndexEnd; colIndex++) {
                this._grid[rowIndex][colIndex] = tile;
            }
        }

        return {
            row: rowIndexStart,
            col: colIndexStart
        };
    }

    includesTile(tile) {
        return this._grid.some(r => r.includes(tile));
    }

    getTilePosition(tile) {
        const row = this._grid.findIndex(r => r.includes(tile));
        const col = this._grid[row].indexOf(tile);

        return {
            row,
            col
        };
    }

    _doesTileFitIntoPosition(rowIndexStart, rowIndexEnd, colIndexStart, colIndexEnd) {
        for (let rowIndex = rowIndexStart; rowIndex <= rowIndexEnd; rowIndex++) {
            const row = this._grid[rowIndex];
            if (!row) break;

            for (let colIndex = colIndexStart; colIndex <= colIndexEnd; colIndex++) {
                if (typeof row[colIndex] !== 'undefined') {
                    return false;
                }
            }
        }

        return true;
    }

    reset(tilesInRow) {
        this._grid = [];
        this._tilesInRow = tilesInRow;
    }
}

class ColumnLayout extends BaseLayout {
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
        this._grid = new GridLayoutHandler();
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

class FlowLayout extends BaseLayout {
    constructor(options) {
        super();

        this._options = {
            tileWidth: 96,
            tileHeight: 96,
            margin: 8,
            outerMargin: true,
            moveMode: 'switch' // switch || push
        };
        Object.assign(this._options, options);

        this._tiles = [];
        this._queue = [];

        this._tilesInRow = 1;
        this._grid = new GridLayoutHandler();
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
            const {row, col} = this._grid.addTile(tile, layoutParams);

            let translateX = col * (this._options.tileWidth + this._options.margin);
            let translateY = row * (this._options.tileHeight + this._options.margin);
            if (this._options.outerMargin) {
                translateX += this._options.margin;
                translateY += this._options.margin;
            }

            this._height = Math.max(
                this._height,
                (row + layoutParams.height) * (this._options.tileHeight + this._options.margin) + (this._options.outerMargin ? this._options.margin : -this._options.margin));

            tilePositionSetter(tile, {
                x: translateX,
                y: translateY,
                width: (this._options.tileWidth + this._options.margin) * layoutParams.width - this._options.margin,
                height: (this._options.tileHeight + this._options.margin) * layoutParams.height - this._options.margin
            });
        });
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
            this._tilesInRow = Math.floor((width - this._options.margin) / (this._options.tileWidth + this._options.margin));
        } else {
            this._tilesInRow = Math.floor((width + this._options.margin) / (this._options.tileWidth + this._options.margin));
        }

        if (this._tilesInRow < 1) {
            this._tilesInRow = 1;
        }

        // Need to layout all tiles now.
        this._grid.reset(this._tilesInRow);
        this._height = 0;
        this._queue = [...this._tiles];
    }
}

class BaseAdapter extends ListenableMixin() {
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

class DomAdapter extends BaseAdapter {
    constructor(containerElement) {
        super();

        this._containerElement = containerElement;
        this._containerElement.classList.add('st-container');
        this._tiles = Array.from(containerElement.children);
        this._tiles.forEach(tile => {
            tile.classList.add('st-tile');
        });

        this._onChildrenMutated = this._onChildrenMutated.bind(this);

        this._observer = new MutationObserver(this._onChildrenMutated);
        this._observer.observe(containerElement, {
            childList: true
        });
    }

    _onChildrenMutated(records) {
        for (const record of records) {
            for (const node of record.addedNodes) {
                if (node instanceof Element) {
                    node.classList.add('st-tile');
                    this._tiles.push(node);
                    this.dispatchEvent('tileadded', node);
                }
            }

            for (const node of record.removedNodes) {
                if (node instanceof Element) {
                    const index = this._tiles.indexOf(node);
                    this._tiles.splice(index, 1);
                    this.dispatchEvent('tileremoved', node);
                }
            }
        }
    }

    get container() {
        return this._containerElement;
    }

    get tiles() {
        return this._tiles;
    }

    getContainerBounds() {
        const bounds = this._containerElement.getBoundingClientRect();

        let absoluteTop = 0;
        let absoluteLeft = 0;
        let currentElement = this._containerElement;
        do {
            absoluteTop += currentElement.offsetTop;
            absoluteLeft += currentElement.offsetLeft;
            currentElement = currentElement.offsetParent;
        } while (currentElement);

        return {
            top: bounds.top,
            left: bounds.left,
            absoluteTop,
            absoluteLeft
        };
    }

    getTileBounds(tile) {
        const containerBounds = this.getContainerBounds();
        const bounds = tile.getBoundingClientRect();

        return {
            width: bounds.width,
            height: bounds.width,
            x: bounds.left - containerBounds.left,
            y: bounds.top - containerBounds.top
        };
    }

    getTileLayoutParams(tile) {
        return {
            position: parseInt(tile.dataset.tilePosition, 10),
            width: parseInt(tile.dataset.tileWidth, 10) || 1,
            height: parseInt(tile.dataset.tileHeight, 10) || 1
        };
    }

    onTilePositionChanged(tile, newPosition) {
        tile.dataset.tilePosition = newPosition;
    }
}

class SilkyTiles {
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

const layouts = {
    BaseLayout,
    ColumnLayout,
    FlowLayout
};

const adapters = {
    BaseAdapter,
    DomAdapter
};

exports.SilkyTiles = SilkyTiles;
exports.layouts = layouts;
exports.adapters = adapters;

}((this.SilkyTiles = this.SilkyTiles || {})));
//# sourceMappingURL=silky-tiles.js.map

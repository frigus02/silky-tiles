export default class GridLayoutHandler {
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
